import { describe, expect, it } from 'vitest';
import vectors from './fixtures/generator-v2.json' with { type: 'json' };
import { generateCritter, GEN_VERSION_2 } from '../src/generator/versioned.js';
import { generate, GEN_VERSION } from '../src/generator/index.js';

describe('versioned critter generation', () => {
  it('matches the ten independently captured October review critters', () => {
    expect(GEN_VERSION_2).toBe('2');
    for (const vector of vectors) expect(generateCritter(vector.address, vector.variant, '2')).toEqual(vector.params);
  });
  it('keeps the frozen v1 interface and defaults new callers to v1', () => {
    expect(GEN_VERSION).toBe('1');
    expect(generateCritter(vectors[0]!.address, 0)).toEqual({ ...generate(vectors[0]!.address, 0), version: '1' });
  });
});
