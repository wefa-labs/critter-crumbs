/** Complete v1 payloads fit mock and Shutter encryption; see research/scatter-capacity.md. */
export const MAX_FEAST_TARGETS = 49;
export const MAX_CIPHERTEXT_BYTES = 4096;
/** How far a scatter's signed time may stand from the store's clock, either way, for the store to take it (Technical Spec §7). */
export const BALLOT_TIME_TOLERANCE_SECONDS = 300;
/**
 * The longest name a member can give themselves or an option, in Unicode code points: the most the circle's tags and
 * the dock's focus row were designed around (docs/decisions.md, 2026-10-05 and 2026-11-03). Names saved before the
 * limit stay as they are.
 */
export const MAX_NAME_LENGTH = 16;
/** Crumbs per critter (PRD P9): a whole number from 10 to 1,000, and 100 unless the creator changes it. */
export const CRUMBS_PER_CRITTER = { fewest: 10, most: 1000, norm: 100 } as const;
