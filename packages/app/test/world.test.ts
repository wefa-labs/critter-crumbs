import { afterEach, expect, test } from 'vitest';
import { Asleep, Bump, Chewing, Clock, Count, Flight, FlyingTo, Hop, Identity, Mesh, Pile, Pouring, Rig, Settings, SoundEvent, createWorld, type SoundCue, type WorldOptions } from '../src/world/index.js';
import { soundTokens } from '../src/audio/plan.js';

const worlds: ReturnType<typeof createWorld>[] = [];
afterEach(() => { for (const game of worlds.splice(0)) game.destroy(); });

function setup(issued = 100, extra: Partial<WorldOptions> = {}) {
  const game = createWorld({ issued, ...extra, critters: [
    { id: 'a', address: `0x${'1'.padStart(40, '0')}`, name: 'A', variant: 0 },
    { id: 'b', address: `0x${'2'.padStart(40, '0')}`, name: 'B', variant: 0 },
  ] });
  worlds.push(game);
  return game;
}

test('a held press empties 100 crumbs in 3.3–3.5 seconds', () => {
  const game = setup();
  const critter = game.critters[0]!;
  game.tick(0);
  game.actions.startPour(critter, 1);
  game.tick(0);
  expect(critter.get(Count)?.given).toBe(1);
  let emptyAt = 0;
  for (let now = 16; now <= 3600; now += 16) {
    game.tick(now);
    if (game.heap.get(Pile)?.remaining === 0) { emptyAt = now; break; }
  }
  expect(emptyAt).toBeGreaterThanOrEqual(3300);
  expect(emptyAt).toBeLessThanOrEqual(3500);
  expect(critter.get(Count)?.given).toBe(100);
});

/* Game Design §5.2 is one table; the world names a level only where a moment asks for a quieter or damped one. */
test('each scatter cue leaves the world at the level the token table gives it', () => {
  const cues: SoundCue[] = [];
  const game = setup(10, { outputs: { sound: cue => cues.push(cue) } }), critter = game.critters[0]!;
  game.actions.giveCrumb(critter); game.tick(0);
  game.actions.takeCrumb(critter); game.tick(16);
  game.actions.setCount(critter, 10); game.tick(32);
  expect(cues.map(cue => cue.token)).toEqual(['crumb.add', 'crumb.remove', 'pile.wall', 'pour.hold', 'pile.empty']);
  for (const cue of cues) expect([cue.token, cue.level]).toEqual([cue.token, soundTokens[cue.token].db]);
});

test('the wall stops the pour, emits once per press, and leaves no sound events behind', () => {
  const cues: string[] = [];
  const game = setup(100, { outputs: { sound: cue => cues.push(cue.token) } });
  game.tick(0);
  game.actions.startPour(game.critters[0]!, 1);
  for (let now = 0; now <= 4000; now += 16) game.tick(now);
  expect(game.heap.has(Pouring)).toBe(false);
  expect(cues.filter(token => token === 'pile.wall')).toHaveLength(1);
  expect(cues.filter(token => token === 'pile.empty')).toHaveLength(1);
  game.actions.startPour(game.critters[0]!, 1);
  game.tick(4016);
  game.tick(4032);
  expect(cues.filter(token => token === 'pile.wall')).toHaveLength(2);
  expect(game.world.query(SoundEvent)).toHaveLength(0);
});

test('release stops within one crumb and a new reverse press uses the same curve', () => {
  const game = setup();
  const critter = game.critters[0]!;
  game.tick(0);
  game.actions.startPour(critter, 1);
  for (let now = 0; now <= 1200; now += 16) game.tick(now);
  const released = critter.get(Count)!.given;
  game.actions.stopPour();
  for (let now = 1216; now <= 2400; now += 16) game.tick(now);
  expect(critter.get(Count)!.given).toBe(released);
  game.actions.startPour(critter, -1);
  for (let now = 2416; now <= 3616; now += 16) game.tick(now);
  expect(critter.get(Count)!.given).toBeLessThanOrEqual(1);
  expect(game.heap.get(Pile)!.remaining).toBeGreaterThanOrEqual(99);
});

