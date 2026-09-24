import {copy,formatCopy,GROWTH,type TallyResult} from '@critter-crumbs/shared';
import {aggregateCsv,downloadCsv} from './csv.js';
import {PortraitImage,targetLabel} from './ui.js';
import {ResultsTable} from './results.js';
import {RecordReceipt} from './result-record.js';
import {portraitVariant,type PublicFeast} from './feast-view.js';
/** Public readers display the verified record; they never fetch private ciphertexts or keys. */
export default function PublicResults({feast}:{feast:PublicFeast}) {
  if(!feast.aggregate || !feast.resultAttestation)return <section><h1>{copy['results.title']}</h1><p>{copy['results.public.pending']}</p></section>;
  const record=feast.aggregate,totalScattered=record.crumbs.reduce((sum,value)=>sum+value,0);
  const totals:TallyResult['totals']=feast.targets.map(target=>{const index=record.targetIds.indexOf(target.id),crumbs=record.crumbs[index]!;return{targetId:target.id,crumbs,share:totalScattered?[crumbs,totalScattered]:[0,1]};});
  return <section><h1>{copy['results.title']}</h1><ul className="critter-grid" role="list">{feast.targets.map((target,index)=>{const row=totals[index]!,fed=Math.min(1,row.share[0]/row.share[1]*feast.targets.length/GROWTH.fairShareCap)**GROWTH.exponent;return <li className="critter-cell" key={target.id}><PortraitImage address={target.ownerAddress??target.id} variant={portraitVariant(feast,target)} name={targetLabel(target)} size="stage" fed={fed}/><h2>{targetLabel(target)}</h2><p>{formatCopy('results.received',{n:row.crumbs})}</p></li>;})}</ul><ResultsTable feast={feast} result={{totals,totalScattered}}/>{!totalScattered?<p>{copy['results.nobody']}</p>:null}<button onClick={()=>downloadCsv(document,feast.title,aggregateCsv(feast.targets,{totals}))}>{copy['results.export']}</button><RecordReceipt record={feast.resultAttestation}/></section>;
}
