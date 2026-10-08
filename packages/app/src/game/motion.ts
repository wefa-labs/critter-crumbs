import type {Entity} from 'koota';
import {IsOwn} from '../world/traits.js';
import type {StageRuntime} from '../sim/stage-runtime.js';
/** DOM adapter only; the Koota Clock owns the side and glyph trajectories. */
export function presentSleep(host:HTMLElement,entity:Entity,circle:StageRuntime['circle'],gathered:boolean){
 host.dataset.stir=String(circle.sleeping(entity));if(!gathered&&entity.has(IsOwn))host.dataset.face=circle.facing(entity)<0?'left':'right';
 const glyphs=circle.sleepGlyphs(entity);host.querySelectorAll<HTMLElement>('.sleep-glyph span').forEach((node,index)=>{const glyph=glyphs[index]!;node.style.opacity=String(glyph.visible?glyph.opacity:0);node.style.transform=`translate(${glyph.x}px,${glyph.y}px)`;});
}
