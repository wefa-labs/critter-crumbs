import '../styles/burrows.css';
import { useEffect, useId, useRef, useState } from 'react';
import { ApiClientError } from '@critter-crumbs/core';
import { copy, formatCopy } from '@critter-crumbs/shared';
import { GameIcon } from '../game/icons.js';
import { useNotification } from './announcements.js';
import { CrittersScreen } from './burrow-critters.js';
import { FeastCard, FeastRows } from './burrow-feasts.js';
import { AddCritter, BurrowFloor, CopyLink, CrittersCard, Faces, NoFeasts, SleepingZ, YourCritter } from './burrow-parts.js';
import { ASLEEP_SCENE, BURROW_SHEETS, FRESH_BURROW_SCENE, HOME_SCENE, NEW_BURROW_SCENE, UNKNOWN_BURROW_SCENE, burrowPainting } from './burrow-scenes.js';
import { activeMembers, feastsUnderWay, otherFeasts, sameAddress, type BurrowView } from './burrow-view.js';
import { copyText } from './clipboard.js';
import { deadlineLine, phaseCopy, useTrustedTime } from './deadlines.js';
import { PlaceScreen } from './place-screen.js';
import type { AppApi, Me, Session } from './session.js';
import { Link, PendingPage, navigate, shortAddress, useResource } from './ui.js';
export type { BurrowView } from './burrow-view.js';
export type RunAction = (action: () => Promise<void>) => Promise<void>;

/** What every screen here is handed: who you are, the store, and the app's way of running a write. `onProfile` opens your critter's profile from the face in the header. */
interface Screen { me: Me; api: AppApi; run: RunAction; busy: boolean; onProfile: () => void }
const viewerOf = ({ me, onProfile }: Pick<Screen, 'me' | 'onProfile'>) => ({ address: me.address, variant: me.variant, open: onProfile });
const goHome = () => navigate('/');

/**
 * Home (flow page, SCREENS.home and ['home-empty']; the November UI audit's screens 12 and 13): your critter at the
 * burrow's entrance and your burrows, each a card that opens it, with Start a burrow at the foot (audit decision D4).
 * With no burrows yet, your critter sleeps there over the one action.
 */
export function Home({ me, api, onProfile }: Pick<Screen, 'me' | 'api' | 'onProfile'>) {
  const now = useTrustedTime(api);
  if (!me.burrows.length) return (
    <PlaceScreen wordmark title={copy['home.title']} viewer={viewerOf({ me, onProfile })} painting={ASLEEP_SCENE.painting} sheetHeight={ASLEEP_SCENE.sheetHeight} className="burrow-screen"
      floor={<><YourCritter me={me} place={ASLEEP_SCENE} asleep /><SleepingZ at={ASLEEP_SCENE.z} /></>}
      actions={<Link className="pill wide" href="/burrows/new">{copy['home.empty.cta']}</Link>}>
      <h1 className="sr-only">{copy['home.title']}</h1>
      <h2>{copy['home.empty.title']}</h2>
      <p>{copy['home.empty.body']}</p>
    </PlaceScreen>
  );
  return (
    <PlaceScreen wordmark title={copy['home.title']} viewer={viewerOf({ me, onProfile })} painting={HOME_SCENE.painting} sheetHeight={HOME_SCENE.sheetHeight} className="burrow-screen"
      floor={<YourCritter me={me} place={HOME_SCENE} />}
      actions={<Link className="pill soft wide" href="/burrows/new">{copy['home.empty.cta']}</Link>}>
      <h1>{copy['home.title']}</h1>
      <ul role="list" className="link-cards">{me.burrows.map(burrow => <BurrowCard key={burrow.id} burrow={burrow} api={api} now={now} />)}</ul>
    </PlaceScreen>
  );
}

/**
 * One of your burrows on home (flow page, burrowCard()): three of its critters' faces, its name, how many critters it
 * has with the phase of its feast under way, and when that closes in words, or that nothing is due. The card opens it.
 */
