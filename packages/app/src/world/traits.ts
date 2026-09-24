import { relation, trait } from 'koota';
import { generate } from '@critter-crumbs/core';
import type { Phase as FeastPhase } from '@critter-crumbs/shared';
import type { Group } from 'three';

export const Clock = trait({ now: 0, dt: 0 });
export const Count = trait({ given: 0 });
export const Pile = trait({ issued: 100, remaining: 100 });
export const Pouring = trait({ direction: 1, startedAt: 0, acc: 0, emitted: 1, lastSoftAt: 0 });
export const PouringInto = relation({ exclusive: true });
export type SoundToken = 'connect' | 'reroll' | 'ui.tap' | 'crumb.add' | 'crumb.remove' | 'pour.hold' | 'pour.reverse' | 'pile.wall' | 'pile.empty' | 'statement.open' | 'scatter.confirm' | 'statements.reveal' | 'feast.open' | 'feast.feed' | 'feast.settle' | 'error';
export type FeastBeat = 'Laid out' | 'Waking' | 'Wave' | 'Settle' | 'Readable' | 'Skipping' | 'Crossfade';
export const SoundEvent = trait({ token: 'ui.tap' as SoundToken, pitchStep: 0, level: 0, action: 'trigger' as 'trigger' | 'start' | 'update' | 'stop', durationMs: 0, rate: 0 });
export const Hop = trait({ from: '', to: '', reverse: false });
export const IsOwn = trait();
export const Asleep = trait();
export const Identity = trait({ id: '', address: '', variant: 0, seed: '', parameters: () => generate(`0x${'0'.repeat(40)}`, 0) });
export const Name = trait({ display: '' });
export const Owner = trait({ address: '' });
export const Phase = trait({ name: 'scattering' as FeastPhase, gatheringEndsAt: 0, scatteringEndsAt: 0 });
export const Settings = trait({ effects: true, ambience: false, still: false, simple: false, reducedMotion: false });
export const Viewer = trait({ address: '' });
export const Received = trait({ crumbs: 0, share: () => [0, 1] as [number, number], fed: 0, mood: 0 });
export const Rig = trait({ scaleX: 1, scaleY: 1, scaleZ: 1, leanZ: 0, postureX: 0, headTilt: 0, earL: 0, earR: 0, lids: 1, mouth: 0, cheeks: 0, pupilX: 0, pupilY: 0, liftY: 0 });
export const Feast = trait({ beat: 'Laid out' as FeastBeat, startedAt: 0, index: -1, skipped: false });
export const Bump = trait({ t: 0, fromX: 1.08, fromY: 0.92, fromZ: 1.08 });
export const Chewing = trait({ rate: 0, releasedAt: -1 });
export const Mesh = trait(() => null as Group | null);
export const Portrait = trait(() => null as SVGSVGElement | null);
export const Flight = trait({ t: 0, x: 0, y: 0, z: 0, startX: -1, startY: 0, startZ: 0, endX: 0, endY: 1, endZ: 0, reverse: false });
// A target's removal destroys its flying crumbs, never the other way around.
export const FlyingTo = relation({ autoDestroy: 'source' });

export const StatementReveal = trait({ daylight: 0, ready: false });
