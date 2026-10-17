import { phaseAt } from '@critter-crumbs/core';
import { copy, formatCopy, type CopyId, type FeastClock, type Phase } from '@critter-crumbs/shared';
import { relativeTime } from './time.js';

export const phaseCopy: Record<Phase, CopyId> = { draft: 'phase.draft', gathering: 'phase.gathering', scattering: 'phase.scattering', feast: 'phase.feast', cancelled: 'feast.cancelled', void: 'phase.void' };
const deadlineCopy = { gathering: 'deadline.gathering', scattering: 'deadline.scattering' } as const;
/** Inside six hours the next deadline reads "Closing soon" (Design System §8). */
const CLOSING_SOON = 6 * 3600000;
/**
 * "Gathering closes in 2 days", or "Gathering closed yesterday" once it has, at minute granularity. The next deadline
 * inside six hours reads "Closing soon — in 1 hour" in its place.
 */
export function deadlineLine(phase: 'gathering' | 'scattering', at: number, now: number, next = false) {
  const relative = relativeTime(at, Math.floor(now / 60000) * 60000);
  if (at - now <= 0) return formatCopy('deadline.closed', { phase: copy[phaseCopy[phase]], relative });
  return formatCopy(next && at - now < CLOSING_SOON ? 'deadline.soon' : deadlineCopy[phase], { relative });
}
/**
 * The feast's two deadlines, each said once (QA copy-08). Only the next can be closing soon, so the later one keeps its
 * name and the two stay apart; a cancelled or void feast has nothing left to count down to.
 */
export function deadlineLines(feast: FeastClock, now: number): readonly string[] {
  const phase = phaseAt(feast, now);
  if (phase === 'cancelled' || phase === 'void') return [];
  const next = now < feast.gatheringEndsAt ? 'gathering' : 'scattering';
  return [deadlineLine('gathering', feast.gatheringEndsAt, now, next === 'gathering'), deadlineLine('scattering', feast.scatteringEndsAt, now, next === 'scattering')];
}
