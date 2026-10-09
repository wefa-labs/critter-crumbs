import { afterEach, expect, test } from 'vitest';
import { participantSetHash, tally } from '@critter-crumbs/core';
import { canonicalJSON, type Hex, type TallyInput } from '@critter-crumbs/shared';
import { Asleep, Feast, Received, Rig, createWorld, type SoundCue } from '../src/world/index.js';
import { soundTokens } from '../src/audio/plan.js';

const worlds: ReturnType<typeof createWorld>[] = [];
afterEach(() => { for (const game of worlds.splice(0)) game.destroy(); });
const hex = (n: number, bytes = 32) => `0x${n.toString(16).padStart(bytes * 2, '0')}` as Hex;
function fixture(amounts: number[]) {
  const input: TallyInput = {
    feastId: '00000000-0000-4000-8000-000000000001', publishedSetHash: hex(99), crumbsIssued: 100,
    targets: amounts.map((_, position) => ({ id: hex(position + 1), position, ownerAddress: null })),
    participants: [hex(1, 20)], ballots: [],
  };
  if (amounts.some(Boolean)) {
    input.crumbsIssued = amounts.reduce((sum, value) => sum + value, 0);
    input.ballots.push({ uid: hex(77), seq: '1', attester: input.participants[0]!, plaintext: canonicalJSON({
      v: 1, feast: input.feastId, participants: participantSetHash(input.participants), scatterer: input.participants[0],
      allocation: input.targets.map((target, i) => [target.id, amounts[i]]), nonce: '0123456789abcdef',
    }) });
  }
  const result = tally(input), cues: SoundCue[] = [], feeds: string[] = [];
  const game = createWorld({ issued: input.crumbsIssued, critters: input.targets.map(target => ({
    id: target.id, address: target.id, name: String(target.position), variant: 0, ownerAddress: null,
  })), outputs: { sound: cue => cues.push(cue), hop: hop => { if (hop.from === 'feast') feeds.push(hop.to); } } });
  worlds.push(game);
  return { game, result, cues, feeds };
}
const beat = (game: ReturnType<typeof createWorld>) => game.world.query(Feast)[0]?.get(Feast)?.beat;

test('eight critters reach Readable in 6.0–6.6 seconds, feed in grid order and retain equal growth', () => {
  const { game, result, cues, feeds } = fixture(Array(8).fill(10));
  game.tick(0); game.actions.beginFeast(result); game.tick(0);
  let readableAt = 0;
  for (let now = 16; now <= 6600; now += 16) {
    game.tick(now);
    if (beat(game) === 'Readable') { readableAt = now; break; }
  }
  expect(readableAt).toBeGreaterThanOrEqual(6000);
  expect(readableAt).toBeLessThanOrEqual(6600);
  expect([...new Set(feeds)]).toEqual(result.totals.map(total => total.targetId));
  for (const total of result.totals) expect(feeds.filter(id => id === total.targetId)).toHaveLength(24);
  expect(cues.map(cue => cue.token)).toEqual(['feast.open', ...Array(8).fill('feast.feed'), 'feast.settle']);
  for (const cue of cues) expect([cue.token, cue.level]).toEqual([cue.token, soundTokens[cue.token].db]);
  for (const critter of game.critters) {
    expect(critter.has(Asleep)).toBe(false);
    expect(critter.get(Received)?.fed).toBeCloseTo(0.5029733718731741, 14);
    expect(critter.get(Received)?.mood).toBeCloseTo(0.5029733718731741, 14);
    expect(critter.get(Rig)?.scaleX).toBeCloseTo(1.176040680155611, 2);
  }
});

test.each(['reducedMotion', 'still'] as const)('%s makes the feast one 320 ms crossfade with only a damped settle cue', setting => {
  const { game, result, cues, feeds } = fixture(Array(8).fill(10));
  game.actions.setSettings({ [setting]: true }); game.actions.beginFeast(result); game.tick(0);
  game.tick(319);
  expect(beat(game)).not.toBe('Readable');
  game.tick(320);
  expect(beat(game)).toBe('Readable');
  expect(cues.map(cue => [cue.token, cue.level])).toEqual([['feast.settle', -14]]);
  expect(feeds).toEqual([]);
  for (const critter of game.critters) expect(critter.has(Asleep)).toBe(false);
});

test('skip reaches Readable within 200 ms, stops sound within 100 ms, and replay retains the result', () => {
  const { game, result, cues } = fixture(Array(8).fill(10));
  game.actions.beginFeast(result); game.tick(0);
  game.actions.skipFeast(); game.tick(16);
  game.tick(216);
  expect(beat(game)).toBe('Readable');
  expect(cues.at(-1)?.action).toBe('stop');
  expect(cues.at(-1)?.durationMs).toBe(100);
  game.actions.replayFeast(); game.tick(232);
  expect(beat(game)).not.toBe('Readable');
  /* the feast cue is the feast's music, so a replay plays it again */
  expect(cues.filter(cue => cue.token === 'feast.open' && cue.action === 'trigger')).toHaveLength(2);
  for (let now = 248; now <= 7000; now += 16) game.tick(now);
  expect(beat(game)).toBe('Readable');
  expect(game.critters.map(critter => critter.get(Received)!.crumbs)).toEqual(Array(8).fill(10));
});

