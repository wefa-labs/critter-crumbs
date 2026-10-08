import { useEffect, useState } from 'react';
import { memberName } from './names.js';
import { ApiClientError, type Account } from '@critter-crumbs/core';
import { copy, formatCopy, type ResultAttestation, type TallyResult } from '@critter-crumbs/shared';
import { recordLocalResult } from './result-recorder.js';
import type { MemberFeast, PublicFeast } from './feast-view.js';
import type { AppApi, Me } from './session.js';
import type { RunAction } from './burrows.js';
import { isRehearsalAccount } from './rehearsal-accounts.js';
import { SheetNotice } from '../game/surface.js';

/**
 * A public result's record, in the results list (flow pages 48–50). This build records a local rehearsal fixture, so the
 * lines are the rehearsal's own (`results.local.*`), not the on-chain ones the flow page draws.
 */
export function RecordReceipt({ record, feast, plain = false }: { record: ResultAttestation; feast: PublicFeast; plain?: boolean }) {
  const line = formatCopy('results.local.done', { name: memberName(feast, record.attester) });
  return (
    <div className="results-record">
      {plain ? <p className="results-sum">{line}</p> : <SheetNotice>{line}</SheetNotice>}
      <details className="record-details">
        <summary>{copy['results.local.view']}</summary>
        <p className="results-sum">{copy['results.local.help']}</p>
        <dl><dt>{copy['results.local.transaction']}</dt><dd className="receipt-evidence">{record.txHash}</dd><dt>{copy['results.local.uid']}</dt><dd className="receipt-evidence">{record.uid}</dd></dl>
      </details>
      <p className="results-sum">{copy['results.public']}</p>
    </div>
  );
}

/**
 * Recording a public result (flow 48): the public line, then the button, with the line under it saying what that costs.
 * Any member may record it and the feast's creator is prompted first (PRD F9, Design System §9), so the creator sees
 * the button and everyone else finds it folded. Once recorded, the receipt takes its place (flow 49).
 */
export function ResultRecord({ feast, result, api, me, account, run, busy }: { feast: MemberFeast; result: TallyResult; api: AppApi; me: Me; account: () => Account | null; run: RunAction; busy: boolean }) {
  const [record, setRecord] = useState(feast.resultAttestation);
  useEffect(() => { if (feast.resultAttestation) setRecord(feast.resultAttestation); }, [feast.resultAttestation]);
  if (!feast.aggregatePublic) return null;
  if (record) return <RecordReceipt record={record} feast={feast} />;
  const control = <>
    <button type="button" className="pill wide" disabled={busy} onClick={() => void run(async () => {
      const connected = account();
      if (!connected || connected.address.toLowerCase() !== me.address.toLowerCase()) throw new ApiClientError('err.sessionExpired', 401);
      if (!import.meta.env.DEV || !isRehearsalAccount(connected)) throw new ApiClientError('err.storeUnreachable', 503);
      setRecord(await recordLocalResult({ api, feast, result, account: connected }));
    })}>{copy[busy ? 'results.recording' : 'results.local.cta']}</button>
    <p className="results-sum">{copy['results.local.help']}</p>
  </>;
  return (
    <div className="results-record">
      <p className="results-sum">{copy['results.public']}</p>
      {feast.createdBy.toLowerCase() === me.address.toLowerCase() ? control : <details className="record-details"><summary>{copy['results.local.cta']}</summary>{control}</details>}
    </div>
  );
}
