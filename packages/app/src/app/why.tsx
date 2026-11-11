import { useEffect, useId, useRef, type ReactNode } from 'react';
import { copy, formatCopy, whyCopy, type WhyCopyId } from '@critter-crumbs/shared';
import { ScreenHeader } from './screen-header.js';
import { SeedPodDrawing } from './seed-pod.js';
import { navigate } from './ui.js';

/** A line that leads with its key word, in bold, then says the rest. */
type Lead = readonly [lead: WhyCopyId, line: WhyCopyId];
/** What a member is promised: the pitch's five, each the guarantee PRD §8 makes. */
const PROMISES: readonly Lead[] = [
  ['why.promise.read.lead', 'why.promise.read.body'],
  ['why.promise.forge.lead', 'why.promise.forge.body'],
  ['why.promise.drop.lead', 'why.promise.drop.body'],
  ['why.promise.same.lead', 'why.promise.same.body'],
  ['why.promise.measure.lead', 'why.promise.measure.body'],
];
/** The game's four words, each by its name (PRD §3). */
const WORDS: readonly Lead[] = [
  ['why.words.burrow.lead', 'why.words.burrow.body'],
  ['why.words.critters.lead', 'why.words.critters.body'],
  ['why.words.scatter.lead', 'why.words.scatter.body'],
  ['why.words.feast.lead', 'why.words.feast.body'],
];
/** What runs where, for whoever wants the machinery: the one place Shutter, EAS, Gnosis Chain and Base are named. */
const RUNS: readonly Lead[] = [
  ['why.runs.device.lead', 'why.runs.device.body'],
  ['why.runs.store.lead', 'why.runs.store.body'],
  ['why.runs.gnosis.lead', 'why.runs.gnosis.body'],
  ['why.runs.base.lead', 'why.runs.base.body'],
  ['why.runs.ethereum.lead', 'why.runs.ethereum.body'],
];

/** A list whose lines lead with their key word, bold at the body's size, so a list read by ear can be scanned too. */
function Leads({ lines }: { lines: readonly Lead[] }) {
  return <ul className="why-leads">{lines.map(([lead, line]) => <li key={lead}><b>{whyCopy[lead]}</b>{' '}{whyCopy[line]}</li>)}</ul>;
}

/**
 * The page behind "Why nobody can peek" (docs/reviews/first-steps-2026-11, F4; Design System §9): one column under the
 * wordmark, headed by the closed seed pod of the private step. What you are promised, the one thing the app will not
 * pretend, the words, what runs where in the secondary colour, and the source, the one section that links out of the
 * app, to the code and the technical spec on GitHub (decision D3 of the review). It is linked from the private step and
 * the result of the first steps, the waiting screen and the results, and it never opens unasked. Got it goes back where
 * it was opened from.
 */
export function Why({ sound }: { sound: ReactNode }) {
  const heading = useRef<HTMLHeadingElement>(null), headingId = useId();
  useEffect(() => { document.title = formatCopy('app.pageTitle', { title: copy['why.title'] }); heading.current?.focus(); }, []);
  /* opened by a press in the app, which `navigate` records (ui.tsx), the page goes back through the browser's history:
     to the very screen it was opened on, and to the step the first steps were on, which keep their own way out; opened
     by its own address, with nothing recorded, it leads to the launcher, as the steps do */
  const leave = () => { if (typeof history.state?.from === 'string') history.back(); else navigate('/'); };
  return (
    <div className="core-game why">
      <ScreenHeader end={sound} />
      <article className="why-page" tabIndex={0} aria-labelledby={headingId}>
        <div className="why-column">
          <SeedPodDrawing width={44} />
          <h1 ref={heading} id={headingId} tabIndex={-1}>{copy['why.title']}</h1>
          <h2>{whyCopy['why.promises.title']}</h2>
          <Leads lines={PROMISES} />
          <h2>{whyCopy['why.limit.title']}</h2>
          <p>{whyCopy['why.limit.body']}</p>
          <h2>{whyCopy['why.words.title']}</h2>
          <Leads lines={WORDS} />
          <h2>{whyCopy['why.runs.title']}</h2>
          <div className="why-machinery"><p>{whyCopy['why.runs.connect']}</p><Leads lines={RUNS} /><p>{whyCopy['why.runs.beta']}</p></div>
          <h2>{whyCopy['why.source.title']}</h2>
          <p>{whyCopy['why.source.body']}</p>
          <p><a className="quiet" href="https://github.com/wefa-labs/critter-crumbs" rel="noopener">{whyCopy['why.source.code']}</a></p>
          <p><a className="quiet" href="https://github.com/wefa-labs/critter-crumbs/blob/main/docs/04-technical-spec.md" rel="noopener">{whyCopy['why.source.spec']}</a></p>
        </div>
      </article>
      <div className="why-foot"><button type="button" className="pill wide" onClick={leave}>{copy['learn.done']}</button></div>
    </div>
  );
}
