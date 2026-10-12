import { Component, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { createRoot, events, extend, unmountComponentAtNode, type ReconcilerRoot } from '@react-three/fiber';
import { View } from '@react-three/drei/web/View.js';
import { Group } from 'three';
import { Identity } from '../world/traits.js';
import { canvasConfig, configureRenderer, contextConfig, useStageDriver, useStageLights, useStageModel, type SceneProps } from './runtime.js';
export type { SceneProps, RenderSample } from './runtime.js';

/* fiber's own <Canvas> registers every export of three so that any of them can be written as an element, and a library
   named whole cannot be trimmed: all of three shipped. The scene is mounted through fiber's createRoot instead, as its
   documentation gives for this, and registers the one element drawn by name: the <group> drei's View wraps each stage
   in. Everything else is built in code (critter.ts, runtime.ts) and handed over as a <primitive>. */
extend({ Group });

/** An error inside the scene is thrown again from the canvas, where the app's own boundary falls back to portraits. */
class Rethrow extends Component<{ report: (error: unknown) => void; children: ReactNode }, { failed: boolean }> {
 state={failed:false};static getDerivedStateFromError(){return {failed:true};}componentDidCatch(error:unknown){this.props.report(error);}render(){return this.state.failed?null:this.props.children;}
}
/** What fiber's <Canvas> does for this scene, less the registering: a canvas the size of its host, a root configured for it, the children rendered into the root, and the root unmounted with it. */
function StageCanvas({dpr,antialias,children}:Pick<SceneProps,'dpr'|'antialias'>&{children:ReactNode}) {
 const host=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null),root=useRef<ReconcilerRoot<HTMLCanvasElement>|null>(null);
 const [size,setSize]=useState({width:0,height:0}),[error,setError]=useState<unknown>(null),mounted=useRef(true);
 if(error)throw error;
 useLayoutEffect(()=>{
   const measure=()=>{const box=host.current!.getBoundingClientRect();setSize(old=>old.width===box.width&&old.height===box.height?old:{width:box.width,height:box.height});};
   const observer=new ResizeObserver(measure);observer.observe(host.current!);measure();return()=>observer.disconnect();
 },[]);
 useLayoutEffect(()=>{
   if(!size.width||!size.height||!canvas.current)return;
   const current=root.current??=createRoot(canvas.current);
   void current.configure({gl:contextConfig(antialias),events,frameloop:canvasConfig.frameloop,dpr,size:{...size,top:0,left:0},onCreated:state=>{state.events.connect?.(host.current);configureRenderer(state);}}).then(()=>{if(mounted.current)current.render(<Rethrow report={setError}>{children}</Rethrow>);});
 });
 useEffect(()=>{const node=canvas.current;mounted.current=true;return()=>{mounted.current=false;if(node)unmountComponentAtNode(node);};},[]);
 return <div ref={host} className={canvasConfig.className} inert aria-hidden="true"><canvas ref={canvas}/></div>;
}
function Stage({entity,texture,registry,stage,runtime}:Parameters<typeof useStageModel>[0] & Pick<SceneProps,'runtime'>) {
 const model=useStageModel({entity,texture,registry,stage,runtime}),lights=useStageLights({runtime});
 return <><primitive object={lights.sky}/><primitive object={lights.sun}/><primitive object={lights.ambient}/><primitive object={model.group}/></>;
}
function Driver(props:SceneProps) {
 const {registry,texture}=useStageDriver(props);
 return <>{props.runtime.alive?props.stages.map((stage,index)=>{const entity=props.runtime.critters.find(entity=>entity.get(Identity)!.id===stage.dataset.critterId)!;return <View key={stage.dataset.critterId} track={{current:stage}} index={index+1} frames={Infinity}><Stage entity={entity} texture={texture} registry={registry} stage={stage} runtime={props.runtime}/></View>;}):null}</>;
}
export function StageScene(props:SceneProps) {return createPortal(<StageCanvas dpr={props.dpr} antialias={props.antialias}><Driver {...props}/></StageCanvas>,document.body);}
