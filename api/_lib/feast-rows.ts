import { bytesToHex, getAddress } from 'viem';
import { hex, type Feast, type Hex, type Target } from '@critter-crumbs/shared';
import type { FeastClock, FeastStatus } from '@critter-crumbs/shared';
import type { Row } from './database.js';
export const milliseconds = (value: unknown): number => new Date(value as string | number).getTime();
export function feastClock(row: Row): FeastClock {
  return { status: row.status as FeastStatus, gatheringEndsAt: milliseconds(row.gathering_ends_at), scatteringEndsAt: milliseconds(row.scattering_ends_at) };
}

export const dbHex = (value: unknown): Hex => value instanceof Uint8Array ? bytesToHex(value) : hex(String(value).replace(/^\\x/, '0x'));
export function targetFromRow(row: Row): Target {
  return { id: dbHex(row.target_id), ownerAddress: row.owner_address ? getAddress(String(row.owner_address)) : null, name: String(row.name), position: Number(row.position), kind: row.kind as Target['kind'] };
}
export function feastFromRow(row: Row, targets: Target[], participants: string[]): Feast {
  return { ...feastClock(row), id: String(row.id), burrowId: String(row.burrow_id), createdBy: getAddress(String(row.created_by)),
    title: String(row.title), context: String(row.context), kind: row.kind as Feast['kind'], crumbsPerCritter: Number(row.crumbs_per_critter),
    aggregatePublic: Boolean(row.aggregate_public), individualOpen: Boolean(row.individual_open), gatheringExtended: Boolean(row.gathering_extended),
    openedAt: row.opened_at === null ? null : milliseconds(row.opened_at), cancelledAt: row.cancelled_at === null ? null : milliseconds(row.cancelled_at),
    participantsFrozenAt: row.participants_frozen_at === null ? null : milliseconds(row.participants_frozen_at),
    targets, participants: participants.map(address => getAddress(address)), closeRecord: row.close_record as Feast['closeRecord'],
    registration: row.shutter_identity && row.shutter_eon_key ? { identityPrefix: dbHex(row.shutter_identity_prefix), identity: dbHex(row.shutter_identity), eon: Number(row.shutter_eon), eonKey: dbHex(row.shutter_eon_key), txHash: row.shutter_tx_hash as Hex | null } : null };
}
