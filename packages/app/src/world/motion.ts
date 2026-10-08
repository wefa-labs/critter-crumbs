import { trait, type Entity, type TraitRecord, type World } from 'koota';
import { BUMP, CHEW, CRUMB_GAZE, DELIGHTED, EXPRESSION, FEAST, GROWTH, IDLE, RIG, WAKE } from '@critter-crumbs/shared';
import { Asleep, Bump, Chewing, Clock, Delight, Identity, Received, Rig, Settings } from './traits.js';
import type { createDirector } from './director.js';

const Waking = trait({ t: 0 });
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const ease = (value: number) => { const t = clamp(value, 0, 1); return t * t * (3 - 2 * t); };

export function createMotion(world: World, critters: readonly Entity[], director: Pick<ReturnType<typeof createDirector>, 'growth' | 'playing' | 'settleAge'>) {
  let idleMotion = true;
  const targets = new Map<Entity, TraitRecord<typeof Rig.schema>>();
  const unwatch = world.onRemove(Asleep, critter => {
    if (critter.isAlive() && critter.has(Identity)) critter.add(Waking({ t: world.get(Clock)!.now }));
  });
  function bump(critter: Entity, at = world.get(Clock)!.now) {
    const current = critter.get(Rig)!, previous = critter.get(Bump);
    const base = 1 + GROWTH.scaleGain * critter.get(Received)!.fed;
    const update = { t: at, fromX: previous ? current.scaleX / base : BUMP[0][1],
      fromY: previous ? current.scaleY / base : BUMP[0][2], fromZ: previous ? current.scaleZ / base : BUMP[0][3] };
    if (previous) critter.set(Bump, update); else critter.add(Bump(update));
  }
  function expression() {
    const settleAge = director.settleAge(), playing = director.playing();
    for (const [index, critter] of critters.entries()) {
      if (!critter.isAlive()) { targets.delete(critter); continue; }
      const received = critter.get(Received)!, identity = critter.get(Identity)!.parameters;
      const asleep = critter.has(Asleep), amount = director.growth(index);
      const mood = Math.max(received.mood * Math.min(1, amount), asleep ? 0 : world.get(Delight)?.level ?? 0);
      const scale = 1 + GROWTH.scaleGain * received.fed * amount;
      const lower = EXPRESSION[Math.min(EXPRESSION.length - 1, Math.floor(mood * 4))]!;
      const upper = EXPRESSION[Math.min(EXPRESSION.length - 1, Math.floor(mood * 4) + 1)]!;
      const progress = upper.mood === lower.mood ? 0 : (mood - lower.mood) / (upper.mood - lower.mood);
      const blend = (key: keyof typeof lower) => lower[key] + (upper[key] - lower[key]) * progress;
      const ears = asleep ? -IDLE.asleep.earDroop : blend('earLift');
      const target = { scaleX: scale, scaleY: scale, scaleZ: scale, leanZ: 0, liftY: 0,
        headTilt: identity.headTilt * blend('tiltFactor'), earL: ears, earR: ears,
        postureX: blend('posture'), lids: asleep ? RIG.lid[0] : 1 - blend('squint'),
        mouth: mood >= RIG.mouthThreshold ? blend('mouth') : 0,
        cheeks: identity.cheeks || received.fed * amount >= RIG.cheekThreshold || mood >= 0.5 ? Math.max(1, blend('cheekScale')) : 0,
        pupilX: 0, pupilY: 0,
      };
      const bump = critter.get(Bump), settings = world.get(Settings)!;
      const now = world.get(Clock)!.now;
      const moving = !settings.still && !settings.reducedMotion;
      if (moving && idleMotion) {
        const phase = identity.idlePhase, radians = phase * Math.PI * 2;
        const idle = asleep ? IDLE.asleep : mood >= IDLE.pleased.threshold ? IDLE.pleased : IDLE.awake;
        target.scaleY *= 1 + idle.breath * Math.sin(now / 1000 * Math.PI * 2 * idle.breathHz + radians);
        target.leanZ = asleep ? 0 : idle.wobble * Math.sin(now / 1000 * Math.PI * 2 * ('wobbleHz' in idle ? idle.wobbleHz : 0) + radians);
        if (asleep) {
          const nodAge = (now + phase * IDLE.asleep.nodEveryMs) % IDLE.asleep.nodEveryMs;
          if (nodAge < IDLE.asleep.nodMs) target.headTilt += IDLE.asleep.nod * Math.sin(Math.PI * nodAge / IDLE.asleep.nodMs);
        } else {
          const blinkPeriod = IDLE.blinkEveryMs[0] + phase * (IDLE.blinkEveryMs[1] - IDLE.blinkEveryMs[0]);
          const blinkAge = (now + phase * blinkPeriod) % blinkPeriod;
          if (blinkAge < IDLE.blinkMs) target.lids = Math.max(RIG.lid[0], target.lids * Math.abs(2 * blinkAge / IDLE.blinkMs - 1));
          const pupilPeriod = IDLE.pupilEveryMs[0] + phase * (IDLE.pupilEveryMs[1] - IDLE.pupilEveryMs[0]);
          target.pupilX = IDLE.pupilDrift * Math.sin(now / pupilPeriod * Math.PI * 2 + radians);
          target.pupilY = IDLE.pupilDrift * Math.cos(now / pupilPeriod * Math.PI * 2 + radians);
          if (mood >= IDLE.pleased.threshold && !playing) {
            const hopPeriod = IDLE.pleased.hopEveryMs[0] + phase * (IDLE.pleased.hopEveryMs[1] - IDLE.pleased.hopEveryMs[0]);
            const hopAge = (now + phase * hopPeriod) % hopPeriod;
            if (hopAge < IDLE.pleased.hopMs) {
              const hop = Math.sin(Math.PI * hopAge / IDLE.pleased.hopMs);
              target.scaleX *= 1 + (IDLE.pleased.hopScale[0] - 1) * hop;
              target.scaleY *= 1 + (IDLE.pleased.hopScale[1] - 1) * hop;
              target.liftY = IDLE.pleased.hopHeight * hop;
            }
          }
          if (mood >= 1) {
            const wiggleAge = (now + phase * DELIGHTED.wiggleEveryMs) % DELIGHTED.wiggleEveryMs;
            if (wiggleAge < IDLE.pleased.hopMs) {
              const wiggle = DELIGHTED.wiggleDegrees * Math.sin(wiggleAge / IDLE.pleased.hopMs * Math.PI * 2);
              target.earL += wiggle; target.earR -= wiggle;
            }
          }
        }
      }
      if (moving && settleAge >= 0 && settleAge < FEAST.settleHopMs) {
        const settle = 1 - ease(settleAge / FEAST.settleHopMs);
        target.scaleX *= 1 + (FEAST.settleScale[0] - 1) * settle;
        target.scaleY *= 1 + (FEAST.settleScale[1] - 1) * settle;
        target.liftY = IDLE.pleased.hopHeight * Math.sin(Math.PI * settleAge / FEAST.settleHopMs);
      }
      if (bump) {
        const age = now - bump.t;
        if (age >= BUMP[3][0]) critter.remove(Bump);
        else if (age >= 0 && !settings.still && !settings.reducedMotion) {
          const keyframes = [[0, bump.fromX, bump.fromY, bump.fromZ], ...BUMP.slice(1)];
          const endIndex = keyframes.findIndex(frame => frame[0]! > age);
          const start = keyframes[endIndex - 1]!, end = keyframes[endIndex]!;
          const progress = (age - start[0]!) / (end[0]! - start[0]!);
          target.scaleX *= start[1]! + (end[1]! - start[1]!) * progress;
          target.scaleY *= start[2]! + (end[2]! - start[2]!) * progress;
          target.scaleZ *= start[3]! + (end[3]! - start[3]!) * progress;
          if (age < CRUMB_GAZE.ms) {
            target.pupilX = -RIG.pupil * (1 - age / CRUMB_GAZE.ms);
            target.lids += CRUMB_GAZE.lidWiden;
          }
        }
      }
      const chew = critter.get(Chewing);
      if (chew) {
        const strength = chew.releasedAt < 0 ? 1 : clamp(1 - (now - chew.releasedAt) / CHEW.decayMs, 0, 1);
        if (strength === 0) critter.remove(Chewing);
        else if (!settings.still && !settings.reducedMotion) {
          const wave = Math.sin(now / 1000 * Math.PI * 2 * Math.min(CHEW.maxHz, chew.rate * CHEW.rateFraction)) * strength;
          target.scaleY *= 1 + wave * CHEW.amplitude;
          target.earL += wave * CHEW.earDegrees;
          target.earR += wave * CHEW.earDegrees;
          target.cheeks *= 1 + (CHEW.cheekScale - 1) * strength;
          target.mouth = Math.min(1, target.mouth + CHEW.mouthAdd * strength);
        }
      }
      const waking = critter.get(Waking);
      if (waking) {
        const age = now - waking.t;
        if (age >= WAKE.ms || !moving) critter.remove(Waking);
        else {
          target.lids = RIG.lid[0] + (1 - blend('squint') - RIG.lid[0]) * (1 - (1 - clamp(age / WAKE.lidEndMs, 0, 1)) ** 3);
          if (age < WAKE.earEndMs) {
            const t = Math.max(0, age - WAKE.earStartMs) / 1000;
            const damping = WAKE.damping / 2, frequency = Math.sqrt(WAKE.stiffness - damping * damping);
            const spring = 1 - Math.exp(-damping * t) * (Math.cos(frequency * t) + damping / frequency * Math.sin(frequency * t));
            target.earL = target.earR = Math.min(blend('earLift') + WAKE.overshootDegrees, -IDLE.asleep.earDroop + (blend('earLift') + IDLE.asleep.earDroop) * spring);
          }
          const stretch = age < WAKE.stretchStartMs ? ease(age / WAKE.stretchStartMs) : 1 - ease((age - WAKE.stretchStartMs) / (WAKE.stretchEndMs - WAKE.stretchStartMs));
          target.scaleX *= 1 + (WAKE.stretch[0] - 1) * stretch;
          target.scaleY *= 1 + (WAKE.stretch[1] - 1) * stretch;
          target.scaleZ *= 1 + (WAKE.stretch[2] - 1) * stretch;
          target.headTilt += IDLE.asleep.nod * (1 - ease((age - WAKE.headStartMs) / (WAKE.ms - WAKE.headStartMs)));
        }
      }
      target.scaleX = clamp(target.scaleX, ...RIG.scale); target.scaleY = clamp(target.scaleY, ...RIG.scale); target.scaleZ = clamp(target.scaleZ, ...RIG.scale);
      target.leanZ = clamp(target.leanZ, -RIG.lean, RIG.lean);
      target.lids = clamp(target.lids, ...RIG.lid);
      targets.set(critter, target);
    }
  }
  function rig() { for (const [critter, target] of targets) critter.set(Rig, target); }
  function chew(critter: Entity, rate: number) { critter.remove(Bump); if (critter.has(Chewing)) critter.set(Chewing, { rate, releasedAt: -1 }); else critter.add(Chewing({ rate, releasedAt: -1 })); }
  function release(critter: Entity) { if (critter.has(Chewing)) critter.set(Chewing, { releasedAt: world.get(Clock)!.now }); }
  function reset() { for (const critter of critters) if (critter.isAlive()) critter.remove(Bump, Chewing, Waking); }
  return { isAnimating: () => world.query(Bump).length > 0 || world.query(Chewing).length > 0 || world.query(Waking).length > 0, bump, chew, release, expression, rig, reset, setIdleMotion(value: boolean) { idleMotion = value; }, destroy: unwatch };
}
