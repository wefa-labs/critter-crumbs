import { AccountUnavailable, ApiClientError, phaseAt } from '@critter-crumbs/core';
import { BALLOT_TIME_TOLERANCE_SECONDS, integer, parseAddress, parseSequence, ValidationError, type Address, type SignedOffchainAttestation } from '@critter-crumbs/shared';
import type { AppApi } from './session.js';
import { isMemberFeast, type MemberFeast } from './feast-view.js';
export interface ScatterReceipt { uid: string; seq: string }
export interface ScatterState { amounts: number[]; dirty: boolean; status: 'idle' | 'signing' | 'saving' | 'verifying' | 'saved' | 'error'; receipt: ScatterReceipt | null; remote: ScatterReceipt | null }
/** A kept signature is sent again only while the store would still take it, with a minute to spare (rules-04). */
const REUSE_SECONDS = BALLOT_TIME_TOLERANCE_SECONDS - 60;
const unavailable = { locked: 'scatter.sign.locked', otherAccount: 'scatter.sign.otherAccount' } as const;
/** A signature that did not come says why (production-build-04): the account app locked or on another account, else not confirmed. */
const unsigned = (error: unknown) => error instanceof ApiClientError || error instanceof ValidationError ? error
  : new ApiClientError(error instanceof AccountUnavailable ? unavailable[error.reason] : 'scatter.sign.rejected', 400);
interface Options { onAccepted?: (receipt: ScatterReceipt) => void; api: AppApi; feast: MemberFeast; viewer: Address; sign: (amounts: number[], now: number, feast: MemberFeast) => Promise<SignedOffchainAttestation> }
/** Keep edits in memory. A lost response is reconciled by UID before any retry; a retry signs again once the kept signature is too old. */
export function createScatterSession({ api, feast, viewer, sign, onAccepted }: Options) {
  const address = parseAddress(viewer), listeners = new Set<() => void>();
  let state: ScatterState = { amounts: feast.targets.map(() => 0), dirty: false, status: 'idle', receipt: null, remote: null };
  let savedAmounts: number[] | null = null, pending: { signed: SignedOffchainAttestation; amounts: number[] } | null = null;
  let inFlight: Promise<void> | null = null;
  const same = (a: number[], b: number[]) => a.length === b.length && a.every((n, i) => n === b[i]);
  const publish = (patch: Partial<ScatterState>) => { state = { ...state, ...patch }; for (const listener of listeners) listener(); };
  const ordered = (receipts: ScatterReceipt[]) => [...receipts].sort((a, b) => BigInt(a.seq) < BigInt(b.seq) ? -1 : 1);
  function observe(latest: MemberFeast) {
    const receipts = ordered(latest.ownReceipts), remote = receipts.at(-1) ?? null;
    publish({ remote }); if (pending) confirm(receipts); return receipts;
  }
  async function read() { api.invalidate(); const latest = await api.get(`/api/feasts/${feast.id}`) as unknown as MemberFeast; if (!isMemberFeast(latest)) throw new ApiClientError('err.sessionExpired', 401); observe(latest); return latest; }
  function confirm(receipts: ScatterReceipt[]) {
    const receipt = pending && receipts.find(receipt => receipt.uid === pending!.signed.uid);
    if (!receipt || !pending) return false;
    savedAmounts = pending.amounts; pending = null; onAccepted?.(receipt);
    publish({ receipt, dirty: !same(state.amounts, savedAmounts), status: 'saved' }); return true;
  }
  return {
    snapshot: () => state,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    observe,
    refresh: async () => { const latest = await read(); if (pending) confirm(latest.ownReceipts); },
    edit(amounts: number[]) {
      if (amounts.length !== feast.targets.length) throw new ValidationError('err.generic');
      amounts.forEach((amount, i) => { integer(amount, 0, feast.crumbsPerCritter); if (amount && feast.targets[i]!.ownerAddress && parseAddress(feast.targets[i]!.ownerAddress) === address) throw new ValidationError('err.generic'); });
      if (amounts.reduce((sum, n) => sum + n, 0) > feast.crumbsPerCritter) throw new ValidationError('err.generic');
      publish({ amounts: [...amounts], dirty: !savedAmounts || !same(amounts, savedAmounts) });
    },
    submit() {
      if (inFlight) return inFlight;
      inFlight = (async () => {
        try {
          const latest = await read();
          if (pending) confirm(latest.ownReceipts);
          if (!state.dirty && state.receipt && state.remote?.uid === state.receipt.uid) return;
          const now = api.now();
          if (now === null || phaseAt(latest, now) !== 'scattering') throw new ApiClientError('scatter.closed', 400);
          if (!latest.participants?.some(participant => parseAddress(participant) === address)) throw new ApiClientError('err.notParticipant', 403);
          if (state.amounts.reduce((sum, n) => sum + n, 0) !== latest.crumbsPerCritter) throw new ValidationError('scatter.submit.help');
          const amounts = [...state.amounts];
          if (!pending || !same(pending.amounts, amounts) || now / 1000 - Number(pending.signed.message.time) > REUSE_SECONDS) {
            publish({ status: 'signing' });
            pending = { signed: await sign(amounts, now, latest).catch(error => { throw unsigned(error); }), amounts };
          }
          const submittedUid = pending.signed.uid;
          publish({ status: 'saving' });
          let failure: unknown;
          try { const accepted = await api.write(`/api/feasts/${feast.id}/ballots`, 'POST', pending.signed); if(accepted.uid === submittedUid) onAccepted?.({uid:submittedUid,seq:parseSequence(accepted.seq)}); } catch (error) { failure = error; }
          publish({ status: 'verifying' });
          const verified = await read();
          if (state.receipt?.uid !== submittedUid && !confirm(verified.ownReceipts)) throw failure ?? new ApiClientError('err.saveUnverified', 0);
        } catch (error) { publish({ status: 'error' }); throw error; }
        finally { inFlight = null; }
      })(); return inFlight;
    },
  };
}
