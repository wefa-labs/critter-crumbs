import { useEffect, useLayoutEffect, useRef, type ReactNode, type RefObject } from 'react';
import { copy } from '@critter-crumbs/shared';
import { Dialog } from '../app/ui.js';
import { StatementText } from '../app/gathering.js';
import { ElementChip, GameIcon, type CritterElement } from './icons.js';

/**
 * The pieces each core state's surface is made of (game/composition.ts), ported from the review pages' CSS and DOM:
 * the flow page's .sheet, .toast and dialog, and the scatter page's statement bubble, side panel and results.
 */

/** A passing message at the top of the floor, clear of the circle and the critter in focus. It is not a live region: the screen that shows it also says it through the app's announcers (Design System §12.6). */
export function Toast({ children }: { children: ReactNode }) {
  return <div className="game-toast">{children}</div>;
}

export { Grow, Loader, SheetNotice } from './sheet-parts.js';

/**
 * The signing step: a sheet from the bottom on the phone, a centred card on desktop. Native <dialog>, opened modally
 * and announced; Cancel and Escape both close it.
 */
export function GameDialog({ title, children, cancel, action, busy = false }: { title: string; children: ReactNode; cancel: () => void; action: ReactNode; busy?: boolean }) {
  return (
    <Dialog title={title} className="game-dialog" onClose={cancel} busy={busy} dismiss="action.cancel" actions={action}>
      {children}
    </Dialog>
  );
}

/**
 * A statement's words, scrolling inside its bubble or panel. The box is a stop for the keys of its own, named for its
 * critter, so the words of a statement longer than the box can be reached by keyboard in every engine, Safari's
 * included (QA accessibility-06). The same box shows each critter's words as the circle turns, so focus stays in it, and
 * each starts at the top.
 */
function StatementScroll({ className, name, body, empty, scroller }: { className: string; name: string; body: string | undefined; empty: string; scroller?: RefObject<HTMLDivElement | null> }) {
  const inner = useRef<HTMLDivElement>(null), box = scroller ?? inner;
  useLayoutEffect(() => { if (box.current) box.current.scrollTop = 0; }, [name]);
  return <div ref={box} className={className} tabIndex={0} role="region" aria-label={name}>{body ? <StatementText body={body} paragraphs /> : <p>{empty}</p>}</div>;
}

/**
 * A statement opened from the thought bubble on the phone: the bubble panel at the top of the screen, the element
 * chip and a close icon above the text, which takes focus so the keys scroll it straight away. The dock's ‹ and › step
 * through the circle; there is no position count.
 */
export function PhoneStatement({ name, element, body, empty, close }: { name: string; element: CritterElement | null; body: string | undefined; empty: string; close: () => void }) {
  const scroll = useRef<HTMLDivElement>(null), closer = useRef(close);
  closer.current = close;
  useEffect(() => {
    scroll.current?.focus();
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') closer.current(); };
    addEventListener('keydown', escape);
    return () => { removeEventListener('keydown', escape); document.querySelector<HTMLElement>('.thought-target')?.focus(); };
  }, []);
  return (
    <article tabIndex={-1} className="phone-statement" aria-label={name}>
      <div className="statement-heading">
        {element ? <ElementChip element={element} /> : <strong>{name}</strong>}
        <button className="icon-button statement-close" type="button" aria-label={copy['action.close']} onClick={close}><GameIcon name="close" /></button>
      </div>
      <StatementScroll className="statement-scroll" scroller={scroll} name={name} body={body} empty={empty} />
    </article>
  );
}

/**
 * How tall an open phone statement (a PhoneStatement inside `host`) stands with all of its text showing: the bubble's
 * frame and heading, the text's own height and the padding under it. The text's height is its laid-out height, which
 * the bubble's opening scale does not change; a pixel more covers the frame's measures, which the browser rounds.
 * `text` is the element to watch for its height changing; null until the statement has rendered.
 */
export function measureStatement(host: HTMLElement) {
  const bubble = host.firstElementChild, text = bubble?.querySelector<HTMLElement>('.statement-scroll > *');
  if (!(bubble instanceof HTMLElement) || !text) return null;
  const scroll = text.parentElement!, room = getComputedStyle(scroll), measured = getComputedStyle(text);
  return { text, height: () => bubble.offsetHeight - scroll.offsetHeight + parseFloat(room.paddingTop) + parseFloat(room.paddingBottom) + parseFloat(measured.height) + 1 };
}

/** On desktop the side panel always holds the focused critter's statement: its name, element and "You" for your own. */
export function PanelStatement({ name, element, own, body, empty }: { name: string; element: CritterElement | null; own: boolean; body: string | undefined; empty: string }) {
  return (
    <article className="panel-statement" aria-label={name}>
      <div className="panel-heading">
        <h2>{name}</h2>
        {element ? <ElementChip element={element} /> : null}
        {own ? <span className="panel-own">{copy['scatter.own.short']}</span> : null}
      </div>
      <StatementScroll className="panel-scroll" name={name} body={body} empty={empty} />
    </article>
  );
}

/**
 * The phone's results: the dock grown into a card with its heading and close icon, the list scrolling under a fade, and
 * its actions pinned at its foot, so a long list never pushes the download below the fold (decision D9).
 */
export function ResultsCard({ title, close, heading, actions, children }: { title: string; close?: () => void; heading?: React.RefObject<HTMLHeadingElement | null>; actions?: ReactNode; children: ReactNode }) {
  return (
    <section className="results-card" aria-label={title}>
      <div className="results-heading">
        <h2 ref={heading} tabIndex={-1}>{title}</h2>
        {close ? <button className="icon-button statement-close" type="button" aria-label={copy['action.close']} onClick={close}><GameIcon name="close" /></button> : null}
      </div>
      <div className="results-scroll">{children}</div>
      {actions ? <div className="results-actions">{actions}</div> : null}
    </section>
  );
}

/** Desktop results: the panel's list, with its actions in a bar at its foot level with the folded dock. */
export function ResultsPanel({ title, close, heading, actions, children }: { title: string; close?: () => void; heading?: React.RefObject<HTMLHeadingElement | null>; actions?: ReactNode; children: ReactNode }) {
  return (
    <section className="results-panel" aria-label={title}>
      <div className="panel-heading">
        <h2 ref={heading} tabIndex={-1}>{title}</h2>
        {close ? <button className="icon-button statement-close" type="button" aria-label={copy['action.close']} onClick={close}><GameIcon name="close" /></button> : null}
      </div>
      <div className="results-scroll">{children}</div>
      {actions ? <div className="results-bar">{actions}</div> : null}
    </section>
  );
}
