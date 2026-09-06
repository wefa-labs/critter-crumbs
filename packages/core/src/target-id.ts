import { concatHex, keccak256, stringToHex, toHex } from 'viem';
import { integer, parseAddress, parseUuid, type Address } from '@critter-crumbs/shared';
export const personTargetId = (address: Address) => keccak256(stringToHex(parseAddress(address)));
export const optionTargetId = (feastId: string, index: number) => keccak256(concatHex([stringToHex(parseUuid(feastId)), toHex(integer(index, 0, 255), { size: 1 })]));
