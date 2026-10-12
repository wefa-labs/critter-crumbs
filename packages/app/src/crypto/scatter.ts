import { ApiClientError, participantSetHash, signBallot, ballotSchema, schemaUID, type Account } from '@critter-crumbs/core';
import { canonicalJSON, MAX_CIPHERTEXT_BYTES, parseAllocationPayload, parseAddress, type Feast } from '@critter-crumbs/shared';
import { bytesToHex } from 'viem';
import { feastTimelock, type FeastTimelock } from './timelock.js';
/** Encrypts a complete scatter for the feast's timelock, then has the member sign it as an EAS off-chain attestation. */
export async function signScatter(account: Account, feast: Feast, amounts: number[], now: number, lock: FeastTimelock = feastTimelock(feast, () => now)) {
  if (!feast.registration) throw new ApiClientError('err.generic', 400);
  const plaintext = canonicalJSON(parseAllocationPayload({ v: 1, feast: feast.id, scatterer: parseAddress(account.address), participants: participantSetHash(feast.participants), allocation: feast.targets.map((target, index) => [target.id, amounts[index]]), nonce: bytesToHex(crypto.getRandomValues(new Uint8Array(8))).slice(2) }));
  let ciphertext: Uint8Array;
  // The timelock's code is fetched on first use. Failing to get it is a connection problem, not a declined signature.
  try { await lock.ready(); ciphertext = await lock.timelock.encrypt(new TextEncoder().encode(plaintext), feast.registration); }
  catch { throw new ApiClientError('err.saveFailed', 0); }
  if (ciphertext.length > MAX_CIPHERTEXT_BYTES) throw new ApiClientError('err.feastCapacity', 400);
  return signBallot(account, { chainId: 84532, address: '0x4200000000000000000000000000000000000021', ballotSchemaUid: schemaUID(ballotSchema) }, { feastId: feast.id, shutterIdentity: feast.registration.identity, ciphertext: bytesToHex(ciphertext), now });
}
