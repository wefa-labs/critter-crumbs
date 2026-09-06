import { encodeFunctionData, parseAbi, zeroAddress, zeroHash } from 'viem';
import { hex, parseAddress, type Address, type Hex } from '@critter-crumbs/shared';
import type { TxRequest } from '../account/index.js';
import { easDomain, schemaUID } from './index.js';
import { easAbi } from './reader.js';
import { encodeResult, type ResultData } from './result.js';
export function prepareResultTransaction(config: { chainId: 8453 | 84532; address: Address; resultSchemaUid: Hex }, input: ResultData): TxRequest {
  easDomain(config);
  return { to: parseAddress(config.address), value: 0n, data: encodeFunctionData({ abi: easAbi, functionName: 'attest', args: [{ schema: hex(config.resultSchemaUid, 32),
    data: { recipient: zeroAddress, expirationTime: 0n, revocable: false, refUID: zeroHash, data: encodeResult(input), value: 0n } }] }) };
}
export function prepareSchemaRegistration(schema: string): { uid: Hex; transaction: TxRequest } {
  return { uid: schemaUID(schema), transaction: { to: '0x4200000000000000000000000000000000000020', value: 0n,
    data: encodeFunctionData({ abi: parseAbi(['function register(string schema,address resolver,bool revocable) returns (bytes32)']), functionName: 'register', args: [schema, zeroAddress, false] }) } };
}
