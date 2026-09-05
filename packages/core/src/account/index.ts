import { privateKeyToAccount } from 'viem/accounts';
import { verifyMessage, type TypedDataDefinition } from 'viem';
import { formatCopy, hex, integer, parseAddress, type Address, type Hex } from '@critter-crumbs/shared';

export type TypedData = TypedDataDefinition;
export interface TxRequest { to: Address; data?: Hex; value?: bigint }
export interface Account {
  address: Address;
  kind: 'injected' | 'embedded';
  signMessage(message: string): Promise<Hex>;
  signTypedData(typed: TypedData): Promise<Hex>;
  sendTransaction?(tx: TxRequest): Promise<Hex>;
  disconnect(): Promise<void>;
}
export interface AccountOption { id: string; name: string; icon?: string }
export interface AccountProvider { discover(): Promise<AccountOption[]>; connect(option: AccountOption): Promise<Account> }
export interface SignInChallenge { nonce: string; issuedAt: number; expiresAt: number }

/** Local tests emulate an injected signer, without discovery or a network transport. */
export function createLocalAccount(privateKey: Hex): Account {
  const signer = privateKeyToAccount(hex(privateKey, 32));
  let connected = true;
  const requireConnected = () => { if (!connected) throw new Error('Disconnected account'); };
  return {
    address: signer.address, kind: 'injected',
    async signMessage(message) { requireConnected(); return signer.signMessage({ message }); },
    async signTypedData(typed) { requireConnected(); return signer.signTypedData(typed); },
    async disconnect() { connected = false; },
  };
}
export function buildSignInMessage(address: Address, challenge: SignInChallenge): string {
  const { nonce, issuedAt, expiresAt } = challenge;
  if (!/^[0-9a-f]{32}$/.test(nonce) || expiresAt - issuedAt !== 600000) throw new TypeError('Invalid sign-in challenge');
  integer(issuedAt, 0, 8640000000000000); integer(expiresAt, 0, 8640000000000000);
  return formatCopy('session.message', { address: parseAddress(address), nonce, issued: new Date(issuedAt).toISOString(), expires: new Date(expiresAt).toISOString() });
}
export async function verifySignInMessage(address: Address, challenge: SignInChallenge, signature: Hex, now: number): Promise<boolean> {
  if (!Number.isFinite(now) || now < challenge.issuedAt || now >= challenge.expiresAt) return false;
  try { return await verifyMessage({ address, message: buildSignInMessage(address, challenge), signature }); }
  catch { return false; }
}