test('typed counts preserve the pile, clamp unsafe input, and own people targets cannot receive', () => {
  const game = setup(100, { viewer: `0x${'1'.padStart(40, '0')}` });
  const [own, other] = game.critters;
  game.tick(0);
  game.actions.giveCrumb(own!);
  game.actions.startPour(own!, 1);
  game.actions.setCount(own!, 50);
  game.actions.setCount(other!, 130);
  game.tick(16);
  expect(own!.get(Count)!.given).toBe(0);
  expect(other!.get(Count)!.given).toBe(100);
  game.actions.setCount(other!, Number.NaN);
  game.tick(32);
  expect(other!.get(Count)!.given).toBe(100);
  game.actions.setCount(other!, 32.9);
  game.tick(48);
  expect(other!.get(Count)!.given).toBe(32);
  expect(game.heap.get(Pile)!.remaining).toBe(68);
  game.actions.takeCrumb(other!);
  game.tick(64);
  expect(other!.get(Count)!.given).toBe(31);
  expect(game.heap.get(Pile)!.remaining).toBe(69);
  game.actions.setCount(other!, -10);
  game.tick(80);
  expect(other!.get(Count)!.given).toBe(0);
  expect(game.heap.get(Pile)!.remaining).toBe(100);
});

test('crumb pitch follows count, a hold crosses after three ticks, and release pairs with its final hop', () => {
  const cues: SoundCue[] = [], hops: unknown[] = [];
  const game = setup(100, { outputs: { sound: cue => cues.push(cue), hop: hop => hops.push(hop) } });
  const critter = game.critters[0]!;
  game.tick(0);
  game.actions.startPour(critter, 1);
  for (let now = 0; now <= 1000; now += 10) game.tick(now);
  expect(cues.slice(0, 4).map(cue => cue.token)).toEqual(['crumb.add', 'crumb.add', 'crumb.add', 'pour.hold']);
  expect(cues.filter(cue => cue.token === 'crumb.add')).toHaveLength(3);
  game.actions.stopPour(); game.tick(1010);
  expect(cues.at(-2)?.action).toBe('stop');
  expect(cues.at(-1)?.token).toBe('crumb.add');
  expect(hops).toHaveLength(2); // Press and release; a hold uses the stream/count pulse.
  game.actions.setCount(critter, 12); game.tick(1020);
  expect(cues.at(-1)?.pitchStep).toBe(2);
  game.actions.setCount(critter, 30); game.tick(1030);
  expect(cues.at(-1)?.pitchStep).toBe(6);
  game.actions.takeCrumb(critter); game.tick(1040);
  expect(cues.at(-1)?.pitchStep).toBe(5);
  expect(game.world.query(Hop)).toHaveLength(0);
});

test('mute consumes events, renderers see the same final counts, and a delayed tick spends at most 50 ms', () => {
  const cues: SoundCue[] = [], frames: number[] = [];
  const game = setup(100, { outputs: { sound: cue => cues.push(cue),
    render2d: world => frames.push(world.query(Count)[0]!.get(Count)!.given),
    render3d: world => frames.push(world.query(Count)[0]!.get(Count)!.given),
  } });
  game.tick(0);
  game.actions.setSettings({ effects: false });
  game.actions.startPour(game.critters[0]!, 1);
  game.tick(0);
  game.tick(10000);
  expect(game.world.get(Clock)!.dt).toBe(50);
  expect(game.critters[0]!.get(Count)!.given).toBe(3);
  expect(frames.slice(-2)).toEqual([3, 3]);
  expect(cues).toEqual([]);
  expect(game.world.get(Settings)!.effects).toBe(false);
  expect(game.world.query(SoundEvent)).toHaveLength(0);
});

test('all 49 targets remain addressable and a 50th target is rejected', () => {
  const critters = Array.from({ length: 49 }, (_, index) => ({
    id: String(index), address: `0x${(index + 1).toString(16).padStart(40, '0')}`, name: String(index), variant: 0,
  }));
  const game = createWorld({ issued: 100, critters }); worlds.push(game);
  game.actions.setCount(game.critters[48]!, 100); game.tick(0);
  expect(game.critters[48]!.get(Count)!.given).toBe(100);
  expect(() => createWorld({ issued: 100, critters: [...critters, { ...critters[0]!, id: '49' }] })).toThrow();
});

