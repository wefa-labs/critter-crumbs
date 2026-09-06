import { bytesToHex, concatHex, hexToBytes, keccak256, stringToHex } from 'viem';
import { hex, integer, parseUuid, type Hex, type Registration } from '@critter-crumbs/shared';
import type { Timelock } from './index.js';
interface MockRegistration { feastId: string; decryptionTimestamp: number }
export interface MockTimelockConfig {
  secret?: string; clock: () => number;
  random?: (length: number) => Uint8Array;
  lookup?: (identity: Hex) => Promise<MockRegistration | null>;
}
/** Development-only encryption: the mock eon key intentionally exposes encryption material. */
export function createMockTimelock(config: MockTimelockConfig): Timelock & { release(identity: Hex): void } {
  const registrations = new Map<Hex, MockRegistration>(), released = new Set<Hex>();
  const random = config.random ?? (length => crypto.getRandomValues(new Uint8Array(length)));
  async function derive(feastId: string) {
    if (!config.secret || config.secret.length < 32) throw new Error('Mock registration requires a server secret');
    const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(config.secret), 'HKDF', false, ['deriveBits']);
    return new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt: new TextEncoder().encode(feastId), info: new TextEncoder().encode('critter-crumbs/mock/v1') }, material, 256));
  }
  return {
    async register(feastId, decryptionTimestamp, identityPrefix) {
      parseUuid(feastId); integer(decryptionTimestamp, 0, 8640000000000000);
      const prefix = identityPrefix ?? keccak256(concatHex([stringToHex(`critter-crumbs${feastId}`), bytesToHex(random(32))]));
      const identity = keccak256(concatHex([hex(prefix, 32), `0x${'00'.repeat(20)}`]));
      const previous = registrations.get(identity);
      if (previous && (previous.feastId !== feastId || previous.decryptionTimestamp !== decryptionTimestamp)) throw new Error('Registration is immutable');
      registrations.set(identity, { feastId, decryptionTimestamp });
      return { identityPrefix: prefix, identity, eon: 0, eonKey: bytesToHex(await derive(feastId)), txHash: null } satisfies Registration;
    },
    async encrypt(plaintext, params) {
      const iv = new Uint8Array(random(12));
      const key = await crypto.subtle.importKey('raw', new Uint8Array(hexToBytes(hex(params.eonKey, 32))), 'AES-GCM', false, ['encrypt']);
      const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new Uint8Array(plaintext)));
      const ciphertext = new Uint8Array(iv.length + encrypted.length); ciphertext.set(iv); ciphertext.set(encrypted, iv.length); return ciphertext;
    },
    async getKey(identity) {
      const entry = registrations.get(identity) ?? await config.lookup?.(identity);
      if (!entry || (config.clock() < entry.decryptionTimestamp && !released.has(identity))) return null;
      return derive(entry.feastId);
    },
    async decrypt(ciphertext, rawKey) {
      if (ciphertext.length < 28) throw new Error('Invalid mock ciphertext');
      const key = await crypto.subtle.importKey('raw', new Uint8Array(rawKey), 'AES-GCM', false, ['decrypt']);
      return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(ciphertext.slice(0, 12)) }, key, new Uint8Array(ciphertext.slice(12))));
    },
    release(identity) { released.add(hex(identity, 32)); },
  };
}
