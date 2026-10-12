import { useEffect, useState } from 'react';
import { copy, formatCopy, type CopyId, type FeastClock, type Phase } from '@critter-crumbs/shared';
import { absoluteTime, relativeTime } from './time.js';
import type { AppApi } from './session.js';
export const phaseCopy: Record<Phase, CopyId> = { draft: 'phase.draft', gathering: 'phase.gathering', scattering: 'phase.scattering', feast: 'phase.feast', cancelled: 'feast.cancelled', void: 'phase.void' };
export function useTrustedTime(api: AppApi) {
  const [now, setNow] = useState(api.now());
  useEffect(() => { const timer = setInterval(() => setNow(api.now()), 1000); return () => clearInterval(timer); }, [api]);
  return now;
}
const deadlineCopy = { gathering: 'deadline.gathering', scattering: 'deadline.scattering' } as const;
/** "Gathering closes in 2 days", or "Gathering closed yesterday" once it has, at minute granularity. */
export function deadlineLine(phase: 'gathering' | 'scattering', at: number, now: number) {
  const relative = relativeTime(at, Math.floor(now / 60000) * 60000);
  return at - now <= 0 ? formatCopy('deadline.closed', { phase: copy[phaseCopy[phase]], relative }) : formatCopy(deadlineCopy[phase], { relative });
}
function Deadline({ phase, at, now }: { phase: 'gathering' | 'scattering'; at: number; now: number }) {
  const [expanded, setExpanded] = useState(false), difference = at - now;
  const relative = relativeTime(at, Math.floor(now / 60000) * 60000), text = deadlineLine(phase, at, now);
  return <div className="deadline"><button className="quiet" aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>{text}{difference > 0 && difference < 21600000 ? <small>{formatCopy('deadline.soon', { relative })}</small> : null}</button>{expanded ? <time dateTime={new Date(at).toISOString()}>{absoluteTime(at)}</time> : null}</div>;
}
export function DeadlineStrip({ feast, now }: { feast: FeastClock; now: number }) {
  // Minute-granularity presentation; phase selection still consumes the full trusted time.
  return <div className="deadline-strip" aria-live="off"><Deadline phase="gathering" at={feast.gatheringEndsAt} now={now} /><Deadline phase="scattering" at={feast.scatteringEndsAt} now={now} /></div>;
}
