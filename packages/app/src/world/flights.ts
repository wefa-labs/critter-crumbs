import type { Entity, World } from 'koota';
import { layoutCritter } from '@critter-crumbs/core';
import { FLIGHT } from '@critter-crumbs/shared';
import { Clock, Flight, FlyingTo, Identity, Mesh, Settings } from './traits.js';

export function createFlights(world: World, bump: (critter: Entity) => void) {
  function spawn(critter: Entity, reverse: boolean) {
    const settings = world.get(Settings)!;
    if (!critter.has(Mesh) || settings.simple || settings.still || settings.reducedMotion || world.query(Flight).length >= FLIGHT.maxAlive) return;
    const dimensions = layoutCritter(critter.get(Identity)!.parameters);
    const mouth = { x: 0, y: dimensions.headC - dimensions.hr / 3, z: dimensions.hr };
    const heap = { x: -dimensions.bw * 2, y: 0, z: 0 };
    const start = reverse ? mouth : heap, end = reverse ? heap : mouth;
    world.spawn(Flight({ t: world.get(Clock)!.now, ...start, startX: start.x, startY: start.y, startZ: start.z,
      endX: end.x, endY: end.y, endZ: end.z, reverse }), FlyingTo(critter));
  }
  function tick() {
    const now = world.get(Clock)!.now;
    for (const crumb of world.query(Flight)) {
      const state = crumb.get(Flight)!, target = crumb.targetFor(FlyingTo);
      const progress = Math.max(0, Math.min(1, (now - state.t) / FLIGHT.ms));
      if (!target?.isAlive() || progress === 1) {
        if (target?.isAlive()) bump(target);
        crumb.destroy();
        continue;
      }
      const apex = Math.max(state.startY, state.endY) + Math.abs(state.endX - state.startX) / 2;
      const t = 1 - progress;
      crumb.set(Flight, { x: state.startX * t + state.endX * progress,
        y: t * t * state.startY + 2 * t * progress * apex + progress * progress * state.endY,
        z: state.startZ * t + state.endZ * progress });
    }
  }
  return { spawn, tick };
}
