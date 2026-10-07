import { expect, test } from 'vitest';
import { createWorld, Count, Rig } from '../src/world/index.js';
const address='0x0000000000000000000000000000000000000001';
test('stir keeps your critter asleep and its allocation empty, driven by the injected clock',()=>{
 const game=createWorld({issued:100,viewer:'0x0000000000000000000000000000000000000001',critters:[{id:'own',address:'0x0000000000000000000000000000000000000001',name:'Juniper',variant:0}]});
 game.tick(0); const restingTilt=game.critters[0]!.get(Rig)!.headTilt; game.circle.stir(game.critters[0]!); game.tick(200);
 expect(game.critters[0]!.get(Count)!.given).toBe(0);
 expect(game.critters[0]!.get(Rig)!.headTilt).not.toBe(restingTilt);
 game.tick(1200);expect(game.circle.sleeping(game.critters[0]!)).toBe(false);game.destroy();
});

test('stir retains its turned side and releases three Clock-driven sleep glyphs',()=>{
 const game=createWorld({issued:100,viewer:address,critters:[{id:address,address,ownerAddress:address,name:'Juniper',variant:0}]});
 game.tick(0);game.circle.stir(game.critters[0]!);expect(game.circle.facing(game.critters[0]!)).toBe(-1);expect(game.circle.sleepGlyphs(game.critters[0]!).filter(glyph=>glyph.visible)).toHaveLength(1);
 game.tick(260);expect(game.circle.sleepGlyphs(game.critters[0]!).filter(glyph=>glyph.visible)).toHaveLength(3);game.tick(1100);expect(game.circle.facing(game.critters[0]!)).toBe(-1);expect(game.critters[0]!.get(Count)!.given).toBe(0);game.destroy();
});

for(const setting of ['still','reducedMotion'] as const)test(`${setting} stir keeps the current side and suppresses glyph travel`,()=>{
 const game=createWorld({issued:100,viewer:address,settings:{[setting]:true},critters:[{id:address,address,name:'Juniper',variant:0}]});game.tick(0);game.circle.stir(game.critters[0]!);game.tick(260);
 expect(game.circle.facing(game.critters[0]!)).toBe(1);for(const glyph of game.circle.sleepGlyphs(game.critters[0]!)){expect(glyph.x).toBe(0);expect(glyph.y).toBe(0);}game.destroy();
});
