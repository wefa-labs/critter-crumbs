import type { Entity, World } from 'koota';
import { DOM_HOP, FEAST, GROWTH, POUR_RATE_MIN, POUR_RATE_MAX, WAKE, type TallyResult } from '@critter-crumbs/shared';
import { Asleep, Chewing, Clock, Feast, Hop, Identity, Received, Settings, SoundEvent } from './traits.js';

/** Receives the core's result; this module animates it and never tallies. */
export function createDirector(world: World, critters: readonly Entity[]) {
  const targetIds = critters.map(critter => critter.get(Identity)!.id);
  const stagger = critters.length < 2 ? 0 : Math.min(FEAST.waveStaggerMs,
    (FEAST.maxMs - FEAST.waveStartMs - FEAST.feedMs - FEAST.settleDelayMs - FEAST.settleLightMs) / (critters.length - 1));
  const wakeStagger = critters.length < 2 ? 0 : Math.min(FEAST.wakeStaggerMs,
    (FEAST.waveStartMs - FEAST.wakeStartMs - WAKE.ms) / (critters.length - 1));
  const run = () => world.query(Feast)[0];
  const hasCrumbs = () => critters.some(critter => critter.isAlive() && critter.get(Received)!.crumbs > 0);
  let transitionFrom = { dusk: 1, feast: 0, day: 0 };
  const still = () => { const settings = world.get(Settings)!; return settings.still || settings.reducedMotion; };
  function start(replay = false) {
    transitionFrom = { dusk: 1, feast: 0, day: 0 };
    run()?.destroy();
    world.spawn(Feast({ beat: still() ? 'Crossfade' : 'Laid out', startedAt: world.get(Clock)!.now }));
    for (const critter of critters) { if (!critter.isAlive()) continue; if (still()) critter.remove(Asleep); else critter.add(Asleep); }
    if (still()) world.spawn(SoundEvent({ token: 'feast.settle', level: -8 }));
    else if (!replay) world.spawn(SoundEvent({ token: 'feast.open', level: -10 }));
  }
  function begin(result: TallyResult) {
    if (result.totals.length !== critters.length || result.totals.some((total, i) => total.targetId !== targetIds[i])) {
      throw new RangeError('Feast result must use the world target order');
    }
    for (const [index, critter] of critters.entries()) {
      if (!critter.isAlive()) continue;
      const total = result.totals[index]!, share = total.share[0] / total.share[1];
      const fed = Math.min(1, Math.max(0, share * critters.length / GROWTH.fairShareCap)) ** GROWTH.exponent;
      critter.set(Received, { crumbs: total.crumbs, share: [...total.share], fed, mood: total.crumbs > 0 ? Math.max(GROWTH.minimumContentMood, fed) : 0 });
      critter.add(Asleep);
    }
    start();
  }
  function timing() {
    if (!hasCrumbs()) return { stagger: 0, settle: FEAST.wakeEndMs + FEAST.settleDelayMs, readable: FEAST.wakeEndMs + FEAST.settleDelayMs + FEAST.settleLightMs };
    const waveEnd = FEAST.waveStartMs + Math.max(0, critters.length - 1) * stagger + FEAST.feedMs;
    return { stagger, settle: waveEnd + FEAST.settleDelayMs, readable: waveEnd + FEAST.settleDelayMs + FEAST.settleLightMs };
  }
  function tick() {
    const entity = run(), state = entity?.get(Feast);
    if (!entity || !state || state.beat === 'Readable') return;
    const elapsed = world.get(Clock)!.now - state.startedAt;
    if (state.beat === 'Skipping' || state.beat === 'Crossfade') {
      if (elapsed >= (state.beat === 'Skipping' ? FEAST.skipMs : FEAST.reducedMs)) entity.set(Feast, { beat: 'Readable' });
      return;
    }
    if (still()) {
      transitionFrom = lighting();
      entity.set(Feast, { beat: 'Crossfade', startedAt: world.get(Clock)!.now });
      for (const critter of critters) if (critter.isAlive()) critter.remove(Asleep);
      world.spawn(SoundEvent({ token: 'feast.open', action: 'stop', durationMs: FEAST.skipSoundMs }));
      world.spawn(SoundEvent({ token: 'feast.settle', level: -8 }));
      return;
    }
    const times = timing();
    for (const [index, critter] of critters.entries()) {
      if (!critter.isAlive()) continue;
      if (elapsed >= FEAST.wakeStartMs + index * wakeStagger) critter.remove(Asleep);
    }
    if (hasCrumbs() && elapsed >= FEAST.waveStartMs && state.beat !== 'Settle') {
      const next = Math.min(critters.length - 1, times.stagger === 0 ? 0 : Math.floor((elapsed - FEAST.waveStartMs) / times.stagger));
      for (let index = state.index + 1; index <= next; index++) {
        const critter = critters[index]!;
        if (!critter.isAlive()) continue;
        const received = critter.get(Received)!;
        if (received.crumbs > 0) {
          world.spawn(SoundEvent({ token: 'feast.feed', pitchStep: Math.min(10, Math.max(1, Math.floor(received.share[0] / received.share[1] / 0.05))), level: -10 }));
          world.spawn(Hop({ from: 'feast', to: critter.get(Identity)!.id }));
          critter.add(Chewing({ rate: POUR_RATE_MIN + (POUR_RATE_MAX - POUR_RATE_MIN) * received.share[0] / received.share[1],
            releasedAt: state.startedAt + FEAST.waveStartMs + index * stagger + FEAST.feedMs }));
        }
      }
      entity.set(Feast, { beat: 'Wave', index: next });
    } else if (elapsed >= FEAST.wakeStartMs && state.beat === 'Laid out') entity.set(Feast, { beat: 'Waking' });
    const maximum = Math.max(0, ...critters.map(critter => critter.isAlive() ? critter.get(Received)!.crumbs : 0));
    const previousElapsed = elapsed - world.get(Clock)!.dt;
    if (maximum > 0) for (const [index, critter] of critters.entries()) {
      if (!critter.isAlive()) continue;
      const crumbs = critter.get(Received)!.crumbs;
      if (crumbs === 0) continue;
      const hopCount = Math.max(FEAST.minHops, Math.round(FEAST.hops[1] * crumbs / maximum));
      for (let hop = 1; hop < hopCount; hop++) {
        const at = FEAST.waveStartMs + index * stagger + hop / (hopCount - 1) * FEAST.hopStreamMs;
        if (at > previousElapsed && at <= elapsed && world.query(Hop).length < DOM_HOP.maxAlive) {
          world.spawn(Hop({ from: 'feast', to: critter.get(Identity)!.id }));
        }
      }
    }
    if (elapsed >= times.settle && state.beat !== 'Settle') {
      entity.set(Feast, { beat: 'Settle' });
      world.spawn(SoundEvent({ token: 'feast.settle', level: hasCrumbs() ? -8 : -14 }));
    }
    if (elapsed >= times.readable) entity.set(Feast, { beat: 'Readable' });
  }
  function growth(index: number) {
    const state = run()?.get(Feast);
    if (!state || ['Readable', 'Crossfade', 'Skipping'].includes(state.beat)) return 1;
    const elapsed = world.get(Clock)!.now - state.startedAt;
    const age = elapsed - FEAST.waveStartMs - index * stagger;
    const target = 1 + GROWTH.scaleGain * critters[index]!.get(Received)!.fed;
    if (target === 1) return 1;
    const ease = (value: number) => { const t = Math.min(1, Math.max(0, value)); return t * t * (3 - 2 * t); };
    const current = age <= FEAST.growPeakMs
      ? 1 + (target * (1 + FEAST.growOvershoot) - 1) * ease(age / FEAST.growPeakMs)
      : target + target * FEAST.growOvershoot * (1 - ease((age - FEAST.growPeakMs) / (FEAST.feedMs - FEAST.growPeakMs)));
    return (current - 1) / (target - 1);
  }
  function skip() {
    const entity = run();
    if (!entity || ['Readable', 'Skipping'].includes(entity.get(Feast)!.beat)) return;
    transitionFrom = lighting();
    entity.set(Feast, { beat: 'Skipping', startedAt: world.get(Clock)!.now, skipped: true });
    for (const critter of critters) if (critter.isAlive()) critter.remove(Asleep);
    world.spawn(SoundEvent({ token: 'feast.open', action: 'stop', durationMs: FEAST.skipSoundMs }));
  }
  function replay() { if (run()) start(true); }
  function settleAge() {
    const state = run()?.get(Feast);
    return !state || state.skipped || still() || !hasCrumbs() ? -1 : world.get(Clock)!.now - state.startedAt - timing().settle;
  }
  function lighting() {
    const state=run()?.get(Feast);if(!state||state.beat==='Readable')return {dusk:0,feast:0,day:1};
    const elapsed=world.get(Clock)!.now-state.startedAt,times=timing(),clamp=(value:number)=>Math.min(1,Math.max(0,value));
    if(state.beat==='Skipping'||state.beat==='Crossfade') {const t=clamp(elapsed/(state.beat==='Skipping'?FEAST.skipMs:FEAST.reducedMs));return {dusk:transitionFrom.dusk*(1-t),feast:transitionFrom.feast*(1-t),day:transitionFrom.day*(1-t)+t};}
    if(state.beat==='Settle'){const t=clamp((elapsed-times.settle)/FEAST.settleLightMs);return {dusk:0,feast:1-t,day:t};}
    const t=clamp((elapsed-FEAST.waveStartMs)/Math.max(1,times.settle-FEAST.settleDelayMs-FEAST.waveStartMs));return {dusk:1-t,feast:t,day:0};
  }
  function presentation() {
    const state=run()?.get(Feast);if(!state)return null;
    const elapsed=world.get(Clock)!.now-state.startedAt,final=['Settle','Readable','Skipping','Crossfade'].includes(state.beat);
    const amounts=critters.map(critter=>critter.isAlive()?critter.get(Received)!.crumbs:0),total=amounts.reduce((sum,value)=>sum+value,0);
    const counts=amounts.map((amount,index)=>final?amount:Math.round(amount*Math.min(1,Math.max(0,(elapsed-FEAST.waveStartMs-index*stagger)/FEAST.hopStreamMs))));
    const fill=Math.min(1,Math.max(0,elapsed/FEAST.fillMs));
    return {lighting:lighting(),counts,heapTotal:final?total:Math.round(total*fill),heapFraction:final||!total?0:fill*Math.max(1/FEAST.glyphs,1-counts.reduce((sum,value)=>sum+value,0)/total),settled:state.beat==='Settle'||state.beat==='Readable'};
  }
  const playing = () => !!run() && run()!.get(Feast)!.beat !== 'Readable';
  return { presentation, begin, tick, growth, skip, replay, settleAge, playing, hasRun: () => !!run() };
}
