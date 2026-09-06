import { hex, integer, parseAddress, type ResultAggregate, type Hex } from '@critter-crumbs/shared';
import { decodeAbiParameters, encodeAbiParameters, parseAbiParameters } from 'viem';
import { feastBytes32 } from './index.js';
export const resultSchema = 'bytes32 feastId, bytes32 publishedSetHash, uint32 crumbsIssued, uint16 scatterers, bytes32[] targetIds, address[] owners, uint32[] crumbs';
export interface ResultData extends Omit<ResultAggregate, 'feastId'> { feastId: string }
const parameters = parseAbiParameters(resultSchema);
function values(input: ResultData, feastId: Hex) {
  if (input.targetIds.length !== input.owners.length || input.targetIds.length !== input.crumbs.length) throw new TypeError('Mismatched result arrays');
  return [feastId, hex(input.publishedSetHash, 32), integer(input.crumbsIssued, 0, 4294967295), integer(input.scatterers, 0, 65535), input.targetIds.map(id => hex(id, 32)), input.owners.map(parseAddress), input.crumbs.map(n => integer(n, 0, 4294967295))] as const;
}
export function encodeResult(input: ResultData): Hex { return encodeAbiParameters(parameters, values(input, feastBytes32(input.feastId))); }
export function decodeResult(data: Hex): ResultData & { feastId: Hex } {
  const [feastId, publishedSetHash, crumbsIssued, scatterers, targetIds, owners, crumbs] = decodeAbiParameters(parameters, hex(data));
  const result = { feastId, publishedSetHash, crumbsIssued, scatterers, targetIds: [...targetIds], owners: [...owners], crumbs: [...crumbs] };
  if (encodeAbiParameters(parameters, values(result, feastId)) !== data.toLowerCase()) throw new TypeError('Noncanonical result encoding');
  return result;
}
