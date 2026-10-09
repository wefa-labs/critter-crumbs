import { createActions, createWorld as createKootaWorld, type Entity, type World } from 'koota';
import { generateCritter, type CritterVersion } from '@critter-crumbs/core';
import { DELIGHT_MOOD, HOLD_DELAY_MS, POUR_RATE_MIN, POUR_RATE_MAX, POUR_RAMP_S, POUR_SCALE, REPLY, TYPED_AMOUNT, MAX_FEAST_TARGETS, ValidationError, integer, REDUCED_MOTION, type TallyResult } from '@critter-crumbs/shared';
import { Asleep, Clock, Count, Delight, Flight, Hop, Identity, IsOwn, Name, Owner, Phase, Pile, Pouring, PouringInto, Received, Rig, Settings, SoundEvent, Viewer, type SoundToken } from './traits.js';
import { createReveal } from './reveal.js';
import { createDirector } from './director.js';
import { createMotion } from './motion.js';
import { createCircleMotion } from './circle.js';
import { tickDomFlights,DomFlight } from './dom-flights.js';
import { createFlights } from './flights.js';
export * from './traits.js';

export interface CritterInput { id: string; address: string; variant: number; name: string; ownerAddress?: string | null }
export interface SoundCue { token: SoundToken; pitchStep: number; level: number; action: 'trigger' | 'start' | 'update' | 'stop'; durationMs: number; rate?: number }
export interface HopCue { from: string; to: string; reverse: boolean }
export interface GameSettings { effects: boolean; music: boolean; still: boolean; simple: boolean; reducedMotion: boolean }
export interface WorldOptions {
  critterVersion?: CritterVersion; asleep?: boolean; issued: number; critters: CritterInput[]; viewer?: string; settings?: Partial<GameSettings>;
  outputs?: { feedback?: (cue: SoundCue) => void; sound?: (cue: SoundCue) => void; hop?: (cue: HopCue) => void; render2d?: (world: World) => void; render3d?: (world: World) => void };
}
type Input = { type: 'press'; critter: Entity; direction: 1 | -1; hold: boolean }
  | { type: 'idle'; value: boolean } | { type: 'delight'; on: boolean } | { type: 'sleep' } | { type: 'suspend' } | { type: 'reveal' } | { type: 'stop' } | { type: 'count'; critter: Entity; count: number }
  | { type: 'settings'; patch: Partial<GameSettings> } | { type: 'feast'; result: TallyResult } | { type: 'skip' } | { type: 'replay' };

