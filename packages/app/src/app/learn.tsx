import { useEffect, useRef, useState, type ReactNode } from 'react';
import { copy, formatCopy, HOLD_DELAY_MS, POUR_RATE_MIN } from '@critter-crumbs/shared';
import { useAudio } from '../audio/context.js';
import { CrumbGlyph } from '../game/mound.js';
import { Grow } from '../game/sheet-parts.js';
import { ROUND } from '../game/styles.js';
import { LEARN_SHEET_HEIGHT, LEARN_STEPS } from './learn-steps.js';
import { FloorCritter, FloorHeap, PaintedFloor } from './painted-floor.js';
import { sheetScreenStyle, standingStyle, type SceneCritter, type Standing } from './painted-scene.js';
import { flyPracticeCrumb } from './practice-flight.js';
import { Link, navigate } from './ui.js';

/** Each step's title and line. The second step's title is the scatter screen's own instruction. */
const WORDS = [['learn.handful.title', 'learn.handful.body'], ['scatter.instruction', 'learn.tap.body'], ['learn.private.title', 'learn.private.body']] as const;

/** A closed seed pod: where a scatter rests until the feast (design pass, Appendix A: "gentle hiding, not locks"). */
function SeedPod({ pod }: { pod: Standing }) {
  return (
    <div className="floor-prop" style={standingStyle(pod)}>
      <svg viewBox="-14 -22 28 30" aria-hidden="true">
        <ellipse cx="0" cy="4" rx="11" ry="2.6" fill="var(--cc-ink)" opacity=".16" />
        <path d="M0-14 C9-12 11-2 8 3 C5 6 -5 6 -8 3 C-11-2 -9-12 0-14Z" fill="var(--cc-pod)" stroke="var(--cc-ink)" strokeWidth="1.4" />
        <path d="M0-13 C1-6 1 0 0 5" fill="none" stroke="var(--cc-ink)" strokeWidth="1.1" opacity=".7" />
        <path d="M0-14 C-1-17 1-19 4-20" fill="none" stroke="var(--cc-pod-stem)" strokeWidth="1.8" strokeLinecap={ROUND} />
        <ellipse cx="6" cy="-19" rx="3.6" ry="1.8" transform="rotate(-25 6 -19)" fill="var(--cc-pod-leaf)" stroke="var(--cc-ink)" strokeWidth=".9" />
      </svg>
    </div>
  );
}

/** A critter that takes practice crumbs: a press gives one, and holding pours them, as on the scatter screen. */
function PracticeCritter({ critter, give, released }: { critter: SceneCritter; /** gives one crumb if any is left, and says whether it did */ give: (critter: Element) => boolean; released: () => void }) {
  const hold = useRef<number | undefined>(undefined), pour = useRef<number | undefined>(undefined);
  const stop = () => { if (hold.current === undefined && pour.current === undefined) return; window.clearTimeout(hold.current); window.clearInterval(pour.current); hold.current = pour.current = undefined; released(); };
  useEffect(() => () => { window.clearTimeout(hold.current); window.clearInterval(pour.current); }, []);
  return (
    <FloorCritter critter={critter}>
      <button type="button" className="practice-hit" aria-label={copy['learn.tap.give']}
        onPointerDown={event => {
          if (!event.isPrimary || event.button !== 0) return;
          const target = event.currentTarget.parentElement!; event.preventDefault(); event.currentTarget.focus();
          if (!give(target)) return;
          hold.current = window.setTimeout(() => { pour.current = window.setInterval(() => { if (!give(target)) stop(); }, 1000 / POUR_RATE_MIN); }, HOLD_DELAY_MS);
        }}
        onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop} onBlur={stop}
        onClick={event => { if (event.detail !== 0) return; give(event.currentTarget.parentElement!); released(); }} />
    </FloorCritter>
  );
}

/**
 * The first steps behind "How it works" (flow page, SCREENS['learn-handful'], ['learn-tap'] and ['learn-private']):
 * three short screens that can be skipped, open to anyone before connecting. On the second, ten practice crumbs can be
 * given away; they are counted nowhere. This is the one tour the app has (docs/decisions.md, 2026-10-11).
 */
export function Learn({ sound, announce, still }: { sound: ReactNode; announce: (text: string) => void; still: boolean }) {
  const [step, setStep] = useState(0), heading = useRef<HTMLHeadingElement>(null), floor = useRef<HTMLDivElement>(null), crumb = useRef<HTMLSpanElement>(null);
  const scene = LEARN_STEPS[step]!, [title, body] = WORDS[step]!, last = step === LEARN_STEPS.length - 1;
  /* the practice crumbs left: the count the pour reads between renders, and the count on the screen */
  const remaining = useRef(0), [left, setLeft] = useState(0), audio = useAudio();
  useEffect(() => { document.title = formatCopy('app.pageTitle', { title: copy['launch.learn'] }); }, []);
  useEffect(() => { heading.current?.focus(); }, [step]);
  const leave = () => navigate('/');
  function next() { remaining.current = LEARN_STEPS[step + 1]!.practice?.crumbs ?? 0; setLeft(remaining.current); setStep(step + 1); }
  function give(critter: Element) {
    if (remaining.current <= 0) return false;
    remaining.current--; setLeft(remaining.current); audio.play(remaining.current ? 'crumb.add' : 'pile.empty');
    const heap = floor.current?.querySelector('[data-practice]');
    if (!still && floor.current && crumb.current && heap) { const flying = crumb.current.cloneNode(true) as HTMLElement; flying.hidden = false; flyPracticeCrumb(floor.current, flying, heap, critter); }
    return true;
  }
  const say = () => announce(remaining.current ? formatCopy('pile.remaining', { n: remaining.current }) : copy['pile.empty']);
  return (
    <div className="core-game learn">
      <header className="game-header"><Link href="/" className="wordmark">{copy['app.name']}</Link>{sound}</header>
      <div className="sheet-screen" style={sheetScreenStyle(LEARN_SHEET_HEIGHT)}>
        <PaintedFloor painting={scene.painting} className="screen-floor" ref={floor}>
          {scene.critters.map(critter => scene.practice
            ? <PracticeCritter key={critter.address} critter={critter} give={give} released={say} />
            : <FloorCritter key={critter.address} critter={critter} />)}
          {scene.heaps.map(heap => <FloorHeap key={heap.x} heap={heap} />)}
          {scene.pods.map(pod => <SeedPod key={pod.x} pod={pod} />)}
          {scene.practice ? <FloorHeap heap={scene.practice} crumbs={left} practice /> : null}
          <span className="practice-crumb" ref={crumb} hidden><CrumbGlyph /></span>
        </PaintedFloor>
        <section className="screen-sheet">
          <div className="learn-dots" role="img" aria-label={formatCopy('learn.step', { i: step + 1, n: LEARN_STEPS.length })}>{LEARN_STEPS.map((_, index) => <i key={index} data-on={index === step} />)}</div>
          <h1 ref={heading} tabIndex={-1}>{copy[title]}</h1>
          <p>{copy[body]}</p>
          {scene.practice ? <p className="learn-count">{left ? <><b>{left}</b>{' '}{copy['pile.remaining.words']}</> : copy['pile.empty']}</p> : null}
          <Grow />
          <div className="learn-actions">
            {last ? <button type="button" className="pill wide" onClick={leave}>{copy['learn.done']}</button>
              : <><button type="button" className="quiet" onClick={leave}>{copy['learn.skip']}</button><button type="button" className="pill" onClick={next}>{copy['learn.next']}</button></>}
          </div>
        </section>
      </div>
    </div>
  );
}
