import { hex, integer } from '@critter-crumbs/shared';

export const GEN_VERSION = '1';
// bryc's cyrb53 and Tommy Ettinger's mulberry32; provenance and independent vectors
// are recorded in docs/research/generator-v1-vectors.md. Preserve operation order.
function cyrb53(value: string): number {
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
function mulberry32(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
/** Continuous part sizes remain ratios; layout applies the parent size once. */
export function generate(address: string, variant: number) {
  const input = hex(address, address.length === 42 ? 20 : 32);
  integer(variant, 0, 4);
  const rng = mulberry32(cyrb53(`${input}:${variant}:${GEN_VERSION}`));
  const uniform = (min: number, max: number) => min + (max - min) * rng();
  function choice<const T extends string>(values: readonly (readonly [T, number])[]): T {
    const draw = rng() * values.reduce((sum, entry) => sum + entry[1], 0);
    let threshold = 0;
    for (const [value, weight] of values) { threshold += weight; if (draw < threshold) return value; }
    throw new RangeError('Invalid generator weights');
  }
  return {
    bodyShape: choice([['egg', 35], ['bean', 25], ['capsule', 25], ['round', 15]]),
    bodyHeight: uniform(0.85, 1.25), bodyWidth: uniform(0.75, 1.15), belly: uniform(0, 0.30),
    headShape: choice([['round', 45], ['egg', 30], ['squarish', 25]]),
    headSize: uniform(0.50, 0.72), headTilt: uniform(-8, 8),
    earType: choice([['round', 1], ['pointed', 1], ['long', 1], ['floppy', 1], ['tufts', 1], ['none', 1]]),
    earSize: uniform(0.18, 0.50), earSpread: uniform(35, 75),
    eyeStyle: choice([['round', 50], ['oval', 30], ['half-lid', 20]]),
    eyeSize: uniform(0.10, 0.20), eyeSpacing: uniform(0.32, 0.62), eyeHeight: uniform(0.45, 0.62), pupilSize: uniform(0.45, 0.70),
    snout: choice([['none', 40], ['button', 35], ['muzzle', 25]]), cheeks: rng() < 0.30,
    armType: choice([['stubs', 50], ['paws', 30], ['none', 20]]), legLength: uniform(0.15, 0.35),
    tailType: choice([['none', 30], ['puff', 25], ['curl', 25], ['stub', 20]]),
    markings: choice([['none', 55], ['belly patch', 25], ['spots', 20]]),
    hue: uniform(0, 360), chroma: uniform(0.06, 0.13), lightness: uniform(0.58, 0.76), accentShift: uniform(15, 45), idlePhase: uniform(0, 1),
  };
}
export type CritterParameters = ReturnType<typeof generate>;
export function layout(params: CritterParameters) {
  const yF = { egg: 1.25, bean: 1.10, capsule: 1.15, round: 1.00 }[params.bodyShape];
  const bh = 0.5 * params.bodyHeight * yF, bw = 0.5 * params.bodyWidth;
  const leg = params.legLength * params.bodyHeight, bodyC = 0.6 * leg + bh;
  const hr = 0.5 * params.headSize * params.bodyHeight, headC = bodyC + bh + 0.76 * hr;
  const earLen = params.earSize * 2 * hr * 1.8;
  return { yF, bh, bw, leg, bodyC, hr, headC, earLen };
}
