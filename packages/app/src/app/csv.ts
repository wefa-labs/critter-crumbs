import {getAddress} from 'viem';
import { copy, type Target, type TallyResult } from '@critter-crumbs/shared';
import type { MemberFeast } from './feast-view.js';
import type { OpenedFeast } from './feast-session.js';
const field=(value:string|number)=>/[",\r\n]/.test(String(value))?`"${String(value).replaceAll('"','""')}"`:String(value);
const row=(values:(string|number)[])=>values.map(field).join(',')+'\r\n';
/** Round the core rational directly, without a floating-point intermediate. */
export function shareDecimal([numerator,denominator]:[number,number]) { const scaled=(BigInt(numerator)*1000000n*2n+BigInt(denominator))/(BigInt(denominator)*2n);return `${scaled/1000000n}.${String(scaled%1000000n).padStart(6,'0')}`; }
export function aggregateCsv(targets:Target[],result:Pick<TallyResult,'totals'>) {
  return row([copy['results.csv.critter'],copy['results.csv.address'],copy['results.csv.crumbs'],copy['results.csv.share']])+[...targets].sort((a,b)=>a.position-b.position).map(target=>{const total=result.totals.find(total=>total.targetId===target.id);if(!total)throw new TypeError('Missing result target');return row([target.name,target.ownerAddress??'',total.crumbs,shareDecimal(total.share)]);}).join('');
}
export function giverCsv(feast:MemberFeast,opened:Pick<OpenedFeast,'givers'>) {
  if(!feast.individualOpen)throw new TypeError('Individual scatters are closed');
  return row([copy['results.csv.giver'],copy['results.csv.address'],...feast.targets.map(target=>target.name)])+opened.givers.map(giver=>row([feast.targets.find(target=>target.ownerAddress?.toLowerCase()===giver.attester.toLowerCase())?.name??getAddress(giver.attester),getAddress(giver.attester),...giver.amounts])).join('');
}
export function downloadCsv(document:Document,title:string,csv:string,givers=false) {
  const slug=title.normalize('NFKD').replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'').toLowerCase()||'feast';
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download=`feast-${slug}-${givers?'givers':'results'}.csv`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
