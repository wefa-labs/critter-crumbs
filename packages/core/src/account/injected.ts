import { createWalletClient, custom, getAddress, type EIP1193Provider } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import type { AccountProvider } from './index.js';
interface Announcement { info: { uuid: string; name: string; icon: string }; provider: EIP1193Provider }
/** Keep the discovery listener for the page lifetime, including late announcements. */
export function createInjectedAccountProvider({ events = window, chainId }: { events?: EventTarget; chainId: 8453 | 84532 }): AccountProvider {
  const found = new Map<string, Announcement>();
  events.addEventListener('eip6963:announceProvider', event => {
    const detail: unknown = (event as CustomEvent).detail;
    if (!detail || typeof detail !== 'object' || !('info' in detail) || !('provider' in detail)) return;
    const { info, provider } = detail;
    if (!info || typeof info !== 'object' || !('uuid' in info) || !('name' in info) || !('icon' in info)
      || typeof info.uuid !== 'string' || typeof info.name !== 'string' || typeof info.icon !== 'string'
      || !provider || typeof provider !== 'object' || !('request' in provider) || typeof provider.request !== 'function') return;
    if (!found.has(info.uuid)) found.set(info.uuid, { info: { uuid: info.uuid, name: info.name, icon: info.icon }, provider: provider as EIP1193Provider });
  });
  return {
    async discover() {
      events.dispatchEvent(new Event('eip6963:requestProvider'));
      return [...found.values()].map(({ info }) => ({ id: info.uuid, name: info.name, icon: info.icon }));
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
        async signTypedData(typed) { requireConnected(); return client.signTypedData({ ...typed, account: address }); },
        async sendTransaction(tx) {
          requireConnected();
          await client.switchChain({ id: chainId });
          return client.sendTransaction({ ...tx, account: address, chain: chainId === 8453 ? base : baseSepolia });
        },
        async disconnect() { connected = false; entry.provider.removeListener?.('accountsChanged', changed); entry.provider.removeListener?.('disconnect', lost); },
      };
    },
  };
}