function BurrowCard({ burrow, api, now }: { burrow: Me['burrows'][number]; api: AppApi; now: number | null }) {
  const { data: view, error } = useResource<BurrowView>(api, `/api/burrows/${burrow.id}`);
  const members = view ? activeMembers(view) : [], at = now ?? view?.serverNow ?? 0, next = view ? feastsUnderWay(view.feasts, at)[0] : undefined;
  const count = formatCopy('home.critterCount', { n: members.length });
  return (
    <li><Link className="link-card" href={`/burrows/${burrow.id}`}>
      <Faces members={members.slice(0, 3)} size={34} />
      <span className="link-card-words">
        <b>{burrow.name}</b>
        {view ? <><span>{next ? `${count} · ${copy[phaseCopy[next.phase]]}` : count}</span><span>{next ? deadlineLine(next.phase, next.closes, at, true) : copy['home.noDeadline']}</span></>
          : error ? <span>{copy['err.storeUnreachable']}</span> : null}
      </span>
      <GameIcon name="right" />
    </Link></li>
  );
}

/**
 * Start a burrow (flow page, SCREENS['burrow-new']; audit screen 14): your critter at the entrance, the name with the
 * line under it, and Cancel and Create burrow pinned at the foot. The new burrow opens on its own page, to add critters.
 */
export function CreateBurrow({ me, api, session, run, busy, onProfile }: Screen & { session: Session }) {
  const [name, setName] = useState(''), form = useId(), help = useId(), field = useRef<HTMLInputElement>(null);
  /* after the frame has put the focus on the page (place-screen.tsx), the name takes it */
  useEffect(() => { field.current?.focus(); }, []);
  return (
    <PlaceScreen title={copy['burrow.create.title']} back={goHome} viewer={viewerOf({ me, onProfile })} painting={NEW_BURROW_SCENE.painting} sheetHeight={NEW_BURROW_SCENE.sheetHeight} className="burrow-screen"
      floor={<YourCritter me={me} place={NEW_BURROW_SCENE} />}
      actions={<><Link className="quiet" href="/">{copy['action.cancel']}</Link><button className="pill" form={form} disabled={busy || !name.trim()}>{copy['burrow.create.cta']}</button></>}>
      <form id={form} onSubmit={event => { event.preventDefault(); void run(async () => { const result = await api.write('/api/burrows', 'POST', { name }); await session.restore(); navigate(`/burrows/${result.id}`); }); }}>
        <label className="field"><span>{copy['burrow.name.label']}</span><input ref={field} required maxLength={60} aria-describedby={help} value={name} onChange={event => setName(event.target.value)} /></label>
      </form>
      <p id={help} className="burrow-help">{copy['burrow.create.help']}</p>
    </PlaceScreen>
  );
}

/**
 * A burrow's page (flow page, SCREENS.burrow, ['burrow-quiet'], ['burrow-fresh'] and ['burrow-join']; audit screens 15
 * to 18 and 22), chosen by where the burrow and you stand: asked to join, just you so far, or the burrow with its feasts
 * and its critters. A burrow that does not know you, and a link that leads to none, have screens of their own.
 */
export function Burrow({ id, ...screen }: Screen & { id: string }) {
  const resource = useResource<BurrowView>(screen.api, `/api/burrows/${id}`), now = useTrustedTime(screen.api);
  if (!resource.data) return <Unloaded error={resource.error} retry={resource.refresh} {...screen} />;
  const view = resource.data, members = activeMembers(view), you = members.find(member => sameAddress(member.address, screen.me.address));
  if (you?.joinedAt === null) return <JoinBurrow view={view} refresh={resource.refresh} {...screen} />;
  if (members.length === 1 && !view.feasts.length) return <FreshBurrow view={view} refresh={resource.refresh} {...screen} />;
  return <BurrowPage view={view} now={now ?? view.serverNow} {...screen} />;
}

