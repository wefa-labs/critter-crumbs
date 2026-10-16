import { useEffect, useRef, type ReactNode } from 'react';
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
    <Dialog title={title} className="game-dialog" onClose={cancel} busy={busy} actions={<>
        <button className="quiet" type="button" disabled={busy} onClick={cancel}>{copy['action.cancel']}</button>
        {action}
      </>}>
      {children}
    </Dialog>
  );
}

/**
 * A statement opened from the thought bubble on the phone: the bubble panel at the top of the screen, the element
 * chip and a close icon above the text. The dock's ‹ and › step through the circle; there is no position count.
 */
export function PhoneStatement({ name, element, body, empty, close }: { name: string; element: CritterElement | null; body: string | undefined; empty: string; close: () => void }) {
  const host = useRef<HTMLElement>(null), closer = useRef(close);
  closer.current = close;
  useEffect(() => {
    host.current?.focus();
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') closer.current(); };
    addEventListener('keydown', escape);
    return () => { removeEventListener('keydown', escape); document.querySelector<HTMLElement>('.thought-target')?.focus(); };
  }, []);
  return (
    <article ref={host} tabIndex={-1} className="phone-statement" aria-label={name}>
      <div className="statement-heading">
        {element ? <ElementChip element={element} /> : <strong>{name}</strong>}
        <button className="icon-button statement-close" type="button" aria-label={copy['action.close']} onClick={close}><GameIcon name="close" /></button>
      </div>
      <div className="statement-scroll" key={name}>{body ? <StatementText body={body} paragraphs /> : <p>{empty}</p>}</div>
    </article>
  );
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
      <div className="panel-scroll" key={name}>{body ? <StatementText body={body} paragraphs /> : <p>{empty}</p>}</div>
    </article>
  );
}

/** The phone's results: the dock grown into a card with its heading and close icon, the list scrolling under a fade. */
export function ResultsCard({ title, close, heading, children }: { title: string; close?: () => void; heading?: React.RefObject<HTMLHeadingElement | null>; children: ReactNode }) {
  return (
    <section className="results-card" aria-label={title}>
      <div className="results-heading">
        <h2 ref={heading} tabIndex={-1}>{title}</h2>
        {close ? <button className="icon-button statement-close" type="button" aria-label={copy['action.close']} onClick={close}><GameIcon name="close" /></button> : null}
      </div>
      <div className="results-scroll">{children}</div>
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
