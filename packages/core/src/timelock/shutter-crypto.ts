import { bytesToHex, hexToBytes } from 'viem';
import { hex, integer, type Hex } from '@critter-crumbs/shared';
import type { EncryptionParams } from './index.js';
export interface ShutterSDK {
  encryptData(message: Hex, identity: Hex, eonKey: Hex, sigma: Hex): Promise<Hex>;
  decrypt(ciphertext: Hex, key: Hex): Promise<Hex>;
}
let pending: Promise<unknown> = Promise.resolve();
/** SDK 0.0.2 has one mutable readiness callback; serialize across adapter instances. */
function serialize<T>(operation: () => Promise<T>): Promise<T> {
  const result = pending.then(operation); pending = result.catch(() => {}); return result;
}
export function shutterCrypto(loadSDK: () => Promise<ShutterSDK> = () => import('@shutter-network/shutter-sdk'), random: (length: number) => Uint8Array = (length: number) => crypto.getRandomValues(new Uint8Array(length))) {
  return {
    encrypt(plaintext: Uint8Array, params: EncryptionParams): Promise<Uint8Array> {
      const identity = hex(params.identity, 32), eonKey = hex(params.eonKey, 96); integer(params.eon, 0, 2147483647);
      const sigma = hex(bytesToHex(random(32)), 32), message = bytesToHex(plaintext);
      return serialize(async () => hexToBytes(hex(await (await loadSDK()).encryptData(message, identity, eonKey, sigma))));
    },
    decrypt(ciphertext: Uint8Array, key: Uint8Array): Promise<Uint8Array> {
      const encrypted = bytesToHex(ciphertext), secret = hex(bytesToHex(key), 48);
      return serialize(async () => hexToBytes(hex(await (await loadSDK()).decrypt(encrypted, secret))));
    },
  };
}
