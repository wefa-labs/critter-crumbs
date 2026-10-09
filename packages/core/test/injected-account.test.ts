import { expect, test } from 'vitest';
import { createInjectedAccountProvider, createLocalAccount } from '@critter-crumbs/core';
import { copy } from '@critter-crumbs/shared';
import { hexToString, verifyMessage, verifyTypedData } from 'viem';

/** A wallet fixture: `switchFails` makes the first switch request fail with that EIP-1193 error code. */
function setup({ chain = '0x1', switchFails, announce = true }: { chain?: string; switchFails?: number; announce?: boolean } = {}) {
  const events = new EventTarget() as EventTarget & { ethereum?: unknown }, local = createLocalAccount(`0x${'1'.padStart(64, '0')}`), methods: string[] = [], added: unknown[] = [];
  const listeners = new Map<string, (value: never) => void>();
  let chainId = chain, failure = switchFails;
  const provider = { on(name: string, listener: (value: never) => void) { listeners.set(name, listener); }, removeListener(name: string) { listeners.delete(name); }, async request({ method, params }: { method: string; params: unknown[] }) {
    methods.push(method);
    if (method === 'eth_requestAccounts') return [local.address];
    if (method === 'wallet_switchEthereumChain') {
      if (failure !== undefined) { const code = failure; failure = undefined; throw Object.assign(new Error('switch failed'), { code }); }
      chainId = (params[0] as { chainId: string }).chainId; return null;
    }
    if (method === 'wallet_addEthereumChain') { added.push(params[0]); return null; }
    if (method === 'eth_chainId') return chainId;
    if (method === 'eth_sendTransaction') return `0x${'ab'.repeat(32)}`;
    if (method === 'eth_signTypedData_v4') return local.signTypedData(JSON.parse(params[1] as string));
    if (method === 'personal_sign') return local.signMessage(hexToString(params[0] as `0x${string}`));
    throw new Error(method);
  } };
  const detail = { info: { uuid: 'c82a3583-128f-408c-9163-4b0f2eec8a7a', name: 'Fixture', icon: 'data:image/png;base64,AA==', rdns: 'example.fixture' }, provider };
  if (announce) events.addEventListener('eip6963:requestProvider', () => {
    events.dispatchEvent(new CustomEvent('eip6963:announceProvider', { detail }));
    events.dispatchEvent(new CustomEvent('eip6963:announceProvider', { detail }));
  });
  else events.ethereum = provider;
  const accounts = createInjectedAccountProvider({ events, chainId: 84532 });
  return { provider: accounts, local, methods, added, change: () => listeners.get('accountsChanged')?.([] as never) };
}
const typed = { domain: { name: 'Fixture', version: '1', chainId: 84532 }, types: { Example: [{ name: 'value', type: 'uint256' }] }, primaryType: 'Example', message: { value: 42n } } as const;
async function connected(options?: Parameters<typeof setup>[0]) {
  const fixture = setup(options); const [option] = await fixture.provider.discover();
  return { ...fixture, account: await fixture.provider.connect(option!) };
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

// MetaMask refuses typed data whose domain chainId differs from the active chain, so a ballot moves the wallet first.
test('Account moves the wallet to the typed data chain before signing', async () => {
  const { account, local, methods } = await connected();
  const signature = await account.signTypedData(typed);
  expect(await verifyTypedData({ ...typed, address: local.address, signature })).toBe(true);
  expect(methods).toEqual(['eth_requestAccounts', 'eth_chainId', 'wallet_switchEthereumChain', 'eth_signTypedData_v4']);
});
test('Account signs without asking to switch when the wallet is already on the chain', async () => {
  const { account, methods } = await connected({ chain: '0x14a34' });
  await account.signTypedData(typed);
  expect(methods).toEqual(['eth_requestAccounts', 'eth_chainId', 'eth_signTypedData_v4']);
});
test('Account adds Base Sepolia to a wallet that does not know it, then switches and signs', async () => {
  const { account, methods, added } = await connected({ switchFails: 4902 });
  await account.signTypedData(typed);
  expect(added).toEqual([expect.objectContaining({ chainId: '0x14a34' })]);
  expect(methods).toEqual(['eth_requestAccounts', 'eth_chainId', 'wallet_switchEthereumChain', 'wallet_addEthereumChain', 'wallet_switchEthereumChain', 'eth_signTypedData_v4']);
});
test('Account signs as it is when the wallet cannot switch chains', async () => {
  const { account, local, methods } = await connected({ switchFails: 4200 });
  const signature = await account.signTypedData(typed);
  expect(await verifyTypedData({ ...typed, address: local.address, signature })).toBe(true);
  expect(methods.at(-1)).toBe('eth_signTypedData_v4');
});
test('Account stops before signing when the person declines the switch', async () => {
  const { account, methods } = await connected({ switchFails: 4001 });
  await expect(account.signTypedData(typed)).rejects.toThrow();
  expect(methods).not.toContain('eth_signTypedData_v4');
});
test('Account offers the browser’s own provider when no wallet announces itself', async () => {
  const { provider, local, methods } = setup({ announce: false });
  const options = await provider.discover();
  expect(options).toEqual([expect.objectContaining({ name: copy['connect.injected'] })]);
  const account = await provider.connect(options[0]!);
  expect(account.address).toBe(local.address);
  await account.signMessage('connect fixture');
  expect(methods).toEqual(['eth_requestAccounts', 'personal_sign']);
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