test('nobody scattered skips the wave and all 49 targets fit an eight-second feast', () => {
  const empty = fixture(Array(8).fill(0));
  empty.game.actions.beginFeast(empty.result);
  for (let now = 0; now <= 2400; now += 16) empty.game.tick(now);
  expect(beat(empty.game)).toBe('Readable');
  expect(empty.cues.map(cue => cue.token)).toEqual(['feast.open', 'feast.settle']);
  expect(empty.feeds).toEqual([]);
  for (const critter of empty.game.critters) expect(critter.get(Received)!.mood).toBe(0);
  const large = fixture(Array(49).fill(2));
  large.game.actions.beginFeast(large.result);
  for (let now = 0; now <= 8000; now += 16) large.game.tick(now);
  expect(beat(large.game)).toBe('Readable');
  expect([...new Set(large.feeds)]).toEqual(large.result.totals.map(total => total.targetId));
});

test.each([
  [[60, 14, 13, 13], 0.9698474422447793, 1.3394466047856728],
  [[5, 95, 0, 0, 0, 0, 0, 0, 0, 0], 0.29906975624424414, 1.1046744146854854],
] as const)('growth uses fair share and never makes small shares sad', (amounts, fed, scale) => {
  const { game, result } = fixture([...amounts]);
  game.actions.beginFeast(result); game.tick(0); game.actions.skipFeast(); game.tick(16); game.tick(216);
  expect(game.critters[0]!.get(Received)!.fed).toBeCloseTo(fed, 14);
  expect(game.critters[0]!.get(Received)!.mood).toBeGreaterThanOrEqual(0.25);
  expect(game.critters[0]!.get(Rig)!.scaleX).toBeCloseTo(scale, 2);
});

test('the delighted pose follows the expression table and an unfed critter stays calm', () => {
  const { game, result } = fixture([100, 0, 0, 0]);
  game.actions.setSettings({ still: true }); game.actions.beginFeast(result); game.tick(0); game.tick(320);
  expect(game.critters[0]!.get(Rig)).toMatchObject({ scaleX: 1.35, lids: 0.55, earL: 15, earR: 15, mouth: 1, cheeks: 1.1, headTilt: 0, postureX: -3 });
  expect(game.critters[1]!.get(Rig)).toMatchObject({ scaleX: 1, lids: 1, mouth: 0, postureX: 0 });
});

test('feeding grows through the six-percent overshoot and the shared settle is one small hop', () => {
  const { game, result } = fixture([25, 25, 25, 25]);
  game.actions.beginFeast(result);
  for (let now = 0; now <= 1800; now += 10) game.tick(now);
  expect(game.critters[0]!.get(Rig)!.scaleX).toBeCloseTo(1.2466031209649475, 10);
  for (let now = 1810; now <= 2100; now += 10) game.tick(now);
  expect(game.critters[0]!.get(Rig)!.scaleX).toBeCloseTo(1.176040680155611, 10);
  for (let now = 2110; now <= 3650; now += 10) game.tick(now);
  expect(game.critters[0]!.get(Rig)!.scaleX).toBeCloseTo(1.2348427141633915, 10);
});

test.each([0, 10])('all 49 critters wake before feeding, including an empty feast (%i each)', amount => {
  const { game, result, cues } = fixture(Array(49).fill(amount));
  game.actions.beginFeast(result); game.tick(0);
  for (let now = 16; now <= 1200; now += 16) game.tick(now);
  expect(game.critters.filter(critter => critter.has(Asleep))).toHaveLength(0);
  for (const critter of game.critters) expect(critter.get(Rig)?.lids).toBeGreaterThan(0.12);
  if (amount) expect(cues.some(cue => cue.token === 'feast.feed')).toBe(true);
  game.tick(2200); game.tick(3000);
  expect(game.critters.filter(critter => critter.has(Asleep))).toHaveLength(0);
});

test('a removed visual target does not corrupt the retained core result order', () => {
  const { game, result } = fixture([30, 30, 40]);
  game.critters[0]!.destroy(); game.tick(0); game.actions.beginFeast(result);
  expect(() => game.tick(16)).not.toThrow();
  expect(game.critters[1]!.get(Received)?.crumbs).toBe(30);
  game.actions.skipFeast(); game.tick(32); game.tick(232);
  expect(beat(game)).toBe('Readable');
});

test('feast presentation fills in400ms, rolls counts in grid order, exposes Settle before Readable and restarts on replay',()=>{
  const {game,result}=fixture([60,40]);game.tick(0);game.actions.beginFeast(result);game.tick(0);
  expect(game.feastPresentation()).toMatchObject({heapTotal:0,counts:[0,0],settled:false});
  game.tick(200);expect(game.feastPresentation()?.heapTotal).toBe(50);
  game.tick(400);expect(game.feastPresentation()?.heapTotal).toBe(100);
  game.tick(1500);expect(game.feastPresentation()?.counts).toEqual([30,0]);
  game.tick(2750);expect(game.feastPresentation()).toMatchObject({heapFraction:0,counts:[60,40],settled:true});expect(beat(game)).toBe('Settle');
  game.actions.replayFeast();game.tick(2750);expect(game.feastPresentation()).toMatchObject({heapTotal:0,counts:[0,0],settled:false});
  game.actions.skipFeast();game.tick(2750);game.tick(2950);expect(game.feastPresentation()).toMatchObject({heapFraction:0,counts:[60,40],settled:true});
});

test('skipping or choosing Still critters blends from the current feast light',()=>{
 for(const quiet of [false,true]){
  const {game,result}=fixture([50,50]);game.tick(0);game.actions.beginFeast(result);game.tick(0);game.tick(2600);
  const before=game.feastPresentation()!.lighting;
  if(quiet)game.actions.setSettings({still:true});else game.actions.skipFeast();game.tick(2600);
  expect(game.feastPresentation()!.lighting).toEqual(before);
  game.tick(2600+(quiet?320:200));expect(game.feastPresentation()!.lighting).toEqual({dusk:0,feast:0,day:1});
 }
});
