import type { Entity, World } from 'koota';
import { STATEMENTS_FOCUS_MS, STATEMENTS_REVEAL as TIMING, WAKE } from '@critter-crumbs/shared';
import { Asleep, IsOwn, Clock, Settings, SoundEvent, StatementReveal } from './traits.js';
export function createReveal(world: World, critters: Entity[]) {
  let start: number | null = null;
  return {
    begin() { if (start !== null) return; start = world.get(Clock)!.now; world.add(StatementReveal); world.spawn(SoundEvent({ token: 'statements.reveal', level: -10 })); },
    tick() {
      if (start === null) return;
      const now = world.get(Clock)!.now - start, settings = world.get(Settings)!, quiet = settings.still || settings.reducedMotion;
      const step = Math.min(TIMING.staggerMs, Math.max(0, (STATEMENTS_FOCUS_MS - TIMING.wakeStartMs - WAKE.ms) / Math.max(1, critters.length - 1)));
      critters.forEach((entity, index) => { if (now >= (quiet ? 0 : TIMING.wakeStartMs + step * index) && !entity.has(IsOwn) && entity.has(Asleep)) entity.remove(Asleep); });
      world.set(StatementReveal, { daylight: Math.min(1, now / (quiet ? TIMING.reducedMs : TIMING.lightMs)), ready: now >= (quiet ? TIMING.reducedMs : STATEMENTS_FOCUS_MS) });
    },
  };
}
