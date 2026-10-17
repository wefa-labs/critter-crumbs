import { useEffect, useState } from 'react';
import type { FeastClock } from '@critter-crumbs/shared';
import { deadlineLines } from './deadline-lines.js';
import { absoluteTime } from './time.js';
import type { AppApi } from './session.js';
export { deadlineLine, phaseCopy } from './deadline-lines.js';
export function useTrustedTime(api: AppApi) {
  const [now, setNow] = useState(api.now());
  useEffect(() => { const timer = setInterval(() => setNow(api.now()), 1000); return () => clearInterval(timer); }, [api]);
  return now;
}
function Deadline({ text, at }: { text: string; at: number }) {
  const [expanded, setExpanded] = useState(false);
  return <div className="deadline"><button className="quiet" aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>{text}</button>{expanded ? <time dateTime={new Date(at).toISOString()}>{absoluteTime(at)}</time> : null}</div>;
}
export function DeadlineStrip({ feast, now }: { feast: FeastClock; now: number }) {
  // Minute-granularity presentation; phase selection still consumes the full trusted time.
  const [gathering, scattering] = deadlineLines(feast, now);
  return gathering && scattering ? <div className="deadline-strip" aria-live="off"><Deadline text={gathering} at={feast.gatheringEndsAt} /><Deadline text={scattering} at={feast.scatteringEndsAt} /></div> : null;
}
