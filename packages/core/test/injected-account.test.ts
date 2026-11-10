import { expect, test } from 'vitest';
import { AccountUnavailableError, createInjectedAccountProvider, createLocalAccount } from '@critter-crumbs/core';
import { copy } from '@critter-crumbs/shared';
import { hexToString, verifyMessage, verifyTypedData } from 'viem';

/**
 * A wallet fixture: `switchFails` makes the first switch request fail with that EIP-1193 error code, and `signFails` the
 * first typed-data signature. `accounts` is what the wallet reports (none while locked); `report` also tells the page.
 */
function setup({ chain = '0x1', switchFails, signFails, announce = true }: { chain?: string; switchFails?: number; signFails?: number; announce?: boolean } = {}) {
  const events = new EventTarget() as EventTarget & { ethereum?: unknown }, local = createLocalAccount(`0x${'1'.padStart(64, '0')}`), methods: string[] = [], added: unknown[] = [];
  const listeners = new Map<string, (value: never) => void>();
  let chainId = chain, failure = switchFails, signFailure = signFails, accounts: string[] = [local.address];
  const provider = { on(name: string, listener: (value: never) => void) { listeners.set(name, listener); }, removeListener(name: string) { listeners.delete(name); }, async request({ method, params }: { method: string; params: unknown[] }) {
    methods.push(method);
    if (method === 'eth_requestAccounts') return [local.address];
    if (method === 'eth_accounts') return accounts;
    if (method === 'wallet_switchEthereumChain') {
      if (failure !== undefined) { const code = failure; failure = undefined; throw Object.assign(new Error('switch failed'), { code }); }
      chainId = (params[0] as { chainId: string }).chainId; return null;
    }
    if (method === 'wallet_addEthereumChain') { added.push(params[0]); return null; }
    if (method === 'eth_chainId') return chainId;
    if (method === 'eth_sendTransaction') return `0x${'ab'.repeat(32)}`;
    if (method === 'eth_signTypedData_v4') {
      if (signFailure !== undefined) { const code = signFailure; signFailure = undefined; throw Object.assign(new Error('sign failed'), { code }); }
      return local.signTypedData(JSON.parse(params[1] as string));
    }
    if (method === 'personal_sign') return local.signMessage(hexToString(params[0] as `0x${string}`));
    throw new Error(method);
  } };
  const detail = { info: { uuid: 'c82a3583-128f-408c-9163-4b0f2eec8a7a', name: 'Fixture', icon: 'data:image/png;base64,AA==', rdns: 'example.fixture' }, provider };
  if (announce) events.addEventListener('eip6963:requestProvider', () => {
    events.dispatchEvent(new CustomEvent('eip6963:announceProvider', { detail }));
    events.dispatchEvent(new CustomEvent('eip6963:announceProvider', { detail }));
  });
  else events.ethereum = provider;
  const accountProvider = createInjectedAccountProvider({ events, chainId: 84532 });
  const report = (next: string[], { quietly = false } = {}) => { accounts = next; if (!quietly) listeners.get('accountsChanged')?.(next as never); };
  return { provider: accountProvider, local, methods, added, report, emit: (name: string) => listeners.get(name)?.(undefined as never) };
}
const typed = { domain: { name: 'Fixture', version: '1', chainId: 84532 }, types: { Example: [{ name: 'value', type: 'uint256' }] }, primaryType: 'Example', message: { value: 42n } } as const;
/** Why the account would not sign: its AccountUnavailableError reason, or the error itself. */
async function refusal(signing: Promise<unknown>) {
  try { await signing; } catch (error) { return error instanceof AccountUnavailableError ? error.reason : error; }
  throw new Error('signed');
}
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

test('Account injected disconnect prevents further signatures, even once the wallet reports the account again', async () => {
  const { provider, local, report } = setup(); const [option] = await provider.discover();
  const account = await provider.connect(option!); await account.disconnect(); report([local.address]);
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
// production-build-04: a wallet that locks or moves to another account must be able to sign again once it is back.
test('Account refuses to sign while the wallet is locked, without asking it, and signs again once it is unlocked', async () => {
  const { account, local, methods, report } = await connected({ chain: '0x14a34' });
  report([]);
  expect(await refusal(account.signTypedData(typed))).toBe('locked');
  expect(methods).not.toContain('eth_signTypedData_v4');
  report([local.address]);
  expect(await verifyTypedData({ ...typed, address: local.address, signature: await account.signTypedData(typed) })).toBe(true);
});
test('Account refuses to sign on another account and signs again once the wallet is back on the connected one', async () => {
  const { account, local, methods, report } = await connected({ chain: '0x14a34' });
  report(['0x0000000000000000000000000000000000000002', local.address]);
  expect(await refusal(account.signTypedData(typed))).toBe('otherAccount');
  expect(methods).not.toContain('eth_signTypedData_v4');
  report([local.address]);
  expect(await verifyTypedData({ ...typed, address: local.address, signature: await account.signTypedData(typed) })).toBe(true);
});
test('Account asks the wallet again when it came back without saying so', async () => {
  const { account, local, report } = await connected({ chain: '0x14a34' });
  report([]); report([local.address], { quietly: true });
  expect(await verifyTypedData({ ...typed, address: local.address, signature: await account.signTypedData(typed) })).toBe(true);
});
test('Account asks the wallet again after it reported a lost connection, and signs', async () => {
  const { account, local, emit } = await connected({ chain: '0x14a34' });
  emit('disconnect');
  expect(await verifyMessage({ address: local.address, message: 'after a disconnect', signature: await account.signMessage('after a disconnect') })).toBe(true);
});
test('Account reads a wallet that refuses to sign as unauthorised (4100) as locked, and signs on the next try', async () => {
  const { account, local } = await connected({ chain: '0x14a34', signFails: 4100 });
  expect(await refusal(account.signTypedData(typed))).toBe('locked');
  expect(await verifyTypedData({ ...typed, address: local.address, signature: await account.signTypedData(typed) })).toBe(true);
});
