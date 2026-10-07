import { Component, useEffect, useState, useSyncExternalStore, type ComponentType, type ReactNode, type RefObject } from 'react';
import { copy, RENDER_BUDGET } from '@critter-crumbs/shared';
import { supportsMesh } from '../portraits/version.js';
import { Identity } from '../world/index.js';
import type { GameSettings } from '../world/index.js';
import type { StageRuntime } from '../sim/stage-runtime.js';
import { createRenderPolicy } from '../sim/render-policy.js';
import type { SceneProps } from '../three/scene.js';
let session: ReturnType<typeof createRenderPolicy> | undefined;
function renderingSession() { return session ??= createRenderPolicy(Math.min(devicePixelRatio, matchMedia('(pointer: coarse)').matches ? RENDER_BUDGET.phoneDpr : RENDER_BUDGET.desktopDpr)); }
class RenderBoundary extends Component<{children:ReactNode;failed:()=>void},{failed:boolean}> {
 state={failed:false};static getDerivedStateFromError(){return {failed:true};}componentDidCatch(){this.props.failed();}render(){return this.state.failed?null:this.props.children;}
}
function portraitsOnly(runtime: StageRuntime) { return runtime.critters.some(entity => !supportsMesh(entity.get(Identity)!.parameters.version)); }
/** Keeps renderer availability outside the world: the world and its allocation never remount. */
export function Renderer({runtime,settings,surface,announce,diagnostics}:{runtime:StageRuntime;settings:GameSettings;surface:RefObject<HTMLElement|null>;announce:(text:string)=>void;diagnostics?:Pick<SceneProps,'onFrame'|'onRenderer'>}) {
 const [policy]=useState(renderingSession),state=useSyncExternalStore(policy.subscribe,policy.snapshot),[Scene,setScene]=useState<ComponentType<SceneProps>|null>(null),[attempt,setAttempt]=useState(0),[stages,setStages]=useState<HTMLElement[]>([]);
 useEffect(()=>{if(portraitsOnly(runtime)||settings.simple||state.phase==='fallback')return;let active=true;void import('../three/index.js').then(module=>{if(active)setScene(()=>module.StageScene);}).catch(()=>{if(active)policy.failed();});return()=>{active=false;};},[settings.simple,state.phase==='fallback',attempt]);
 useEffect(()=>{const notice=policy.takeAnnouncement();if(notice)announce(copy[notice]);},[state.notice,announce]);
 useEffect(()=>{runtime.setIdleMotion(state.idle);},[runtime,state.idle]);
 useEffect(()=>{
   const nodes=Array.from(surface.current?.querySelectorAll<HTMLElement>('.stage[data-critter-id]')??[]);
   const measure=()=>{if(!runtime.alive)return;const visible=nodes.filter(node=>{const r=node.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth;});const rect=surface.current?.getBoundingClientRect(),onScreen=!!rect&&rect.bottom>0&&rect.top<innerHeight;runtime.ticker.setVisible(onScreen);runtime.ticker.invalidate();if(!onScreen)policy.pause();const chosen=visible.slice(0,Math.floor((RENDER_BUDGET.sceneCalls-1)/RENDER_BUDGET.callsPerCritter));setStages(previous=>previous.length===chosen.length&&previous.every((node,i)=>node===chosen[i])?previous:chosen);};
   const observer=new ResizeObserver(measure),intersection=new IntersectionObserver(measure);nodes.forEach(node=>{observer.observe(node);intersection.observe(node);});if(surface.current){observer.observe(surface.current);intersection.observe(surface.current);}surface.current?.addEventListener('toggle',measure,true);const visibility=()=>{if(document.hidden)policy.pause();};window.addEventListener('scroll',measure,true);window.addEventListener('resize',measure);document.addEventListener('visibilitychange',visibility);measure();
   return()=>{observer.disconnect();intersection.disconnect();surface.current?.removeEventListener('toggle',measure,true);window.removeEventListener('scroll',measure,true);window.removeEventListener('resize',measure);document.removeEventListener('visibilitychange',visibility);if(runtime.alive)runtime.ticker.setVisible(true);nodes.forEach(node=>delete node.dataset.mesh);};
 },[runtime]);
 if (portraitsOnly(runtime)) return null;
 return <>{!settings.simple&&state.notice?<div className="notice"><p>{copy[state.notice]}</p>{state.retryAvailable?<button onClick={()=>{if(policy.retry()){setScene(null);setAttempt(value=>value+1);}}}>{copy['fallback.retry']}</button>:null}</div>:null}{!settings.simple&&state.phase!=='fallback'&&Scene&&stages.length>0?<RenderBoundary key={`${attempt}:${state.antialias}`} failed={()=>policy.failed()}><Scene runtime={runtime} stages={stages} dpr={state.dpr} antialias={state.antialias} policy={policy} {...(import.meta.env.DEV?diagnostics:{})} onReady={()=>policy.ready()}/></RenderBoundary>:null}</>;
}
