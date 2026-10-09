import { createWalletClient, custom, getAddress, type EIP1193Provider, type WalletClient } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { copy } from '@critter-crumbs/shared';
import type { AccountProvider } from './index.js';
interface Announcement { info: { uuid: string; name: string; icon?: string }; provider: EIP1193Provider }
type BaseChainId = 8453 | 84532;
const chains = { 8453: base, 84532: baseSepolia } as const;
/** The browser's own provider, offered only while no wallet has announced itself (some phone apps' built-in browsers never do). */
const browserProvider = 'injected:window.ethereum';
const isProvider = (value: unknown): value is EIP1193Provider => !!value && typeof value === 'object' && 'request' in value && typeof value.request === 'function';
/** EIP-1193 codes from a wallet error and what it wraps, including the nested form some phone wallets use for 4902. */
function rpcCodes(error: unknown): number[] {
  const codes: number[] = [];
  for (let current = error, depth = 0; current && typeof current === 'object' && depth < 6; current = (current as { cause?: unknown }).cause, depth++) {
    const { code, data } = current as { code?: unknown; data?: unknown };
    if (typeof code === 'number') codes.push(code);
    const nested = data && typeof data === 'object' ? (data as { originalError?: { code?: unknown } }).originalError?.code : undefined;
    if (typeof nested === 'number') codes.push(nested);
  }
  return codes;
}
/** Move the wallet to a Base chain, adding it first if the wallet does not know it. A wallet that cannot switch is used as it is; a declined switch stops the action. */
async function useChain(client: WalletClient, id: BaseChainId) {
  try { if (await client.getChainId() === id) return; } catch { /* ask the wallet to switch below */ }
  try { await client.switchChain({ id }); }
  catch (error) {
    const codes = rpcCodes(error);
    if (codes.includes(4902)) { await client.addChain({ chain: chains[id] }); await client.switchChain({ id }); return; }
    if (codes.includes(4200) || codes.includes(-32601)) return;
    throw error;
  }
}
/** Keep the discovery listener for the page lifetime, including late announcements. */
export function createInjectedAccountProvider({ events = window, chainId }: { events?: EventTarget; chainId: BaseChainId }): AccountProvider {
  const found = new Map<string, Announcement>();
  events.addEventListener('eip6963:announceProvider', event => {
    const detail: unknown = (event as CustomEvent).detail;
    if (!detail || typeof detail !== 'object' || !('info' in detail) || !('provider' in detail)) return;
    const { info, provider } = detail;
    if (!info || typeof info !== 'object' || !('uuid' in info) || !('name' in info) || !('icon' in info)
      || typeof info.uuid !== 'string' || typeof info.name !== 'string' || typeof info.icon !== 'string' || !isProvider(provider)) return;
    found.delete(browserProvider);
    if (!found.has(info.uuid)) found.set(info.uuid, { info: { uuid: info.uuid, name: info.name, icon: info.icon }, provider });
  });
  return {
    async discover() {
      events.dispatchEvent(new Event('eip6963:requestProvider'));
      const legacy = (events as EventTarget & { ethereum?: unknown }).ethereum;
      if (!found.size && isProvider(legacy)) found.set(browserProvider, { info: { uuid: browserProvider, name: copy['connect.injected'] }, provider: legacy });
      return [...found.values()].map(({ info }) => ({ id: info.uuid, name: info.name, ...(info.icon ? { icon: info.icon } : {}) }));
    },
    async connect(option) {
      const entry = found.get(option.id); if (!entry) throw new Error('Unknown account provider');
      const client = createWalletClient({ transport: custom(entry.provider, { retryCount: 0 }) });
      const [selected] = await client.requestAddresses(); if (!selected) throw new Error('No account selected');
      const address = getAddress(selected);
      let connected = true;
      const requireConnected = () => { if (!connected) throw new Error('Disconnected account'); };
      const changed = (addresses: string[]) => { if (addresses[0]?.toLowerCase() !== address.toLowerCase()) connected = false; };
      const lost = () => { connected = false; };
      entry.provider.on?.('accountsChanged', changed); entry.provider.on?.('disconnect', lost);
      return { address, kind: 'injected',
        async signMessage(message) { requireConnected(); return client.signMessage({ account: address, message }); },
        /* MetaMask refuses typed data whose domain chainId is not the active chain, so a ballot moves the wallet to its chain first */
        async signTypedData(typed) {
          requireConnected();
          const target = typed.domain?.chainId === undefined ? undefined : Number(typed.domain.chainId);
          if (target !== undefined) {
            if (target !== 8453 && target !== 84532) throw new TypeError('Unsupported signing chain');
            await useChain(client, target);
          }
          return client.signTypedData({ ...typed, account: address });
        },
        async sendTransaction(tx) {
          requireConnected();
          await useChain(client, chainId);
          return client.sendTransaction({ ...tx, account: address, chain: chains[chainId] });
        },
        async disconnect() { connected = false; entry.provider.removeListener?.('accountsChanged', changed); entry.provider.removeListener?.('disconnect', lost); },
      };
    },
  };
}