/** The burrow's critters (flow page, SCREENS.members; audit screen 19), with the same screens as the burrow for a link that leads nowhere. */
export function BurrowCritters({ id, session, ...screen }: Screen & { id: string; session: Session }) {
  const resource = useResource<BurrowView>(screen.api, `/api/burrows/${id}`);
  if (!resource.data) return <Unloaded error={resource.error} retry={resource.refresh} {...screen} />;
  return <CrittersScreen view={resource.data} session={session} refresh={resource.refresh} {...screen} />;
}

/**
 * The burrow (flow page, SCREENS.burrow and ['burrow-quiet']; audit screens 17 and 18): its critters on the floor; each
 * feast under way as a card, the one closing next first; its other feasts as rows; its critters behind one card; and
 * at the foot Copy burrow link and Start a feast, which is gold when no feast is under way. A burrow with no feasts
 * yet has the empty card in their place, holding Start a feast.
 */
function BurrowPage({ view, now, ...screen }: Screen & { view: BurrowView; now: number }) {
  const underWay = feastsUnderWay(view.feasts, now), others = otherFeasts(view.feasts, now), feasted = view.feasts.length > 0;
  return (
    <PlaceScreen title={view.name} back={goHome} viewer={viewerOf(screen)} painting={burrowPainting(view.feasts.length)} sheetHeight={feasted ? BURROW_SHEETS.feasts : BURROW_SHEETS.quiet} className="burrow-screen"
      floor={<BurrowFloor view={view} you={screen.me.address} />}
      actions={<><CopyLink id={view.id} run={screen.run} className="pill soft small" />{feasted ? <Link className={underWay.length ? 'pill soft small' : 'pill small'} href={`/burrows/${view.id}/feasts/new`}>{copy['burrow.feasts.new']}</Link> : null}</>}>
      {underWay.map(item => <FeastCard key={item.feast.id} underWay={item} view={view} api={screen.api} you={screen.me.address} now={now} />)}
      {feasted ? null : <NoFeasts id={view.id} primary />}
      {others.length ? <FeastRows feasts={others} now={now} /> : null}
      <CrittersCard view={view} />
    </PlaceScreen>
  );
}

/**
 * Just you so far (flow page, SCREENS['burrow-fresh']; audit screen 15): straight after making a burrow, you at its
 * entrance; the line, the add field with the focus in it, Copy burrow link, and the empty card, whose Start a feast
 * waits for more critters.
 */
function FreshBurrow({ view, refresh, ...screen }: Screen & { view: BurrowView; refresh: () => void }) {
  const field = useRef<HTMLInputElement>(null);
  /* after the frame has put the focus on the page (place-screen.tsx), the add field takes it */
  useEffect(() => { field.current?.focus(); }, []);
  return (
    <PlaceScreen title={view.name} back={goHome} viewer={viewerOf(screen)} painting={FRESH_BURROW_SCENE.painting} sheetHeight={FRESH_BURROW_SCENE.sheetHeight} className="burrow-screen"
      floor={<YourCritter me={screen.me} place={FRESH_BURROW_SCENE} />}>
      <h2>{copy['burrow.empty.title']}</h2>
      <p>{copy['burrow.empty.body']}</p>
      <AddCritter id={view.id} api={screen.api} run={screen.run} busy={screen.busy} added={refresh} field={field} />
      <CopyLink id={view.id} run={screen.run} className="pill soft wide" />
      <NoFeasts id={view.id} primary={false} />
    </PlaceScreen>
  );
}

/**
 * Joining a burrow (flow page, SCREENS['burrow-join']; audit screen 16): someone added your address, and after
 * connecting you see the burrow's critters, Ready to join, their faces and how many, and one gold Join this burrow. The
 * flow page's line naming who added you is left out: the burrow's view does not say who added a member.
 */
