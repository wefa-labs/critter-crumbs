import { useEffect, useRef, useState } from 'react';
import { copy, formatCopy } from '@critter-crumbs/shared';
import { useNotification } from './announcements.js';
import { AddCritter, CopyLink } from './burrow-parts.js';
import { BURROW_SHEETS, burrowPainting } from './burrow-scenes.js';
import { activeMembers, dateLabel, sameAddress, type BurrowMember, type BurrowView } from './burrow-view.js';
import type { RunAction } from './burrows.js';
import { PlaceScreen } from './place-screen.js';
import type { AppApi, Me, Session } from './session.js';
import { CritterFace, Dialog, displayName, memberLabel, navigate, shortAddress } from './ui.js';

/**
 * The burrow's critters, a screen of its own behind the burrow's Critters card (flow page, SCREENS.members, remove and
 * leave; the November UI audit's screens 19 to 21): the add field; everyone in the burrow by name and short address
 * (X7), you first and marked so, and Ready to join under a member added who has not joined yet; Remove as a quiet
 * link, for the burrow's creator only; then the past members, the membership history and, last, Leave this burrow.
 * Copy burrow link stays at the foot. Removing and leaving each ask first, and Cancel is the way out.
 */
export function CrittersScreen({ view, api, me, session, run, busy, refresh, onProfile }: {
  view: BurrowView; api: AppApi; me: Me; session: Session; run: RunAction; busy: boolean; refresh: () => void; onProfile: () => void;
}) {
  const notify = useNotification();
  const [removal, setRemoval] = useState<{ member: BurrowMember; operationId: string } | null>(null), [leaving, setLeaving] = useState(false);
  const history = useRef<HTMLHeadingElement>(null), [removed, setRemoved] = useState(false);
  /* once a removal is in the history the burrow reads back, the focus goes to the history, where it now stands */
  useEffect(() => { if (removed && view.removals.length) { history.current?.focus(); setRemoved(false); } }, [removed, view]);
  const active = activeMembers(view), past = view.members.filter(member => member.leftAt !== null), creator = sameAddress(view.createdBy, me.address);
  const yours = (member: BurrowMember) => sameAddress(member.address, me.address);
  const burrowPage = `/burrows/${view.id}`;
  return (
    <PlaceScreen title={copy['burrow.members.title']} burrow={view.name} href={burrowPage} back={() => navigate(burrowPage)} viewer={{ address: me.address, variant: me.variant, open: onProfile }}
      painting={burrowPainting(view.feasts.length)} sheetHeight={BURROW_SHEETS.critters} floor={null} className="burrow-screen burrow-critters"
      actions={<CopyLink id={view.id} run={run} className="pill soft wide" />}>
      <AddCritter id={view.id} api={api} run={run} busy={busy} added={refresh} />
      <ul role="list" className="burrow-rows">{[...active.filter(yours), ...active.filter(member => !yours(member))].map(member => (
        <MemberRow key={member.address} member={member} you={yours(member)} remove={creator && !yours(member) ? () => setRemoval({ member, operationId: crypto.randomUUID() }) : undefined} busy={busy} />
      ))}</ul>
      {past.length ? <details className="burrow-past">
        <summary><span>{copy['burrow.historical']}</span><span className="burrow-count">{past.length}</span></summary>
        <ul role="list" className="burrow-rows">{past.map(member => <MemberRow key={member.address} member={member} you={false} busy={busy} />)}</ul>
      </details> : null}
      {view.removals.length ? <section className="burrow-history">
        <h3 ref={history} tabIndex={-1}>{copy['burrow.removals.title']}</h3>
        <ol>{view.removals.map(event => <li key={event.id}>
          <p>{formatCopy('burrow.removals.line', { actor: memberLabel(event.actorName, event.actorAddress), name: memberLabel(event.memberName, event.address) })}</p>
          <time dateTime={new Date(event.removedAt).toISOString()}>{dateLabel(event.removedAt)}</time>
        </li>)}</ol>
      </section> : null}
      <button type="button" data-sound="ui.tap" className="quiet left" onClick={() => setLeaving(true)}>{copy['burrow.leave']}</button>
      {removal ? <Dialog title={formatCopy('burrow.remove.title', { name: displayName(removal.member) })} onClose={() => setRemoval(null)} busy={busy} dismiss="action.cancel" className="burrow-dialog"
        actions={<button type="button" className="pill" disabled={busy} onClick={() => void run(async () => {
          try {
            await api.write(`/api/burrows/${view.id}/removals`, 'POST', { address: removal.member.address, membershipVersion: removal.member.membershipVersion, operationId: removal.operationId });
            setRemoved(true); notify(formatCopy('burrow.remove.done', { name: displayName(removal.member) })); setRemoval(null);
          } finally { refresh(); }
        })}>{copy['burrow.remove']}</button>}><p>{copy['burrow.remove.body']}</p></Dialog> : null}
      {leaving ? <Dialog title={formatCopy('burrow.leave.title', { burrowName: view.name })} onClose={() => setLeaving(false)} busy={busy} dismiss="action.cancel" className="burrow-dialog"
        actions={<button type="button" className="pill" disabled={busy} onClick={() => void run(async () => { await api.write(`/api/burrows/${view.id}/leave`, 'POST'); setLeaving(false); await session.restore(); navigate('/'); })}>{copy['burrow.leave.cta']}</button>}>
        <p>{copy['burrow.leave.body']}</p></Dialog> : null}
    </PlaceScreen>
  );
}

/**
 * One critter of the burrow (flow page, memberRow()): its face, its name, marked if it is you, the short address where
 * the name is not already one, and Ready to join for a member added who has not joined; `remove` puts the quiet Remove
 * at the right, whose name says whom it removes.
 */
function MemberRow({ member, you, remove, busy }: { member: BurrowMember; you: boolean; remove?: (() => void) | undefined; busy: boolean }) {
  const name = displayName(member), short = shortAddress(member.address);
  return (
    <li className="burrow-row">
      <CritterFace address={member.address} variant={member.variant} name={name} size={40} />
      <span className="burrow-row-words">
        <b>{you ? formatCopy('burrow.members.you', { name }) : name}</b>
        {name === short ? null : <span className="address">{short}</span>}
        {member.joinedAt === null && member.leftAt === null ? <small>{copy['burrow.preAdded']}</small> : null}
      </span>
      {remove ? <button type="button" className="quiet" aria-label={formatCopy('burrow.remove.label', { name })} disabled={busy} onClick={remove}>{copy['burrow.remove']}</button> : null}
    </li>
  );
}
