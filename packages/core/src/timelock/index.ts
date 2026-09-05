import type { Hex, Registration } from '@critter-crumbs/shared';
export type EncryptionParams = Pick<Registration, 'identity' | 'eon' | 'eonKey'>;
export interface Timelock {
  register(feastId: string, decryptionTimestamp: number, identityPrefix?: Hex): Promise<Registration>;
  encrypt(plaintext: Uint8Array, params: EncryptionParams): Promise<Uint8Array>;
  getKey(identity: Hex): Promise<Uint8Array | null>;
  decrypt(ciphertext: Uint8Array, key: Uint8Array): Promise<Uint8Array>;
}
export { createMockTimelock } from './mock.js';
export * from './shutter.js';
export { readFeastKey } from './read-key.js';
