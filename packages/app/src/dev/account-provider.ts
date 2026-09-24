/// <reference types="vite/client" />
import { createLocalAccount, type AccountProvider } from '@critter-crumbs/core';
import { formatCopy, hex } from '@critter-crumbs/shared';
import { markRehearsalAccount } from '../app/rehearsal-accounts.js';
import type { AppApi } from '../app/session.js';

/** Public rehearsal keys only; this module is dynamically imported inside the DEV branch. */
export function createDevAccountProvider(api: AppApi): AccountProvider {
  async function available() {
    if (!import.meta.env.DEV) return false;
    api.invalidate();
    try {
      const config = await api.get('/api/dev/config');
      return config.enabled === true && config.mode === 'mock' && config.production === false;
    } catch { return false; }
  }
  return {
    async discover() {
      return await available() ? Array.from({ length: 8 }, (_, index) => ({ id: `local:${index + 1}`, name: formatCopy('dev.account', { n: index + 1 }) })) : [];
    },
    async connect(option) {
      if (!await available() || !/^local:[1-8]$/.test(option.id)) throw new Error('Local account unavailable');
      const local=createLocalAccount(`0x${Number(option.id.slice(6)).toString(16).padStart(64, '0')}`);
      return markRehearsalAccount({...local,async sendTransaction(tx) { if(!await available())throw new Error('Local account unavailable'); await local.signMessage(tx.data ?? '0x'); const response=await api.write('/api/dev/result-transaction','POST',{operationId:crypto.randomUUID(),chainId:84532,address:local.address,to:tx.to,data:tx.data,value:String(tx.value??0n)});return hex(response.txHash,32); }});
    },
  };
}
