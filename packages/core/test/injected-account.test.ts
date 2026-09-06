import { expect, test } from 'vitest';
import { createInjectedAccountProvider, createLocalAccount } from '@critter-crumbs/core';
import { hexToString, verifyMessage, verifyTypedData } from 'viem';

function setup() {
  const events = new EventTarget(), local = createLocalAccount(`0x${'1'.padStart(64, '0')}`), methods: string[] = [];
  const listeners = new Map<string, (value: never) => void>();
  let chainId = '0x1';
  const detail = { info: { uuid: 'c82a3583-128f-408c-9163-4b0f2eec8a7a', name: 'Fixture', icon: 'data:image/png;base64,AA==', rdns: 'example.fixture' },
    provider: { on(name: string, listener: (value: never) => void) { listeners.set(name, listener); }, removeListener(name: string) { listeners.delete(name); }, async request({ method, params }: { method: string; params: unknown[] }) {
      methods.push(method);
      if (method === 'eth_requestAccounts') return [local.address];
      if (method === 'wallet_switchEthereumChain') { chainId = (params[0] as { chainId: string }).chainId; return null; }
      if (method === 'eth_chainId') return chainId;
      if (method === 'eth_sendTransaction') return `0x${'ab'.repeat(32)}`;
      if (method === 'eth_signTypedData_v4') return local.signTypedData(JSON.parse(params[1] as string));
      if (method === 'personal_sign') return local.signMessage(hexToString(params[0] as `0x${string}`));
      throw new Error(method);
    } } };
  events.addEventListener('eip6963:requestProvider', () => {
    events.dispatchEvent(new CustomEvent('eip6963:announceProvider', { detail }));
    events.dispatchEvent(new CustomEvent('eip6963:announceProvider', { detail }));
  });
  const provider = createInjectedAccountProvider({ events, chainId: 84532 });
  return { provider, local, methods, change: () => listeners.get('accountsChanged')?.([] as never) };
}
test('Account EIP-6963 discovery deduplicates announcements and signs without switching chains', async () => {
  const { provider, local, methods } = setup();
  const options = await provider.discover(); expect(options).toHaveLength(1);
  const account = await provider.connect(options[0]!);
  const signature = await account.signMessage('connect fixture');
  expect(await verifyMessage({ address: local.address, message: 'connect fixture', signature })).toBe(true);
  expect(methods).toEqual(['eth_requestAccounts', 'personal_sign']);
});

test('Account injected disconnect prevents further signatures', async () => {
  const { provider } = setup(); const [option] = await provider.discover();
  const account = await provider.connect(option!); await account.disconnect();
  await expect(account.signMessage('after disconnect')).rejects.toThrow();
});

test('Account injected typed-data signing needs no chain switch', async () => {
  const { provider, local, methods } = setup(); const [option] = await provider.discover();
  const account = await provider.connect(option!);
  const typed = { domain: { name: 'Fixture', version: '1', chainId: 84532 }, types: { Example: [{ name: 'value', type: 'uint256' }] }, primaryType: 'Example', message: { value: 42n } } as const;
  const signature = await account.signTypedData(typed);
  expect(await verifyTypedData({ ...typed, address: local.address, signature })).toBe(true);
  expect(methods).toEqual(['eth_requestAccounts', 'eth_signTypedData_v4']);
});
test('Account switches to configured Base only when sending a result transaction', async () => {
  const { provider, local, methods } = setup(); const [option] = await provider.discover();
  const account = await provider.connect(option!);
  expect(await account.sendTransaction!({ to: local.address, data: '0x' })).toBe(`0x${'ab'.repeat(32)}`);
  expect(methods.indexOf('wallet_switchEthereumChain')).toBeLessThan(methods.indexOf('eth_sendTransaction'));
});
test('Account invalidates a connection when the selected address changes', async () => {
  const { provider, change } = setup(); const [option] = await provider.discover();
  const account = await provider.connect(option!); change();
  await expect(account.signMessage('old address')).rejects.toThrow();
});
