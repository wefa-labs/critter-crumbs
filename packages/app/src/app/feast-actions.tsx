import { useId, useState, type ReactNode } from 'react';
import { copy, formatCopy, type CopyId } from '@critter-crumbs/shared';
import { SheetNotice } from '../game/sheet-parts.js';
import type { RunAction } from './burrows.js';
import { burrowPath, DRAFT_SCENE, feastFrame, type Viewer } from './feast-place.js';
import { portraitVariant, type MemberFeast } from './feast-view.js';
import { FloorCritter } from './painted-floor.js';
import { PlaceScreen } from './place-screen.js';
import type { AppApi, Me } from './session.js';
import { absoluteDeadline, localDateTime, localTimeZone, relativeTime } from './time.js';
import { Dialog, Field, navigate } from './ui.js';
import '../styles/feast-pages.css';

/** The new close shown as the flow page writes it, "Mon 5 Oct, 18:00 (PDT)", for a field the browser fills in its own way; nothing while it holds no time. */
function shownDeadline(value: string) {
  const at = new Date(value).getTime();
  return Number.isFinite(at) ? absoluteDeadline(at) : '';
}

/**
 * The creator's actions on a draft and while gathering, each asking first in a dialog with one way out: Cancel this
 * feast beside Open the feast at the draft's foot, Open left out once the draft's gathering deadline has passed (`late`,
 * QA copy-08); Extend gathering (once) and Cancel this feast as quiet links at the end of gathering. The dialogs write
 * times as the flow page does ("Wed 7 Oct, 18:00 (PDT)"), and the extend field shows the new close that way too,
 * becoming the browser's own picker while it is being changed.
 */
export function FeastActions({ feast, me, api, run, busy, refresh, announce, late = false }: { feast: MemberFeast; me: Me; api: AppApi; run: RunAction; busy: boolean; refresh: () => void; announce: (text: string) => void; late?: boolean }) {
  const [action, setAction] = useState<'open' | 'extend' | 'cancel' | null>(null), [deadline, setDeadline] = useState(() => localDateTime(feast.gatheringEndsAt + 3600000));
  const [editing, setEditing] = useState(false);
  const formId = useId();
  if (feast.createdBy.toLowerCase() !== me.address.toLowerCase() || !['draft', 'gathering'].includes(feast.phase)) return null;
  const title = action === 'open' ? formatCopy('setup.open.title', { feastTitle: feast.title }) : action === 'cancel' ? formatCopy('gathering.cancel.title', { feastTitle: feast.title }) : copy['gathering.extend.title'];
  const shown = shownDeadline(deadline);
  const dialog = action ? <Dialog title={title} onClose={() => setAction(null)} busy={busy} dismiss={action === 'cancel' ? 'action.back' : 'action.cancel'} actions={<button form={formId} disabled={busy}>{action === 'open' ? copy['setup.open.cta'] : action === 'cancel' ? copy['gathering.cancel.cta'] : copy['gathering.extend.cta']}</button>}>
    <p>{action === 'open' ? formatCopy('setup.open.body', { gatheringDeadline: absoluteDeadline(feast.gatheringEndsAt) }) : action === 'cancel' ? copy['gathering.cancel.body'] : formatCopy('gathering.extend.body', { scatteringDeadline: absoluteDeadline(feast.scatteringEndsAt) })}</p>
    <form id={formId} onSubmit={event => { event.preventDefault(); void run(async () => { const at = new Date(deadline).getTime(); await api.write(`/api/feasts/${feast.id}/${action}`, 'POST', action === 'extend' ? { gatheringEndsAt: at } : undefined); if (action === 'extend') announce(formatCopy('gathering.extended', { relative: relativeTime(at, api.now() ?? feast.serverNow) })); setAction(null); refresh(); }); }}>
      {action === 'extend' ? <><Field label="setup.field.gathering"><span className="extend-box" data-shown={!editing && shown !== ''}>
        <input type="datetime-local" required value={deadline} onInput={event => setDeadline(event.currentTarget.value)} onChange={event => setDeadline(event.target.value)} min={localDateTime(feast.gatheringEndsAt + 60000)} max={localDateTime(feast.scatteringEndsAt - 60000)}
          onPointerDown={() => setEditing(true)} onKeyDown={() => setEditing(true)} onBlur={() => setEditing(false)} />
        <span className="extend-shown" aria-hidden="true">{shown}</span>
      </span></Field><p>{formatCopy('setup.deadline.help', { tz: localTimeZone() })}</p></> : null}
    </form>
  </Dialog> : null;
  if (feast.phase === 'draft') return <><button className="quiet" disabled={busy} onClick={() => setAction('cancel')}>{copy['gathering.cancel']}</button>{late ? null : <button data-sound="ui.tap" className="pill" disabled={busy} onClick={() => setAction('open')}>{copy['setup.open']}</button>}{dialog}</>;
  return <div className="creator-links">
    {feast.gatheringExtended ? null : <button data-sound="ui.tap" className="quiet left" disabled={busy} onClick={() => { setEditing(false); setAction('extend'); }}>{copy['gathering.extend']}</button>}
    <button className="quiet left" disabled={busy} onClick={() => setAction('cancel')}>{copy['gathering.cancel']}</button>{dialog}
  </div>;
}

