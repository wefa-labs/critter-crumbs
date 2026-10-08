import { useEffect, useRef } from 'react';
import { copy, formatCopy, type CopyId } from '@critter-crumbs/shared';
import { IsOwn } from '../world/index.js';
import type { StageRuntime } from '../sim/stage-runtime.js';
import { targetLabel } from '../app/ui.js';
import type { MemberFeast } from '../app/feast-view.js';
import { critterElement, type GameSurfaces } from './parts.js';
import { GameDialog, Grow, Loader, PanelStatement, PhoneStatement, SheetNotice } from './surface.js';
import { CrumbGlyph } from './mound.js';

/**
 * The contents of the core states' sheets and dialog, as the flow page draws them (SCREENS.reveal, sign, waiting,
 * key-not-yet and feast). The live screens and the gallery render these same pieces.
 */

/** Flow 34: the title, the line, and Start reading across the foot of the sheet once the reveal has settled. */
export function RevealSheet({ crumbs, ready, start }: { crumbs: number; ready: boolean; start: () => void }) {
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (ready) button.current?.focus(); }, [ready]);
  return (
    <>
      <h2>{copy['reveal.title']}</h2>
      <p>{formatCopy('reveal.body', { crumbs })}</p>
      <Grow />
      <button ref={button} type="button" className="pill wide" disabled={!ready} onClick={start}>{copy['reveal.cta']}</button>
    </>
  );
}

/** Flow 42 and 43: the feast being laid out, with three bobbing crumbs, or why it cannot be yet and Try again. */
export function WaitingSheet({ error, retry }: { error: CopyId | null; retry: () => void }) {
  return error ? (
    <>
      <h2>{copy['feast.waiting.title']}</h2>
      <SheetNotice trouble>{copy[error]}</SheetNotice>
      <Grow />
      <button type="button" className="pill soft wide" onClick={retry}>{copy['action.retry']}</button>
    </>
  ) : (
    <>
      <h2>{copy['feast.waiting.title']}</h2>
      <p>{copy['feast.waiting.body']}</p>
      <Loader crumb={<CrumbGlyph />} />
      <Grow />
    </>
  );
}

/** Flow 44: one line under the waking circle, and Skip to results. */
export function FeastSheet({ skip }: { skip: () => void }) {
  return (
    <>
      <p className="sheet-help">{copy['feast.sequence']}</p>
      <button type="button" className="quiet" onClick={skip}>{copy['feast.skip']}</button>
    </>
  );
}

/** Flow 36: confirming a scatter, which costs nothing; Cancel beside Scatter These. */
export function SignDialog({ cancel, confirm, busy }: { cancel: () => void; confirm: () => void; busy: boolean }) {
  return (
    <GameDialog title={copy['scatter.sign.title']} cancel={cancel} busy={busy}
      action={<button type="button" className="pill" disabled={busy} onClick={confirm}>{busy ? copy['scatter.saving'] : copy['scatter.submit']}</button>}>
      <p>{copy['scatter.sign.body']}</p>
    </GameDialog>
  );
}

/** The focused critter's statement: the phone's thought-bubble panel and the desktop side panel. */
export function statementSurfaces({ feast, runtime, focus, close }: { feast: MemberFeast; runtime: StageRuntime; focus: number; close: () => void }): NonNullable<GameSurfaces['statement']> {
  const target = feast.targets[focus]!, name = targetLabel(target), element = critterElement(runtime, focus);
  const body = feast.statements.find(statement => statement.targetId === target.id)?.body, empty = formatCopy('read.noStatement', { name });
  return {
    phone: <PhoneStatement name={name} element={element} body={body} empty={empty} close={close} />,
    panel: <PanelStatement name={name} element={element} own={!!runtime.critters[focus]?.has(IsOwn)} body={body} empty={empty} />,
  };
}
