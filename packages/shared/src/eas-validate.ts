import { hex, integer, record, text, ValidationError } from './validate.js';
import type { Hex, SignedOffchainAttestation } from './types.js';
function fields(value: unknown, names: string[]) {
  const input = record(value);
  if (Object.keys(input).sort().join(',') !== [...names].sort().join(',')) throw new ValidationError();
  return input;
}
function wireHex(value: unknown, bytes?: number): Hex {
  const parsed = hex(value, bytes); if (value !== parsed) throw new ValidationError(); return parsed;
}
function uint64(value: unknown): string {
  if (typeof value !== 'string' || !/^(0|[1-9][0-9]*)$/.test(value) || value.length > 20 || BigInt(value) > 18446744073709551615n) throw new ValidationError();
  return value;
}
export function parseSignedOffchainAttestation(value: unknown): SignedOffchainAttestation {
  const input = fields(value, ['version', 'uid', 'domain', 'primaryType', 'types', 'message', 'signature']);
  const domain = fields(input.domain, ['name', 'version', 'chainId', 'verifyingContract']);
  const message = fields(input.message, ['version', 'schema', 'recipient', 'time', 'expirationTime', 'revocable', 'refUID', 'data', 'salt']);
  const signature = fields(input.signature, ['v', 'r', 's']), types = fields(input.types, ['Attest']);
  if (input.version !== 2 || message.version !== 2 || input.primaryType !== 'Attest' || typeof message.revocable !== 'boolean' || !Array.isArray(types.Attest) || types.Attest.length !== 9) throw new ValidationError();
  const Attest = types.Attest.map(value => {
    const field = fields(value, ['name', 'type']);
    if (typeof field.type !== 'string' || !['uint16', 'bytes32', 'address', 'uint64', 'bool', 'bytes'].includes(field.type)) throw new ValidationError();
    return { name: text(field.name, 1, 32), type: field.type as SignedOffchainAttestation['types']['Attest'][number]['type'] };
  });
  return { version: 2, uid: wireHex(input.uid, 32), primaryType: 'Attest', types: { Attest },
    domain: { name: text(domain.name, 1, 64), version: text(domain.version, 1, 16), chainId: integer(domain.chainId, 0, Number.MAX_SAFE_INTEGER), verifyingContract: wireHex(domain.verifyingContract, 20) },
    message: { version: 2, schema: wireHex(message.schema, 32), recipient: wireHex(message.recipient, 20), time: uint64(message.time), expirationTime: uint64(message.expirationTime),
      revocable: message.revocable, refUID: wireHex(message.refUID, 32), data: wireHex(message.data), salt: wireHex(message.salt, 32) },
    signature: { v: integer(signature.v, 27, 28) as 27 | 28, r: wireHex(signature.r, 32), s: wireHex(signature.s, 32) } };
}
