import {createApiClient,ApiClientError} from '@critter-crumbs/core';
import {createSession} from '../app/session.js';
import {createDevAccountProvider} from './account-provider.js';
import {createScatterSession} from '../app/scatter-session.js';
import {signScatter} from '../crypto/scatter.js';
import type {MemberFeast} from '../app/feast-view.js';
/** Browser-only rehearsal helper. Ordinary auth, encrypted publication and receipt verification. */
export async function scatterRehearsal(index:number,feastId:string){
 if(!import.meta.env.DEV)throw new ApiClientError('err.rehearsalOnly',503);
 const api=createApiClient(),provider=createDevAccountProvider(api),option=(await provider.discover()).find(option=>option.id===`local:${index}`);
 if(!option)throw new ApiClientError('err.rehearsalOnly',503);
 const session=createSession(api);await session.connect(provider,option);const account=session.snapshot().account!;
 const feast=await api.get(`/api/feasts/${feastId}`) as unknown as MemberFeast;
 const eligible=feast.targets.map((target,i)=>({target,i})).filter(({target})=>target.ownerAddress?.toLowerCase()!==account.address.toLowerCase());
 const amounts=feast.targets.map(()=>0);let left=feast.crumbsPerCritter;
 eligible.forEach(({i},position)=>{amounts[i]=position===eligible.length-1?left:Math.floor(feast.crumbsPerCritter/eligible.length);left-=amounts[i]!;});
 const scatter=createScatterSession({api,feast,viewer:account.address,sign:(amounts,now,latest)=>signScatter(account,latest,amounts,now)});scatter.edit(amounts);await scatter.submit();return scatter.snapshot().receipt;
}
