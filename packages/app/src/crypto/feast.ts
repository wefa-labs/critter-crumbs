import { ApiClientError, ballotSchema, createMockTimelock, phaseAt, schemaUID } from '@critter-crumbs/core';
import { hexToBytes } from 'viem';
import { openFeastResult } from '../app/feast-session.js';
import type { MemberFeast } from '../app/feast-view.js';
import type { AppApi } from '../app/session.js';
/** Local rehearsal only: the mock eon key is public fixture material, never a live provider. */
export async function openMockFeast(api: AppApi,feast: MemberFeast,acceptedUids: string[]) {
  if(!import.meta.env.DEV) throw new ApiClientError('err.rehearsalOnly',503);
  api.invalidate(); const capability=await api.get('/api/dev/config');
  if(capability.enabled!==true || capability.mode!=='mock' || capability.production!==false) throw new ApiClientError('err.rehearsalOnly',503);
  const mock=createMockTimelock({ clock:()=>api.now() ?? 0 });
  return openFeastResult({ api,feast,acceptedUids,eas:{ chainId:84532,address:'0x4200000000000000000000000000000000000021',ballotSchemaUid:schemaUID(ballotSchema) },
    timelock:{ ...mock,getKey:async identity=>{ const now=api.now(); return now!==null && phaseAt(feast,now)==='feast' && feast.registration?.identity===identity ? hexToBytes(feast.registration.eonKey) : null; } },
    yieldToBrowser:()=>new Promise(resolve=>setTimeout(resolve,0)) });
}