test('a crumb bumps on the same tick, restarts from the current pose, and settles without stacking', () => {
  const game = setup(), critter = game.critters[0]!;
  game.tick(0); game.actions.giveCrumb(critter); game.tick(0);
  expect(critter.get(Rig)!.scaleX).toBeCloseTo(1.08, 10);
  game.tick(90);
  expect(critter.get(Rig)!.scaleX).toBeCloseTo(0.97, 10);
  const pose = critter.get(Rig)!.scaleX;
  game.actions.giveCrumb(critter); game.tick(90);
  expect(critter.get(Rig)!.scaleX).toBeCloseTo(pose, 10);
  game.tick(350);
  expect(critter.get(Rig)!.scaleX).toBe(1);
  expect(critter.has(Bump)).toBe(false);
});

test('pouring chews, release decays in 260 ms, and Still critters removes spatial motion', () => {
  const game = setup(), critter = game.critters[0]!;
  game.actions.startPour(critter, 1);
  for (let now = 0; now <= 1000; now += 10) game.tick(now);
  expect(critter.get(Chewing)!.rate).toBeGreaterThan(8);
  game.actions.stopPour(); game.tick(1010);
  game.tick(1270);
  expect(critter.has(Chewing)).toBe(false);
  game.actions.setSettings({ still: true }); game.tick(1280);
  const pose = critter.get(Rig);
  game.actions.giveCrumb(critter); game.tick(1290);
  game.tick(1500);
  expect(critter.get(Rig)).toEqual(pose);
});

test('idle uses identity phases, wake opens the lids in 120 ms, and identical clocks reproduce poses', () => {
  const first = setup(), second = setup();
  first.tick(0); second.tick(0);
  const before = first.critters[0]!.get(Rig)!.scaleY;
  first.tick(500); second.tick(500);
  expect(first.critters[0]!.get(Rig)!.scaleY).not.toBe(before);
  expect(first.critters.map(critter => critter.get(Rig))).toEqual(second.critters.map(critter => critter.get(Rig)));
  const critter = first.critters[0]!;
  critter.add(Asleep); first.tick(516);
  expect(critter.get(Rig)!.lids).toBe(0.12);
  critter.remove(Asleep); first.tick(532);
  expect(critter.get(Rig)!.lids).toBeGreaterThan(0.12);
  first.tick(636);
  expect(critter.get(Rig)!.lids).toBe(1);
  first.tick(1116);
  expect(critter.get(Rig)!.headTilt).toBeCloseTo(critter.get(Identity)!.parameters.headTilt, 10);
});

test('a 380 ms flight preserves its critter on arrival and losing the target removes the flight', () => {
  const game = setup(), critter = game.critters[0]!;
  const flight = game.world.spawn(Flight({ t: 0, x: -1, y: 0, z: 0 }), FlyingTo(critter));
  game.tick(0); game.tick(190);
  expect(flight.get(Flight)!.x).toBeGreaterThan(-1);
  game.tick(380);
  expect(flight.isAlive()).toBe(false);
  expect(critter.isAlive()).toBe(true);
  expect(critter.has(Bump)).toBe(true);
  const orphan = game.world.spawn(Flight({ t: 380 }), FlyingTo(critter));
  critter.destroy();
  expect(orphan.isAlive()).toBe(false);
});

test('flight capacity stays at 64 and reduced motion uses at most eight soft pour ticks per second without hops', () => {
  const game = setup(), critter = game.critters[0]!;
  critter.add(Mesh(null));
  for (let i = 0; i < 100; i++) game.actions.giveCrumb(critter);
  game.tick(0);
  expect(game.world.query(Flight)).toHaveLength(64);
  const cues: SoundCue[] = [], hops: unknown[] = [];
  const quiet = setup(100, { settings: { reducedMotion: true }, outputs: { sound: cue => cues.push(cue), hop: value => hops.push(value) } });
  quiet.actions.startPour(quiet.critters[0]!, 1);
  for (let now = 0; now <= 1000; now += 10) quiet.tick(now);
  expect(cues.every(cue => cue.token === 'crumb.add')).toBe(true);
  expect(cues.length).toBeGreaterThan(1);
  expect(cues.length).toBeLessThanOrEqual(8);
  expect(hops).toEqual([]);
});

