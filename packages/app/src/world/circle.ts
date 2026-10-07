import { trait, type Entity, type World } from 'koota';
import { CIRCLE_FEEL } from '@critter-crumbs/shared';
import { Clock, Identity, Rig, Settings } from './traits.js';
const Facing = trait({side:1});
const Stir = trait({startedAt:0});
const Circle = trait({from:0,to:0,startedAt:0,progress:1,huddle:false});
/** Clock-driven circle turns, sleepy gestures and seeded huddle play. */
export function createCircleMotion(world:World,critters:readonly Entity[]){
 world.add(Circle);
 const quiet=()=>{const settings=world.get(Settings)!;return settings.still||settings.reducedMotion;};
 return {
  turn(from:number,to:number){world.set(Circle,{from,to,startedAt:world.get(Clock)!.now,progress:quiet()?1:0});},
  progress(){return world.get(Circle)!.progress;},
  huddle(value:boolean){world.set(Circle,{huddle:value});},
  stir(entity:Entity){if(!critters.includes(entity))return;if(!quiet()){const side=-(entity.get(Facing)?.side??1);if(entity.has(Facing))entity.set(Facing,{side});else entity.add(Facing({side}));}if(entity.has(Stir))entity.set(Stir,{startedAt:world.get(Clock)!.now});else entity.add(Stir({startedAt:world.get(Clock)!.now}));},
  facing(entity:Entity){return entity.get(Facing)?.side??1;},
  sleepGlyphs(entity:Entity){const stir=entity.get(Stir),age=stir?world.get(Clock)!.now-stir.startedAt:-1;return [0,1,2].map(index=>{const elapsed=age-index*CIRCLE_FEEL.sleepReleaseMs,t=Math.min(1,Math.max(0,elapsed/CIRCLE_FEEL.sleepLifeMs));return {visible:!!stir&&elapsed>=0&&elapsed<CIRCLE_FEEL.sleepLifeMs,opacity:1-t,x:quiet()?0:t*CIRCLE_FEEL.sleepDriftX,y:quiet()?0:-t*CIRCLE_FEEL.sleepDriftY};});},
  sleeping(entity:Entity){return entity.has(Stir);},
  isAnimating(){return world.get(Circle)!.progress<1||world.query(Stir).length>0;},
  tick(){const now=world.get(Clock)!.now,state=world.get(Circle)!;const t=quiet()?1:Math.min(1,(now-state.startedAt)/CIRCLE_FEEL.turnMs);world.set(Circle,{progress:t*t*(3-2*t)});
   for(const entity of critters){const rig=entity.get(Rig)!,stir=entity.get(Stir);if(stir){const age=now-stir.startedAt;if(age>=CIRCLE_FEEL.sleepGlyphMs)entity.remove(Stir);else if(!quiet())entity.set(Rig,{headTilt:rig.headTilt+18*Math.sin(Math.PI*Math.min(1,age/CIRCLE_FEEL.stirMs)),leanZ:rig.leanZ+5*Math.sin(age/CIRCLE_FEEL.stirMs*Math.PI*2)});}
    if(state.huddle&&!quiet()){const seed=entity.get(Identity)!.parameters.idlePhase,period=CIRCLE_FEEL.playEveryMs[0]+seed*(CIRCLE_FEEL.playEveryMs[1]-CIRCLE_FEEL.playEveryMs[0]),age=(now+seed*period)%period;if(age<CIRCLE_FEEL.playMs)entity.set(Rig,{liftY:rig.liftY+6/46*Math.sin(Math.PI*age/CIRCLE_FEEL.playMs),headTilt:rig.headTilt+5*Math.sin(age/CIRCLE_FEEL.playMs*Math.PI*2)});}
   }
  }
 };
}
