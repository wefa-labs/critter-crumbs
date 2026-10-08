import {trait,type World} from 'koota';
import {DOM_HOP} from '@critter-crumbs/shared';
import {Clock,Settings} from './traits.js';
import {hopPosition,hopProgress,type Point} from '../app/hop-geometry.js';
export const DomFlight=trait({startedAt:0,fromX:0,fromY:0,toX:0,toY:0,x:0,y:0,rotation:0,opacity:1});
export function spawnDomFlight(world:World,from:Point,to:Point){
 const settings=world.get(Settings)!;
 if(settings.still||settings.reducedMotion||world.query(DomFlight).length>=DOM_HOP.maxAlive)return null;
 return world.spawn(DomFlight({startedAt:world.get(Clock)!.now,fromX:from.x,fromY:from.y,toX:to.x,toY:to.y,x:from.x,y:from.y}));
}
export function tickDomFlights(world:World){
 const now=world.get(Clock)!.now,settings=world.get(Settings)!;
 for(const entity of world.query(DomFlight)){
  const state=entity.get(DomFlight)!,t=Math.min(1,Math.max(0,(now-state.startedAt)/DOM_HOP.ms));
  if(t===1||settings.still||settings.reducedMotion){entity.destroy();continue;}
  const point=hopPosition({x:state.fromX,y:state.fromY},{x:state.toX,y:state.toY},hopProgress(t));
  entity.set(DomFlight,{...point,rotation:DOM_HOP.turnDegrees*t,opacity:t<DOM_HOP.fadeAt?1:(1-t)/(1-DOM_HOP.fadeAt)});
 }
}
