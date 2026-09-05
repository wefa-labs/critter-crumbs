import { canonicalJSON, hex, integer, parseAddress, parseUuid, type Address, type Hex, type OffchainMessage, type SignedOffchainAttestation } from '@critter-crumbs/shared';
import { bytesToHex, decodeAbiParameters, encodeAbiParameters, encodePacked, keccak256, parseAbiParameters, parseSignature, serializeSignature, stringToHex, verifyTypedData, zeroAddress, zeroHash } from 'viem';
import type { Account } from '../account/index.js';

export interface EasConfig { chainId: 8453 | 84532; address: Address; ballotSchemaUid: Hex }
export const ballotSchema = 'bytes32 feastId, bytes32 shutterIdentity, bytes ciphertext, uint32 payloadVersion';
export const attestTypes = { Attest: [
  { name: 'version', type: 'uint16' }, { name: 'schema', type: 'bytes32' }, { name: 'recipient', type: 'address' },
  { name: 'time', type: 'uint64' }, { name: 'expirationTime', type: 'uint64' }, { name: 'revocable', type: 'bool' },
  { name: 'refUID', type: 'bytes32' }, { name: 'data', type: 'bytes' }, { name: 'salt', type: 'bytes32' },
] } as const;
export function easDomain(config: Pick<EasConfig, 'chainId' | 'address'>) {
  if (config.chainId !== 8453 && config.chainId !== 84532) throw new TypeError('Unsupported attestation chain');
  return { name: 'EAS Attestation', version: '0.26', chainId: config.chainId, verifyingContract: parseAddress(config.address) };
}
export function feastBytes32(feastId: string): Hex { return keccak256(stringToHex(parseUuid(feastId))); }
export function schemaUID(schema: string): Hex { return keccak256(encodePacked(['string', 'address', 'bool'], [schema, zeroAddress, false])); }
export interface BallotData { feastId: string; shutterIdentity: Hex; ciphertext: Hex }
export function encodeBallot(input: BallotData): Hex {
  return encodeAbiParameters(parseAbiParameters(ballotSchema), [feastBytes32(input.feastId), hex(input.shutterIdentity, 32), hex(input.ciphertext), 1]);
}
export function offchainUID(message: OffchainMessage): Hex {
  // The SDK packs UTF-8 schema text (including 0x), an empty attester, and a trailing uint32 zero.
  return keccak256(encodePacked(['uint16', 'bytes', 'address', 'address', 'uint64', 'uint64', 'bool', 'bytes32', 'bytes', 'bytes32', 'uint32'],
    [2, stringToHex(message.schema), message.recipient, zeroAddress, BigInt(message.time), BigInt(message.expirationTime), message.revocable, message.refUID, message.data, message.salt, 0]));
}
const typedMessage = (message: OffchainMessage) => ({ ...message, time: BigInt(message.time), expirationTime: BigInt(message.expirationTime) });
export async function signBallot(account: Account, config: EasConfig, input: BallotData & { now: number; salt?: Hex }): Promise<SignedOffchainAttestation> {
  const domain = easDomain(config);
  const message: OffchainMessage = { version: 2, schema: hex(config.ballotSchemaUid, 32), recipient: zeroAddress,
    time: String(Math.floor(integer(input.now, 0, 8640000000000000) / 1000)), expirationTime: '0', revocable: false, refUID: zeroHash,
    data: encodeBallot(input), salt: hex(input.salt ?? bytesToHex(crypto.getRandomValues(new Uint8Array(32))), 32) };
  const signature = parseSignature(await account.signTypedData({ domain, types: attestTypes, primaryType: 'Attest', message: typedMessage(message) }));
  return { version: 2, uid: offchainUID(message), domain, types: { Attest: attestTypes.Attest.map(field => ({ ...field })) }, primaryType: 'Attest', message,
    signature: { r: hex(signature.r, 32), s: hex(signature.s, 32), v: Number(signature.v ?? BigInt(signature.yParity! + 27)) as 27 | 28 } };
}
export async function verifyOffchainAttestation(attester: Address, signed: SignedOffchainAttestation, config: EasConfig): Promise<boolean> {
  try {
    if (signed.version !== 2 || signed.message.version !== 2 || signed.primaryType !== 'Attest' || signed.message.schema !== hex(config.ballotSchemaUid, 32)
      || canonicalJSON(signed.domain) !== canonicalJSON(easDomain(config)) || canonicalJSON(signed.types) !== canonicalJSON(attestTypes) || signed.uid !== offchainUID(signed.message)) return false;
    return await verifyTypedData({ address: attester, domain: easDomain(config), types: attestTypes, primaryType: 'Attest', message: typedMessage(signed.message),
      signature: serializeSignature({ r: signed.signature.r, s: signed.signature.s, v: BigInt(signed.signature.v) }) });
  } catch { return false; }
}
export function decodeBallot(data: Hex): { feastId: Hex; shutterIdentity: Hex; ciphertext: Hex; payloadVersion: number } {
  const [feastId, shutterIdentity, ciphertext, payloadVersion] = decodeAbiParameters(parseAbiParameters(ballotSchema), data);
  if (encodeAbiParameters(parseAbiParameters(ballotSchema), [feastId, shutterIdentity, ciphertext, payloadVersion]) !== data) throw new TypeError('Noncanonical scatter encoding');
  return { feastId, shutterIdentity, ciphertext, payloadVersion };
}
export * from './result.js';
export * from './reader.js';
export * from './transactions.js';
