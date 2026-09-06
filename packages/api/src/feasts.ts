import { resultView } from './results.js';
import { randomBytes, randomUUID } from 'node:crypto';
import { optionTargetId, phaseAt, type Timelock } from '@critter-crumbs/core';
import { MAX_FEAST_TARGETS, hex, integer, parseFeastSetup, parseStatement, type Address, type Registration, type Target } from '@critter-crumbs/shared';
import { bytesToHex, concatHex, getAddress, keccak256, stringToHex } from 'viem';
import type { Database, Row } from './database.js';
import { HttpError } from './errors.js';
import { activeMember, createBurrowTransactions, requireMember, timestamp, type BurrowSnapshot } from './burrow-transactions.js';
import { dbHex, feastClock, feastFromRow, milliseconds, targetFromRow } from './feast-rows.js';
import { freezePeopleTargets, insertTarget, peopleTargets, sameAddress } from './targets.js';
export function createFeasts(db: Database, clock: () => number, timelock?: Timelock) {
  const transactions = createBurrowTransactions(db, clock);
  async function read(id: string, actor: Address | null) {
    const [found] = await db.query('select burrow_id from feasts where id=$1', [id]);
    if (!found) throw new HttpError(404, 'err.generic');
    const snapshot = await transactions.read(String(found.burrow_id));
    const row = snapshot.feasts.find(row => row.id === id)!;
    const member = actor ? activeMember(snapshot, actor) : undefined;
    if (row.status === 'draft' && (!member || row.created_by !== actor)) throw new HttpError(403, 'burrow.unknown.title');
    if (!member) {
      const targets = visibleTargets(snapshot, row);
      return { ...(row.aggregate_public && phaseAt(feastClock(row), snapshot.now) === 'feast' ? resultView(row) : {}), id, burrowName: snapshot.burrow.name, title: row.title, context: row.context, kind: row.kind, ...feastClock(row), aggregatePublic: row.aggregate_public, targets, phase: phaseAt(feastClock(row), snapshot.now), serverNow: snapshot.now };
    }
    return view(snapshot, id, actor!);
  }
  function visibleTargets(snapshot: BurrowSnapshot, row: Row) {
    return row.kind === 'people' && ['draft', 'gathering'].includes(phaseAt(feastClock(row), snapshot.now))
      ? peopleTargets(snapshot.members) : snapshot.targets.filter(target => target.feast_id === row.id).map(targetFromRow);
  }
  function view(snapshot: BurrowSnapshot, id: string, actor: Address) {
    const row = snapshot.feasts.find(row => row.id === id)!;
    const targets = visibleTargets(snapshot, row);
    const feast = feastFromRow(row, targets, snapshot.participants.filter(participant => participant.feast_id === id).map(participant => String(participant.address)));
    const phase = phaseAt(feast, snapshot.now);
    const statements = snapshot.statements.filter(statement => statement.feast_id === id && targets.some(target => target.id === dbHex(statement.target_id)));
    const ballots = snapshot.ballots.filter(ballot => ballot.feast_id === id);
    return { ...feast, ...resultView(row), phase, serverNow: snapshot.now,
      statements: statements.filter(statement => ['scattering', 'feast'].includes(phase) || sameAddress(String(statement.author_address), actor))
        .map(statement => ({ targetId: dbHex(statement.target_id), authorAddress: getAddress(String(statement.author_address)), body: statement.body, updatedAt: milliseconds(statement.updated_at) })),
      participation: { written: statements.filter(statement => String(statement.body).length > 0).map(statement => dbHex(statement.target_id)), scattered: [...new Set(ballots.map(ballot => String(ballot.attester)))].sort().map(address => getAddress(address)) }, ownBallotUids: ballots.filter(ballot => ballot.attester === actor).map(ballot => dbHex(ballot.uid)) };
  }
  async function location(id: string) {
    const [row] = await db.query('select burrow_id from feasts where id=$1', [id]);
    if (!row) throw new HttpError(404, 'err.generic'); return String(row.burrow_id);
  }
  function requireCreator(snapshot: BurrowSnapshot, id: string, actor: Address) {
    requireMember(snapshot, actor);
    const row = snapshot.feasts.find(row => row.id === id);
    if (!row || row.created_by !== actor) throw new HttpError(403, 'err.generic'); return row;
  }
  return { read,
    async open(id: string, actor: Address) {
      if (!timelock) throw new HttpError(503, 'err.storeUnreachable');
      const burrowId = await location(id), token = randomUUID();
      const reservation = await transactions.write(burrowId, (snapshot, now, bind) => {
        const row = requireCreator(snapshot, id, actor), phase = phaseAt(feastClock(row), now);
        if (row.status === 'open') return { sql: [], result: null };
        if (phase !== 'draft' || milliseconds(row.gathering_ends_at) <= now) throw new HttpError(400, 'setup.deadline.order');
        integer(visibleTargets(snapshot, row).length, 1, MAX_FEAST_TARGETS, 'err.feastCapacity');
        if (row.kind === 'people' && snapshot.members.filter(member => member.left_at === null).length < 3) throw new HttpError(400, 'setup.min.people');
        if (row.shutter_registration_started_at !== null && now - milliseconds(row.shutter_registration_started_at) < 60000) throw new HttpError(503, 'err.storeUnreachable');
        const prefix = row.shutter_identity_prefix ? dbHex(row.shutter_identity_prefix) : keccak256(concatHex([stringToHex(`critter-crumbs${id}`), bytesToHex(randomBytes(32))]));
        return { sql: [`update feasts set shutter_identity_prefix=${bind(Buffer.from(prefix.slice(2), 'hex'))}::bytea,shutter_registration_started_at=${bind(timestamp(now))}::timestamptz,shutter_registration_token=${bind(token)}::uuid where id=${bind(id)}::uuid and exists(select 1 from gate)`], result: { prefix, deadline: milliseconds(row.scattering_ends_at) } };
      });
      if (!reservation) return read(id, actor);
      try {
        const registered = await timelock.register(id, reservation.deadline, reservation.prefix);
        const registration: Registration = { identityPrefix: hex(registered.identityPrefix, 32), identity: hex(registered.identity, 32), eon: integer(registered.eon, 0, 2147483647), eonKey: hex(registered.eonKey), txHash: registered.txHash === null ? null : hex(registered.txHash, 32) };
        if (registration.identityPrefix !== reservation.prefix || registration.eonKey.length <= 2) throw new Error('Invalid registration response');
        await transactions.write(burrowId, (snapshot, now, bind) => {
          const row = requireCreator(snapshot, id, actor);
          if (row.shutter_registration_token !== token || phaseAt(feastClock(row), now) !== 'draft' || milliseconds(row.gathering_ends_at) <= now) throw new HttpError(400, 'setup.deadline.order');
          if (visibleTargets(snapshot, row).length > MAX_FEAST_TARGETS) throw new HttpError(400, 'err.feastCapacity');
          return { sql: [`update feasts set status='open',opened_at=${bind(timestamp(now))}::timestamptz,
            shutter_identity=${bind(Buffer.from(registration.identity.slice(2), 'hex'))}::bytea,shutter_eon=${bind(registration.eon)}::int,shutter_eon_key=${bind(Buffer.from(registration.eonKey.slice(2), 'hex'))}::bytea,shutter_tx_hash=${bind(registration.txHash)},shutter_registration_started_at=null,shutter_registration_token=null
            where id=${bind(id)}::uuid and shutter_registration_token=${bind(token)}::uuid and exists(select 1 from gate)`], result: undefined };
        });
      } catch (error) {
        await transactions.write(burrowId, (_, _now, bind) => ({ sql: [`update feasts set shutter_registration_started_at=null,shutter_registration_token=null where id=${bind(id)}::uuid and shutter_registration_token=${bind(token)}::uuid and exists(select 1 from gate)`], result: undefined }));
        if (error instanceof HttpError) throw error;
        throw new HttpError(503, 'err.storeUnreachable');
      }
      return read(id, actor);
    },
    async cancel(id: string, actor: Address) {
      const burrowId = await location(id);
      await transactions.write(burrowId, (snapshot, now, bind) => {
        const row = requireCreator(snapshot, id, actor);
        if (!['draft', 'gathering'].includes(phaseAt(feastClock(row), now))) throw new HttpError(400, 'scatter.closed');
        return { sql: [...(row.kind === 'people' ? freezePeopleTargets(snapshot.members, id, bind) : []), `update feasts set status='cancelled',cancelled_at=${bind(timestamp(now))}::timestamptz where id=${bind(id)}::uuid and exists(select 1 from gate)`], result: undefined };
      });
      return read(id, actor);
    },
    async extend(id: string, actor: Address, input: unknown) {
      const deadline = integer(input, 0, 8640000000000000, 'setup.deadline.order'), burrowId = await location(id);
      await transactions.write(burrowId, (snapshot, now, bind) => {
        const row = requireCreator(snapshot, id, actor), times = feastClock(row);
        if (phaseAt(times, now) !== 'gathering' || row.gathering_extended || deadline <= times.gatheringEndsAt || deadline >= times.scatteringEndsAt) throw new HttpError(400, 'setup.deadline.order');
        return { sql: [`update feasts set gathering_ends_at=${bind(timestamp(deadline))}::timestamptz,gathering_extended=true where id=${bind(id)}::uuid and exists(select 1 from gate)`], result: undefined };
      });
      return read(id, actor);
    },
    async statement(id: string, targetId: string, actor: Address, input: unknown) {
      const body = parseStatement(input), burrowId = await location(id);
      await transactions.write(burrowId, (snapshot, now, bind) => {
        requireMember(snapshot, actor);
        const row = snapshot.feasts.find(row => row.id === id)!;
        const phase = phaseAt(feastClock(row), now);
        if (phase !== 'gathering' && !(phase === 'draft' && row.kind === 'options')) throw new HttpError(400, 'scatter.closed');
        const targets = row.kind === 'people' ? peopleTargets(snapshot.members) : snapshot.targets.filter(target => target.feast_id === id).map(targetFromRow);
        const target = targets.find(target => target.id === targetId);
        if (!target || !sameAddress(target.ownerAddress ?? String(row.created_by), actor)) throw new HttpError(403, 'err.generic');
        return { sql: [insertTarget(target, id, bind), `insert into statements (feast_id,target_id,author_address,body,updated_at)
          select ${bind(id)}::uuid,${bind(Buffer.from(targetId.slice(2), 'hex'))}::bytea,${bind(actor)},${bind(body)},${bind(timestamp(now))}::timestamptz from gate
          on conflict (feast_id,target_id) do update set body=excluded.body,updated_at=excluded.updated_at`], result: undefined };
      });
      return read(id, actor);
    },
    async create(burrowId: string, actor: Address, input: unknown) {
    const setup = parseFeastSetup(input), id = randomUUID();
    await transactions.write(burrowId, (snapshot, now, bind) => {
      requireMember(snapshot, actor);
      if (setup.gatheringEndsAt <= now) throw new HttpError(400, 'setup.deadline.order');
      if (setup.kind === 'people' && snapshot.members.filter(member => member.left_at === null).length < 3) throw new HttpError(400, 'setup.min.people');
      const targets: Target[] = setup.kind === 'people' ? peopleTargets(snapshot.members) : setup.options.map((option, position) => ({ id: optionTargetId(id, position), name: option.name, position, ownerAddress: null, kind: 'option' }));
      integer(targets.length, 1, MAX_FEAST_TARGETS, 'err.feastCapacity');
      const sql = [`insert into feasts (id,burrow_id,created_by,kind,title,context,crumbs_per_critter,gathering_ends_at,scattering_ends_at,aggregate_public,individual_open)
        select ${bind(id)}::uuid,id,${bind(actor)},${bind(setup.kind)}::feast_kind,${bind(setup.title)},${bind(setup.context)},${bind(setup.crumbsPerCritter)}::int,${bind(timestamp(setup.gatheringEndsAt))}::timestamptz,${bind(timestamp(setup.scatteringEndsAt))}::timestamptz,${bind(setup.aggregatePublic)}::boolean,${bind(setup.individualOpen)}::boolean from gate`];
      for (const target of targets) {
        sql.push(insertTarget(target, id, bind));
        if (setup.kind === 'options') sql.push(`insert into statements (feast_id,target_id,author_address,body,updated_at) select ${bind(id)}::uuid,${bind(Buffer.from(target.id.slice(2), 'hex'))}::bytea,${bind(actor)},${bind(setup.options[target.position]!.statement)},${bind(timestamp(now))}::timestamptz from gate`);
      }
      return { sql, result: undefined };
    });
    return read(id, actor);
  } };
}
