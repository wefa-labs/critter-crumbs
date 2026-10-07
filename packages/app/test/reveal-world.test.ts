import { expect, test } from 'vitest';
import { Asleep, Rig, StatementReveal, createWorld } from '../src/world/index.js';
const critters = Array.from({ length: 49 }, (_, index) => ({ id: String(index), address: `0x${(index + 1).toString(16).padStart(40, '0')}`, ownerAddress: null, name: String(index), variant: 0 }));
test('reveal is queued and wakes all 49 critters before its focus-ready state', () => {
  const sounds: string[] = []; const game = createWorld({ issued: 100, critters, asleep: true, outputs: { sound: cue => sounds.push(cue.token) } });
  game.actions.beginReveal(); expect(game.world.has(StatementReveal)).toBe(false);
  for (let now = 0; now <= 1200; now += 10) game.tick(now);
  expect(game.world.get(StatementReveal)).toMatchObject({ ready: true, daylight: 1 });
  expect(game.critters.every(critter => !critter.has(Asleep))).toBe(true);
  // Earlier critters may already be blinking independently; the last wake is complete.
  expect(game.critters.at(-1)!.get(Rig)!.lids).toBeGreaterThanOrEqual(.99);
  expect(sounds).toEqual(['statements.reveal']); game.destroy();
});
test('quiet reveal changes poses in the same tick and becomes ready at 200ms', () => {
  const game = createWorld({ issued: 100, critters: critters.slice(0, 3), asleep: true, settings: { still: true } }); game.actions.beginReveal(); game.tick(0);
  expect(game.critters.every(critter => !critter.has(Asleep))).toBe(true); game.tick(199); expect(game.world.get(StatementReveal)!.ready).toBe(false);
  game.tick(200); expect(game.world.get(StatementReveal)!.ready).toBe(true); game.destroy();
});

test('opened statements leave the woken critters delighted while your own sleeps on', () => {
  // The flow page's reveal (screen 34) draws every critter but yours awake with cheeks and a smile.
  const own = '0x0000000000000000000000000000000000000001';
  const game = createWorld({ issued: 100, asleep: true, viewer: own, settings: { still: true }, critters: [
    { id: own, address: own, name: 'Juniper', variant: 0 },
    { id: 'other', address: '0x0000000000000000000000000000000000000002', name: 'Fern', variant: 0 },
  ] });
  game.actions.beginReveal(); game.actions.delight(true); game.tick(0); game.tick(400);
  expect(game.critters[1]!.get(Rig)).toMatchObject({ cheeks: expect.any(Number) });
  expect(game.critters[1]!.get(Rig)!.mouth).toBeGreaterThan(0);
  expect(game.critters[1]!.get(Rig)!.cheeks).toBeGreaterThan(0);
  expect(game.critters[0]!.get(Rig)!.mouth).toBe(0);
  game.actions.delight(false); game.tick(800);
  expect(game.critters[1]!.get(Rig)!.mouth).toBe(0);
  game.destroy();
});

test('closing scattering with the screen open puts every critter to sleep', () => {
  // The flow page's "Scattering closed" (screen 41) draws the whole circle asleep at dusk.
  const game = createWorld({ issued: 100, settings: { still: true }, critters: critters.slice(0, 4) });
  game.tick(0);
  expect(game.critters.some(critter => critter.has(Asleep))).toBe(false);
  game.actions.fallAsleep(); game.tick(16);
  expect(game.critters.every(critter => critter.has(Asleep))).toBe(true);
  game.destroy();
});

test('the statement reveal leaves your own critter asleep until the feast',()=>{
 const own='0x0000000000000000000000000000000000000001';const game=createWorld({issued:100,asleep:true,viewer:own,critters:[{id:own,address:own,name:'Juniper',variant:0},{id:'other',address:'0x0000000000000000000000000000000000000002',name:'Fern',variant:0}]});game.actions.beginReveal();game.tick(0);game.tick(1400);expect(game.critters[0]!.has(Asleep)).toBe(true);expect(game.critters[1]!.has(Asleep)).toBe(false);game.destroy();
});
