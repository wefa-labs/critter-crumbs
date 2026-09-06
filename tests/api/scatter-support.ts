import { canonicalJSON, parseAddress, type Feast, type SignedOffchainAttestation } from '@critter-crumbs/shared';
import { createMockTimelock, participantSetHash, signBallot, type Account } from '@critter-crumbs/core';
import { bytesToHex } from 'viem';
export const testEas = { chainId: 84532, address: '0x4200000000000000000000000000000000000021', ballotSchemaUid: '0xb8e0cf5878dabf520b1e519ec026c9cc609c6feb255829ada0b6525f9b6ca236' } as const;
export async function encryptedScatter(feast: Feast, account: Account, now: number, amounts?: number[]): Promise<SignedOffchainAttestation> {
  const client = createMockTimelock({ clock: () => now });
  const recipient = feast.targets.find(target => target.ownerAddress?.toLowerCase() !== account.address.toLowerCase())!;
  const plaintext = canonicalJSON({ v: 1, feast: feast.id, scatterer: parseAddress(account.address), participants: participantSetHash(feast.participants),
    allocation: feast.targets.map((target, i) => [target.id, amounts ? amounts[i] : target.id === recipient.id ? feast.crumbsPerCritter : 0]), nonce: '0123456789abcdef' });
  const ciphertext = await client.encrypt(new TextEncoder().encode(plaintext), feast.registration!);
  return signBallot(account, testEas, { feastId: feast.id, shutterIdentity: feast.registration!.identity, ciphertext: bytesToHex(ciphertext), now });
}
