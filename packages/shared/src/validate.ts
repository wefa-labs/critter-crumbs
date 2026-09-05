import type { CopyId } from './copy.js';
import type { FeastSetup, Hex } from './types.js';

export class ValidationError extends Error {
  constructor(readonly copyId: CopyId = 'err.generic') { super(copyId); this.name = 'ValidationError'; }
}
export function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new ValidationError();
  return value as Record<string, unknown>;
}
export function text(value: unknown, min: number, max: number, id: CopyId = 'err.generic', trim = false): string {
  if (typeof value !== 'string') throw new ValidationError(id);
  const result = trim ? value.trim() : value;
  if (Array.from(result).length < min || Array.from(result).length > max) throw new ValidationError(id);
  return result;
}
export function integer(value: unknown, min: number, max: number, id: CopyId = 'err.generic'): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < min || value > max) throw new ValidationError(id);
  return value;
}
export function boolean(value: unknown): boolean {
  if (typeof value !== 'boolean') throw new ValidationError();
  return value;
}
export function hex(value: unknown, bytes?: number): Hex {
  if (typeof value !== 'string' || !/^0x(?:[0-9a-fA-F]{2})*$/.test(value) || (bytes !== undefined && value.length !== 2 + bytes * 2)) throw new ValidationError();
  return value.toLowerCase() as Hex;
}
export function parseFeastSetup(value: unknown): FeastSetup {
  const input = record(value);
  const kind = input.kind;
  if (kind !== 'people' && kind !== 'options') throw new ValidationError();
  const gatheringEndsAt = integer(input.gatheringEndsAt, 0, 8640000000000000, 'setup.deadline.order');
  const scatteringEndsAt = integer(input.scatteringEndsAt, 0, 8640000000000000, 'setup.deadline.order');
  if (gatheringEndsAt >= scatteringEndsAt) throw new ValidationError('setup.deadline.order');
  const aggregatePublic = boolean(input.aggregatePublic), individualOpen = boolean(input.individualOpen);
  if (!aggregatePublic && individualOpen) throw new ValidationError('setup.privacy.individual.locked');
  const options: FeastSetup['options'] = [];
  if (kind === 'options') {
    if (!Array.isArray(input.options) || input.options.length === 0 || input.options.length > 256) throw new ValidationError('setup.options.title');
    for (const option of input.options) {
      const item = record(option), name = text(item.name, 1, 80, 'setup.option.name', true);
      if (options.some(existing => existing.name.toLowerCase() === name.toLowerCase())) throw new ValidationError('setup.option.name');
      options.push({ name, statement: text(item.statement ?? '', 0, 2000, 'gathering.limit') });
    }
  }
  return { title: text(input.title, 1, 80, 'setup.field.title', true), context: text(input.context ?? '', 0, 140), kind,
    crumbsPerCritter: integer(input.crumbsPerCritter ?? 100, 10, 1000, 'setup.crumbs.help'),
    gatheringEndsAt, scatteringEndsAt, aggregatePublic, individualOpen, options };
}
export function parseAddress(value: unknown): Hex { return hex(value, 20); }
export function parseUuid(value: unknown): string {
  if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) throw new ValidationError();
  return value.toLowerCase();
}
export function parseProfileUpdate(value: unknown): { displayName?: string; variant?: number; keepCritter?: true } {
  const input = record(value), result: { displayName?: string; variant?: number; keepCritter?: true } = {};
  if (input.displayName !== undefined) result.displayName = text(input.displayName, 1, 80, 'name.label', true);
  if (input.variant !== undefined) result.variant = integer(input.variant, 0, 4);
  if (input.keepCritter !== undefined) { if (input.keepCritter !== true) throw new ValidationError(); result.keepCritter = true; }
  return result;
}
export function parseStatement(value: unknown): string { return text(value, 0, 2000, 'gathering.limit'); }
export function parseAllocationPayload(value: unknown): import('./types.js').AllocationPayload {
  const input = record(value);
  if (Object.keys(input).sort().join(',') !== 'allocation,feast,nonce,participants,scatterer,v') throw new ValidationError();
  if (input.v !== 1 || !Array.isArray(input.allocation) || typeof input.nonce !== 'string' || !/^[0-9a-f]{16}$/i.test(input.nonce)) throw new ValidationError();
  const allocation: [Hex, number][] = input.allocation.map((entry: unknown) => {
    if (!Array.isArray(entry) || entry.length !== 2) throw new ValidationError();
    return [hex(entry[0], 32), integer(entry[1], 0, 1000)];
  });
  return { v: 1, feast: parseUuid(input.feast), scatterer: parseAddress(input.scatterer), participants: hex(input.participants, 32), allocation, nonce: input.nonce.toLowerCase() };
}
export function parseSequence(value: unknown): string {
  if (typeof value !== 'string' || !/^[1-9][0-9]*$/.test(value) || value.length > 19 || BigInt(value) > 9223372036854775807n) throw new ValidationError();
  return value;
}
