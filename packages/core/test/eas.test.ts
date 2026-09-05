import { createRequire } from 'node:module';
import { createLocalAccount, easDomain, signBallot, offchainUID, encodeBallot, ballotSchema, schemaUID, verifyOffchainAttestation } from '@critter-crumbs/core';
import { expect, test } from 'vitest';
import type { Hex } from '@critter-crumbs/shared';
const require = createRequire(import.meta.url);
const { Offchain, EAS, SchemaEncoder, SchemaRegistry } = require('@ethereum-attestation-service/eas-sdk') as typeof import('@ethereum-attestation-service/eas-sdk');
const { Wallet, Signature } = createRequire(require.resolve('@ethereum-attestation-service/eas-sdk'))('ethers') as typeof import('ethers');
const privateKey = `0x${'0'.repeat(63)}1` as Hex;
const schema = '0xb8e0cf5878dabf520b1e519ec026c9cc609c6feb255829ada0b6525f9b6ca236';
const address = '0x4200000000000000000000000000000000000021';
const input = { feastId: '00000000-0000-4000-8000-000000000001', shutterIdentity: `0x${'22'.repeat(32)}` as Hex, ciphertext: '0x1234abcd' as Hex, now: 1788566400000, salt: `0x${'66'.repeat(32)}` as Hex };

test.each([8453, 84532] as const)('eas SDK cross-check matches ballot encoding, v2 UID and signatures on chain %s', async chainId => {
  const config = { chainId, address, ballotSchemaUid: schema } as const;
  const signed = await signBallot(createLocalAccount(privateKey), config, input);
  const message = { ...signed.message, time: BigInt(signed.message.time), expirationTime: BigInt(signed.message.expirationTime) };
  const reference = new Offchain({ address, version: '0.26', chainId: BigInt(chainId) }, 2, new EAS(address));
  const fromSdk = await reference.signOffchainAttestation(message, new Wallet(privateKey), { verifyOnchain: false });
  const encoded = new SchemaEncoder(ballotSchema).encodeData([
    { name: 'feastId', type: 'bytes32', value: '0x27df9e4f396b049a38fecd6237c650c5df3f372785585cd7ced3fae81d61e5cd' },
    { name: 'shutterIdentity', type: 'bytes32', value: input.shutterIdentity },
    { name: 'ciphertext', type: 'bytes', value: input.ciphertext }, { name: 'payloadVersion', type: 'uint32', value: 1 },
  ]);
  expect(encodeBallot(input)).toBe(encoded);
  expect(schemaUID(ballotSchema)).toBe(SchemaRegistry.getSchemaUID(ballotSchema, '0x0000000000000000000000000000000000000000', false));
  expect(schemaUID(ballotSchema)).toBe(schema);
  expect(signed.domain).toEqual(easDomain(config));
  expect(signed.uid).toBe('0x0743b0d2869abe3212b0594be14fcf17988ca712b411989e4c6f149e24e8df24');
  expect(offchainUID(signed.message)).toBe(fromSdk.uid);
  expect(Signature.from(signed.signature).serialized).toBe(Signature.from(fromSdk.signature).serialized);
  expect(reference.verifyOffchainAttestationSignature(new Wallet(privateKey).address, { ...signed, domain: { ...signed.domain, chainId: BigInt(chainId) }, message })).toBe(true);
  expect(await verifyOffchainAttestation(createLocalAccount(privateKey).address, signed, config)).toBe(true);
});

test('eas UID is stable across signer and chain while signatures bind both', async () => {
  const first = await signBallot(createLocalAccount(privateKey), { chainId: 8453, address, ballotSchemaUid: schema }, input);
  const other = await signBallot(createLocalAccount(`0x${'0'.repeat(63)}2`), { chainId: 84532, address, ballotSchemaUid: schema }, input);
  expect(first.uid).toBe(other.uid); expect(first.signature).not.toEqual(other.signature);
  const changed = await signBallot(createLocalAccount(privateKey), { chainId: 8453, address, ballotSchemaUid: schema }, { ...input, ciphertext: '0x1234abce' });
  expect(changed.uid).not.toBe(first.uid);
});
test('eas enforces the pinned domain even when the SDK compatibility verifier accepts another version', async () => {
  const config = { chainId: 8453, address, ballotSchemaUid: schema } as const, account = createLocalAccount(privateKey);
  const signed = await signBallot(account, config, input);
  const message = { ...signed.message, time: BigInt(signed.message.time), expirationTime: BigInt(signed.message.expirationTime) };
  const other = new Offchain({ address, version: '1.0.0', chainId: 8453n }, 2, new EAS(address));
  const changed = await other.signOffchainAttestation(message, new Wallet(privateKey), { verifyOnchain: false });
  const reference = new Offchain({ address, version: '0.26', chainId: 8453n }, 2, new EAS(address));
  expect(reference.verifyOffchainAttestationSignature(account.address, changed)).toBe(true);
  expect(await verifyOffchainAttestation(account.address, { ...signed, domain: { ...signed.domain, version: '1.0.0' }, signature: { ...changed.signature, r: changed.signature.r as Hex, s: changed.signature.s as Hex, v: changed.signature.v as 27 | 28 } }, config)).toBe(false);
});