/** One injected clock and one action queue serve headless, SVG and 3D hosts. */
export function createWorld(options: WorldOptions) {
  integer(options.issued, 10, 1000, 'setup.crumbs.help');
  if (options.critters.length > MAX_FEAST_TARGETS) throw new ValidationError('err.feastCapacity');
  if (new Set(options.critters.map(critter => critter.id)).size !== options.critters.length) throw new RangeError('Duplicate critter identity');
  const generated = options.critters.map(value => generateCritter(value.address, value.variant, options.critterVersion));
  const world = createKootaWorld(Clock, Phase, Delight, Settings(options.settings ?? {}), Viewer({ address: options.viewer ?? '' }));
  const heap = world.spawn(Pile({ issued: options.issued, remaining: options.issued }));
  const critters = options.critters.map((value, index) => {
    const entity = world.spawn(Count, Received, Rig, Name({ display: value.name }), Identity({
      id: value.id, address: value.address, variant: value.variant,
      seed: `${value.address.toLowerCase()}:${value.variant}:${options.critterVersion ?? '1'}`, parameters: generated[index]!,
    }));
    const owner = value.ownerAddress === undefined ? value.address : value.ownerAddress;
    if (owner) entity.add(Owner({ address: owner }));
    if (owner && owner.toLowerCase() === options.viewer?.toLowerCase()) entity.add(IsOwn, Asleep);
    if (options.asleep) entity.add(Asleep);
    return entity;
  });
  const reveal = createReveal(world, critters);
  const queue: Input[] = [];
  let previous: number | undefined;
  let lastRemaining = options.issued;
  const director = createDirector(world, critters);
  const circle = createCircleMotion(world, critters);
  const motion = createMotion(world, critters, director);
  const flights = createFlights(world, motion.bump);

  const actions = createActions(() => ({
    beginReveal() { queue.push({ type: 'reveal' }); },
    giveCrumb(critter: Entity) { queue.push({ type: 'press', critter, direction: 1, hold: false }); },
    takeCrumb(critter: Entity) { queue.push({ type: 'press', critter, direction: -1, hold: false }); },
    startPour(critter: Entity, direction: 1 | -1) { queue.push({ type: 'press', critter, direction, hold: true }); },
    stopPour() { queue.push({ type: 'stop' }); },
    suspend() { queue.push({ type: 'suspend' }); },
    setIdleMotion(value: boolean) { queue.push({ type: 'idle', value }); },
    delight(on: boolean) { queue.push({ type: 'delight', on }); },
    /** Scattering closed with the screen open: the whole circle sleeps (flow page, screen 41). */
    fallAsleep() { queue.push({ type: 'sleep' }); },
    setCount(critter: Entity, count: number) { queue.push({ type: 'count', critter, count }); },
    setSettings(patch: Partial<GameSettings>) { queue.push({ type: 'settings', patch: { ...patch } }); },
    beginFeast(result: TallyResult) { queue.push({ type: 'feast', result: structuredClone(result) }); },
    skipFeast() { queue.push({ type: 'skip' }); },
    replayFeast() { queue.push({ type: 'replay' }); },
  }))(world);

  function pitch(count: number) { return Math.min(10, Math.max(0, Math.floor(count / (options.issued * 0.05)))); }
  function emit(token: SoundToken, pitchStep = 0, level = -16, action: SoundCue['action'] = 'trigger', durationMs = 0, rate = 0) {
    world.spawn(SoundEvent({ token, pitchStep, level, action, durationMs, rate }));
  }
  function hop(critter: Entity, direction: number) {
    if (world.get(Settings)!.still || world.get(Settings)!.reducedMotion) return;
    world.spawn(Hop({ from: 'heap', to: critter.get(Identity)!.id, reverse: direction < 0 }));
  }
  function stop(reply = false) {
    const target = heap.targetFor(PouringInto);
    if (target?.isAlive()) motion.release(target);
    const pouring = heap.get(Pouring);
    if (pouring && pouring.emitted >= REPLY.ticksBeforeHold) emit(pouring.direction > 0 ? 'pour.hold' : 'pour.reverse', target?.isAlive() ? pitch(target.get(Count)!.given) : 0, -14, 'stop', REPLY.releaseFadeMs);
    if (target?.isAlive() && pouring) {
      const step = pitch(target.get(Count)!.given);
      if (reply && world.get(Clock)!.now - pouring.startedAt >= HOLD_DELAY_MS) {
        emit(pouring.direction > 0 ? 'crumb.add' : 'crumb.remove', step, pouring.direction > 0 ? -14 : -16);
        hop(target, pouring.direction);
        motion.bump(target);
      }
    }
    heap.remove(Pouring);
    if (target) heap.remove(PouringInto(target));
  }
  function wall(critter: Entity, direction: number) {
    return direction > 0 ? heap.get(Pile)!.remaining === 0 : critter.get(Count)!.given === 0;
  }

  function give(critter: Entity, direction: number) {
    const pile = heap.get(Pile)!;
    const count = critter.get(Count)!;
    if (wall(critter, direction)) return false;
    critter.set(Count, { given: count.given + direction });
    heap.set(Pile, { remaining: pile.remaining - direction });
    if (!heap.has(Pouring)) motion.bump(critter);
    flights.spawn(critter, direction < 0);
    return true;
  }
  function input() {
    for (const action of queue.splice(0)) {
      if (action.type === 'idle') { motion.setIdleMotion(action.value); continue; }
      if (action.type === 'delight') { world.set(Delight, { level: action.on ? DELIGHT_MOOD : 0 }); continue; }
      if (action.type === 'sleep') { stop(); for (const critter of critters) if (!critter.has(Asleep)) critter.add(Asleep); continue; }
      if (action.type === 'suspend') { stop(); continue; }
      if (action.type === 'settings') {
        const before = world.get(Settings)!;
        if ((action.patch.effects === false && before.effects) || (action.patch.still && !before.still) || (action.patch.reducedMotion && !before.reducedMotion)) stop();
        world.set(Settings, action.patch); continue;
      }
      stop(!['feast', 'skip', 'replay'].includes(action.type));
      if (action.type === 'reveal') { reveal.begin(); continue; }
      if (action.type === 'feast') { director.begin(action.result); motion.reset(); continue; }
      if (action.type === 'skip' || action.type === 'replay') { director[action.type](); motion.reset(); continue; }
      if (action.type === 'stop') continue;
      if (director.hasRun()) continue;
      if (!critters.includes(action.critter) || !action.critter.isAlive() || action.critter.has(IsOwn)) continue;
      if (action.type === 'count') {
        if (!Number.isFinite(action.count)) continue;
        const count = action.critter.get(Count)!.given, pile = heap.get(Pile)!;
        const next = Math.max(0, Math.min(count + pile.remaining, Math.trunc(action.count)));
        action.critter.set(Count, { given: next });
        heap.set(Pile, { remaining: pile.remaining + count - next });
        if (next !== count) {
          const duration = Math.min(TYPED_AMOUNT.maxMs, Math.abs(next - count) * TYPED_AMOUNT.perCrumbMs);
          emit(next > count ? 'pour.hold' : 'pour.reverse', pitch(next), next > count ? -14 : -16, 'trigger', duration);
          motion.bump(action.critter, world.get(Clock)!.now + duration);
        }
        continue;
      }
      const before = action.critter.get(Count)!.given;
      if (give(action.critter, action.direction)) {
        emit(action.direction > 0 ? 'crumb.add' : 'crumb.remove', action.direction > 0 ? pitch(before + 1) : Math.max(0, pitch(before) - 1), action.direction > 0 ? -14 : -16);
        hop(action.critter, action.direction);
        if (action.hold) heap.add(Pouring({ direction: action.direction, startedAt: world.get(Clock)!.now, lastSoftAt: world.get(Clock)!.now, acc: 0 }), PouringInto(action.critter));
        if (wall(action.critter, action.direction)) { stop(); emit('pile.wall'); }
      } else emit('pile.wall');
    }
  }
  function pour() {
    const current = heap.get(Pouring), critter = heap.targetFor(PouringInto);
    if (!current) return;
    if (!critter || !critter.isAlive()) { stop(); return; }
    const clock = world.get(Clock)!;
    const elapsed = clock.now - current.startedAt - HOLD_DELAY_MS;
    if (elapsed <= 0) return;
    const dt = Math.min(clock.dt, elapsed) / 1000;
    const scale = Math.max(POUR_SCALE.min, Math.min(POUR_SCALE.max, options.issued / POUR_SCALE.base));
    const rate = (POUR_RATE_MIN + (POUR_RATE_MAX - POUR_RATE_MIN) * Math.min(1, elapsed / 1000 / POUR_RAMP_S)) * scale;
    motion.chew(critter, rate);
    let acc = current.acc + rate * dt;
    let emitted = current.emitted;
    let lastSoftAt = current.lastSoftAt;
    while (acc >= 1) {
      if (!give(critter, current.direction)) { stop(); emit('pile.wall'); return; }
      acc -= 1;
      emitted += 1;
      heap.set(Pouring, { emitted });
      const step = pitch(critter.get(Count)!.given);
      if (world.get(Settings)!.still || world.get(Settings)!.reducedMotion) {
        if (clock.now - lastSoftAt >= 1000 / REDUCED_MOTION.maxTicksPerSecond) {
          emit(current.direction > 0 ? 'crumb.add' : 'crumb.remove', step, current.direction > 0 ? -14 : -16);
          lastSoftAt = clock.now;
        }
      } else {
        if (emitted <= REPLY.ticksBeforeHold) emit(current.direction > 0 ? 'crumb.add' : 'crumb.remove', step, current.direction > 0 ? -14 : -16);
        if (emitted >= REPLY.ticksBeforeHold) emit(current.direction > 0 ? 'pour.hold' : 'pour.reverse', step, current.direction > 0 ? -14 : -16, emitted === REPLY.ticksBeforeHold ? 'start' : 'update', 0, rate);
      }
      if (wall(critter, current.direction)) { stop(); emit('pile.wall'); return; }
    }
    heap.set(Pouring, { acc, lastSoftAt });
  }
  function clock(now: number) {
    world.set(Clock, { now, dt: previous === undefined ? 0 : Math.max(0, Math.min(50, now - previous)) });
    previous = now;
  }
  function pile() {
    const remaining = heap.get(Pile)!.remaining;
    if (lastRemaining > 0 && remaining === 0) emit('pile.empty', 0, -12);
    lastRemaining = remaining;
  }
  function feast() { reveal.tick(); director.tick(); }
  function expression() { motion.expression(); }
  function rig() { motion.rig(); }
  function flight() { flights.tick(); }
  function sound() {
    for (const event of world.query(SoundEvent)) {
      const settings = world.get(Settings)!;
      const { rate, ...cue } = event.get(SoundEvent)!;
      options.outputs?.feedback?.({ ...cue,...(rate > 0 ? {rate} : {}) });
      if (settings.effects || cue.action === 'stop') {
        options.outputs?.sound?.({ ...cue, ...(rate > 0 ? { rate } : {}), level: cue.level + (settings.still || settings.reducedMotion ? REDUCED_MOTION.dampingDb : 0) });
      }
      event.destroy();
    }
  }
  function render3d() { options.outputs?.render3d?.(world); }
  function render2d() { options.outputs?.render2d?.(world); }
  function sweep() {
    for (const event of world.query(Hop)) {
      const cue = event.get(Hop)!;
      options.outputs?.hop?.({ ...cue });
      event.destroy();
    }
    for (const event of world.query(SoundEvent)) event.destroy();
  }
  const systems = [clock, input, pour, pile, feast, expression, rig, circle.tick,()=>tickDomFlights(world), flight, sound, render3d, render2d, sweep];
  function tick(now: number) {
    if (!Number.isFinite(now) || (previous !== undefined && now < previous)) throw new RangeError('Tick time must be finite and monotonic');
    for (const system of systems) system(now);
  }
  return { world, heap, critters, actions, circle, tick, isAnimating: () => director.playing() || circle.isAnimating() || motion.isAnimating() || world.query(Flight).length > 0 || world.query(DomFlight).length > 0, feastPresentation:director.presentation, destroy: () => { motion.destroy(); world.destroy(); } };
}
