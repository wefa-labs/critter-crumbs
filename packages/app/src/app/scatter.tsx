import { Renderer } from './renderer.js';
import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { WorldProvider, useTrait } from 'koota/react';
import type { Entity } from 'koota';
import { ApiClientError, type Account } from '@critter-crumbs/core';
import { copy, formatCopy, TYPED_AMOUNT, ValidationError, type Target } from '@critter-crumbs/shared';
import { Count, Pile, Clock, IsOwn, Pouring, PouringInto, Settings, type GameSettings } from '../world/index.js';
import { useAudio } from '../audio/context.js';
import { createStageRuntime, type StageRuntime } from '../sim/stage-runtime.js';
import { browserReceiptBook } from './receipts.js';
import { createScatterSession } from './scatter-session.js';
import { useScatterInput } from './scatter-input.js';
import { createHops, jiggleHeap } from './heap.js';
import { targetLabel } from './ui.js';
import { absoluteDeadline, closingLine } from './time.js';
import { gameView, readingAt, scatterFailure, scatterFailureOf, portraitVariant, type MemberFeast, type ScatterFailure } from './feast-view.js';
import type { AppApi, Me } from './session.js';
import { GameScene } from '../game/parts.js';
import { FocusRow, ScatterMiddle } from '../game/dock.js';
import { SignDialog, statementSurfaces } from '../game/sheets.js';
import { Toast } from '../game/surface.js';
import { stateControls, stateToast } from '../game/composition.js';
import { useDesktop } from '../game/device.js';
import type { RunAction } from './burrows.js';

type Controls = { entity: Entity; runtime: StageRuntime; target: Target; announce: (text: string) => void; busy?: boolean; closed?: boolean };
/**
 * The focus row while scattering (scatter page .focus): − and + for the critter in focus, its name over its count. The
 * count is the typed amount (Game Design §2.6), drawn as the count until it is focused. `busy` stops the controls but keeps
 * their look while a confirmation or save is in progress; `closed` dims them once scattering has closed.
 */
