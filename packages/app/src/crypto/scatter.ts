import { ApiClientError, createMockTimelock, participantSetHash, signBallot, ballotSchema, schemaUID, type Account } from '@critter-crumbs/core';
import { canonicalJSON, MAX_CIPHERTEXT_BYTES, parseAllocationPayload, parseAddress, type Feast } from '@critter-crumbs/shared';
import { bytesToHex } from 'viem';
import type { AppApi } from '../app/session.js';
/** The local rehearsal uses the reviewed mock Timelock and real EAS typed data. */
export async function signScatter(api: AppApi, account: Account, feast: Feast, amounts: number[], now: number) {
  if (!import.meta.env.DEV) throw new ApiClientError('err.storeUnreachable', 503);
  api.invalidate(); const capability = await api.get('/api/dev/config');
  if (capability.enabled !== true || capability.mode !== 'mock' || capability.production !== false || !feast.registration) throw new ApiClientError('err.storeUnreachable', 503);
  const client = createMockTimelock({ clock: () => now });
  const plaintext = canonicalJSON(parseAllocationPayload({ v: 1, feast: feast.id, scatterer: parseAddress(account.address), participants: participantSetHash(feast.participants), allocation: feast.targets.map((target, index) => [target.id, amounts[index]]), nonce: bytesToHex(crypto.getRandomValues(new Uint8Array(8))).slice(2) }));
  const ciphertext = await client.encrypt(new TextEncoder().encode(plaintext), feast.registration);
  if (ciphertext.length > MAX_CIPHERTEXT_BYTES) throw new ApiClientError('err.feastCapacity', 400);
  return signBallot(account, { chainId: 84532, address: '0x4200000000000000000000000000000000000021', ballotSchemaUid: schemaUID(ballotSchema) }, { feastId: feast.id, shutterIdentity: feast.registration.identity, ciphertext: bytesToHex(ciphertext), now });
}