function JoinBurrow({ view, refresh, ...screen }: Screen & { view: BurrowView; refresh: () => void }) {
  const members = activeMembers(view), others = members.filter(member => !sameAddress(member.address, screen.me.address));
  return (
    <PlaceScreen title={view.name} back={goHome} viewer={viewerOf(screen)} painting={burrowPainting(view.feasts.length)} sheetHeight={BURROW_SHEETS.join} className="burrow-screen"
      floor={<BurrowFloor view={view} you={screen.me.address} />}
      actions={<button type="button" className="pill wide" disabled={screen.busy} onClick={() => { void screen.run(async () => { await screen.api.write(`/api/burrows/${view.id}/join`, 'POST'); refresh(); }); }}>{copy['burrow.join']}</button>}>
      <p className="chip">{copy['burrow.preAdded']}</p>
      <div className="place-heading"><Faces members={others.slice(0, 5)} size={32} /><span className="burrow-count">{formatCopy('home.critterCount', { n: members.length })}</span></div>
    </PlaceScreen>
  );
}

/** A burrow that could not be read: one that does not know you, a link that leads to no burrow, or the store out of reach, with Try again. */
function Unloaded({ error, retry, ...screen }: Screen & { error: unknown; retry: () => void }) {
  if (error instanceof ApiClientError && error.status === 403) return <NotInBurrow burrowName={(error.detail as { burrowName?: string } | undefined)?.burrowName} {...screen} />;
  /* the store has no burrow by that id (404), or the id is not one at all, as when a link is cut short in copying
     (400); trying again cannot help, so the screen says so in place of Try again */
  if (error instanceof ApiClientError && (error.status === 404 || error.status === 400)) return <NoBurrow {...screen} />;
  return <PendingPage error={error} retry={retry} />;
}

/**
 * Not in this burrow (flow page, SCREENS.unknown; audit screen 22; PRD P2): you at the burrow's entrance, the line
 * asking someone in it to add you, your short address with Copy your address, which is the one thing to do next, and
 * Back home.
 */
function NotInBurrow({ burrowName, me, run, busy, onProfile }: Screen & { burrowName: string | undefined }) {
  const notify = useNotification();
  return (
    <PlaceScreen title={burrowName ?? copy['burrow.unknown.title']} wordmark={!burrowName} viewer={viewerOf({ me, onProfile })} painting={UNKNOWN_BURROW_SCENE.painting} sheetHeight={UNKNOWN_BURROW_SCENE.sheetHeight} className="burrow-screen"
      floor={<YourCritter me={me} place={UNKNOWN_BURROW_SCENE} />}
      actions={<Link className="pill soft wide" href="/">{copy['action.back']}</Link>}>
      {burrowName ? <h2>{copy['burrow.unknown.title']}</h2> : <h1>{copy['burrow.unknown.title']}</h1>}
      <p>{formatCopy('burrow.unknown.body', { burrowName: burrowName ?? copy['app.name'], shortAddress: shortAddress(me.address) })}</p>
      <div className="critter-address">
        <span className="address">{shortAddress(me.address)}</span>
        <button type="button" className="quiet" disabled={busy} onClick={event => { const origin = event.currentTarget; void run(async () => { await copyText(me.address); notify(copy['profile.address.copied'], origin); }); }}>{copy['burrow.unknown.copy']}</button>
      </div>
    </PlaceScreen>
  );
}

/** A link that leads to no burrow: your critter asleep at the entrance, as on an empty home, the line, and Back home. */
function NoBurrow({ me, onProfile }: Screen) {
  return (
    <PlaceScreen wordmark title={copy['burrow.missing.title']} viewer={viewerOf({ me, onProfile })} painting={ASLEEP_SCENE.painting} sheetHeight={ASLEEP_SCENE.sheetHeight} className="burrow-screen"
      floor={<><YourCritter me={me} place={ASLEEP_SCENE} asleep /><SleepingZ at={ASLEEP_SCENE.z} /></>}
      actions={<Link className="pill soft wide" href="/">{copy['action.back']}</Link>}>
      <h1>{copy['burrow.missing.title']}</h1>
      <p>{copy['burrow.missing.body']}</p>
    </PlaceScreen>
  );
}
