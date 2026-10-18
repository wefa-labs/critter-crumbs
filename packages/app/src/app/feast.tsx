import { lazy, Suspense, useDeferredValue, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { copy, formatCopy } from '@critter-crumbs/shared';
import { phaseAt, ApiClientError } from '@critter-crumbs/core';
import { DeadlineStrip, phaseCopy, useTrustedTime } from './deadlines.js';
import { Link, Page, PendingPage, PortraitImage, shortAddress, useResource, targetLabel } from './ui.js';
import type { AppApi, Me } from './session.js';
import type { RunAction } from './burrows.js';
import { feastPageMusic, isMemberFeast, portraitVariant, type MemberFeast, type PublicFeast } from './feast-view.js';
import { useMusic } from '../audio/context.js';
import { DraftSummary, FeastActions } from './feast-actions.js';
import type { GameSettings } from '../world/index.js';
import { Reveal } from './read.js';
const Scatter = lazy(() => import('./scatter.js').then(module => ({ default: module.Scatter })));
import type { Account } from '@critter-crumbs/core';
import { GameFrame } from '../game/parts.js';
import { Toast } from '../game/surface.js';
import { scatteringDeadline } from './time.js';
import { Gathering } from './gathering.js';
import { Invite } from './invite.js';
const PublicResults = lazy(() => import('./public-results.js'));
const Results = lazy(() => import('./results.js'));
/** Scattering closed with the scatter screen open: the screen stops and the circle falls asleep (flow 41) for a moment before the feast is laid out. */
const CLOSING_HOLD_MS = 2400;
/** Start reading or a bubble pressed again while the reading screen is on its way: the first press stands. */
const pressedAlready = () => {};
function FeastTop({ feast, now }: { feast: PublicFeast; now: number }) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => setHost(document.getElementById('feast-header')), []);
  return host ? createPortal(<div className="feast-top"><p>{formatCopy('arrive.burrow', { burrowName: feast.burrowName, n: feast.targets.length })}</p><span className="chip">{copy[phaseCopy[phaseAt(feast, now)]]}</span><DeadlineStrip feast={feast} now={now} /></div>, host) : null;
}
export function FeastRoute({ id, api, me, connect, run, busy, announce, settings, path, account, clearError, onProfile, sound }: { id: string; api: AppApi; me: Me | null; connect: () => void; run: RunAction; busy: boolean; announce: (text: string) => void; settings: GameSettings; path: string; account: () => Account | null; clearError: () => void;onProfile:()=>void; /** the Music toggle, for someone who has not connected */ sound: ReactNode }) {
  const resource = useResource<PublicFeast | MemberFeast>(api, `/api/feasts/${id}`, (previous, next) => !isMemberFeast(previous) || isMemberFeast(next)), trusted = useTrustedTime(api);
  const phase = resource.data ? phaseAt(resource.data, trusted ?? resource.data.serverNow) : undefined;
  useEffect(() => { if (resource.data && phase !== resource.data.phase) resource.refresh(); }, [phase, resource.data?.phase]);
  /* The page follows its address a moment late: the screen in view stays until the one the new address asks for is
     ready to draw, so Start reading takes the reveal to the reading screen with nothing between, and Back the other
     way. It is one page for all of a feast's addresses (app.tsx keys it by feast and member, not by address), so
     nothing is unmounted but the screen that leaves. */
  const shown = useDeferredValue(path), leaving = shown !== path;
  const scatterScreen = shown.endsWith('/read') || shown.endsWith('/scatter');
  /* What each address having a page of its own used to give a change of screen: focus moves to the page's content, as
     it does on arriving (GameFrame), after which the screen may take it; and the feast is read again, now behind the
     screen instead of in place of it. */
  const arrived = useRef(false);
  useLayoutEffect(() => { if (arrived.current) document.getElementById('content')?.focus(); }, [shown]);
  useEffect(() => { if (arrived.current) resource.refresh(); arrived.current = true; }, [shown]);
  /* the trusted clock has passed the deadline while the page still holds the scattering feast. Under the scatter screen
     that closes it from this very render, so the screen is never unmounted; the hold then keeps it a moment after the
     feast data arrives */
  const passed = resource.data?.phase === 'scattering' && phase === 'feast', passedOnScreen = scatterScreen && passed;
  const [closing, setClosing] = useState(false), closingTimer = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (!passedOnScreen) return;
    setClosing(true); window.clearTimeout(closingTimer.current);
    closingTimer.current = window.setTimeout(() => setClosing(false), CLOSING_HOLD_MS);
  }, [passedOnScreen]);
  useEffect(() => () => window.clearTimeout(closingTimer.current), []);
  /* A scattering screen the deadline has passed under stays on the page: the scatter screen closed, the reveal as it
     is, since it has no closed state (docs/decisions.md, 2026-10-12). Leaving it is deferred: React keeps it up until
     the feast's screens are ready to draw, so the laid-out sheet follows with no loading line or heading between,
     whether the hold or late feast data ends the stay. The scattering screens and the feast's are one Suspense boundary
     (the same element in the same place), which is what lets React wait. */
  const staying = passed || closing, stillStaying = useDeferredValue(staying);
  /* the scatter screen's code and the feast's load while scattering, so those waits are a moment */
  useEffect(() => { if (phase === 'scattering' && me) { void import('./scatter.js'); void import('./results.js'); } }, [phase, me]);
  /* A link that leads to no feast: the store has no feast by that id (404), or the id is not one at all, as when a
     link is cut short in copying (400). Trying again cannot help, so the page says so in place of Try again, and the
     announcer stays quiet. */
  const missing = !resource.data && resource.error instanceof ApiClientError && (resource.error.status === 404 || resource.error.status === 400);
  /* the game's notices are not live regions; a failed refresh is read out through the polite announcer */
  const refreshFailure = resource.error && !missing ? resource.error instanceof ApiClientError && resource.error.status === 401 ? copy['err.sessionExpired'] : copy['err.storeUnreachable'] : '';
  useEffect(() => { if (refreshFailure) announce(refreshFailure); }, [refreshFailure]);
  useMusic(feastPageMusic(resource.data, phase, !!me));
  if (missing) return <Page title={copy['feast.missing.title']}><p>{copy['feast.missing.body']}</p><Link href="/">{copy['action.back']}</Link></Page>;
  if (!resource.data) return <PendingPage error={resource.error} retry={resource.refresh} bare />;
  const feast = resource.data, now = trusted ?? feast.serverNow;
  const props = { api, run, busy, refresh: resource.refresh, announce };
  /* one element in one place, so a scattering screen stays mounted as scattering closes under it */
  const reveal = isMemberFeast(feast) && me ? <Suspense fallback={<p>{copy['app.loading']}</p>}><Reveal feast={feast} viewer={me.address} settings={settings} announce={announce} {...(leaving ? { read: pressedAlready } : {})} /></Suspense> : null;
  const scatter = (closed: boolean) => isMemberFeast(feast) && me ? <Suspense fallback={<p>{copy['app.loading']}</p>}><Scatter feast={feast} me={me} {...props} clearError={clearError} settings={settings} account={account} connect={connect} now={now} initialReading={shown.endsWith('/read')} closed={closed} /></Suspense> : null;
  let content;
  if ((staying || stillStaying) && isMemberFeast(feast) && me) content = scatterScreen ? scatter(true) : reveal;
  else if (phase !== feast.phase) content = <p>{copy['app.loading']}</p>;
  else if (phase === 'cancelled') content = <p>{copy['feast.cancelled']}</p>;
  else if (phase === 'void') content = <p>{formatCopy('feast.tooFew', { feastTitle: feast.title })}</p>;
  else if (phase === 'feast' && feast.aggregatePublic && !isMemberFeast(feast)) content = <Suspense fallback={<h1>{copy['results.title']}</h1>}><PublicResults feast={feast} settings={settings} announce={announce}/></Suspense>;
  else if (!me) return <Invite feast={feast} now={now} connect={connect} sound={sound} />;
  else if (!isMemberFeast(feast)) content = <section><h2>{copy['burrow.unknown.title']}</h2><p>{formatCopy('burrow.unknown.body', { burrowName: feast.burrowName, shortAddress: shortAddress(me.address) })}</p></section>;
  else if (phase === 'draft') content = <><DraftSummary feast={feast} /><FeastActions feast={feast} me={me} {...props} />{feast.kind === 'options' ? <Gathering feast={feast} me={me} {...props} /> : <PortraitGrid feast={feast} />}</>;
  else if (phase === 'gathering') content = <><Gathering feast={feast} me={me} {...props} /><FeastActions feast={feast} me={me} {...props} /></>;
  else if (phase === 'scattering') content = scatterScreen ? scatter(false) : reveal;
  else content = <Suspense fallback={<h1>{copy['feast.waiting.title']}</h1>}><Results feast={feast} api={api} me={me} settings={settings} announce={announce} account={account} run={run} busy={busy} clearError={clearError} report={error=>void run(async()=>{throw error;})}/></Suspense>;
  if(phase==='feast'&&feast.aggregatePublic&&!isMemberFeast(feast))return <GameFrame feast={feast} onConnect={connect}>{content}</GameFrame>;
  if(isMemberFeast(feast)&&me&&(phase==='scattering'||phase==='feast'))return <GameFrame feast={feast} viewer={{address:me.address,variant:me.variant}} onProfile={onProfile} when={phase==='scattering'?scatteringDeadline(feast.scatteringEndsAt,now):undefined}>{content}{refreshFailure?<Toast>{refreshFailure}</Toast>:null}</GameFrame>;
  return <Page primary={!(phase === feast.phase && phase === 'feast' && ((isMemberFeast(feast) && !!me) || feast.aggregatePublic))} title={feast.title} context={feast.burrowName} screen={phase === 'scattering' ? shown.endsWith('/scatter') ? copy['scatter.title'] : shown.endsWith('/read') ? copy['read.title'] : copy['reveal.title'] : copy[phaseCopy[phase!]]}><FeastTop feast={feast} now={now} />{isMemberFeast(feast) ? <Link href={`/burrows/${feast.burrowId}`}>{feast.burrowName}</Link> : null}<p>{feast.context}</p>{resource.error ? <p className="notice">{resource.error instanceof ApiClientError && resource.error.status === 401 ? copy['err.sessionExpired'] : copy['err.storeUnreachable']}</p> : null}{content}</Page>;
}
export function PortraitGrid({ feast }: { feast: PublicFeast }) {
  return <ul role="list" className="critter-grid">{feast.targets.map(target => <li className="critter-cell" key={target.id}><div data-critter-id={target.id}><PortraitImage address={target.ownerAddress ?? target.id} variant={portraitVariant(feast, target)} name={targetLabel(target)} size="stage" asleep /></div><h2>{targetLabel(target)}</h2></li>)}</ul>;
}
