import {useEffect,useState} from 'react';
import {ApiClientError,type Account} from '@critter-crumbs/core';
import {copy,formatCopy,type ResultAttestation,type TallyResult} from '@critter-crumbs/shared';
import {recordLocalResult} from './result-recorder.js';
import type {MemberFeast} from './feast-view.js';
import type {AppApi,Me} from './session.js';
import type {RunAction} from './burrows.js';
import {isRehearsalAccount} from './rehearsal-accounts.js';
import {shortAddress} from './ui.js';
export function RecordReceipt({record}:{record:ResultAttestation}) {
  return <section role="status"><p>{formatCopy('results.local.done',{name:shortAddress(record.attester)})}</p><details><summary>{copy['results.local.view']}</summary><p>{copy['results.local.help']}</p><dl><dt>{copy['results.local.transaction']}</dt><dd className="receipt-evidence">{record.txHash}</dd><dt>{copy['results.local.uid']}</dt><dd className="receipt-evidence">{record.uid}</dd></dl></details></section>;
}
export function ResultRecord({feast,result,api,me,account,run,busy}:{feast:MemberFeast;result:TallyResult;api:AppApi;me:Me;account:()=>Account|null;run:RunAction;busy:boolean}) {
  const [record,setRecord]=useState(feast.resultAttestation);
  useEffect(()=>{if(feast.resultAttestation)setRecord(feast.resultAttestation);},[feast.resultAttestation]);
  if(!feast.aggregatePublic)return null;
  if(record)return <RecordReceipt record={record}/>;
  const control=<><p>{copy['results.local.help']}</p><button disabled={busy} onClick={()=>void run(async()=>{const connected=account();if(!connected || connected.address.toLowerCase()!==me.address.toLowerCase())throw new ApiClientError('err.sessionExpired',401);if(!import.meta.env.DEV || !isRehearsalAccount(connected))throw new ApiClientError('err.storeUnreachable',503);setRecord(await recordLocalResult({api,feast,result,account:connected}));})}>{copy[busy?'results.recording':'results.local.cta']}</button></>;
  return feast.createdBy.toLowerCase()===me.address.toLowerCase()?<section>{control}</section>:<details><summary>{copy['results.local.cta']}</summary>{control}</details>;
}
