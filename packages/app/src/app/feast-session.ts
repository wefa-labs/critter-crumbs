import { ApiClientError, createCloseRecord, decodeBallot, feastBytes32, phaseAt, readFeastKey, tally, verifyOffchainAttestation, type EasConfig, type Timelock } from '@critter-crumbs/core';
import { canonicalJSON, hex, MAX_CIPHERTEXT_BYTES, parseAddress, parseAllocationPayload, parseSignedOffchainAttestation, type CloseRecord, type Hex, type PublishedEntry, type TallyCandidate, type TallyResult } from '@critter-crumbs/shared';
import { hexToBytes, zeroAddress, zeroHash } from 'viem';
import type { AppApi } from './session.js';
import type { MemberFeast } from './feast-view.js';
export interface OpenedFeast { result: TallyResult; closeRecord: CloseRecord; missingUids: string[]; givers: (PublishedEntry & { amounts: number[] })[] }
interface Options { api: AppApi; feast: MemberFeast; timelock: Timelock; eas: EasConfig; acceptedUids?: string[]; yieldToBrowser: () => Promise<void> }
const normalizeRecord = (record: CloseRecord): CloseRecord => ({ ...record,published:record.published.map(entry=>({ ...entry,attester:parseAddress(entry.attester) })),counted:record.counted.map(entry=>({ ...entry,attester:parseAddress(entry.attester) })) });
interface StoredCandidate extends PublishedEntry { ciphertext: Hex; attestation: unknown }
/** Authenticate publication and ciphertexts, then hand plaintext to the single reviewed tally. */
export async function openFeastResult({ api, feast, timelock, eas, acceptedUids = [], yieldToBrowser }: Options): Promise<OpenedFeast | null> {
  // Obtain a fresh server stamp even on direct navigation and on a fast device clock.
  api.invalidate(); const response = await api.get(`/api/feasts/${feast.id}`);
  const now = api.now();
  if (now === null || phaseAt(feast, now) !== 'feast') throw new ApiClientError('feast.keyNotYet', 400);
  if (!('participants' in response)) throw new ApiClientError('err.sessionExpired', 401);
  const publication = await api.get(`/api/feasts/${feast.id}/ballots`);
  let closeRecord: CloseRecord; const stored = publication.ballots as StoredCandidate[];
  try {
    closeRecord = normalizeRecord(publication.closeRecord as CloseRecord);
    const expected = createCloseRecord(feast.id,closeRecord.published,closeRecord.closedAt);
    if (closeRecord.closedAt < feast.scatteringEndsAt || canonicalJSON(expected) !== canonicalJSON(closeRecord)
      || (feast.closeRecord && canonicalJSON(normalizeRecord(feast.closeRecord)) !== canonicalJSON(closeRecord))
      || canonicalJSON(normalizeRecord(response.closeRecord as CloseRecord)) !== canonicalJSON(closeRecord)
      || stored.length !== closeRecord.counted.length
      || stored.some((candidate,index) => canonicalJSON({ seq:candidate.seq,uid:candidate.uid,attester:parseAddress(candidate.attester) }) !== canonicalJSON(closeRecord.counted[index]))) throw new Error();
  } catch { throw new ApiClientError('err.publicationChanged', 200); }
  const missingUids = [...new Set([...acceptedUids,...feast.ownBallotUids,...response.ownBallotUids as string[]])].filter(uid => !closeRecord.published.some(entry => entry.uid === uid));
  const key = await readFeastKey(api,feast,timelock); if (!key) return null;
  const ballots: TallyCandidate[] = [];
  for (const candidate of stored) {
    let plaintext: string | null = null;
    try {
      const signed = parseSignedOffchainAttestation(candidate.attestation), message = signed.message;
      const decoded = decodeBallot(message.data), ciphertext = hex(candidate.ciphertext);
      if (signed.uid !== candidate.uid || message.recipient !== zeroAddress || message.expirationTime !== '0' || message.revocable || message.refUID !== zeroHash
        || decoded.payloadVersion !== 1 || decoded.feastId !== feastBytes32(feast.id) || decoded.shutterIdentity !== feast.registration?.identity
        || decoded.ciphertext !== ciphertext || (ciphertext.length-2)/2 > MAX_CIPHERTEXT_BYTES
        || !await verifyOffchainAttestation(candidate.attester,signed,eas)) throw new Error();
      plaintext = new TextDecoder('utf-8',{ fatal:true }).decode(await timelock.decrypt(hexToBytes(ciphertext),key));
    } catch { /* The latest candidate remains present and the core records it as unreadable. */ }
    ballots.push({ seq:candidate.seq,uid:candidate.uid,attester:candidate.attester,plaintext });
    await yieldToBrowser();
  }
  const result = tally({ feastId:feast.id,publishedSetHash:closeRecord.publishedSetHash,crumbsIssued:feast.crumbsPerCritter,targets:feast.targets,participants:feast.participants,ballots });
  const givers = result.counted.map(entry => ({ ...entry,amounts:parseAllocationPayload(JSON.parse(ballots.find(candidate => candidate.seq===entry.seq)!.plaintext!)).allocation.map(([,amount])=>amount) }));
  return { result,closeRecord,missingUids,givers };
}