export function ScatterControls({ entity, runtime, target, announce, busy = false, closed = false }: Controls) {
  const count = useTrait(entity, Count)!, pile = useTrait(runtime.heap, Pile)!, pouring = useTrait(runtime.heap, Pouring);
  const [text, setText] = useState(String(count.given)), editing = useRef(false), [editingVisible, setEditingVisible] = useState(false), id = useId();
  const rolling = useRef<{ from: number; to: number; start: number; ms: number } | null>(null);
  const own = entity.has(IsOwn), name = targetLabel(target), isPouring = !!pouring && runtime.heap.targetFor(PouringInto) === entity, live = !busy && !closed;
  useEffect(() => { if (!editing.current) setText(String(count.given)); }, [count.given]);
  const { start, stop, tap, say, held, move } = useScatterInput(entity, runtime, name, announce);
  const commit = (value = text) => {
    const maximum = entity.get(Count)!.given + runtime.heap.get(Pile)!.remaining;
    const parsed = /^\d+$/.test(value) ? Number(value) : entity.get(Count)!.given;
    const next = Math.min(maximum, Math.max(0, Number.isFinite(parsed) ? parsed : maximum));
    rolling.current = { from: entity.get(Count)!.given, to: next, start: runtime.world.get(Clock)!.now, ms: Math.min(TYPED_AMOUNT.maxMs, Math.abs(next - entity.get(Count)!.given) * TYPED_AMOUNT.perCrumbMs) };
    editing.current = false; setEditingVisible(false); setText(String(next)); runtime.actions.setCount(entity, next); runtime.animateFor(320); say();
  };
  const button = (direction: 1 | -1) => <button type="button" data-give={direction > 0} className={`icon-button big crumb-control${direction > 0 ? '' : ' soft'}`} disabled={!live} aria-label={formatCopy(direction > 0 ? 'scatter.add' : 'scatter.remove', { name })} aria-disabled={direction > 0 ? pile.remaining === 0 : count.given === 0}
    onPointerDown={event => { if (!event.isPrimary || event.button !== 0) return; event.preventDefault(); event.currentTarget.focus(); event.currentTarget.setPointerCapture(event.pointerId); start(direction); }}
    onPointerMove={move} onPointerLeave={stop} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop} onBlur={stop}
    onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); if (!event.repeat) start(direction); } }}
    onKeyUp={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); stop(); } }}
    onClick={event => { if (event.detail === 0 && !held.current) tap(direction); }}>{direction > 0 ? copy['scatter.add.symbol'] : copy['scatter.remove.symbol']}</button>;
  return <FocusRow name={name} dimmed={closed} {...(own ? {} : { minus: button(-1), plus: button(1) })}
    line={own ? <span className="focus-sub">{copy['scatter.own.short']}</span> : <span className="focus-count" data-zero={count.given <= 0} data-pouring={isPouring}>
      <input disabled={!live} id={id} data-editing={editingVisible} data-count-id={target.id} type="text" inputMode="numeric" pattern="[0-9]*" aria-label={formatCopy('scatter.count.label', { name })} value={text}
        onFocus={() => { editing.current = true; setEditingVisible(true); }} onChange={event => { editing.current = true; setEditingVisible(true); setText(event.target.value); }} onBlur={() => commit()}
        onKeyDown={event => {
          if (event.key === 'Escape') { event.preventDefault(); editing.current = false; setEditingVisible(false); rolling.current = null; setText(String(entity.get(Count)!.given)); }
          else if (event.key === 'Enter') { event.preventDefault(); commit(); }
          else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') { event.preventDefault(); const current = /^\d+$/.test(text) ? Number(text) : count.given; commit(String(Math.max(0, current + (event.key === 'ArrowUp' ? 1 : -1) * (event.shiftKey ? 10 : 1)))); }
        }} />
      <CountOutput id={id} entity={entity} runtime={runtime} rolling={rolling} hidden={editingVisible} />
    </span>} />;
}
function CountOutput({ id, entity, runtime, rolling, hidden }: { id: string; entity: Entity; runtime: StageRuntime; rolling: React.RefObject<{ from: number; to: number; start: number; ms: number } | null>; hidden: boolean }) {
  const count = useTrait(entity, Count)!, visual = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const render = (now: number) => { const tween = rolling.current, settings = runtime.world.get(Settings)!, quiet = settings.still || settings.reducedMotion; const t = tween && tween.ms ? Math.min(1, Math.max(0, (now - tween.start) / tween.ms)) : 1; const value = tween && !quiet ? Math.round(tween.from + (tween.to - tween.from) * t) : entity.get(Count)!.given; if (visual.current) visual.current.textContent = String(value); if (t === 1) rolling.current = null; };
    render(runtime.world.get(Clock)!.now); return runtime.onFrame(render);
  }, [entity, runtime, count.given]);
  return <output htmlFor={id} aria-live="off" className={hidden ? 'sr-only' : 'count-output'}><span aria-hidden="true" ref={visual}>{count.given}</span><span className="sr-only">{count.given}</span></output>;
}

/** Where the screen opens: reading, at the critter whose bubble opened it; scattering, at the first critter not yours. */
function startingFocus(feast: MemberFeast, me: Me, reading: boolean) {
  if (reading) return readingAt(location.search, feast.targets.length);
  return Math.max(0, feast.targets.findIndex(target => target.ownerAddress?.toLowerCase() !== me.address.toLowerCase()));
}