/**
 * The saved draft (flow page, SCREENS.draft; the November UI audit's screen 26), which only its creator sees: a strip of
 * floor with your critter between two of the feast's, then the draft's chip, "Draft saved…" as a leaf notice, every
 * detail as a row with both closes, and Cancel this feast beside Open the feast at the foot. A draft whose gathering
 * deadline has passed says so in place of "Draft saved…". An options draft's statements follow (`children`).
 */
export function Draft({ feast, me, viewer, now, trouble, children, ...acting }: { feast: MemberFeast; me: Me; viewer: Viewer; now: number; trouble: string; api: AppApi; run: RunAction; busy: boolean; refresh: () => void; announce: (text: string) => void; children?: ReactNode }) {
  const late = now >= feast.gatheringEndsAt, people = feast.kind === 'people';
  const beside = feast.targets.filter(target => target.ownerAddress?.toLowerCase() !== me.address.toLowerCase()).slice(0, DRAFT_SCENE.beside.length);
  const rows: [CopyId, string][] = [
    ['setup.field.context', feast.context],
    ['setup.field.type', copy[people ? 'setup.type.people' : 'setup.type.options']],
    ['setup.field.crumbs', String(feast.crumbsPerCritter)],
    ['setup.field.gathering', absoluteDeadline(feast.gatheringEndsAt)],
    ['setup.field.scattering', absoluteDeadline(feast.scatteringEndsAt)],
    ['setup.privacy.aggregate.label', copy[feast.aggregatePublic ? 'setup.privacy.aggregate.public' : 'setup.privacy.aggregate.burrow']],
    ['setup.privacy.individual.label', copy[feast.individualOpen ? 'setup.privacy.individual.open' : 'setup.privacy.individual.closed']],
  ];
  return (
    <PlaceScreen {...feastFrame(feast, viewer)} back={() => navigate(burrowPath(feast))} painting={DRAFT_SCENE.painting} sheetHeight={DRAFT_SCENE.sheetHeight} className="feast-page feast-draft"
      floor={<>
        {beside.map((target, index) => <FloorCritter key={target.id} critter={{ ...DRAFT_SCENE.beside[index]!, address: target.ownerAddress ?? target.id, variant: portraitVariant(feast, target), asleep: !people }} />)}
        <FloorCritter critter={{ ...DRAFT_SCENE.viewer, address: me.address, variant: me.variant, asleep: false }} />
      </>}
      actions={<FeastActions feast={feast} me={me} {...acting} late={late} />}>
      {trouble ? <SheetNotice trouble>{trouble}</SheetNotice> : null}
      <span className="chip draft-chip">{copy['setup.draft.chip']}</span>
      {late ? <SheetNotice trouble>{copy['setup.open.late']}</SheetNotice> : <SheetNotice>{copy['setup.saved']}</SheetNotice>}
      <dl className="draft-rows">{rows.filter(([, value]) => value !== '').map(([label, value]) => <div key={label}><dt>{copy[label]}</dt><dd>{value}</dd></div>)}</dl>
      <p className="feast-help">{copy['setup.saved.help']}</p>
      {children}
    </PlaceScreen>
  );
}
