import { Renderer } from './renderer.js';
import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { WorldProvider, useTrait } from 'koota/react';
import type { Entity } from 'koota';
import { ApiClientError, type Account } from '@critter-crumbs/core';
import { copy, formatCopy, TYPED_AMOUNT, type Target } from '@critter-crumbs/shared';
import { Count, Pile, Clock, IsOwn, Pouring, PouringInto, Settings, type GameSettings } from '../world/index.js';
import { useAudio } from '../audio/context.js';
import { createStageRuntime, type StageRuntime } from '../sim/stage-runtime.js';
import { browserReceiptBook } from './receipts.js';
import { createScatterSession } from './scatter-session.js';
import { useScatterInput } from './scatter-input.js';
import { createHeap, createHops, jiggleHeap } from './heap.js';
import { GameStage } from './game-stage.js';
import { StatementText } from './gathering.js';
import { Dialog, targetLabel } from './ui.js';
import { absoluteTime } from './time.js';
import { portraitVariant, type MemberFeast } from './feast-view.js';
import type { AppApi, Me } from './session.js';
import type { RunAction } from './burrows.js';

type Controls = { entity: Entity; runtime: StageRuntime; target: Target; announce: (text: string) => void };
function ScatterControls({ entity, runtime, target, announce }: Controls) {
  const count = useTrait(entity, Count)!, pile = useTrait(runtime.heap, Pile)!, pouring = useTrait(runtime.heap, Pouring);
  const [text, setText] = useState(String(count.given)), editing = useRef(false), [editingVisible, setEditingVisible] = useState(false), id = useId();
  const rolling = useRef<{ from: number; to: number; start: number; ms: number } | null>(null);
  const name = targetLabel(target), isPouring = !!pouring && runtime.heap.targetFor(PouringInto) === entity;
  useEffect(() => { if (!editing.current) setText(String(count.given)); }, [count.given]);
  const { start, stop, tap, say, held, move } = useScatterInput(entity, runtime, name, announce);
  const commit = (value = text) => {
    const maximum = entity.get(Count)!.given + runtime.heap.get(Pile)!.remaining;
    const parsed = /^\d+$/.test(value) ? Number(value) : entity.get(Count)!.given;
    const next = Math.min(maximum, Math.max(0, Number.isFinite(parsed) ? parsed : maximum));
    rolling.current = { from: entity.get(Count)!.given, to: next, start: runtime.world.get(Clock)!.now, ms: Math.min(TYPED_AMOUNT.maxMs, Math.abs(next - entity.get(Count)!.given) * TYPED_AMOUNT.perCrumbMs) };
    editing.current = false; setEditingVisible(false); setText(String(next)); runtime.actions.setCount(entity, next); runtime.animateFor(320); say();
  };
  const button = (direction: 1 | -1) => <button type="button" data-give={direction > 0} className="secondary crumb-control" aria-label={formatCopy(direction > 0 ? 'scatter.add' : 'scatter.remove', { name })} aria-disabled={direction > 0 ? pile.remaining === 0 : count.given === 0}
    onPointerDown={event => { if (!event.isPrimary || event.button !== 0) return; event.preventDefault(); event.currentTarget.focus(); event.currentTarget.setPointerCapture(event.pointerId); start(direction); }}
    onPointerMove={move} onPointerLeave={stop} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop} onBlur={stop}
    onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); if (!event.repeat) start(direction); } }}
    onKeyUp={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); stop(); } }}
    onClick={event => { if (event.detail === 0 && !held.current) tap(direction); }}>{direction > 0 ? copy['scatter.add.symbol'] : copy['scatter.remove.symbol']}</button>;
  return <div className="scatter-controls" data-pouring={isPouring}>
    {button(-1)}<div className="number-field"><input id={id} data-editing={editingVisible} data-count-id={target.id} type="text" inputMode="numeric" pattern="[0-9]*" aria-label={formatCopy('scatter.count.label', { name })} value={text}
      onFocus={() => { editing.current = true; setEditingVisible(true); }} onChange={event => { editing.current = true; setEditingVisible(true); setText(event.target.value); }} onBlur={() => commit()}
      onKeyDown={event => {
        if (event.key === 'Escape') { event.preventDefault(); editing.current = false; setEditingVisible(false); rolling.current = null; setText(String(entity.get(Count)!.given)); }
        else if (event.key === 'Enter') { event.preventDefault(); commit(); }
        else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') { event.preventDefault(); const current = /^\d+$/.test(text) ? Number(text) : count.given; commit(String(Math.max(0, current + (event.key === 'ArrowUp' ? 1 : -1) * (event.shiftKey ? 10 : 1)))); }
      }} /><CountOutput id={id} entity={entity} runtime={runtime} rolling={rolling} hidden={editingVisible} /></div>{button(1)}
  </div>;
}
function CountOutput({ id, entity, runtime, rolling, hidden }: { id: string; entity: Entity; runtime: StageRuntime; rolling: React.RefObject<{ from: number; to: number; start: number; ms: number } | null>; hidden: boolean }) {
  const count = useTrait(entity, Count)!, visual = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const render = (now: number) => { const tween = rolling.current, settings = runtime.world.get(Settings)!, quiet = settings.still || settings.reducedMotion; const t = tween && tween.ms ? Math.min(1, Math.max(0, (now - tween.start) / tween.ms)) : 1; const value = tween && !quiet ? Math.round(tween.from + (tween.to - tween.from) * t) : entity.get(Count)!.given; if (visual.current) visual.current.textContent = String(value); if (t === 1) rolling.current = null; };
    render(runtime.world.get(Clock)!.now); return runtime.onFrame(render);
  }, [entity, runtime, count.given]);
  return <output htmlFor={id} aria-live="off" className={hidden ? 'sr-only' : 'count-output'}><span aria-hidden="true" ref={visual}>{count.given}</span><span className="sr-only">{count.given}</span></output>;
}
function ScatterStage({ entity, runtime, target, announce }: Controls) {
  const input = useScatterInput(entity, runtime, targetLabel(target), announce), own = entity.has(IsOwn);
  return <div className="stage-input" onPointerDown={event => { if (own || !event.isPrimary || event.button !== 0) return; event.preventDefault(); event.currentTarget.parentElement?.querySelector<HTMLElement>('[data-give="true"]')?.focus(); event.currentTarget.setPointerCapture(event.pointerId); input.start(1); }} onPointerMove={input.move} onPointerLeave={input.stop} onPointerUp={input.stop} onPointerCancel={input.stop} onLostPointerCapture={input.stop}><GameStage entity={entity} /></div>;
}
function Heap({ runtime, host }: { runtime: StageRuntime; host: React.RefObject<HTMLDivElement | null> }) {
  const pile = useTrait(runtime.heap, Pile)!, heap = useRef<ReturnType<typeof createHeap> | null>(null);
  useLayoutEffect(() => { heap.current = createHeap(host.current!); return () => { heap.current?.destroy(); heap.current = null; }; }, []);
  useLayoutEffect(() => heap.current?.update(pile.remaining, pile.issued), [pile.remaining, pile.issued]);
  return <div className="pile-heap" ref={host} />;
}
function PileBar({ runtime, host, submit, busy, saved, children }: { runtime: StageRuntime; host: React.RefObject<HTMLDivElement | null>; submit: () => void; busy: boolean; saved: boolean; children: React.ReactNode }) {
  const pile = useTrait(runtime.heap, Pile)!;
  return <aside className="pile-bar" aria-label={copy['pile.label']}><Heap runtime={runtime} host={host} /><div><p className={pile.remaining ? 'pile-count' : 'chip pile-empty'}>{pile.remaining ? formatCopy('pile.remaining', { n: pile.remaining }) : copy['pile.empty']}</p>{pile.remaining ? <small>{formatCopy('scatter.submit.help', { n: pile.issued })}</small> : null}</div><button data-sound="ui.tap" disabled={busy} aria-disabled={pile.remaining !== 0} onClick={() => { if (pile.remaining === 0) submit(); }}>{busy ? copy['scatter.saving'] : saved ? copy['scatter.done.change'] : copy['scatter.submit']}</button>{children}</aside>;
}
export function Scatter({ feast, me, api, run, busy, announce, settings, account, clearError }: { feast: MemberFeast; me: Me; api: AppApi; run: RunAction; busy: boolean; announce: (text: string) => void; settings: GameSettings; account: () => Account | null; connect: () => void; clearError: () => void }) {
  const audio = useAudio();
  const heapMotion = useRef<Animation | null>(null);
  const heap = useRef<HTMLDivElement>(null), done = useRef<HTMLDivElement>(null), surface = useRef<HTMLElement>(null), currentAccount = useRef(account);
  currentAccount.current = account;
  const [signing, setSigning] = useState(false), focusAccepted = useRef(false);
  const [hops] = useState(() => createHops(document, () => heap.current, id => surface.current?.querySelector<HTMLElement>(`[data-count-id="${id}"]`) ?? null));
  const [runtime] = useState(() => createStageRuntime({ issued: feast.crumbsPerCritter, viewer: me.address, settings, critters: feast.targets.map(target => ({ id: target.id, address: target.ownerAddress ?? target.id, ownerAddress: target.ownerAddress, name: targetLabel(target), variant: portraitVariant(feast, target) })), outputs: { sound:audio.cue, feedback: cue => { if(cue.token === 'pile.wall') { const preferences=runtime.world.get(Settings)!; if(!preferences.still && !preferences.reducedMotion) { heapMotion.current?.cancel(); heapMotion.current=jiggleHeap(heap.current); } } }, hop: cue => hops.add(cue, runtime.world.get(Clock)!.now) } }));
  const [session] = useState(() => createScatterSession({ api, feast, viewer: me.address, onAccepted: receipt => browserReceiptBook().remember(feast.id,me.address,receipt.uid), sign: async (amounts, now, latest) => {
    const connected = currentAccount.current();
    if (!connected || connected.address.toLowerCase() !== me.address.toLowerCase()) { setSigning(false); throw new ApiClientError('scatter.sign.rejected', 401); }
    try { const { signScatter } = await import('../crypto/index.js'); return await signScatter(api, connected, latest, amounts, now); }
    catch (error) { if (error instanceof ApiClientError) throw error; throw new ApiClientError('scatter.sign.rejected', 400); }
  } }));
  const state = useSyncExternalStore(session.subscribe, session.snapshot);
  useEffect(() => {
    const stop = runtime.start(); let previous = runtime.critters.map(() => 0), previousRemaining = feast.crumbsPerCritter;
    const unwatch = runtime.onFrame(now => {
      hops.tick(now); const amounts = runtime.critters.map(entity => entity.get(Count)!.given);
      if (amounts.some((amount, index) => amount !== previous[index])) { previous = amounts; session.edit(amounts); }
      const remaining = runtime.heap.get(Pile)!.remaining;
      if (!remaining && previousRemaining) announce(copy['pile.empty.announce']); previousRemaining = remaining;
    });
    return () => { audio.stop(); heapMotion.current?.cancel(); stop(); unwatch(); hops.clear(); runtime.ticker.destroy(); queueMicrotask(() => runtime.destroy()); };
  }, [runtime, session]);
  useEffect(() => { runtime.setSettings(settings); if (settings.still || settings.reducedMotion) { hops.clear(); heapMotion.current?.cancel(); } }, [runtime, settings]);
  useEffect(() => { session.observe(feast); }, [session, feast]);
  const newer = state.remote && state.remote.uid !== state.receipt?.uid;
  const missing = feast.participants.filter(address => !feast.participation.scattered.some(done => done.toLowerCase() === address.toLowerCase())).map(address => { const target = feast.targets.find(target => target.ownerAddress?.toLowerCase() === address.toLowerCase()); return target ? targetLabel(target) : `${address.slice(0, 6)}…${address.slice(-4)}`; });
  if (!feast.participants.some(address => address.toLowerCase() === me.address.toLowerCase())) return <p>{copy['err.notParticipant']}</p>;
  return <WorldProvider world={runtime.world}><section ref={surface} className="scatter-surface"><Renderer runtime={runtime} settings={settings} surface={surface} announce={announce}/><p>{copy['scatter.instruction']}</p><p>{formatCopy('scatter.participation', { done: feast.participation.scattered.length, total: feast.participants.length })}</p>{missing.length ? <p>{formatCopy('scatter.notYet', { names: missing.join(', ') })}</p> : null}
    {newer ? <p className="notice">{formatCopy('scatter.latest', { seq: state.remote!.seq })}</p> : null}
    <ul role="list" className="critter-grid">{feast.targets.map((target, index) => { const entity = runtime.critters[index]!, body = feast.statements.find(statement => statement.targetId === target.id)?.body ?? ''; return <li className="critter-cell" key={target.id}>
      <ScatterStage entity={entity} runtime={runtime} target={target} announce={announce} /><h2>{targetLabel(target)}</h2><details onToggle={event => { if (event.currentTarget.open) audio.play('statement.open'); }}><summary>{body.split('\n')[0] || (target.kind === 'option' ? copy['read.option.noStatement'] : formatCopy('read.noStatement', { name: targetLabel(target) }))}</summary><StatementText body={body} /></details>
      {entity.has(IsOwn) ? <div className="own-critter"><strong>{copy['scatter.own.label']}</strong><p>{copy['scatter.own.body']}</p></div> : <ScatterControls entity={entity} runtime={runtime} target={target} announce={announce} />}
    </li>; })}</ul>
    <PileBar runtime={runtime} host={heap} busy={busy} saved={!!state.receipt} submit={() => { runtime.actions.stopPour(); runtime.input(false); setSigning(true); }}>
      {state.receipt ? <div ref={done} tabIndex={-1} className="scatter-done"><strong>{copy['scatter.done.title']}</strong><p>{formatCopy('scatter.done.body', { scatteringDeadline: absoluteTime(feast.scatteringEndsAt) })}</p>{state.dirty ? <p>{copy['scatter.unsaved']}</p> : null}</div> : null}
    </PileBar>
    {signing ? <Dialog title={copy['scatter.sign.title']} onClose={() => { focusAccepted.current = false; setSigning(false); }} busy={busy}><p>{copy['scatter.sign.body']}</p><button disabled={busy} onClick={() => void run(async () => { try { focusAccepted.current = false; const previousUid=session.snapshot().receipt?.uid; await session.submit(); focusAccepted.current = session.snapshot().receipt?.uid !== previousUid; setSigning(false);  } catch (error) { if (error instanceof ApiClientError && error.status === 401) { setSigning(false); } throw error; } })}>{busy ? copy['scatter.saving'] : copy['scatter.submit']}</button></Dialog> : null}
    <SavedFocus focusAccepted={focusAccepted} receipt={state.receipt?.uid} signing={signing} done={done} onSaved={() => { clearError(); audio.play('scatter.confirm'); announce((session.snapshot().dirty ? copy['scatter.savedWithChanges'] : copy['scatter.done.title']) + ' ' + formatCopy('scatter.done.body', { scatteringDeadline: absoluteTime(feast.scatteringEndsAt) })); }} />
  </section></WorldProvider>;
}
function SavedFocus({ receipt, signing, done, onSaved, focusAccepted }: { focusAccepted: React.RefObject<boolean>; receipt: string | undefined; signing: boolean; done: React.RefObject<HTMLDivElement | null>; onSaved: () => void }) { const focused = useRef<string | undefined>(undefined); useEffect(() => { if (receipt && receipt !== focused.current && !signing) { focused.current = receipt; if (focusAccepted.current) { focusAccepted.current = false; done.current?.focus(); } onSaved(); } }, [receipt, signing, onSaved]); return null; }
