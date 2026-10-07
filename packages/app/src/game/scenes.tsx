import { useEffect, useId, useState, type CSSProperties } from 'react';
import { tokens } from '../styles/tokens.js';
import { defaultScene } from './art.js';
import { validateScenes } from './scene-manifest.js';
interface Crop { x:number;y:number;w:number;h:number }
interface Scene {id:string;aspect:number;devices:{phone:{image:string;kind:'crops'|'plate'};desktop:{image:string;kind:'crops'|'plate'}};floor:Crop;wall:Crop;cornerL:Crop;cornerR:Crop;lookFilter:keyof typeof tokens}
function CroppedImage({src,crop,className,x,y,width,height}:{src:string;crop:Crop;className?:string;x?:number;y?:number;width?:number;height?:number}){return <svg x={x} y={y} width={width} height={height} className={className} viewBox={`${crop.x} ${crop.y} ${crop.w} ${crop.h}`} preserveAspectRatio="none" aria-hidden="true"><image href={src} width="1" height="1" preserveAspectRatio="none"/></svg>;}
/** Crop and mirror tiles in SVG; the canvas remains exclusively a critter renderer. */
function Floor({scene,src}:{scene:Scene;src:string}){
 const id=useId(),width=280,height=width*scene.floor.h/(scene.floor.w*scene.aspect);
 return <svg className="floor-plane" aria-hidden="true"><defs><pattern id={id} width={width*2} height={height*2} patternUnits="userSpaceOnUse"><CroppedImage src={src} crop={scene.floor} x={0} y={0} width={width} height={height}/><g transform={`translate(${width*2} 0) scale(-1 1)`}><CroppedImage src={src} crop={scene.floor} x={0} y={0} width={width} height={height}/></g><g transform={`translate(0 ${height*2}) scale(1 -1)`}><CroppedImage src={src} crop={scene.floor} x={0} y={0} width={width} height={height}/></g><g transform={`translate(${width*2} ${height*2}) scale(-1 -1)`}><CroppedImage src={src} crop={scene.floor} x={0} y={0} width={width} height={height}/></g></pattern></defs><rect width="100%" height="100%" fill={`url(#${id})`}/></svg>;
}
/** A manifest addition chooses crops or a painted plate without a screen change. */
export function SceneBackdrop({id=defaultScene,desktop}:{id?:string;desktop:boolean}){
 const [scenes,setScenes]=useState<Scene[]>([]);
 useEffect(()=>{let active=true;const controller=new AbortController();void fetch('/scenes/manifest.json',{signal:controller.signal}).then(response=>response.json()).then((value:Scene[])=>{validateScenes(value);if(active)setScenes(value);}).catch(error=>{if(error.name!=='AbortError'&&active)setScenes([]);});return()=>{active=false;controller.abort();};},[]);
 const scene=scenes.find(scene=>scene.id===id)??scenes[0];if(!scene)return <div className="scene-backdrop" aria-hidden="true"/>;
 const device=desktop?scene.devices.desktop:scene.devices.phone,style={filter:tokens[scene.lookFilter]} as CSSProperties;
 if(device.kind==='plate')return <div className="scene-backdrop scene-plate" aria-hidden="true" style={{...style,backgroundImage:`url(${device.image})`}}/>;
 return <div className="scene-backdrop" aria-hidden="true" style={style}><Floor scene={scene} src={device.image}/><div className="floor-shade"/><CroppedImage src={device.image} crop={scene.wall} className="wall-band"/><CroppedImage src={device.image} crop={scene.cornerL} className="scene-corner left"/><CroppedImage src={device.image} crop={scene.cornerR} className="scene-corner right"/><div className="scene-wash"/></div>;
}