test('repeated bumps restart from their current pose and chew follows the rising rate', () => {
  const game = setup(), critter = game.critters[0]!;
  game.actions.giveCrumb(critter); game.tick(0); game.tick(80);
  const pose = critter.get(Rig)!;
  game.actions.giveCrumb(critter); game.tick(90);
  expect(critter.get(Bump)?.t).toBe(90);
  expect(critter.get(Bump)?.fromX).toBeCloseTo(pose.scaleX);
  game.actions.startPour(critter, 1); game.tick(100);
  for (let now = 116; now <= 2004; now += 16) game.tick(now);
  expect(critter.get(Chewing)?.rate).toBe(40);
});

test('a short held pour still lands with one final reply without giving another crumb', () => {
  const cues: SoundCue[] = [], hops: unknown[] = [];
  const game = setup(100, { outputs: { sound: cue => cues.push(cue), hop: hop => hops.push(hop) } });
  const critter = game.critters[0]!;
  game.actions.startPour(critter, 1); game.tick(0);
  for (let now = 16; now <= 448; now += 16) game.tick(now);
  expect(critter.get(Count)?.given).toBe(2);
  const before = hops.length;
  game.actions.stopPour(); game.tick(460);
  expect(critter.get(Count)?.given).toBe(2);
  expect(hops).toHaveLength(before + 1);
  expect(cues.at(-1)?.token).toBe('crumb.add');
  expect(critter.get(Bump)?.t).toBe(460);
});

test('removed targets leave the next tick safe, including their flying crumbs', () => {
  const game = setup(), critter = game.critters[0]!;
  critter.add(Mesh); game.actions.giveCrumb(critter); game.tick(0);
  critter.destroy();
  expect(() => game.tick(16)).not.toThrow();
  expect(game.world.query(Flight)).toHaveLength(0);
});

test.each(['effects', 'still', 'reducedMotion'] as const)('changing %s ends an already playing pour', setting => {
  const cues: SoundCue[] = [];
  const game = setup(100, { outputs: { sound: cue => cues.push(cue) } });
  game.actions.startPour(game.critters[0]!, 1); game.tick(0);
  for (let now = 16; now <= 800; now += 16) game.tick(now);
  expect(cues.some(cue => cue.action === 'start')).toBe(true);
  cues.length = 0;
  game.actions.setSettings({ [setting]: setting !== 'effects' }); game.tick(816);
  expect(cues.some(cue => cue.token === 'pour.hold' && cue.action === 'stop')).toBe(true);
});

test('destroying a held target stops the continuous pour and clears its hold', () => {
  const cues: SoundCue[] = [];
  const game = setup(100, { outputs: { sound: cue => cues.push(cue) } }), critter = game.critters[0]!;
  game.actions.startPour(critter, 1); game.tick(0);
  for (let now = 16; now <= 800; now += 16) game.tick(now);
  expect(cues.some(cue => cue.action === 'start')).toBe(true);
  cues.length = 0; critter.destroy(); game.tick(816);
  expect(game.heap.has(Pouring)).toBe(false);
  expect(cues.filter(cue => cue.action === 'stop').map(cue => cue.token)).toEqual(['pour.hold']);
});

test('wall feedback survives muted effects while quiet motion remains an adapter choice',()=>{
  const feedback:SoundCue[]=[],sound:SoundCue[]=[];
  const game=setup(100,{settings:{effects:false},outputs:{feedback:cue=>feedback.push(cue),sound:cue=>sound.push(cue)}});
  game.actions.takeCrumb(game.critters[0]!);game.tick(0);expect(feedback.map(cue=>cue.token)).toEqual(['pile.wall']);expect(sound).toEqual([]);
});
