import {test,expect} from 'vitest';
import {createWorld,Clock} from '../src/world/index.js';
import {spawnDomFlight,DomFlight} from '../src/world/dom-flights.js';
import {DOM_HOP} from '@critter-crumbs/shared';
test('DOM crumb flight positions and lifetime come from the Koota Clock',()=>{
 const game=createWorld({issued:100,critters:[]});game.tick(0);const flight=spawnDomFlight(game.world,{x:10,y:100},{x:100,y:200})!;expect(flight.get(DomFlight)!.x).toBe(10);game.tick(DOM_HOP.ms*.15);expect(game.world.get(Clock)!.now).toBe(DOM_HOP.ms*.15);expect(flight.get(DomFlight)!.x).toBeGreaterThan(10);expect(flight.get(DomFlight)!.y).toBeLessThan(100);game.tick(DOM_HOP.ms);expect(flight.isAlive()).toBe(false);game.destroy();
});
