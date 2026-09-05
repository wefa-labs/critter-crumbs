import { createRequire } from 'node:module';
import { encodeResult, decodeResult, resultSchema, schemaUID } from '@critter-crumbs/core';
import { expect, test } from 'vitest';
import { zeroAddress } from 'viem';
const require = createRequire(import.meta.url);
const { SchemaEncoder, SchemaRegistry } = require('@ethereum-attestation-service/eas-sdk') as typeof import('@ethereum-attestation-service/eas-sdk');
const input = { feastId: '00000000-0000-4000-8000-000000000001', publishedSetHash: `0x${'22'.repeat(32)}` as const, crumbsIssued: 100, scatterers: 2,
  targetIds: [`0x${'11'.repeat(32)}` as const], owners: [zeroAddress], crumbs: [200] };
test('eas result schema encoding cross-checks the SDK including position-ordered arrays', () => {
  const expected = new SchemaEncoder(resultSchema).encodeData([
    { name: 'feastId', type: 'bytes32', value: '0x27df9e4f396b049a38fecd6237c650c5df3f372785585cd7ced3fae81d61e5cd' },
    { name: 'publishedSetHash', type: 'bytes32', value: input.publishedSetHash }, { name: 'crumbsIssued', type: 'uint32', value: 100 },
    { name: 'scatterers', type: 'uint16', value: 2 }, { name: 'targetIds', type: 'bytes32[]', value: input.targetIds },
    { name: 'owners', type: 'address[]', value: input.owners }, { name: 'crumbs', type: 'uint32[]', value: input.crumbs },
  ]);
  expect(encodeResult(input)).toBe(expected);
  expect(schemaUID(resultSchema)).toBe(SchemaRegistry.getSchemaUID(resultSchema, zeroAddress, false));
  expect(decodeResult(encodeResult(input))).toEqual({ ...input, feastId: '0x27df9e4f396b049a38fecd6237c650c5df3f372785585cd7ced3fae81d61e5cd' });
});

test('eas prepares a nonrevocable zero-value result transaction without sending it', async () => {
  const { prepareResultTransaction } = await import('@critter-crumbs/core');
  const { EAS } = require('@ethereum-attestation-service/eas-sdk') as typeof import('@ethereum-attestation-service/eas-sdk');
  const address = '0x4200000000000000000000000000000000000021';
  const tx = prepareResultTransaction({ address, chainId: 84532, resultSchemaUid: schemaUID(resultSchema) }, input);
  const decoded = new EAS(address).contract.interface.decodeFunctionData('attest', tx.data!)[0];
  expect(tx.to).toBe(address); expect(tx.value).toBe(0n);
  expect(decoded.schema).toBe(schemaUID(resultSchema));
  expect(decoded.data.toObject()).toMatchObject({ recipient: zeroAddress, expirationTime: 0n, revocable: false, refUID: `0x${'00'.repeat(32)}`, data: encodeResult(input), value: 0n });
});

test('eas schema registration uses the SDK UID and nonrevocable resolver-free calldata', async () => {
  const { prepareSchemaRegistration } = await import('@critter-crumbs/core');
  const registry = new SchemaRegistry('0x4200000000000000000000000000000000000020');
  const prepared = prepareSchemaRegistration(resultSchema);
  const decoded = registry.contract.interface.decodeFunctionData('register', prepared.transaction.data!);
  expect([...decoded]).toEqual([resultSchema, zeroAddress, false]);
  expect(prepared.uid).toBe(SchemaRegistry.getSchemaUID(resultSchema, zeroAddress, false));
});
