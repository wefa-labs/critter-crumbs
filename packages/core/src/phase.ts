import type { FeastClock, Phase } from '@critter-crumbs/shared';

/** Milliseconds from the trusted clock; release of a key is a separate condition. */
export function phaseAt(feast: FeastClock, now: number): Phase {
  if (!Number.isFinite(now) || !Number.isFinite(feast.gatheringEndsAt) || !Number.isFinite(feast.scatteringEndsAt)
    || feast.gatheringEndsAt >= feast.scatteringEndsAt) throw new RangeError('Invalid feast clock');
  if (feast.status !== 'open') return feast.status;
  if (now < feast.gatheringEndsAt) return 'gathering';
  if (now < feast.scatteringEndsAt) return 'scattering';
  return 'feast';
}
