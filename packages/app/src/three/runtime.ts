import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { addEffect, useFrame, useThree } from '@react-three/fiber';
import { ACESFilmicToneMapping, AmbientLight, CanvasTexture, Color, DirectionalLight, HemisphereLight, InstancedMesh, Matrix4, MeshStandardMaterial, OctahedronGeometry, OrthographicCamera, PerspectiveCamera, Scene, SRGBColorSpace, Vector3, type WebGLRenderer } from 'three';
import { FLIGHT, REDUCED_MOTION, RENDER_BUDGET } from '@critter-crumbs/shared';
import { Clock, Flight, FlyingTo, Identity, Mesh, Rig, Settings } from '../world/index.js';
import { readAnimationTime } from '../sim/ticker-host.js';
import type { StageRuntime } from '../sim/stage-runtime.js';
import type { createRenderPolicy } from '../sim/render-policy.js';
import { createCritter } from './critter.js';
import { tokens } from '../styles/tokens.js';
import type { Entity } from 'koota';
export interface RenderSample { calls:number; triangles:number; interval:number; count:number; antialias:boolean; dpr:number }
export interface SceneProps { runtime:StageRuntime; stages:HTMLElement[]; dpr:number; antialias:boolean; policy?:ReturnType<typeof createRenderPolicy>; onReady:()=>void; onFrame?:(sample:RenderSample)=>void; onRenderer?:(renderer:WebGLRenderer)=>void }
type Model=ReturnType<typeof createCritter>;
type Registry=Map<Entity,{model:Model;camera:PerspectiveCamera;stage:HTMLElement}>;
function blobTexture() { const canvas=document.createElement('canvas');canvas.width=canvas.height=RENDER_BUDGET.blobSize;const context=canvas.getContext('2d')!;const half=RENDER_BUDGET.blobSize/2;const gradient=context.createRadialGradient(half,half,0,half,half,half);gradient.addColorStop(0,'rgba(255,255,255,1)');gradient.addColorStop(1,'rgba(255,255,255,0)');context.fillStyle=gradient;context.fillRect(0,0,canvas.width,canvas.height);return new CanvasTexture(canvas); }
export function useStageModel({entity,texture,registry,stage,runtime}:{entity:Entity;texture:CanvasTexture;registry:Registry;stage:HTMLElement;runtime:StageRuntime}) {
 const model=useMemo(()=>createCritter(entity.get(Identity)!.parameters,texture),[entity,texture]);
 const set=useThree(state=>state.set),previous=useThree(state=>state.camera);
 const camera=useMemo(()=>{const value=new PerspectiveCamera(28,1,.1,100);value.position.set(0,1.4,7.5);value.lookAt(0,1.4,0);return value;},[]);
 useLayoutEffect(()=>{if(!runtime.alive){model.dispose();return;}set({camera});entity.add(Mesh(model.group));registry.set(entity,{model,camera,stage});let disposed=false;const dispose=()=>{if(disposed)return;disposed=true;delete stage.dataset.mesh;set({camera:previous});registry.delete(entity);if(runtime.alive&&entity.isAlive())entity.remove(Mesh);model.dispose();};const unregister=runtime.onDestroy(dispose);return()=>{unregister();dispose();};},[entity,model,stage,runtime]);
 return model;
}
const presets={day:[tokens['light-day-sky'],tokens['light-day-ground'],tokens['light-day-sky-intensity'],tokens['light-day-sun'],tokens['light-day-sun-intensity'], [tokens['light-day-sun-x'],tokens['light-day-sun-y'],tokens['light-day-sun-z']],tokens['light-day-ambient'],tokens['light-day-ambient-intensity']],dusk:[tokens['light-dusk-sky'],tokens['light-dusk-ground'],tokens['light-dusk-sky-intensity'],tokens['light-dusk-sun'],tokens['light-dusk-sun-intensity'], [tokens['light-dusk-sun-x'],tokens['light-dusk-sun-y'],tokens['light-dusk-sun-z']],tokens['light-dusk-ambient'],tokens['light-dusk-ambient-intensity']],feast:[tokens['light-feast-sky'],tokens['light-feast-ground'],tokens['light-feast-sky-intensity'],tokens['light-feast-sun'],tokens['light-feast-sun-intensity'], [tokens['light-feast-sun-x'],tokens['light-feast-sun-y'],tokens['light-feast-sun-z']],tokens['light-feast-ambient'],tokens['light-feast-ambient-intensity']]} as const;
export function useStageLights({runtime}:{runtime:StageRuntime}){
 const lights=useMemo(()=>({sky:new HemisphereLight(),sun:new DirectionalLight(),ambient:new AmbientLight()}),[]);
 useFrame(()=>{if(!runtime.alive)return;const light=runtime.feastPresentation()?.lighting;
 const weights=light??{dusk:0,feast:0,day:1};
 const colour=(index:0|1|3|6)=>new Color(0).add(new Color(presets.dusk[index]).multiplyScalar(weights.dusk)).add(new Color(presets.feast[index]).multiplyScalar(weights.feast)).add(new Color(presets.day[index]).multiplyScalar(weights.day));
 const intensity=(index:2|4|7)=>presets.dusk[index]*weights.dusk+presets.feast[index]*weights.feast+presets.day[index]*weights.day;
 lights.sky.color.copy(colour(0));lights.sky.groundColor.copy(colour(1));lights.sky.intensity=intensity(2);lights.sun.color.copy(colour(3));lights.sun.intensity=intensity(4);lights.sun.position.set(0,0,0);for(const key of ['dusk','feast','day'] as const)lights.sun.position.addScaledVector(new Vector3(...presets[key][5]),weights[key]);lights.ambient.color.copy(colour(6));lights.ambient.intensity=intensity(7);},0);
 return lights;
}
export function useStageDriver({runtime,stages,onReady,onFrame,onRenderer,policy}:SceneProps) {
 const {gl,invalidate,setFrameloop,size}=useThree(),raw=useRef(0),previous=useRef<number|undefined>(undefined),ready=useRef(false),registry=useMemo<Registry>(()=>new Map(),[]);
 const texture=useMemo(blobTexture,[]);
 const crumbs=useMemo(()=>{const geometry=new OctahedronGeometry(.045,0),position=geometry.attributes.position!;for(let i=0;i<position.count;i++){position.setXYZ(i,position.getX(i)*(1+(i%3-1)*.06),position.getY(i)*(1+(i%5-2)*.03),position.getZ(i));}geometry.computeVertexNormals();const material=new MeshStandardMaterial({color:tokens.honey,roughness:.8});const mesh=new InstancedMesh(geometry,material,FLIGHT.maxAlive);mesh.frustumCulled=false;mesh.count=0;const scene=new Scene();scene.add(mesh,new AmbientLight(tokens.surface,1.5));return{geometry,material,mesh,scene,camera:new OrthographicCamera(-1,1,1,-1,-1000,1000)};},[]);
 useEffect(()=>{
   const remove=addEffect(now=>{raw.current=now;});const release=runtime.ticker.connectThree({invalidate,setMode:mode=>{previous.current=undefined;setFrameloop(mode==='paused'?'never':mode==='continuous'?'always':'demand');if(mode!=='continuous')policy?.pause();}});
   const detach=runtime.attach3d(()=>{const settings=runtime.world.get(Settings)!,now=runtime.world.get(Clock)!.now;for(const [entity,{model}]of registry)if(entity.isAlive()&&model.apply(entity.get(Rig)!,now,settings.still||settings.reducedMotion))runtime.animateFor(REDUCED_MOTION.growthCrossfadeMs);});
   let timeout:ReturnType<typeof setTimeout>|undefined;const lost=(event:Event)=>{event.preventDefault();const at=readAnimationTime();policy?.lost(at);gl.domElement.style.visibility='hidden';for(const [entity,{stage}]of registry){delete stage.dataset.mesh;if(runtime.alive&&entity.isAlive())entity.remove(Mesh);}runtime.ticker.setOwner('raf');setFrameloop('never');timeout=setTimeout(()=>policy?.check(at+RENDER_BUDGET.restoreMs),RENDER_BUDGET.restoreMs);};
   const restored=()=>{clearTimeout(timeout);policy?.restored(readAnimationTime());if(!policy||policy.snapshot().phase==='active'){gl.domElement.style.visibility='';for(const [entity,{model}]of registry)if(runtime.alive&&entity.isAlive())entity.add(Mesh(model.group));ready.current=false;setFrameloop(runtime.ticker.mode()==='continuous'?'always':'demand');runtime.ticker.setOwner('three');runtime.ticker.invalidate();}};
   gl.domElement.addEventListener('webglcontextlost',lost);gl.domElement.addEventListener('webglcontextrestored',restored);onRenderer?.(gl);
   let disposed=false;const dispose=()=>{if(disposed)return;disposed=true;clearTimeout(timeout);gl.domElement.removeEventListener('webglcontextlost',lost);gl.domElement.removeEventListener('webglcontextrestored',restored);detach();release();remove();texture.dispose();crumbs.geometry.dispose();crumbs.material.dispose();crumbs.mesh.dispose();gl.forceContextLoss();gl.dispose();};const unregister=runtime.onDestroy(dispose);return()=>{unregister();dispose();};
 },[runtime,gl]);
 useFrame(()=>{if(!runtime.alive)return;gl.info.autoReset=false;gl.info.reset();gl.setScissorTest(false);gl.clear();runtime.ticker.frame(raw.current,'three');},-1);
 useFrame(()=>{
   if(!runtime.alive||gl.getContext().isContextLost())return;
   const {mesh,camera,scene}=crumbs;camera.left=-size.width/2;camera.right=size.width/2;camera.top=size.height/2;camera.bottom=-size.height/2;camera.updateProjectionMatrix();let count=0;
   for(const entity of runtime.world.query(Flight)){if(count>=(policy?.snapshot().crumbLimit??FLIGHT.maxAlive))break;const target=entity.targetFor(FlyingTo),entry=target&&registry.get(target);if(!entry)continue;const flight=entity.get(Flight)!,rect=entry.stage.getBoundingClientRect();if(rect.bottom<0||rect.top>size.height)continue;const point=new Vector3(flight.x,flight.y,flight.z).project(entry.camera);const x=rect.left+(point.x+1)*rect.width/2-size.width/2,y=size.height/2-rect.top-(1-point.y)*rect.height/2;mesh.setMatrixAt(count++,new Matrix4().makeScale(rect.height*.22,rect.height*.22,1).setPosition(x,y,0));}
   mesh.count=count;if(count){mesh.instanceMatrix.needsUpdate=true;gl.setViewport(0,0,size.width,size.height);gl.setScissorTest(false);const clear=gl.autoClear;gl.autoClear=false;gl.clearDepth();gl.render(scene,camera);gl.autoClear=clear;}
   for(const {stage}of registry.values())stage.dataset.mesh='ready';
   if(!ready.current&&registry.size){ready.current=true;onReady();}
   const now=raw.current,interval=previous.current===undefined?0:now-previous.current;
   if(previous.current!==undefined&&runtime.ticker.mode()==='continuous')policy?.sample(now,interval);
   onFrame?.({calls:gl.info.render.calls,triangles:gl.info.render.triangles,interval,count:stages.length,antialias:gl.getContextAttributes()!.antialias??false,dpr:gl.getPixelRatio()});previous.current=now;
 },100);
 return {registry,texture};
}
export const canvasConfig = { className: 'critter-canvas', frameloop: 'always' as const };
export const contextConfig = (antialias: boolean) => ({ alpha: true, antialias, powerPreference: 'low-power' as const });
export function configureRenderer({gl}:{gl:WebGLRenderer}) {gl.domElement.setAttribute('aria-hidden','true');gl.domElement.inert=true;gl.setClearColor(new Color(0),0);gl.outputColorSpace=SRGBColorSpace;gl.toneMapping=ACESFilmicToneMapping;gl.toneMappingExposure=1;}
