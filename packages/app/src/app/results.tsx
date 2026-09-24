import { Renderer } from './renderer.js';
import { getAddress } from 'viem';
import { useEffect, useRef, useState } from 'react';
import { ApiClientError, type Account } from '@critter-crumbs/core';
import { copy, formatCopy, FEAST, type CopyId, type TallyResult } from '@critter-crumbs/shared';
import { useAudio } from '../audio/context.js';
import { Clock, Feast as FeastTrait, type GameSettings } from '../world/index.js';
import { createStageRuntime } from '../sim/stage-runtime.js';
import { aggregateCsv, giverCsv, downloadCsv } from './csv.js';
import { ResultRecord } from './result-record.js';
import type { RunAction } from './burrows.js';
import { percentShare } from './time.js';
import { browserReceiptBook } from './receipts.js';
import { createHeap, createHops } from './heap.js';
import { GameStage } from './game-stage.js';
import { PortraitImage, shortAddress, targetLabel } from './ui.js';
import { portraitVariant, type MemberFeast, type PublicFeast } from './feast-view.js';
import type { OpenedFeast } from './feast-session.js';
import type { AppApi, Me } from './session.js';
const nameFor = (feast: MemberFeast,address: string) => { const target=feast.targets.find(target=>target.ownerAddress?.toLowerCase()===address.toLowerCase()); return target ? targetLabel(target) : shortAddress(getAddress(address)); };
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
  if(!opened)return <section><h1>{copy['feast.waiting.title']}</h1><p>{copy['feast.waiting.body']}</p>{error ? <p className="notice">{copy[error]}</p>:null}<button onClick={()=>setRetry(value=>value+1)}>{copy['action.retry']}</button><ul role="list" className="critter-grid">{feast.targets.map(target=><li className="critter-cell" key={target.id}><PortraitImage address={target.ownerAddress??target.id} variant={portraitVariant(feast,target)} name={targetLabel(target)} asleep size="stage"/><h2>{targetLabel(target)}</h2></li>)}</ul></section>;
  return <FeastResults feast={feast} opened={opened} settings={settings} announce={announce}><ResultRecord feast={feast} result={opened.result} api={api} me={me} account={account} run={run} busy={busy}/></FeastResults>;
}
export function ResultsTable({ feast,result }: { feast:PublicFeast; result:Pick<TallyResult,'totals'|'totalScattered'> }) {
  const rows=[...result.totals].sort((a,b)=>b.crumbs-a.crumbs || feast.targets.findIndex(t=>t.id===a.targetId)-feast.targets.findIndex(t=>t.id===b.targetId));
  return <div className="table-scroll"><table><caption>{formatCopy('results.caption',{feastTitle:feast.title})}</caption><thead><tr><th scope="col">{copy['results.col.critter']}</th><th scope="col">{copy['results.col.crumbs']}</th><th scope="col">{copy['results.col.share']}</th></tr></thead><tbody>{result.totalScattered ? rows.map(row=>{ const target=feast.targets.find(target=>target.id===row.targetId)!; return <tr key={row.targetId}><th scope="row"><div className="result-name"><PortraitImage address={target.ownerAddress??target.id} variant={portraitVariant(feast,target)} name={targetLabel(target)}/>{targetLabel(target)}</div></th><td>{row.crumbs}</td><td>{percentShare(row.share)}</td></tr>; }):null}</tbody></table></div>;
}
function FeastResults({ feast,opened,settings,announce,children }: { feast:MemberFeast; opened:OpenedFeast; settings:GameSettings; announce:(text:string)=>void;children:React.ReactNode }) {
  const {result}=opened,audio=useAudio(),surface=useRef<HTMLElement>(null),source=useRef<HTMLDivElement>(null),heading=useRef<HTMLHeadingElement>(null),heapCount=useRef<HTMLParagraphElement>(null);
  const [playing,setPlaying]=useState(true),[beat,setBeat]=useState('');
  const [hops]=useState(()=>createHops(document,()=>source.current,id=>surface.current?.querySelector<HTMLElement>(`[data-critter-id="${id}"]`)??null));
  const [runtime]=useState(()=>createStageRuntime({issued:feast.crumbsPerCritter,asleep:true,settings,critters:feast.targets.map(target=>({ id:target.id,address:target.ownerAddress??target.id,ownerAddress:target.ownerAddress,name:targetLabel(target),variant:portraitVariant(feast,target) })),outputs:{sound:audio.cue,hop:cue=>hops.add(cue,runtime.world.get(Clock)!.now)}}));
  useEffect(()=>{
    const heap=createHeap(source.current!);heap.update(0,1);
    runtime.actions.beginFeast(result); const stop=runtime.start(); runtime.animateFor(FEAST.maxMs);
    let settled=false,previous='';
    const frame=runtime.onFrame(now=>{
      hops.tick(now); const presentation=runtime.feastPresentation(); if(presentation) { heap.update(presentation.heapFraction,1);if(heapCount.current&&heapCount.current.textContent!==String(presentation.heapTotal))heapCount.current.textContent=String(presentation.heapTotal);surface.current?.querySelectorAll<HTMLElement>('[data-result-count]').forEach((element,index)=>{const text=formatCopy('results.received',{n:presentation.counts[index]!});if(element.textContent!==text)element.textContent=text;}); } const state=runtime.world.query(FeastTrait)[0]?.get(FeastTrait); if(!state)return;
      if(state.beat!==previous){ previous=state.beat;setBeat(state.beat); }
      if(!presentation?.settled)settled=false;
      if(presentation?.settled&&!settled){ settled=true;setPlaying(false);heading.current?.focus();const maximum=Math.max(0,...result.totals.map(row=>row.crumbs));const names=result.totals.filter(row=>row.crumbs===maximum).map(row=>targetLabel(feast.targets.find(target=>target.id===row.targetId)!));announce(maximum?formatCopy('feast.announce',{topName:names.join(', ')}):copy['results.nobody']); }
    });
    return ()=>{audio.stop();frame();stop();hops.clear();heap.destroy();runtime.destroy();};
  },[runtime]);
  useEffect(()=>{runtime.setSettings(settings);if(settings.still||settings.reducedMotion)hops.clear();},[runtime,settings]);
  return <section ref={surface} className="feast-results" data-result-hash={result.resultHash} data-feast-beat={beat}><Renderer runtime={runtime} settings={settings} surface={surface} announce={announce}/>
    <div className="actions"><h1 ref={heading} tabIndex={-1}>{copy['results.title']}</h1>{playing?<button onClick={()=>{hops.clear();runtime.actions.skipFeast();runtime.animateFor(FEAST.skipMs);}}>{copy['feast.skip']}</button>:<button onClick={()=>{audio.stop();hops.clear();setPlaying(true);runtime.actions.replayFeast();runtime.animateFor(FEAST.maxMs);}}>{copy['feast.replay']}</button>}</div>
    <div className="feast-heap" ref={source} aria-hidden="true"/><p ref={heapCount} className="feast-total">{result.totalScattered}</p>
    <ul role="list" className="critter-grid">{feast.targets.map((target,index)=><li className="critter-cell" key={target.id}><GameStage entity={runtime.critters[index]!}/><h2>{targetLabel(target)}</h2><p data-result-count={target.id}>{formatCopy('results.received',{n:result.totals[index]!.crumbs})}</p></li>)}</ul>
    <ResultsTable feast={feast} result={result}/>
    <p>{formatCopy('results.summary',{scatterers:result.counted.length,total:feast.participants.length,totalCrumbs:result.totalScattered})}</p>
    {!result.totalScattered?<p>{copy['results.nobody']}</p>:result.counted.length===1?<p>{formatCopy('results.one',{name:nameFor(feast,result.counted[0]!.attester)})}</p>:null}
    <p>{result.didNotScatter.length?formatCopy('results.didNotScatter',{names:result.didNotScatter.map(address=>nameFor(feast,address)).join(', ')}):copy['results.everyone']}</p>
    {result.ties.map(group=><p key={group[0]}>{formatCopy('results.tie',{names:group.map(id=>targetLabel(feast.targets.find(target=>target.id===id)!)).join(', ')})}</p>)}
    {result.rejected.length?<p className="notice">{formatCopy('results.unreadable',{names:result.rejected.map(entry=>nameFor(feast,entry.attester)).join(', ')})}</p>:null}
    {opened.missingUids.map(uid=><p className="notice receipt-evidence" key={uid}>{formatCopy('err.uidMissing',{uid})}</p>)}
    <p>{copy[feast.aggregatePublic?'results.public':'results.private']}</p>
    <div className="actions"><button onClick={()=>downloadCsv(document,feast.title,aggregateCsv(feast.targets,result))}>{copy['results.export']}</button>{feast.individualOpen?<button onClick={()=>downloadCsv(document,feast.title,giverCsv(feast,opened),true)}>{copy['results.export.givers']}</button>:null}</div>
    {feast.individualOpen?<GiverTable feast={feast} opened={opened}/>:null}
    {children}
    <details><summary>{copy['results.verification']}</summary><code className="receipt-evidence">{result.resultHash}</code></details>
  </section>;
}

function GiverTable({feast,opened}:{feast:MemberFeast;opened:OpenedFeast}) { return <section><h2>{copy['results.givers.title']}</h2><div className="table-scroll giver-table"><table><caption>{copy['results.givers.caption']}</caption><thead><tr><th scope="col">{copy['results.col.critter']}</th>{feast.targets.map(target=><th scope="col" key={target.id}>{targetLabel(target)}</th>)}</tr></thead><tbody>{opened.givers.map(giver=><tr key={giver.uid}><th scope="row">{nameFor(feast,giver.attester)}</th>{giver.amounts.map((amount,index)=><td key={feast.targets[index]!.id}>{amount}</td>)}</tr>)}</tbody></table></div></section>; }