export function Scatter({ feast, me, api, run, busy, announce, settings, account, clearError, now, initialReading = false, closed = false }: { feast: MemberFeast; me: Me; api: AppApi; run: RunAction; busy: boolean; announce: (text: string) => void; settings: GameSettings; account: () => Account | null; connect: () => void; clearError: () => void; now: number; initialReading?: boolean; closed?: boolean }) {
  const audio = useAudio();
  const heapMotion = useRef<Animation | null>(null);
  const barSource = useRef<HTMLSpanElement>(null);
  const heap = useRef<HTMLDivElement>(null), done = useRef<HTMLDivElement>(null), surface = useRef<HTMLElement>(null), currentAccount = useRef(account);
  currentAccount.current = account;
  const [signing, setSigning] = useState(false), focusAccepted = useRef(false);
  const [focus, setFocus] = useState(() => startingFocus(feast, me, initialReading)), [reading, setReading] = useState(initialReading), desktop = useDesktop(), [failure, setFailure] = useState<ScatterFailure | undefined>(), failing = useRef(false), [saved, setSaved] = useState(false);
  const [hops] = useState(() => createHops(document, () => heap.current ?? barSource.current, id => surface.current?.querySelector<HTMLElement>(`[data-count-id="${id}"]`) ?? null, () => runtime.world));
  const [runtime] = useState(() => createStageRuntime({ issued: feast.crumbsPerCritter, viewer: me.address, settings, critters: feast.targets.map(target => ({ id: target.id, address: target.ownerAddress ?? target.id, ownerAddress: target.ownerAddress, name: targetLabel(target), variant: portraitVariant(feast, target) })), outputs: { sound: audio.cue, feedback: cue => { if (cue.token === 'pile.wall') { const preferences = runtime.world.get(Settings)!; if (!preferences.still && !preferences.reducedMotion) { heapMotion.current?.cancel(); heapMotion.current = jiggleHeap(heap.current); } } }, hop: cue => hops.add(cue) } }));
  const [session] = useState(() => createScatterSession({ api, feast, viewer: me.address, onAccepted: receipt => browserReceiptBook().remember(feast.id, me.address, receipt.uid), sign: async (amounts, now, latest) => {
    const connected = currentAccount.current();
    if (!connected || connected.address.toLowerCase() !== me.address.toLowerCase()) { setSigning(false); throw new ApiClientError('scatter.sign.rejected', 401); }
    try { const { signScatter } = await import('../crypto/index.js'); return await signScatter(connected, latest, amounts, now); }
    catch (error) { if (error instanceof ApiClientError) throw error; throw new ApiClientError('scatter.sign.rejected', 400); }
  } }));
  const state = useSyncExternalStore(session.subscribe, session.snapshot);
  useEffect(() => {
    const stop = runtime.start(); let previous = runtime.critters.map(() => 0), previousRemaining = feast.crumbsPerCritter;
    const unwatch = runtime.onFrame(() => {
      hops.tick(); const amounts = runtime.critters.map(entity => entity.get(Count)!.given);
      /* a changed allocation answers a declined or failed save: its message goes with it */
      if (amounts.some((amount, index) => amount !== previous[index])) { previous = amounts; session.edit(amounts); if (failing.current) { failing.current = false; setFailure(undefined); clearError(); } }
      const remaining = runtime.heap.get(Pile)!.remaining;
      if (!remaining && previousRemaining) announce(copy['pile.empty.announce']); previousRemaining = remaining;
    });
    if (initialReading) audio.play('statement.open');
    return () => { audio.stop(); heapMotion.current?.cancel(); stop(); unwatch(); hops.clear(); runtime.ticker.destroy(); queueMicrotask(() => runtime.destroy()); };
  }, [runtime, session]);
  useEffect(() => { runtime.setSettings(settings); if (settings.still || settings.reducedMotion) { hops.clear(); heapMotion.current?.cancel(); } }, [runtime, settings]);
  useEffect(() => { session.observe(feast); }, [session, feast]);
  useEffect(() => { if (!saved) return; const timer = setTimeout(() => setSaved(false), 3000); return () => clearTimeout(timer); }, [saved]);
  useEffect(() => { if (state.status === 'saving' || state.status === 'verifying') setSigning(false); }, [state.status]);
  const newer = !!state.remote && state.remote.uid !== state.receipt?.uid;
  useEffect(() => { if (newer) announce(formatCopy('scatter.latest', { seq: state.remote!.seq })); }, [newer, state.remote?.uid]);
  /* desktop keeps the statement open in its panel, so only the phone's open bubble is a reading state */
  const statementOpen = reading && !desktop;
  const remaining = feast.crumbsPerCritter - state.amounts.reduce((sum, n) => sum + n, 0);
  /* the deadline passing with the screen open stops it as a refused save would (flow 41) */
  const shownFailure = closed ? scatterFailure.closed : failure;
  const view = gameView({ phase: feast.phase, remaining, receipt: !!(state.receipt || state.remote), dirty: state.dirty, reading: statementOpen, signing, saving: state.status === 'saving' || state.status === 'verifying', ...(shownFailure ? { failure: shownFailure } : {}) });
  /* scattering closing under the open screen is the one deadline that makes a sound: the dusk sting, once. Arriving after it has closed is silent. */
  const shut = view.state === 'closed', dusk = useRef(shut);
  useEffect(() => { if (shut && !dusk.current) { dusk.current = true; audio.play('scatter.closed'); } }, [audio, shut]);
  const turn = (index: number) => { runtime.actions.stopPour(); runtime.input(false); setFocus(index); };
  const target = feast.targets[focus]!, entity = runtime.critters[focus]!;
  if (!feast.participants.some(address => address.toLowerCase() === me.address.toLowerCase())) return <p>{copy['err.notParticipant']}</p>;
  const confirm = () => void run(async () => {
    try { focusAccepted.current = false; const previousUid = session.snapshot().receipt?.uid; await session.submit(); focusAccepted.current = session.snapshot().receipt?.uid !== previousUid; setSigning(false); }
    catch (error) {
      setSigning(false);
      /* the designed failures set the screen's state (flow 39–41); every message still goes to the app's alert, which
         the game shows as the toast at the top of the floor, except scattering closed, which the bar says itself */
      const coded = error instanceof ApiClientError || error instanceof ValidationError ? error : undefined;
      const kind = scatterFailureOf(coded?.copyId, error instanceof ApiClientError ? error.status : undefined);
      if (kind) { failing.current = true; setFailure(kind); }
      /* the bar says scattering has closed and the screen plays its dusk sting; this is no error notice */
      if (kind === scatterFailure.closed) { announce(copy['scatter.closed']); return; }
      throw kind === scatterFailure.failed ? new ApiClientError('err.saveFailed', error instanceof ApiClientError ? error.status : 0) : error;
    }
  });
  const middle = <ScatterMiddle state={view.state} remaining={remaining} closes={closingLine(feast.scatteringEndsAt, now)} until={absoluteDeadline(feast.scatteringEndsAt)} source={barSource} done={done}
    goDisabled={busy || !view.editable} onGo={() => { runtime.actions.stopPour(); runtime.input(false); failing.current = false; setFailure(undefined); clearError(); setSigning(true); }} />;
  /* the saved toast is the one this screen shows itself; refusals and failures arrive through the app's alert */
  const message = view.state === 'scattered' && saved ? stateToast(view.state) : undefined;
  return <WorldProvider world={runtime.world}><section ref={surface} className="scatter-surface"><Renderer runtime={runtime} settings={settings} surface={surface} announce={announce} />
    <GameScene runtime={runtime} feast={feast} focus={focus} turnTo={turn} state={view.state} editable={view.editable && !signing} reading={statementOpen} onRead={() => { setReading(true); audio.play('statement.open'); }} onClose={() => setReading(false)} announce={announce} heapHost={heap}
      surfaces={{
        focusRow: <ScatterControls key={target.id} entity={entity} runtime={runtime} target={target} announce={announce} busy={!view.editable || signing || busy} closed={stateControls(view.state) === 'disabled'} />,
        middle,
        statement: statementSurfaces({ feast, runtime, focus, close: () => setReading(false) }),
        toast: message ? <Toast>{copy[message]}</Toast> : newer ? <Toast>{formatCopy('scatter.latest', { seq: state.remote!.seq })}</Toast> : null,
        dialog: signing ? <SignDialog busy={busy} cancel={() => { focusAccepted.current = false; setSigning(false); }} confirm={confirm} /> : null,
      }} />
    <SavedFocus focusAccepted={focusAccepted} receipt={state.receipt?.uid} signing={signing || busy} done={done} onSaved={() => { clearError(); setSaved(true); audio.play('scatter.confirm'); announce((session.snapshot().dirty ? copy['scatter.savedWithChanges'] : copy['scatter.done.title']) + ' ' + formatCopy('scatter.done.body', { scatteringDeadline: absoluteDeadline(feast.scatteringEndsAt) })); }} />
  </section></WorldProvider>;
}
function SavedFocus({ receipt, signing, done, onSaved, focusAccepted }: { focusAccepted: React.RefObject<boolean>; receipt: string | undefined; signing: boolean; done: React.RefObject<HTMLDivElement | null>; onSaved: () => void }) { const focused = useRef<string | undefined>(undefined); useEffect(() => { if (receipt && receipt !== focused.current && !signing) { focused.current = receipt; if (focusAccepted.current) { focusAccepted.current = false; done.current?.focus(); } onSaved(); } }, [receipt, signing, onSaved]); return null; }
