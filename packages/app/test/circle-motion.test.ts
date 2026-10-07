import { expect, test } from 'vitest';
import { createWorld, Count, Rig } from '../src/world/index.js';
test('stir keeps your critter asleep and its allocation empty, driven by the injected clock',()=>{
 const game=createWorld({issued:100,viewer:'0x0000000000000000000000000000000000000001',critters:[{id:'own',address:'0x0000000000000000000000000000000000000001',name:'Juniper',variant:0}]});
 game.tick(0); const restingTilt=game.critters[0]!.get(Rig)!.headTilt; game.circle.stir(game.critters[0]!); game.tick(200);
 expect(game.critters[0]!.get(Count)!.given).toBe(0);
 expect(game.critters[0]!.get(Rig)!.headTilt).not.toBe(restingTilt);
 game.tick(1200);expect(game.circle.sleeping(game.critters[0]!)).toBe(false);game.destroy();
});
