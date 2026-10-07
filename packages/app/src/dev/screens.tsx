import { useEffect, useRef, useState } from 'react';
import { WorldProvider } from 'koota/react';
import { copy, formatCopy, type CopyId } from '@critter-crumbs/shared';
import { Count, type GameSettings } from '../world/index.js';
import { createStageRuntime } from '../sim/stage-runtime.js';
import { GameFrame, GameScene, GameNotice, StatementPanel, Toast } from '../game/parts.js';
import { Dialog } from '../app/ui.js';
import type { GameScreenState } from '../app/feast-view.js';
import members from './game-members.js';
import { fixtureFeast, screenStates, emptyScatterStates, noticeIds, galleryQuery } from './game-fixtures.js';
import { absoluteTime } from '../app/time.js';
import { defaultScene, sceneIds } from '../game/art.js';
const settings:GameSettings={effects:false,ambience:false,still:true,simple:true,reducedMotion:true};
export function FixtureScreen({state,count,scene}:{state:GameScreenState;count:number;scene:string}){
 const [feast]=useState(()=>fixtureFeast(count)),[focus,setFocus]=useState(0),[reading,setReading]=useState(state==='reading'),host=useRef<HTMLDivElement>(null);
 const [runtime]=useState(()=>{const game=createStageRuntime({issued:100,viewer:members[2]!.address,settings,critters:feast.targets.map(t=>({id:t.id,address:t.id,ownerAddress:t.ownerAddress,name:t.name,variant:0}))});if(!emptyScatterStates.includes(state)){const others=game.critters.filter((_,i)=>i!==2);others.forEach((entity,i)=>game.actions.setCount(entity,i===0?100:0));}game.tick(0);return game;});
 useEffect(()=>{const stop=runtime.start();return()=>{stop();runtime.destroy();};},[runtime]);
 const complete=!emptyScatterStates.includes(state),saved=state==='scattered',notice:Partial<Record<GameScreenState,CopyId>>=noticeIds;
 return <WorldProvider world={runtime.world}><GameFrame feast={feast} viewer={{address:members[2]!.address,variant:0}}><GameScene runtime={runtime} feast={feast} focus={focus} turnTo={setFocus} state={state} sceneId={scene} reading={reading} onRead={()=>setReading(true)} onClose={()=>setReading(false)} announce={()=>{}} heapHost={host} panel={<StatementPanel feast={feast} focus={focus} close={()=>setReading(false)} turn={d=>setFocus((focus+d+count)%count)}/>} focusRow={<div className="scatter-controls"><button className="secondary crumb-control">{copy['scatter.remove.symbol']}</button><div className="number-field"><strong className="focus-name">{feast.targets[focus]!.name}</strong><output className="count-output">{runtime.critters[focus]!.get(Count)!.given}</output></div><button className="secondary crumb-control">{copy['scatter.add.symbol']}</button></div>} middle={saved?<><strong>{copy['scatter.done.title']}</strong><small>{formatCopy('game.closeDay',{day:absoluteTime(feast.scatteringEndsAt)})}</small></>:complete?<button>{copy['scatter.submit']}</button>:<><strong className="remaining-count">{100}</strong><small>{formatCopy('pile.remaining',{n:100})}</small></>}/>{notice[state]?<GameNotice title={copy[notice[state]!]}><p>{state==='reveal'?formatCopy('reveal.body',{crumbs:100}):state==='waiting'?copy['feast.waiting.body']:null}</p></GameNotice>:null}{saved?<Toast>{copy['err.saveVerified']}</Toast>:null}{state==='signing'||state==='saving'?<Dialog title={copy['scatter.sign.title']} onClose={()=>{}} busy={state==='saving'}><p>{copy['scatter.sign.body']}</p><button disabled={state==='saving'}>{copy[state==='saving'?'scatter.saving':'scatter.submit']}</button></Dialog>:null}</GameFrame></WorldProvider>;
}
export function ScreenGallery(){
 const query=new URLSearchParams(location.search),raw=query.get(galleryQuery.state),[state,setState]=useState<GameScreenState>(screenStates.includes(raw as GameScreenState)?raw as GameScreenState:screenStates[1]!),[count,setCount]=useState(Number(query.get(galleryQuery.count)??8)),[scene,setScene]=useState(query.get(galleryQuery.scene)??defaultScene),capture=query.has(galleryQuery.capture);
 return <>{!capture?<div className="gallery-toolbar"><h1>{copy['preview.game.title']}</h1><label>{copy['preview.game.state']}<select value={state} onChange={e=>setState(e.target.value as GameScreenState)}>{screenStates.map(s=><option key={s} value={s}>{copy[`preview.game.${s}`]}</option>)}</select></label><label>{copy['preview.game.size']}<select value={count} onChange={e=>setCount(Number(e.target.value))}>{[4,6,8,10].map(n=><option key={n}>{n}</option>)}</select></label><label>{copy['preview.game.scene']}<select value={scene} onChange={e=>setScene(e.target.value)}>{sceneIds.map(s=><option key={s} value={s}>{copy[`preview.game.${s}` as CopyId]}</option>)}</select></label></div>:null}<div className="gallery-frame"><FixtureScreen key={state+count+scene} state={state} count={count} scene={scene}/></div></>;
}
