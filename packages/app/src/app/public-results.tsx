import {copy,type TallyResult} from '@critter-crumbs/shared';
import type {GameSettings} from '../world/index.js';
import {FeastResults} from './results.js';
import {RecordReceipt} from './result-record.js';
import type {PublicFeast} from './feast-view.js';
/** Public readers display the verified aggregate; no private ciphertexts, keys or giver identities. */
export default function PublicResults({feast,settings,announce}:{feast:PublicFeast;settings:GameSettings;announce:(text:string)=>void}) {
 if(!feast.aggregate||!feast.resultAttestation)return <section><h2>{copy['results.title']}</h2><p>{copy['results.public.pending']}</p></section>;
 const aggregate=feast.aggregate,totalScattered=aggregate.crumbs.reduce((sum,value)=>sum+value,0);
 const totals:TallyResult['totals']=feast.targets.map(target=>{const index=aggregate.targetIds.indexOf(target.id),crumbs=aggregate.crumbs[index]!;return {targetId:target.id,crumbs,share:totalScattered?[crumbs,totalScattered]:[0,1]};});
 const result:TallyResult={totals,totalScattered,counted:[],rejected:[],didNotScatter:[],ties:[],resultHash:feast.resultAttestation.uid};
 const opened={result,closeRecord:{published:[],counted:[],publishedSetHash:aggregate.publishedSetHash,closedAt:feast.scatteringEndsAt},missingUids:[],givers:[]};
 return <FeastResults feast={feast} opened={opened} settings={settings} announce={announce} initialPlaying={false}><RecordReceipt record={feast.resultAttestation}/></FeastResults>;
}
