import { bls12_381 as curve } from '@noble/curves/bls12-381';
import { createChiadoTimelock, type ShutterSDK, type Timelock } from '@critter-crumbs/core';
import { createRequire } from 'node:module';
import { hex, integer, parseUuid, type Hex, type Registration } from '@critter-crumbs/shared';
import { bytesToHex, concatHex, hexToBytes, keccak256, stringToHex } from 'viem';

interface LocalRegistration { feastId: string; decryptionTimestamp: number }
export interface LocalShutterConfig {
  secret: string; clock: () => number;
  random?: (length: number) => Uint8Array;
  lookup?: (identity: Hex) => Promise<LocalRegistration | null>;
}
const require = createRequire(import.meta.url);
/** In Node the SDK only loads through its CommonJS build; its module build expects a browser. */
export const nodeShutterSDK = async () => require('@shutter-network/shutter-sdk') as ShutterSDK;
/** The tag Shutter hashes an identity to the curve with (shutter-sdk, computeIdentityP1). */
const IDENTITY_TAG = 'SHUTTER_V01_BLS12381G1_XMD:SHA-256_SSWU_RO_';

/**
 * Shutter's place in a local run, with real keys. The eon key pair is made from the server secret, and each identity's
 * key is the one keypers holding that secret would release once its time has come. Scatters are then encrypted and
 * opened by the same SDK code as in production, so a whole feast runs offline through the real client path.
 *
 * Never a production timelock: whoever holds the secret can open every scatter at any time. The key is derived here with
 * a second curve library, not the SDK's, so the two have to agree on Shutter's scheme for a feast to open.
 */
export function createLocalShutterTimelock(config: LocalShutterConfig): Timelock & { release(identity: Hex): void } {
  if (config.secret.length < 32) throw new Error('Local Shutter keys require a server secret');
  // Only the SDK's two pure functions are used; the network half of the adapter is replaced below.
  const { encrypt, decrypt } = createChiadoTimelock({ sdk: nodeShutterSDK, ...(config.random ? { random: config.random } : {}) });
  const registrations = new Map<Hex, LocalRegistration>(), released = new Set<Hex>();
  const random = config.random ?? (length => crypto.getRandomValues(new Uint8Array(length)));
  const eonSecret = BigInt(keccak256(stringToHex(`critter-crumbs/local-shutter/v1/${config.secret}`))) % (curve.params.r - 1n) + 1n;
  const eonKey = bytesToHex(curve.G2.ProjectivePoint.BASE.multiply(eonSecret).toRawBytes(true));
  return {
    encrypt, decrypt,
    async register(feastId, decryptionTimestamp, identityPrefix) {
      parseUuid(feastId); integer(decryptionTimestamp, 0, 8640000000000000);
      const prefix = identityPrefix ?? keccak256(concatHex([stringToHex(`critter-crumbs${feastId}`), bytesToHex(random(32))]));
      const identity = keccak256(concatHex([hex(prefix, 32), `0x${'00'.repeat(20)}`]));
      const previous = registrations.get(identity);
      if (previous && (previous.feastId !== feastId || previous.decryptionTimestamp !== decryptionTimestamp)) throw new Error('Registration is immutable');
      registrations.set(identity, { feastId, decryptionTimestamp });
      return { identityPrefix: prefix, identity, eon: 1, eonKey, txHash: null } satisfies Registration;
    },
    async getKey(identity) {
      const normalized = hex(identity, 32), entry = registrations.get(normalized) ?? await config.lookup?.(normalized);
      if (!entry || (config.clock() < entry.decryptionTimestamp && !released.has(normalized))) return null;
      // The SDK hashes a one byte, then the identity; the released key is that point times the eon secret.
      const point = curve.G1.hashToCurve(hexToBytes(concatHex(['0x01', normalized])), { DST: IDENTITY_TAG });
      return curve.G1.ProjectivePoint.fromAffine(point.toAffine()).multiply(eonSecret).toRawBytes(true);
    },
    release(identity) { released.add(hex(identity, 32)); },
  };
}
