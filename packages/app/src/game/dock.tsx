import { useLayoutEffect, useRef, type ReactNode, type Ref } from 'react';
import { copy, formatCopy } from '@critter-crumbs/shared';
import { GameIcon } from './icons.js';
import { CrumbGlyph } from './mound.js';
import { NAME_SIZES } from './styles.js';

/**
 * The scatter screen's dock, as the scatter page builds it (.dock, .focus, .bottom): one surface holding the critter in
 * focus above the bar, ‹ middle ›. ‹ and › never move; the middle is the crumbs left, then the one action, then the
 * scattered state. On the phone at the feast the results card grows out of the same surface, above the bar.
 */
export function Dock({ focusRow, middle, turn, results }: { focusRow?: ReactNode; middle: ReactNode; turn: (direction: number) => void; results?: ReactNode }) {
  return (
    <div className="game-dock">
      {results ?? null}
      {focusRow ?? null}
      <div className="dock-bar">
        <button type="button" className="dock-turn" aria-label={copy['read.prev']} onClick={() => turn(-1)}><GameIcon name="left" /></button>
        <div className="dock-middle" aria-live="polite">{middle}</div>
        <button type="button" className="dock-turn" aria-label={copy['read.next']} onClick={() => turn(1)}><GameIcon name="right" /></button>
      </div>
    </div>
  );
}

/**
 * The focus row's frame: − on the left, the name and its line in the middle, + on the right. The row keeps one height for
 * every critter and state; − and + go for your own critter and at the feast, and dim once scattering has closed.
 */
export function FocusRow({ minus, plus, name, line, dimmed = false }: { minus?: ReactNode; plus?: ReactNode; name: string; line: ReactNode; dimmed?: boolean }) {
  const controls = !!minus && !!plus, named = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const node = named.current;
    if (node) for (const size of NAME_SIZES) { node.dataset.size = size; if (node.scrollWidth <= node.clientWidth) break; }
  }, [name]);
  return (
    <div className="focus-row" data-controls={!controls ? 'none' : dimmed ? 'disabled' : 'live'}>
      {controls ? minus : <span className="focus-spacer" />}
      <div className="focus-centre">
        <span ref={named} className="focus-name" title={name}>{name}</span>
        {line}
      </div>
      {controls ? plus : <span className="focus-spacer" />}
    </div>
  );
}

/** At the feast the second line is what the critter received and its share, as one line like the count while scattering. */
export function FedLine({ received, share }: { received: ReactNode; share: string }) {
  return <span className="focus-count">{received}<span className="focus-share">{copy['game.share.separator']}{share}</span></span>;
}

/** The crumbs left: the crumb, the number and "to go"; on the phone the closing line sits under it. */
export function CrumbsLeft({ remaining, closes, source }: { remaining: number; closes?: string; source?: Ref<HTMLSpanElement> }) {
  return (
    <>
      <span className="crumbs-left" role="group" aria-label={copy['pile.label']}>
        <span className="crumb-icon" ref={source}><CrumbGlyph /></span>
        <span className="crumbs-left-count">{remaining}</span>
        <span className="crumbs-left-words">{formatCopy('pile.remaining', { n: remaining }).replace(/^\d+\s*/, '')}</span>
      </span>
      {closes ? <span className="dock-when">{closes}</span> : null}
    </>
  );
}

/** Scatter These, while it is still saving: the pill held down with a spinner. */
export function SavingPill() {
  return <button type="button" className="pill dock-go" aria-disabled={true} disabled><span className="spinner" aria-hidden="true" />{copy['scatter.saving']}</button>;
}

/** After scattering: "Scattered." and the day it can still be changed until. */
export const ScatteredNote = ({ until, focusRef }: { until: string; focusRef?: Ref<HTMLDivElement> }) => (
  <div className="dock-scattered" ref={focusRef} tabIndex={-1}>
    <span className="dock-done">{copy['scatter.done.title']}</span>
    <span className="dock-when">{formatCopy('scatter.done.body', { scatteringDeadline: until })}</span>
  </div>
);

export const ClosedNote = () => <span className="dock-closed">{copy['scatter.closed']}</span>;

/** After the feast: Results in the bar opens the results and closes them again. */
export const ResultsPill = ({ open, toggle }: { open: boolean; toggle: () => void }) => (
  <button type="button" className="pill soft dock-go" aria-expanded={open} onClick={toggle}>{copy['results.title']}</button>
);
