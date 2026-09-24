import { createPortal } from 'react-dom';
import { Canvas } from '@react-three/fiber';
import { View } from '@react-three/drei/web/View.js';
import { Identity } from '../world/index.js';
import { canvasConfig, configureRenderer, contextConfig, useStageDriver, useStageLights, useStageModel, type SceneProps } from './runtime.js';
export type { SceneProps, RenderSample } from './runtime.js';
function Stage({entity,texture,registry,stage,runtime}:Parameters<typeof useStageModel>[0] & Pick<SceneProps,'runtime'>) {
 const model=useStageModel({entity,texture,registry,stage,runtime}),lights=useStageLights({runtime});
 return <><primitive object={lights.sky}/><primitive object={lights.sun}/><primitive object={lights.ambient}/><primitive object={model.group}/></>;
}
function Driver(props:SceneProps) {
 const {registry,texture}=useStageDriver(props);
 return <>{props.runtime.alive?props.stages.map((stage,index)=>{const entity=props.runtime.critters.find(entity=>entity.get(Identity)!.id===stage.dataset.critterId)!;return <View key={stage.dataset.critterId} track={{current:stage}} index={index+1} frames={Infinity}><Stage entity={entity} texture={texture} registry={registry} stage={stage} runtime={props.runtime}/></View>;}):null}</>;
}
export function StageScene(props:SceneProps) {return createPortal(<Canvas {...canvasConfig} inert aria-hidden="true" dpr={props.dpr} gl={contextConfig(props.antialias)} onCreated={configureRenderer}><Driver {...props}/></Canvas>,document.body);}
