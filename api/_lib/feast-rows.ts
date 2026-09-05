import type { FeastClock, FeastStatus } from '@critter-crumbs/shared';
import type { Row } from './database.js';
export const milliseconds = (value: unknown): number => new Date(value as string | number).getTime();
export function feastClock(row: Row): FeastClock {
  return { status: row.status as FeastStatus, gatheringEndsAt: milliseconds(row.gathering_ends_at), scatteringEndsAt: milliseconds(row.scattering_ends_at) };
}
