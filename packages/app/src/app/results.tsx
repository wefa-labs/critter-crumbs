import { Renderer } from './renderer.js';
import { getAddress } from 'viem';
import { useEffect, useRef, useState, type ReactNode }
from 'react';
import {WorldProvider} from 'koota/react';
import {useTrait} from 'koota/react';
import type {Entity} from 'koota';
import type {StageRuntime} from '../sim/stage-runtime.js';
import { sceneIds } from '../game/art.js';
import {GameScene,GameNotice} from '../game/parts.js';
import {Received} from '../world/index.js';
import {CIRCLE_FEEL} from '@critter-crumbs/shared';
import { ApiClientError, type Account } from '@critter-crumbs/core';
import { copy, formatCopy, FEAST, GROWTH, type CopyId, type TallyResult } from '@critter-crumbs/shared';
import { useAudio } from '../audio/context.js';
import { Feast as FeastTrait, type GameSettings } from '../world/index.js';
import { createStageRuntime } from '../sim/stage-runtime.js';
import { aggregateCsv, giverCsv, downloadCsv } from './csv.js';
import { ResultRecord } from './result-record.js';
import type { RunAction } from './burrows.js';
import { percentShare } from './time.js';
import { browserReceiptBook } from './receipts.js';
import { createHops } from './heap.js';
import { PortraitImage, shortAddress, targetLabel } from './ui.js';
import { gameView, resultStates, isMemberFeast, portraitVariant, type MemberFeast, type PublicFeast } from './feast-view.js';
import type { OpenedFeast } from './feast-session.js';
import type { AppApi, Me } from './session.js';
const nameFor = (feast: PublicFeast,address: string) => { const target=feast.targets.find(target=>target.ownerAddress?.toLowerCase()===address.toLowerCase()); return target ? targetLabel(target) : shortAddress(getAddress(address)); };
export default function Results({ feast,api,me,settings,announce,report,account,run,busy,clearError }: { feast: MemberFeast; api: AppApi; me: Me; settings: GameSettings; announce: (text:string)=>void; report: (error:unknown)=>void; account:()=>Account|null; run:RunAction; busy:boolean; clearError:()=>void }) {
  const [opened,setOpened]=useState<OpenedFeast | null>(null),[error,setError]=useState<CopyId | null>(null),[retry,setRetry]=useState(0);
  useEffect(()=>{
    let active=true, timer:ReturnType<typeof setTimeout> | undefined; setError(null);
    const delayed=setTimeout(()=>{ if(active) { setError('err.keyUnreachable'); report(new ApiClientError('err.keyUnreachable',503)); } },20000);
    async function load() {
      try {
        const { openMockFeast }=await import('../crypto/index.js');
        const value=await openMockFeast(api,feast,browserReceiptBook().read(feast.id,me.address));
        if(!active)return;
        if(value) { clearTimeout(delayed); setOpened(value); setError(null); clearError(); return; }
        setError('feast.keyNotYet');
      } catch(failure) {
        if(!active)return;
        const id=failure instanceof ApiClientError ? failure.copyId : 'err.generic';
        if(id!=='err.keyUnreachable') { clearTimeout(delayed); setError(id); report(failure); }
      }
      if(active)timer=setTimeout(()=>{void load();},60000);
    }
    void load(); return ()=>{active=false;clearTimeout(delayed);clearTimeout(timer);};
  },[api,feast.id,me.address,retry]);
  if(!opened)return <WaitingScene feast={feast} settings={settings} announce={announce} error={error} retry={()=>setRetry(value=>value+1)}/>;
  return <FeastResults feast={feast} opened={opened} settings={settings} announce={announce}><ResultRecord feast={feast} result={opened.result} api={api} me={me} account={account} run={run} busy={busy}/></FeastResults>;
}
export function ResultsTable({ feast,result }: { feast:PublicFeast; result:Pick<TallyResult,'totals'|'totalScattered'> }) {
  const rows=[...result.totals].sort((a,b)=>b.crumbs-a.crumbs || feast.targets.findIndex(t=>t.id===a.targetId)-feast.targets.findIndex(t=>t.id===b.targetId));
  return <div className="table-scroll"><table><caption>{formatCopy('results.caption',{feastTitle:feast.title})}</caption><thead><tr><th scope="col">{copy['results.col.critter']}</th><th scope="col">{copy['results.col.crumbs']}</th><th scope="col">{copy['results.col.share']}</th></tr></thead><tbody>{result.totalScattered ? rows.map(row=>{ const target=feast.targets.find(target=>target.id===row.targetId)!; return <tr key={row.targetId}><th scope="row"><div className="result-name"><PortraitImage address={target.ownerAddress??target.id} variant={portraitVariant(feast,target)} name={targetLabel(target)}/>{targetLabel(target)}</div></th><td>{row.crumbs}</td><td>{percentShare(row.share)}</td></tr>; }):null}</tbody></table></div>;
}
export function WaitingScene({feast,settings,announce,error,retry}:{feast:MemberFeast;settings:GameSettings;announce:(text:string)=>void;error:CopyId|null;retry:()=>void}){
 const [focus,setFocus]=useState(0),[runtime]=useState(()=>createStageRuntime({issued:feast.crumbsPerCritter,asleep:true,settings,critters:feast.targets.map(target=>({id:target.id,address:target.ownerAddress??target.id,ownerAddress:target.ownerAddress,name:targetLabel(target),variant:portraitVariant(feast,target)}))}));
 useEffect(()=>{const stop=runtime.start();announce(copy['feast.waiting.title']);return()=>{stop();queueMicrotask(()=>runtime.destroy());};},[runtime]);useEffect(()=>runtime.setSettings(settings),[runtime,settings]);
 const view=gameView({phase:feast.phase,remaining:0,keyPending:error==='feast.keyNotYet'});
 return <WorldProvider world={runtime.world}><section className="game-flow"><GameScene runtime={runtime} feast={feast} focus={focus} turnTo={setFocus} state={view.state} editable={false} announce={announce} remaining={0} middle={<strong>{copy['phase.feast']}</strong>} focusRow={<strong className="focus-name">{targetLabel(feast.targets[focus]!)}</strong>} sceneId={sceneIds[1]!}/><GameNotice title={copy['feast.waiting.title']}><p>{copy['feast.waiting.body']}</p>{error?<p role="status">{copy[error]}</p>:null}<button className="secondary" onClick={retry}>{copy['action.retry']}</button></GameNotice></section></WorldProvider>;
}
export function ResultsCard({feast,opened,heading,actions,children,showGivers=false,toggleGivers}:{feast:PublicFeast;opened:OpenedFeast;heading?:React.RefObject<HTMLHeadingElement|null>;actions:ReactNode;children?:ReactNode;showGivers?:boolean;toggleGivers?:()=>void}){
 const {result}=opened,rows=[...result.totals].sort((a,b)=>b.crumbs-a.crumbs||feast.targets.findIndex(t=>t.id===a.targetId)-feast.targets.findIndex(t=>t.id===b.targetId));
 return <div className="results-card"><div className="game-results-heading"><h2 ref={heading} tabIndex={-1}>{copy[showGivers?'results.givers.title':'results.title']}</h2></div><div className="game-results-scroll"><p>{isMemberFeast(feast)?formatCopy('results.summary',{scatterers:result.counted.length,total:feast.participants.length,totalCrumbs:result.totalScattered}):formatCopy('results.public.summary',{scatterers:feast.aggregate?.scatterers??0,totalCrumbs:result.totalScattered})}</p>
 {showGivers&&isMemberFeast(feast)?<GiverTable feast={feast} opened={opened}/>:result.totalScattered?<ol className="game-results-list">{rows.map(row=>{const target=feast.targets.find(t=>t.id===row.targetId)!;return <li key={row.targetId}><PortraitImage address={target.ownerAddress??target.id} variant={portraitVariant(feast,target)} name={targetLabel(target)} fed={Math.min(1,row.share[0]/row.share[1]*feast.targets.length/GROWTH.fairShareCap)**GROWTH.exponent}/><strong>{targetLabel(target)}</strong><span className="result-amount">{row.crumbs}<small>{percentShare(row.share)}</small></span></li>;})}</ol>:<p>{copy['results.nobody']}</p>}
 {isMemberFeast(feast)&&result.counted.length===1?<p>{formatCopy('results.one',{name:nameFor(feast,result.counted[0]!.attester)})}</p>:null}{result.ties.filter(group=>result.totalScattered>0&&group.length>1).map(group=><p key={group[0]}>{formatCopy('results.tie',{names:group.map(id=>targetLabel(feast.targets.find(t=>t.id===id)!)).join(', ')})}</p>)}
 {isMemberFeast(feast)?<p>{result.didNotScatter.length?formatCopy('results.didNotScatter',{names:result.didNotScatter.map(address=>nameFor(feast,address)).join(', ')}):copy['results.everyone']}</p>:null}{result.rejected.length?<p className="notice">{formatCopy('results.unreadable',{names:result.rejected.map(entry=>nameFor(feast,entry.attester)).join(', ')})}</p>:null}{opened.missingUids.map(uid=><p className="notice receipt-evidence" key={uid}>{formatCopy('err.uidMissing',{uid})}</p>)}
 <p>{copy[feast.aggregatePublic?'results.public':'results.private']}</p>{isMemberFeast(feast)&&feast.individualOpen&&toggleGivers?<button className="secondary" onClick={toggleGivers}>{copy[showGivers?'results.title':'results.givers.title']}</button>:null}{isMemberFeast(feast)&&feast.individualOpen?<button className="secondary" onClick={()=>downloadCsv(document,feast.title,giverCsv(feast,opened),true)}>{copy['results.export.givers']}</button>:null}{children}{isMemberFeast(feast)?<details><summary>{copy['results.verification']}</summary><code className="receipt-evidence">{result.resultHash}</code></details>:null}</div><div className="results-actions">{actions}</div></div>;
}
export function ResultActions({replay,download}:{replay:()=>void;download:()=>void}){return <><button className="secondary" onClick={replay}>{copy['feast.replay']}</button><button className="secondary" aria-label={copy['results.export']} onClick={download}><span className="download-short">{copy['results.export.short']}</span><span className="download-long">{copy['results.export']}</span></button></>;}
function FeastFocus({entity,runtime,feast,focus}:{entity:Entity;runtime:StageRuntime;feast:PublicFeast;focus:number}){
 const received=useTrait(entity,Received)!,output=useRef<HTMLSpanElement>(null);useEffect(()=>{const draw=()=>{if(output.current)output.current.textContent=String(runtime.feastPresentation()?.counts[focus]??received.crumbs);};draw();return runtime.onFrame(draw);},[entity,focus,runtime]);
 return <div className="feast-focus"><strong className="focus-name">{targetLabel(feast.targets[focus]!)}</strong><span><span ref={output}>{received.crumbs}</span>{copy['game.share.separator']}{percentShare(received.share)}</span></div>;
}
export function FeastResults({feast,opened,settings,announce,children,initialPlaying=true}:{feast:PublicFeast;initialPlaying?:boolean;opened:OpenedFeast;settings:GameSettings;announce:(text:string)=>void;children:ReactNode}){
 const {result}=opened,audio=useAudio(),surface=useRef<HTMLElement>(null),source=useRef<HTMLDivElement>(null),heading=useRef<HTMLHeadingElement>(null);
 const [playing,setPlaying]=useState(initialPlaying),[beat,setBeat]=useState(''),[focus,setFocus]=useState(0),[showGivers,setShowGivers]=useState(false),[presentation,setPresentation]=useState({counts:result.totals.map(()=>0),remaining:0});
 const [hops]=useState(()=>createHops(document,()=>source.current,id=>surface.current?.querySelector<HTMLElement>(`[data-critter-id="${id}"]`)??null,()=>runtime.world));
 const [runtime]=useState(()=>createStageRuntime({issued:isMemberFeast(feast)?feast.crumbsPerCritter:feast.aggregate?.crumbsIssued??100,asleep:true,settings,critters:feast.targets.map(target=>({id:target.id,address:target.ownerAddress??target.id,ownerAddress:target.ownerAddress,name:targetLabel(target),variant:portraitVariant(feast,target)})),outputs:{sound:audio.cue,hop:cue=>hops.add(cue)}}));
 useEffect(()=>{runtime.actions.beginFeast(result);if(!initialPlaying)runtime.actions.skipFeast();const stop=runtime.start();runtime.animateFor(FEAST.maxMs);let settled=false,previous='',previousFocus=-1,lastPresentation=-1;
  const frame=runtime.onFrame(now=>{hops.tick();const state=runtime.world.query(FeastTrait)[0]?.get(FeastTrait),view=runtime.feastPresentation();if(!state||!view)return;if(state.beat!==previous){previous=state.beat;setBeat(state.beat);}if(state.index>=0&&state.index!==previousFocus){previousFocus=state.index;setFocus(state.index);}const step=Math.floor(now/CIRCLE_FEEL.presentationMs);if(step!==lastPresentation){lastPresentation=step;setPresentation({counts:view.counts,remaining:Math.max(0,Math.round(view.heapFraction*result.totalScattered))});}if(!view.settled)settled=false;if(view.settled&&!settled){settled=true;setPlaying(false);const maximum=Math.max(0,...result.totals.map(row=>row.crumbs));const names=result.totals.filter(row=>row.crumbs===maximum).map(row=>targetLabel(feast.targets.find(t=>t.id===row.targetId)!));announce(maximum?formatCopy('feast.announce',{topName:names.join(', ')}):copy['results.nobody']);}});
  return()=>{audio.stop();frame();stop();hops.clear();queueMicrotask(()=>runtime.destroy());};
 },[runtime]);
 useEffect(()=>{runtime.setSettings(settings);if(settings.still||settings.reducedMotion)hops.clear();},[runtime,settings]);useEffect(()=>{if(!playing)heading.current?.focus();},[playing]);
 const resultState=!result.totalScattered?resultStates.nobody:showGivers?resultStates.givers:undefined;
 const view=gameView({phase:feast.phase,remaining:0,opened:true,playing,...(resultState?{resultState}:{})});
 const replay=()=>{audio.stop();hops.clear();setPlaying(true);setFocus(0);setShowGivers(false);runtime.actions.replayFeast();runtime.animateFor(FEAST.maxMs);};
 const actions=<ResultActions replay={replay} download={()=>downloadCsv(document,feast.title,aggregateCsv(feast.targets,result))}/>;
 return <WorldProvider world={runtime.world}><section className="game-flow feast-results" ref={surface} data-result-hash={isMemberFeast(feast)?result.resultHash:undefined} data-record-uid={!isMemberFeast(feast)?feast.resultAttestation?.uid:undefined} data-feast-beat={beat}><Renderer runtime={runtime} settings={settings} surface={surface} announce={announce}/><GameScene runtime={runtime} feast={feast} focus={focus} turnTo={setFocus} state={view.state} editable={false} announce={announce} heapHost={source} counts={presentation.counts} remaining={presentation.remaining} issued={Math.max(1,result.totalScattered)} focusRow={<FeastFocus key={focus} entity={runtime.critters[focus]!} runtime={runtime} feast={feast} focus={focus}/>} middle={playing?<button className="secondary" onClick={()=>{hops.clear();runtime.actions.skipFeast();runtime.animateFor(FEAST.skipMs);}}>{copy['feast.skip']}</button>:<strong>{copy['results.title']}</strong>} results={!playing?<ResultsCard feast={feast} opened={opened} heading={heading} actions={actions} showGivers={showGivers} toggleGivers={()=>setShowGivers(value=>!value)}>{children}</ResultsCard>:undefined} panel={playing?<div className="sequence-panel"><p>{copy['feast.sequence']}</p></div>:undefined}/>{playing?<div className="phone-sequence"><p>{copy['feast.sequence']}</p></div>:null}</section></WorldProvider>;
}

function GiverTable({feast,opened}:{feast:MemberFeast;opened:OpenedFeast}) { return <section><div className="table-scroll giver-table"><table><caption>{copy['results.givers.caption']}</caption><thead><tr><th scope="col">{copy['results.col.critter']}</th>{feast.targets.map(target=><th scope="col" key={target.id}>{targetLabel(target)}</th>)}</tr></thead><tbody>{opened.givers.map(giver=><tr key={giver.uid}><th scope="row">{nameFor(feast,giver.attester)}</th>{giver.amounts.map((amount,index)=><td key={feast.targets[index]!.id}>{amount}</td>)}</tr>)}</tbody></table></div></section>; }
