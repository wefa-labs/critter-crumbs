import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { copy, formatCopy } from '@critter-crumbs/shared';
import { useTrait } from 'koota/react';
import type { Entity } from 'koota';
import { Count, Identity, IsOwn, Name, Pile, Received } from '../world/index.js';
import { generateCritter } from '@critter-crumbs/core';
import { critterVersion } from '../portraits/version.js';
import type { StageRuntime } from '../sim/stage-runtime.js';
import { GameStage } from '../app/game-stage.js';
import { Link, PortraitImage, targetLabel } from '../app/ui.js';
import { StatementText } from '../app/gathering.js';
import { absoluteTime } from '../app/time.js';
import { portraitMetrics } from '../portraits/metrics.js';
import { isResultState, layoutStateFor, type MemberFeast, type PublicFeast, type GameScreenState } from '../app/feast-view.js';
import { layoutGame, shortName, type Rect } from './layout.js';
import { defaultScene } from './art.js';
import { SceneBackdrop } from './scenes.js';
import { CrumbMound, ThoughtBubble } from './mound.js';
import { useScatterInput } from '../app/scatter-input.js';
const rectStyle=(r:Rect):CSSProperties=>({left:r.x,top:r.y,width:r.width,height:r.height});
export function GameFrame({feast,viewer,onProfile,children}:{feast:PublicFeast;viewer?:{address:string;variant:number};onProfile?:()=>void;children:ReactNode}){
 return <div className="core-game"><header className="game-header"><div><Link href={'burrowId' in feast?`/burrows/${feast.burrowId}`:'/'}>{feast.burrowName}</Link><h1>{feast.title}</h1></div><span className="closing-day">{formatCopy('game.closeDay',{day:absoluteTime(feast.scatteringEndsAt)})}</span>{viewer?<button className="game-profile" style={viewer?{'--face-y':`${22-portraitMetrics(generateCritter(viewer.address,viewer.variant,critterVersion)).extent.headY*105}px`} as CSSProperties:undefined} aria-label={copy['game.profile']} onClick={onProfile}><PortraitImage address={viewer.address} variant={viewer.variant} name={copy['scatter.own.short']} size="stage"/></button>:null}</header>{children}</div>;
}
export function StatementPanel({feast,focus,close,turn}:{feast:MemberFeast;focus:number;close:()=>void;turn:(direction:number)=>void}){
 const target=feast.targets[focus]!,body=feast.statements.find(statement=>statement.targetId===target.id)?.body;
 const host=useRef<HTMLElement>(null);
 useEffect(()=>{host.current?.focus();const escape=(event:KeyboardEvent)=>{if(event.key==='Escape')close();};addEventListener('keydown',escape);return()=>removeEventListener('keydown',escape);},[close]);
 return <article ref={host} tabIndex={-1} className="statement-panel" aria-label={formatCopy('read.statement',{name:targetLabel(target)})}><div className="statement-heading"><h2>{targetLabel(target)}</h2><button className="quiet" onClick={close}>{copy['action.close']}</button></div><div className="statement-scroll" key={target.id}>{body?<StatementText body={body}/>:<p>{formatCopy('read.noStatement',{name:targetLabel(target)})}</p>}</div><div className="statement-navigation"><button className="secondary" onClick={()=>turn(-1)}>{copy['read.prev']}</button><p>{formatCopy('read.position',{i:focus+1,n:feast.targets.length})}</p><button className="secondary" onClick={()=>turn(1)}>{copy['read.next']}</button></div></article>;
}
export function Dock({focusRow,middle,turn,results}:{focusRow?:ReactNode;middle:ReactNode;turn:(direction:number)=>void;results?:ReactNode}){
 return <aside className="game-dock" aria-label={copy['pile.label']}>{results?<div className="results-card">{results}</div>:null}{focusRow?<div className="focus-row">{focusRow}</div>:null}<div className="dock-bar"><button className="dock-turn" aria-label={copy['read.prev']} onClick={()=>turn(-1)}>{copy['game.previous.symbol']}</button><div className="dock-middle">{middle}</div><button className="dock-turn" aria-label={copy['read.next']} onClick={()=>turn(1)}>{copy['game.next.symbol']}</button></div></aside>;
}
function CritterSpot({entity,runtime,onFocus,editable,announce}:{entity:Entity;runtime:StageRuntime;onFocus:()=>void;editable:boolean;announce:(text:string)=>void}){
 const own=entity.has(IsOwn),input=useScatterInput(entity,runtime,entity.get(Name)!.display,announce);
 return <button className="circle-hit" type="button" aria-label={own?copy['scatter.own.short']:formatCopy('scatter.add',{name:entity.get(Name)!.display})} onPointerDown={event=>{if(!event.isPrimary||event.button!==0)return;event.preventDefault();event.currentTarget.focus();event.currentTarget.setPointerCapture(event.pointerId);if(own){runtime.circle.stir(entity);runtime.animateFor(1100);}else if(editable&&runtime.heap.get(Pile)!.remaining){input.start(1);}else onFocus();}} onPointerMove={input.move} onPointerUp={input.stop} onPointerLeave={input.stop} onPointerCancel={input.stop} onLostPointerCapture={input.stop} onBlur={input.stop} onClick={event=>{if(event.detail!==0)return;if(own){runtime.circle.stir(entity);runtime.animateFor(1100);}else if(editable&&runtime.heap.get(Pile)!.remaining)input.tap(1);else onFocus();}}><GameStage entity={entity}/><span className="sleep-glyph" aria-hidden="true">{copy['game.sleep.symbol']}</span></button>;
}
function CritterPile({entity}:{entity:Entity}){const count=useTrait(entity,Count)!;return <CrumbMound count={count.given}/>;}
export function GameScene({runtime,feast,focus,turnTo,state,reading=false,onRead,onClose,announce,focusRow,middle,panel,results,heapHost,sceneId=defaultScene,editable=true}:{runtime:StageRuntime;feast:PublicFeast;focus:number;turnTo:(index:number)=>void;state:GameScreenState;reading?:boolean;onRead?:()=>void;onClose?:()=>void;announce:(text:string)=>void;focusRow?:ReactNode;middle:ReactNode;panel?:ReactNode;results?:ReactNode;heapHost?:React.RefObject<HTMLDivElement|null>;sceneId?:string;editable?:boolean}){
 const body=useRef<HTMLDivElement>(null),surface=useRef<HTMLDivElement>(null),[viewport,setViewport]=useState({width:390,height:844}),pile=useTrait(runtime.heap,Pile)!,previous=useRef(focus),from=useRef(focus);
 useLayoutEffect(()=>{const host=body.current!;const observer=new ResizeObserver(entries=>{const box=entries[0]!.contentRect;setViewport({width:box.width,height:box.height+64});});observer.observe(host);return()=>observer.disconnect();},[]);
 const gathered=isResultState(state);
 const critters=runtime.critters.map((entity,index)=>({name:targetLabel(feast.targets[index]!),own:entity.has(IsOwn),count:entity.get(Count)!.given,extent:portraitMetrics(entity.get(Identity)!.parameters,gathered?entity.get(Received)!.fed:0).extent}));
 const input={viewport,critters,focus,state:layoutStateFor(state,reading),issued:pile.issued};
 const layout=layoutGame(input),turn=(direction:number)=>turnTo((focus+direction+critters.length)%critters.length);
 useLayoutEffect(()=>{if(previous.current!==focus){from.current=previous.current;runtime.circle.turn(from.current,focus);runtime.animateFor(320);previous.current=focus;}runtime.circle.huddle(gathered);const earlier=layoutGame({...input,focus:from.current});const render=()=>{const t=runtime.circle.progress();for(const slot of layout.slots){const old=earlier.slots[slot.index]!,host=surface.current?.querySelector<HTMLElement>(`[data-spot="${slot.index}"]`);if(!host)continue;const mix=(a:number,b:number)=>a+(b-a)*t;Object.assign(host.style,rectStyle({x:mix(old.stage.x,slot.stage.x),y:mix(old.stage.y,slot.stage.y),width:mix(old.stage.width,slot.stage.width),height:mix(old.stage.height,slot.stage.height)}));host.dataset.stir=String(runtime.circle.sleeping(runtime.critters[slot.index]!));}};render();return runtime.onFrame(render);},[focus,viewport.width,viewport.height,gathered,reading]);
 const swipe=useRef<{x:number;y:number}|null>(null);
 return <div ref={body} className="game-body" data-desktop={layout.desktop} data-crowd={!layout.desktop&&critters.length>8} data-game-state={state} onKeyDown={event=>{if(event.target instanceof HTMLInputElement)return;if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();turn(event.key==='ArrowLeft'?-1:1);}else if(event.key==='Escape')onClose?.();}}><div ref={surface} className="game-scene" style={{width:layout.scene.width}} onPointerDown={event=>{if(event.target===event.currentTarget||event.target instanceof Element&&event.target.closest('.scene-backdrop'))swipe.current={x:event.clientX,y:event.clientY};}} onPointerUp={event=>{if(!swipe.current)return;const dx=event.clientX-swipe.current.x,dy=event.clientY-swipe.current.y;swipe.current=null;if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy))turn(dx<0?1:-1);else onClose?.();}} onPointerCancel={()=>{swipe.current=null;}}>
 <SceneBackdrop id={sceneId} desktop={layout.desktop}/>
 {layout.slots.map(slot=><div key={slot.index} className="circle-spot" data-spot={slot.index} data-slot={slot.slot} style={{...rectStyle(slot.stage),zIndex:slot.depth}}><CritterSpot entity={runtime.critters[slot.index]!} runtime={runtime} onFocus={()=>turnTo(slot.index)} editable={editable&&!reading&&!gathered} announce={announce}/></div>)}
 {!gathered?layout.slots.map(slot=><div className="circle-pile" data-count-id={feast.targets[slot.index]!.id} key={slot.index} style={{...rectStyle(slot.pile),zIndex:slot.depth+1}}><CritterPile entity={runtime.critters[slot.index]!}/></div>):null}
 {!gathered?layout.slots.filter(slot=>!slot.tag.hidden).map(slot=><button key={slot.index} className="critter-tag-target" aria-label={targetLabel(feast.targets[slot.index]!)} onClick={()=>turnTo(slot.index)} style={{...rectStyle({...slot.tag,y:slot.tag.y-(44-slot.tag.height)/2,height:44}),zIndex:2000+slot.depth}}><span className="critter-tag" data-tag={slot.index} data-focus={slot.slot===0} style={{width:slot.tag.width,height:slot.tag.height}}>{slot.tag.short?shortName(slot.name):slot.name}{!(layout.desktop&&slot.slot===0)&&!critters[slot.index]!.own?<TagCount entity={runtime.critters[slot.index]!}/>:null}</span></button>):null}
 {!gathered&&!reading?<div className="circle-heap" data-heap="true" ref={heapHost} style={rectStyle(layout.heap)}><CrumbMound count={pile.remaining} empty ppu={layout.ppu}/></div>:null}
 {!gathered&&onRead&&!reading?<button className="thought-target" aria-label={formatCopy('read.statement',{name:targetLabel(feast.targets[focus]!)})} onClick={onRead} style={{...rectStyle(layout.bubble),zIndex:2200}}><ThoughtBubble/></button>:null}
 {reading&&!layout.desktop&&panel?<div className="phone-statement">{panel}</div>:null}
 <div className="dock-position" style={rectStyle(layout.dock)}><Dock focusRow={gathered?undefined:focusRow} middle={middle} turn={turn} results={!layout.desktop?results:undefined}/></div>
 </div>{layout.desktop?<aside className="game-side">{panel??results}</aside>:null}</div>;
}
function TagCount({entity}:{entity:Entity}){const count=useTrait(entity,Count)!;return <b className="tag-count">{count.given}</b>;}
export function GameNotice({title,children}:{title:string;children:ReactNode}){return <div className="game-notice"><h2>{title}</h2>{children}</div>;}
export function Toast({children}:{children:ReactNode}){return <div className="game-toast" role="status">{children}</div>;}
