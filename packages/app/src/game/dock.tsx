import { useLayoutEffect, useRef, type ReactNode, type Ref } from 'react';
import { copy, formatCopy } from '@critter-crumbs/shared';
import type { GameScreenState } from '../app/feast-view.js';
import { GameIcon } from './icons.js';
import { CrumbGlyph } from './mound.js';
import { NAME_SIZES } from './styles.js';

/**
 * The scatter screen's dock, as the scatter page builds it (.dock, .focus, .bottom): one surface holding the critter in
 * focus above the bar, ‹ middle ›. ‹ and › never move. While scattering it is the "Your crumbs" landmark (Design
 * System §12.1); on the phone at the feast the results card grows out of the same surface, above the bar. Nothing in
 * it is a live region: what changes is announced through the app's two announcers (§12.6).
 */
export function Dock({ focusRow, middle, turn, results, crumbs = false }: { focusRow?: ReactNode; middle: ReactNode; turn: (direction: number) => void; results?: ReactNode; crumbs?: boolean }) {
  return (
    <aside className="game-dock" aria-label={crumbs ? copy['pile.label'] : undefined}>
      {results ?? null}
      {focusRow ?? null}
      <div className="dock-bar">
        <button type="button" className="dock-turn" aria-label={copy['read.prev']} onClick={() => turn(-1)}><GameIcon name="left" /></button>
        <div className="dock-middle">{middle}</div>
        <button type="button" className="dock-turn" aria-label={copy['read.next']} onClick={() => turn(1)}><GameIcon name="right" /></button>
      </div>
    </aside>
  );
}

/**
 * The focus row's frame: − on the left, the name and its line in the middle, + on the right. The row keeps one height for
 * every critter and state; − and + go for your own critter and at the feast, and dim once scattering has closed. The
 * name takes the largest size on the type scale that fits between them.
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

/**
 * The bar's middle while scattering, one kind per state (fillMiddle): the crumbs left with the closing line under them
 * on the phone, then Scatter These, Saving…, "Scattered." with the day it can be changed until, or the closed line.
 */
export function ScatterMiddle({ state, remaining, closes, until, onGo, goDisabled = false, source, done }: {
  state: GameScreenState; remaining: number; closes: string; until: string; onGo: () => void; goDisabled?: boolean;
  source?: Ref<HTMLSpanElement>; done?: Ref<HTMLDivElement>;
}) {
  if (state === 'saving') return <button type="button" className="pill dock-go" aria-disabled={true} disabled><span className="spinner" aria-hidden="true" />{copy['scatter.saving']}</button>;
  if (state === 'closed') return <span className="dock-closed">{copy['scatter.closed']}</span>;
  if (state === 'scattered') return (
    <div className="dock-scattered" ref={done} tabIndex={-1}>
      <span className="dock-done">{copy['scatter.done.title']}</span>
      <span className="dock-when">{formatCopy('scatter.done.body', { scatteringDeadline: until })}</span>
    </div>
  );
  if (!remaining) return <button type="button" className="pill dock-go" data-sound="ui.tap" disabled={goDisabled} onClick={onGo}>{copy['scatter.submit']}</button>;
  return (
    <>
      <span className="crumbs-left">
        <span className="crumb-icon" ref={source}><CrumbGlyph /></span>
        <span className="crumbs-left-count">{remaining}</span>
        <span className="crumbs-left-words">{copy['pile.remaining.words']}</span>
      </span>
      <span className="dock-when">{closes}</span>
    </>
  );
}

/** After the feast: Results in the bar opens the results and closes them again. */
export const ResultsPill = ({ open, toggle }: { open: boolean; toggle: () => void }) => (
  <button type="button" className="pill soft dock-go" aria-expanded={open} onClick={toggle}>{copy['results.title']}</button>
);
