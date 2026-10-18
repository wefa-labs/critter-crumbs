import { useEffect, useRef, useState } from 'react';
import { ApiClientError, phaseAt } from '@critter-crumbs/core';
import { copy, formatCopy, type FeastClock, type Profile, type MemberRemoval } from '@critter-crumbs/shared';
import { absoluteTime } from './time.js';
import { phaseCopy } from './deadlines.js';
import { CritterFace, Dialog, Field, Link, Page, PendingPage, PortraitImage, displayName, memberLabel, navigate, shortAddress, useResource } from './ui.js';
import { gardenReview } from '../portraits/version.js';
import type { AppApi, Me, Session } from './session.js';
import { useNotification } from './announcements.js';
import { copyBurrowLink } from './clipboard.js';
export type RunAction = (action: () => Promise<void>) => Promise<void>;
export interface BurrowView { id: string; name: string; createdBy: string; removals: MemberRemoval[]; serverNow: number; members: (Profile & { membershipVersion: number; joinedAt: number | null; leftAt: number | null })[]; feasts: (FeastClock & { id: string; title: string })[] }

export function Home({ me, api }: { me: Me; api: AppApi }) {
  return <Page title={copy['home.title']}><div className="page-actions"><Link className="button" href="/burrows/new">{copy['home.empty.cta']}</Link></div>
    {me.burrows.length ? <ul role="list" className="link-list">{me.burrows.map(burrow => <BurrowCard key={burrow.id} burrow={burrow} api={api} />)}</ul>
      : <section className="empty-state"><PortraitImage address={me.address} variant={me.variant} name={displayName(me)} size={96} asleep /><h2>{copy['home.empty.title']}</h2><p>{copy['home.empty.body']}</p></section>}
  </Page>;
}
function BurrowCard({ burrow, api }: { burrow: Me['burrows'][number]; api: AppApi }) {
  const resource = useResource<BurrowView>(api, `/api/burrows/${burrow.id}`);
  const next = resource.data?.feasts.filter(feast => feast.status === 'open').flatMap(feast => [feast.gatheringEndsAt, feast.scatteringEndsAt]).filter(at => at > (api.now() ?? resource.data!.serverNow)).sort((a, b) => a - b)[0];
  return <li className="burrow-card"><Link href={`/burrows/${burrow.id}`}><strong>{burrow.name}</strong>{resource.data ? <><p>{formatCopy('home.critterCount', { n: resource.data.members.filter(member => member.leftAt === null).length })}</p>{next ? <p>{formatCopy('home.nextDeadline', { deadline: absoluteTime(next) })}</p> : <p>{copy['home.noDeadline']}</p>}</> : resource.error ? <p>{copy['err.storeUnreachable']}</p> : null}</Link></li>;
}
export function CreateBurrow({ api, session, run, busy }: { api: AppApi; session: Session; run: RunAction; busy: boolean }) {
  const [name, setName] = useState('');
  return <Page title={copy['burrow.create.title']}><form className="form-column" onSubmit={event => { event.preventDefault(); void run(async () => { const result = await api.write('/api/burrows', 'POST', { name }); await session.restore(); navigate(`/burrows/${result.id}`); }); }}>
    <Field label="burrow.name.label"><input autoFocus required maxLength={60} value={name} onChange={event => setName(event.target.value)} /></Field>
    <div className="actions"><button disabled={busy || !name.trim()}>{copy['burrow.create.cta']}</button><Link href="/">{copy['action.cancel']}</Link></div>
  </form></Page>;
}
export function Burrow({ id, api, me, session, run, busy }: { id: string; api: AppApi; me: Me; session: Session; run: RunAction; busy: boolean }) {
  const announce = useNotification();
  const resource = useResource<BurrowView>(api, `/api/burrows/${id}`), [address, setAddress] = useState(''), [leave, setLeave] = useState(false);
  const [removal, setRemoval] = useState<{ member: BurrowView['members'][number]; operationId: string } | null>(null);
  const history = useRef<HTMLHeadingElement>(null), [removed, setRemoved] = useState(false);
  useEffect(() => { if (removed && resource.data?.removals.length) { history.current?.focus(); setRemoved(false); } }, [removed, resource.data]);
  if (!resource.data) {
    if (resource.error instanceof ApiClientError && resource.error.status === 403) {
      const detail = resource.error.detail as { burrowName?: string } | undefined;
      return <Page title={copy['burrow.unknown.title']}><p>{formatCopy('burrow.unknown.body', { burrowName: detail?.burrowName ?? copy['app.name'], shortAddress: shortAddress(me.address) })}</p><Link href="/">{copy['action.back']}</Link></Page>;
    }
    /* A link that leads to no burrow: the store has no burrow by that id (404), or the id is not one at all, as when a
       link is cut short in copying (400). Trying again cannot help, so the page says so in place of Try again. */
    if (resource.error instanceof ApiClientError && (resource.error.status === 404 || resource.error.status === 400)) return <Page title={copy['burrow.missing.title']}><p>{copy['burrow.missing.body']}</p><Link href="/">{copy['action.back']}</Link></Page>;
    return <PendingPage error={resource.error} retry={resource.refresh} />;
  }
  const burrow = resource.data, active = burrow.members.filter(member => member.leftAt === null), historical = burrow.members.filter(member => member.leftAt !== null);
  const self = active.find(member => member.address.toLowerCase() === me.address.toLowerCase());
  function members(list: BurrowView['members']) { return <ul role="list" className="member-list">{list.map(member => <li key={member.address}>
    {gardenReview ? <CritterFace address={member.address} variant={member.variant} name={displayName(member)} size={40} /> : <PortraitImage address={member.address} variant={member.variant} name={displayName(member)} />}<div><strong>{displayName(member)}</strong><span className="address">{member.address}</span>{member.joinedAt === null && member.leftAt === null ? <small>{copy['burrow.preAdded']}</small> : null}</div>{burrow.createdBy.toLowerCase() === me.address.toLowerCase() && member.address.toLowerCase() !== me.address.toLowerCase() && member.leftAt === null ? <button className="quiet" aria-label={formatCopy('burrow.remove.label', { name: displayName(member) })} disabled={busy} onClick={() => setRemoval({ member, operationId: crypto.randomUUID() })}>{copy['burrow.remove']}</button> : null}
  </li>)}</ul>; }
  return <Page title={burrow.name} context={burrow.name} screen={copy['app.burrowScreen']}>
    <div className="actions"><button className="secondary" onClick={() => { void run(async () => { await copyBurrowLink(burrow.id); announce(copy['burrow.link.copied']); }); }}>{copy['burrow.link.copy']}</button>
      {self?.joinedAt === null ? <button disabled={busy} onClick={() => { void run(async () => { await api.write(`/api/burrows/${id}/join`, 'POST'); resource.refresh(); }); }}>{copy['burrow.join']}</button> : null}
    </div>
    <div className="burrow-columns"><section><h2>{copy['burrow.members.title']}</h2>{active.length === 1 ? <p>{copy['burrow.empty.body']}</p> : null}{members(active)}
      <form onSubmit={event => { event.preventDefault(); void run(async () => { await api.write(`/api/burrows/${id}/members`, 'POST', { address }); announce(formatCopy('burrow.add.done', { name: address })); setAddress(''); resource.refresh(); }); }}>
        <Field label="burrow.add.label"><input data-initial-focus={active.length === 1} autoCapitalize="none" spellCheck={false} required value={address} onChange={event => setAddress(event.target.value)} /></Field><button disabled={busy || !address.trim()}>{copy['burrow.add.cta']}</button>
      </form>
      {historical.length ? <details><summary>{copy['burrow.historical']}</summary>{members(historical)}</details> : null}
    </section><section><div className="section-heading"><h2>{copy['burrow.feasts.title']}</h2><Link className="button secondary" href={`/burrows/${id}/feasts/new`}>{copy['burrow.feasts.new']}</Link></div>
      {burrow.feasts.length ? <ul role="list" className="link-list">{burrow.feasts.map(feast => <li key={feast.id}><Link href={`/feasts/${feast.id}`}>{feast.title}</Link><div><span className="chip">{copy[phaseCopy[phaseAt(feast, burrow.serverNow)]]}</span><p><time dateTime={new Date(feast.scatteringEndsAt).toISOString()}>{absoluteTime(feast.scatteringEndsAt)}</time></p></div></li>)}</ul> : <div className="empty-state"><h3>{copy['burrow.feasts.empty.title']}</h3><p>{copy['burrow.feasts.empty.body']}</p></div>}
    </section></div>
    {burrow.removals.length ? <section><h2 ref={history} tabIndex={-1}>{copy['burrow.removals.title']}</h2><ol className="history-list">{burrow.removals.map(event => <li key={event.id}><p>{formatCopy('burrow.removals.line', { actor: memberLabel(event.actorName, event.actorAddress), name: memberLabel(event.memberName, event.address) })}</p><p className="address">{event.actorAddress}<br />{event.address}</p><time dateTime={new Date(event.removedAt).toISOString()}>{absoluteTime(event.removedAt)}</time></li>)}</ol></section> : null}
    {removal ? <Dialog title={formatCopy('burrow.remove.title', { name: displayName(removal.member) })} onClose={() => setRemoval(null)} busy={busy} actions={<><button disabled={busy} onClick={() => void run(async () => { try { await api.write(`/api/burrows/${id}/removals`, 'POST', { address: removal.member.address, membershipVersion: removal.member.membershipVersion, operationId: removal.operationId }); setRemoved(true); announce(formatCopy('burrow.remove.done', { name: displayName(removal.member) })); setRemoval(null); } finally { resource.refresh(); } })}>{copy['burrow.remove']}</button><button className="secondary" disabled={busy} onClick={() => setRemoval(null)}>{copy['action.cancel']}</button></>}><p>{copy['burrow.remove.body']}</p></Dialog> : null}
    <button data-sound="ui.tap" className="quiet" onClick={() => setLeave(true)}>{copy['burrow.leave']}</button>
    {leave ? <Dialog title={formatCopy('burrow.leave.title', { burrowName: burrow.name })} onClose={() => setLeave(false)} busy={busy} actions={<><button disabled={busy} onClick={() => { void run(async () => { await api.write(`/api/burrows/${id}/leave`, 'POST'); setLeave(false); await session.restore(); navigate('/'); }); }}>{copy['burrow.leave.cta']}</button><button className="secondary" disabled={busy} onClick={() => setLeave(false)}>{copy['action.cancel']}</button></>}><p>{copy['burrow.leave.body']}</p></Dialog> : null}
  </Page>;
}
