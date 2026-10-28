// WEFA reserved generator implementation; see LICENSE in this directory.
// Existing third-party hash and PRNG terms remain in force.
import { hex, integer } from '@critter-crumbs/shared';
import { generate, layout } from './index.js';

/** October review draw order; independent vectors captured from the design artifact. */
export const GEN_VERSION_2 = '2';
export type { CritterVersion } from '@critter-crumbs/shared';
import type { CritterVersion } from '@critter-crumbs/shared';
function cyrb53(value: string) {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < value.length; i++) {
    const ch = value.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}
function mulberry32(seed: number) {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
function draws(seedText: string) {
  const rng = mulberry32(cyrb53(seedText));
  const uniform = (min: number, max: number) => min + (max - min) * rng();
  function choice<const T extends string>(values: readonly (readonly [T, number])[]): T {
    const draw = rng() * values.reduce((sum, entry) => sum + entry[1], 0);
    let threshold = 0;
    for (const [value, weight] of values) { threshold += weight; if (draw < threshold) return value; }
    throw new RangeError('Invalid generator weights');
  }
  return { rng, uniform, choice, equal: <const T extends string>(list: readonly T[]) => choice(list.map(value => [value, 1])) };
}

const ELEMENTS = {
  earth: { ears: ['leaf', 'round'], crests: [['sapling', 60], ['none', 40]], tails: ['branch', 'puff'], marking: 'moss', bands: [[130, 160], [60, 80]], glow: '#E9C46A', spot: 'chest' },
  water: { ears: ['fin', 'round'], crests: [['droplet', 50], ['reed', 50]], tails: ['tadpole', 'stub'], marking: 'dew', bands: [[180, 210]], glow: '#9FE1DC', spot: 'throat' },
  fire: { ears: ['flame', 'pointed'], crests: [['ember', 50], ['seedpods', 50]], tails: ['spark', 'emberwisp'], marking: 'belly', bands: [[20, 40], [40, 55]], glow: '#F28C38', spot: 'chest' },
  air: { ears: ['cloud', 'fern'], crests: [['none', 100]], tails: ['cloudwisp', 'longwisp'], marking: 'sky', bands: [[200, 220]], glow: '#BFE3F5', spot: 'brow' },
} as const;

export function generate2(address: string, variant: number) {
  const input = hex(address, address.length === 42 ? 20 : 32);
  integer(variant, 0, 4);
  const { rng, uniform, choice, equal } = draws(`${input}:${variant}:2`);
  const element = equal(['earth', 'water', 'fire', 'air']), set = ELEMENTS[element];
  const params = {
    version: GEN_VERSION_2 as '2', element,
    bodyShape: choice([['egg', 35], ['bean', 25], ['capsule', 25], ['round', 15]]), bodyHeight: uniform(0.85, 1.25), bodyWidth: uniform(0.75, 1.15), belly: uniform(0, 0.30),
    headShape: choice([['round', 45], ['egg', 30], ['squarish', 25]]), headSize: uniform(0.50, 0.72), headTilt: uniform(-8, 8),
    earType: equal(set.ears), earSize: uniform(0.18, 0.50), earSpread: uniform(35, 75), crest: choice(set.crests),
    eyeStyle: choice([['round', 50], ['oval', 30], ['half-lid', 20]]), eyeSize: uniform(0.10, 0.20), eyeSpacing: uniform(0.32, 0.62), eyeHeight: uniform(0.45, 0.62), pupilSize: uniform(0.45, 0.70),
    snout: choice([['none', 40], ['button', 35], ['muzzle', 25]]), cheeks: rng() < 0.30, armType: choice([['stubs', 50], ['paws', 30], ['none', 20]]), legLength: uniform(0.15, 0.35),
    tailType: equal(set.tails), markings: choice([['none', 40], [set.marking, 60]]),
  };
  const band = set.bands[Math.floor(rng() * set.bands.length)]!;
  return { ...params, hue: uniform(band[0], band[1]), chroma: uniform(0.06, 0.13), lightness: uniform(0.58, 0.76), accentShift: uniform(15, 45), idlePhase: uniform(0, 1), glow: set.glow, spot: set.spot };
}


export function generateCritter(address: string, variant: number, version: CritterVersion = '1') {
  return version === '2' ? generate2(address, variant) : { ...generate(address, variant), version: '1' as const };
}
export type CritterV2 = ReturnType<typeof generate2>;
export type VersionedCritter = ReturnType<typeof generateCritter>;

/** Shared framing interface; v1 implementation and output remain frozen. */
export function layoutCritter(params: VersionedCritter) {
 if (params.version === '1') return layout(params);
 const yF = { egg: 1.25, bean: 1.10, capsule: 1.15, round: 1.00 }[params.bodyShape];
 const bh = .5 * params.bodyHeight * yF, bw = .5 * params.bodyWidth;
 const leg = params.legLength * params.bodyHeight, bodyC = .6 * leg + bh;
 const hr = .5 * params.headSize * params.bodyHeight, headC = bodyC + bh + .76 * hr;
 return { yF, bh, bw, leg, bodyC, hr, headC, earLen: params.earSize * 2 * hr * 1.8 };
}
