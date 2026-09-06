import { decodeResult, EasRecordError, feastBytes32, phaseAt, type ChainAttestation, type EasReader } from '@critter-crumbs/core';
import { canonicalJSON, hex, parseAddress, record, type Address, type ResultAttestation, type ResultView } from '@critter-crumbs/shared';
import { getAddress, zeroAddress, zeroHash } from 'viem';
import type { Database } from './database.js';
import { createBurrowTransactions, requireMember, timestamp, type BurrowSnapshot } from './burrow-transactions.js';
import { closeRecordFromRow, feastClock, targetFromRow } from './feast-rows.js';
import { HttpError } from './errors.js';
export function createResults(db: Database, clock: () => number, reader?: EasReader) {
  const transactions = createBurrowTransactions(db, clock);
  function gate(snapshot: BurrowSnapshot, id: string, actor: Address) {
    requireMember(snapshot, actor);
    const row = snapshot.feasts.find(row => row.id === id)!;
    if (phaseAt(feastClock(row), snapshot.now) !== 'feast') throw new HttpError(400, 'scatter.closed');
    if (!row.aggregate_public) throw new HttpError(403, 'err.generic');
    return row;
  }
  function validate(snapshot: BurrowSnapshot, id: string, attestation: ChainAttestation) {
    const row = snapshot.feasts.find(row => row.id === id)!, closed = closeRecordFromRow(row)!;
    let data: ReturnType<typeof decodeResult>;
    try { data = decodeResult(attestation.data); } catch { throw new HttpError(400, 'err.generic'); }
    const targets = snapshot.targets.filter(t => t.feast_id === id).map(targetFromRow);
    if (attestation.recipient !== zeroAddress || attestation.expirationTime !== '0' || attestation.revocationTime !== '0' || attestation.revocable || attestation.refUID !== zeroHash
      || BigInt(attestation.time) * 1000n < BigInt(feastClock(row).scatteringEndsAt)
      || data.feastId !== feastBytes32(id) || data.publishedSetHash !== closed.publishedSetHash || data.crumbsIssued !== Number(row.crumbs_per_critter)
      || canonicalJSON(data.targetIds) !== canonicalJSON(targets.map(t => t.id)) || canonicalJSON(data.owners.map(a => a.toLowerCase())) !== canonicalJSON(targets.map(t => (t.ownerAddress ?? zeroAddress).toLowerCase()))
      || data.scatterers > closed.counted.length || data.crumbs.reduce((sum, n) => sum + n, 0) !== data.scatterers * data.crumbsIssued) throw new HttpError(400, 'err.generic');
    return data;
  }
  return { async record(id: string, actor: Address, input: unknown) {
    const [location] = await db.query('select burrow_id from feasts where id=$1', [id]);
    if (!location) throw new HttpError(404, 'err.generic');
    const burrowId = String(location.burrow_id), snapshot = await transactions.read(burrowId);
    const row = gate(snapshot, id, actor);
    if (row.result_record) return { resultAttestation: row.result_record };
    const body = record(input), txHash = hex(body.txHash, 32), attester = parseAddress(body.attester);
    if (attester.toLowerCase() !== actor.toLowerCase()) throw new HttpError(403, 'err.generic');
    if (!reader) throw new HttpError(503, 'err.storeUnreachable');
    let attestation: ChainAttestation;
    try { attestation = await reader.read(txHash); } catch (error) { if (error instanceof EasRecordError) throw new HttpError(400, 'err.generic'); throw error; }
    if (attestation.attester.toLowerCase() !== actor.toLowerCase()) throw new HttpError(403, 'err.generic');
    return transactions.write(burrowId, (current, now, bind) => {
      const feast = gate(current, id, actor);
      if (feast.result_record) return { sql: [], result: { resultAttestation: feast.result_record } };
      const aggregate = validate(current, id, attestation);
      const saved = { chainId: attestation.chainId, txHash, uid: attestation.uid, attester: getAddress(attester), postedAt: now, aggregate };
      return { sql: [
        `insert into result_attestations (feast_id,chain_id,tx_hash,uid,attester,posted_at) select ${bind(id)}::uuid,${bind(saved.chainId)}::integer,${bind(txHash)},${bind(Buffer.from(saved.uid.slice(2), 'hex'))}::bytea,${bind(actor)},${bind(timestamp(now))}::timestamptz from gate`,
        `update feasts set result_record=${bind(JSON.stringify(saved))}::jsonb where id=${bind(id)}::uuid and exists(select 1 from gate)`,
      ], result: { resultAttestation: saved } };
    });
  } };
}
export function resultView(row: Record<string, unknown>): ResultView {
  const resultAttestation = row.result_record as ResultAttestation | null;
  return { resultAttestation, aggregate: resultAttestation?.aggregate ?? null };
}
