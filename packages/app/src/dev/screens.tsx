import { AudioProvider } from '../audio/context.js';
import { createAudio } from '../audio/index.js';
import { useScenes } from '../game/scenes.js';
import { useEffect, useRef, useState } from 'react';
import { WorldProvider, useTrait } from 'koota/react';
import { copy, formatCopy, FEAST, type CopyId } from '@critter-crumbs/shared';
import { Clock, Count, Feast, Pile, type GameSettings } from '../world/index.js';
import { createStageRuntime, type StageRuntime } from '../sim/stage-runtime.js';
import { GameFrame, GameScene, GameNotice, StatementPanel, Toast } from '../game/parts.js';
import PublicResults from '../app/public-results.js';
import { Dialog } from '../app/ui.js';
import { ScatterControls } from '../app/scatter.js';
import { ResultsCard, ResultActions, FeastResults } from '../app/results.js';
import { RecordReceipt } from '../app/result-record.js';
import { aggregateCsv, downloadCsv } from '../app/csv.js';
import { isResultState, type GameScreenState } from '../app/feast-view.js';
import members from './game-members.js';
import { fixtureFeast, fixturePublic, fixturePaused, galleryModes, fixtureReadable, fixtureOpened, fixtureRecord, screenStates, emptyScatterStates, noticeIds, galleryQuery } from './game-fixtures.js';
import { absoluteTime, percentShare } from '../app/time.js';
import { defaultScene, sceneIds } from '../game/art.js';
const settings:GameSettings={effects:false,ambience:false,still:true,simple:true,reducedMotion:true};
export function FixtureScreen({state,count,scene}:{state:GameScreenState;count:number;scene:string}){
 const [feast]=useState(()=>({...fixtureFeast(count,state),individualOpen:state==='givers',aggregatePublic:state==='recording'||state==='recorded'})),[opened]=useState(()=>fixtureOpened(feast,state));
 const [runtime]=useState(()=>{
  const game=createStageRuntime({issued:100,viewer:members[2]!.address,asleep:state==='waiting'||state==='key',settings:state==='feast'?{...settings,still:false,reducedMotion:false}:settings,critters:feast.targets.map(t=>({id:t.id,address:t.ownerAddress!,ownerAddress:t.ownerAddress,name:t.name,variant:0}))});
  if(isResultState(state)||state==='feast'){game.actions.beginFeast(opened.result);game.tick(0);if(state==='feast'){game.world.query(Feast)[0]!.set(Feast,{startedAt:-(FEAST.waveStartMs+FEAST.waveStaggerMs*2+300)});game.tick(0);game.ticker.setMode(fixturePaused);}else {game.world.query(Feast)[0]!.set(Feast,{beat:fixtureReadable});game.tick(0);}}
  else {if(!emptyScatterStates.includes(state))game.actions.setCount(game.critters[0]!,100);game.tick(0);}
  return game;
 });
 return <WorldProvider world={runtime.world}><FixtureBody state={state} count={count} scene={scene} feast={feast} opened={opened} runtime={runtime}/></WorldProvider>;
}
function FixtureBody({state,count,scene,feast,opened,runtime}:{state:GameScreenState;count:number;scene:string;feast:ReturnType<typeof fixtureFeast>;opened:ReturnType<typeof fixtureOpened>;runtime:StageRuntime}){
 const [replaying,setReplaying]=useState(false),[mode,setMode]=useState(state),[focus,setFocus]=useState(0),[reading,setReading]=useState(state==='reading'),[givers,setGivers]=useState(state==='givers'),host=useRef<HTMLDivElement>(null);
 const frozen=mode==='feast',gathered=isResultState(mode);
 const pile=useTrait(runtime.heap,Pile)!,amount=useTrait(runtime.critters[focus]!,Count)!.given;
 useEffect(()=>{if(frozen){runtime.tick(runtime.world.get(Clock)!.now);return()=>queueMicrotask(()=>runtime.destroy());}const stop=runtime.start();return()=>{stop();queueMicrotask(()=>runtime.destroy());};},[runtime]);
 const saved=mode==='scattered',notice:Partial<Record<GameScreenState,CopyId>>=noticeIds,view=runtime.feastPresentation(),target=feast.targets[focus]!;
 const results=gathered?<ResultsCard feast={feast} opened={opened} showGivers={givers} toggleGivers={()=>setGivers(value=>!value)} actions={<ResultActions replay={()=>{runtime.ticker.setMode(fixturePaused);setReplaying(true);}} download={()=>downloadCsv(document,feast.title,aggregateCsv(feast.targets,opened.result))}/>}>
 {mode==='recording'?<section><p>{copy['results.local.help']}</p><button disabled>{copy['results.recording']}</button></section>:mode==='recorded'?<RecordReceipt record={fixtureRecord(feast,opened)}/>:null}</ResultsCard>:undefined;
 const middle=saved?<><strong>{copy['scatter.done.title']}</strong><small>{formatCopy('game.closeDay',{day:absoluteTime(feast.scatteringEndsAt)})}</small></>:mode==='saving'?<strong role="status">{copy['scatter.saving']}</strong>:mode==='closed'?<strong>{copy['scatter.closed']}</strong>:mode==='waiting'||mode==='key'?<strong>{copy['phase.feast']}</strong>:frozen?<button className="secondary" onClick={()=>setMode(galleryModes.results)}>{copy['feast.skip']}</button>:gathered?<strong>{copy['results.title']}</strong>:pile.remaining?<><strong className="remaining-count">{pile.remaining}</strong><small>{formatCopy('pile.remaining',{n:pile.remaining})}</small></>:<button onClick={()=>setMode(galleryModes.signing)}>{copy['scatter.submit']}</button>;
 if(mode==='public')return <GameFrame feast={feast} onConnect={()=>{}}><PublicResults feast={fixturePublic(feast,opened)} settings={settings} announce={()=>{}}/></GameFrame>;
 if(replaying)return <GameFrame feast={feast} viewer={{address:members[2]!.address,variant:0}}><FeastResults feast={feast} opened={opened} settings={{...settings,still:false,reducedMotion:false}} announce={()=>{}}>{null}</FeastResults></GameFrame>;
 return <GameFrame feast={feast} viewer={{address:members[2]!.address,variant:0}}><section className="game-flow"><GameScene runtime={runtime} feast={feast} focus={focus} turnTo={setFocus} state={mode} sceneId={mode==='waiting'||mode==='key'?sceneIds[1]!:scene} reading={reading} editable={mode==='scatter'||mode==='done'||mode==='scattered'} {...(!gathered&&!frozen?{onRead:()=>setReading(true)}:{})} onClose={()=>setReading(false)} announce={()=>{}} heapHost={host} panel={reading?<StatementPanel feast={feast} focus={focus} close={()=>setReading(false)} turn={d=>setFocus((focus+d+count)%count)}/>:frozen?<div className="sequence-panel"><p>{copy['feast.sequence']}</p></div>:undefined} focusRow={frozen?<div className="feast-focus"><strong className="focus-name">{target.name}</strong><span>{view?.counts[focus]??amount}{copy['game.share.separator']}{percentShare(opened.result.totals[focus]!.share)}</span></div>:<ScatterControls key={target.id} entity={runtime.critters[focus]!} runtime={runtime} target={target} announce={()=>{}} editable={mode==='scatter'||mode==='done'||mode==='scattered'}/>} middle={middle} results={results} {...(view?{counts:view.counts,remaining:Math.round(view.heapFraction*opened.result.totalScattered),issued:Math.max(1,opened.result.totalScattered)}:{})}/>
 {notice[mode]&&!reading&&!frozen?<GameNotice title={copy[notice[mode]!]}><p>{mode==='reveal'?formatCopy('reveal.body',{crumbs:100}):mode==='waiting'||mode==='key'?copy['feast.waiting.body']:null}</p>{mode==='reveal'?<button onClick={()=>setReading(true)}>{copy['reveal.cta']}</button>:<button className="secondary" onClick={()=>setMode(galleryModes.scatter)}>{copy['action.close']}</button>}</GameNotice>:null}
 {frozen?<div className="phone-sequence"><p>{copy['feast.sequence']}</p></div>:null}{saved?<Toast>{copy['err.saveVerified']}</Toast>:null}{mode==='signing'?<Dialog title={copy['scatter.sign.title']} onClose={()=>setMode(galleryModes.done)}><p>{copy['scatter.sign.body']}</p><button onClick={()=>setMode(galleryModes.scattered)}>{copy['scatter.submit']}</button></Dialog>:null}</section></GameFrame>;
}
export function ScreenGallery(){
 const [audio]=useState(()=>createAudio(settings));useEffect(()=>()=>audio.destroy(),[audio]);return <AudioProvider value={audio}><GalleryBody/></AudioProvider>;
}
function GalleryBody(){
 const scenes=useScenes();
 const query=new URLSearchParams(location.search),raw=query.get(galleryQuery.state),[state,setState]=useState<GameScreenState>(screenStates.includes(raw as GameScreenState)?raw as GameScreenState:galleryModes.scatter),[count,setCount]=useState(Number(query.get(galleryQuery.count)??8)),[scene,setScene]=useState(query.get(galleryQuery.scene)??defaultScene),capture=query.has(galleryQuery.capture);
 return <>{!capture?<div className="gallery-toolbar"><h1>{copy['preview.game.title']}</h1><label>{copy['preview.game.state']}<select value={state} onChange={e=>setState(e.target.value as GameScreenState)}>{screenStates.map(s=><option key={s} value={s}>{copy[`preview.game.${s}`]}</option>)}</select></label><label>{copy['preview.game.size']}<select value={count} onChange={e=>setCount(Number(e.target.value))}>{[4,6,8,10].map(n=><option key={n}>{n}</option>)}</select></label><label>{copy['preview.game.scene']}<select value={scene} onChange={e=>setScene(e.target.value)}>{scenes.map(s=><option key={s.id} value={s.id}>{copy[`preview.game.${s.id}` as CopyId]??s.id}</option>)}</select></label></div>:null}<div className="gallery-frame">{!capture?<div className="gallery-previews"><iframe className="gallery-phone" title={copy['preview.game.phone']} src={`/dev/screens?capture&state=${state}&count=${count}&scene=${scene}`}/><div className="gallery-desktop"><iframe title={copy['preview.game.desktop']} src={`/dev/screens?capture&state=${state}&count=${count}&scene=${scene}`}/></div></div>:<FixtureScreen key={state+count+scene} state={state} count={count} scene={scene}/>}</div></>;
}
