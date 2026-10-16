import { useId, useState } from 'react';
import { copy, formatCopy } from '@critter-crumbs/shared';
import type { MemberFeast } from './feast-view.js';
import type { AppApi, Me } from './session.js';
import type { RunAction } from './burrows.js';
import { absoluteTime, localDateTime, localTimeZone, relativeTime } from './time.js';
import { Dialog, Field } from './ui.js';
export function FeastActions({ feast, me, api, run, busy, refresh, announce }: { feast: MemberFeast; me: Me; api: AppApi; run: RunAction; busy: boolean; refresh: () => void; announce: (text: string) => void }) {
  const [action, setAction] = useState<'open' | 'extend' | 'cancel' | null>(null), [deadline, setDeadline] = useState(() => localDateTime(feast.gatheringEndsAt + 3600000));
  const formId = useId();
  if (feast.createdBy.toLowerCase() !== me.address.toLowerCase() || !['draft', 'gathering'].includes(feast.phase)) return null;
  const title = action === 'open' ? formatCopy('setup.open.title', { feastTitle: feast.title }) : action === 'cancel' ? formatCopy('gathering.cancel.title', { feastTitle: feast.title }) : copy['gathering.extend.title'];
  return <div className="actions">
    {feast.phase === 'draft' ? <button data-sound="ui.tap" disabled={busy} onClick={() => setAction('open')}>{copy['setup.open']}</button> : !feast.gatheringExtended ? <button data-sound="ui.tap" className="secondary" disabled={busy} onClick={() => setAction('extend')}>{copy['gathering.extend']}</button> : null}
    <button className="quiet" disabled={busy} onClick={() => setAction('cancel')}>{copy['gathering.cancel']}</button>
    {action ? <Dialog title={title} onClose={() => setAction(null)} busy={busy} actions={<><button form={formId} disabled={busy}>{action === 'open' ? copy['setup.open.cta'] : action === 'cancel' ? copy['gathering.cancel.cta'] : copy['gathering.extend.cta']}</button><button type="button" className="secondary" disabled={busy} onClick={() => setAction(null)}>{copy['action.cancel']}</button></>}>
      <p>{action === 'open' ? formatCopy('setup.open.body', { gatheringDeadline: absoluteTime(feast.gatheringEndsAt) }) : action === 'cancel' ? copy['gathering.cancel.body'] : formatCopy('gathering.extend.body', { scatteringDeadline: absoluteTime(feast.scatteringEndsAt) })}</p>
      <form id={formId} onSubmit={event => { event.preventDefault(); void run(async () => { const at = new Date(deadline).getTime(); await api.write(`/api/feasts/${feast.id}/${action}`, 'POST', action === 'extend' ? { gatheringEndsAt: at } : undefined); if (action === 'extend') announce(formatCopy('gathering.extended', { relative: relativeTime(at, api.now() ?? feast.serverNow) })); setAction(null); refresh(); }); }}>
        {action === 'extend' ? <><Field label="setup.field.gathering"><input type="datetime-local" required value={deadline} onInput={event => setDeadline(event.currentTarget.value)} onChange={event => setDeadline(event.target.value)} min={localDateTime(feast.gatheringEndsAt + 60000)} max={localDateTime(feast.scatteringEndsAt - 60000)} /></Field><p>{formatCopy('setup.deadline.help', { tz: localTimeZone() })}</p></> : null}
      </form>
    </Dialog> : null}
  </div>;
}
export function DraftSummary({ feast }: { feast: MemberFeast }) {
  return <section><p className="chip">{copy['setup.draft.chip']}</p><p>{copy['setup.saved']}</p><p>{copy['setup.saved.help']}</p><dl><dt>{copy['setup.field.type']}</dt><dd>{feast.kind === 'people' ? copy['setup.type.people'] : copy['setup.type.options']}</dd><dt>{copy['setup.field.crumbs']}</dt><dd>{feast.crumbsPerCritter}</dd><dt>{copy['setup.privacy.aggregate.label']}</dt><dd>{feast.aggregatePublic ? copy['setup.privacy.aggregate.public'] : copy['setup.privacy.aggregate.burrow']}</dd><dt>{copy['setup.privacy.individual.label']}</dt><dd>{feast.individualOpen ? copy['setup.privacy.individual.open'] : copy['setup.privacy.individual.closed']}</dd></dl></section>;
}
