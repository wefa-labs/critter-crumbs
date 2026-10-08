// Version 1 is a line-for-line port of packages/core/src/generator/index.ts, frozen since the
// rehearsal build (D8); its vectors are in docs/research/generator-v1-vectors.md.
// Version 2 is the PR #31 prototype of Design System §5.2: the element is drawn first.

function cyrb53(value) {
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
function mulberry32(seed) {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
function draws(seedText) {
  const rng = mulberry32(cyrb53(seedText));
  const uniform = (min, max) => min + (max - min) * rng();
  function choice(values) {
    const draw = rng() * values.reduce((sum, entry) => sum + entry[1], 0);
    let threshold = 0;
    for (const [value, weight] of values) { threshold += weight; if (draw < threshold) return value; }
    throw new RangeError('Invalid generator weights');
  }
  return { rng, uniform, choice, equal: list => choice(list.map(value => [value, 1])) };
}

export function generate1(address, variant) {
  const { rng, uniform, choice } = draws(`${address.toLowerCase()}:${variant}:1`);
  return {
    version: 1,
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

export const ELEMENTS = {
  earth: { ears: ['leaf', 'round'], crests: [['sapling', 60], ['none', 40]], tails: ['branch', 'puff'], marking: 'moss', bands: [[130, 160], [60, 80]], glow: '#E9C46A', spot: 'chest' },
  water: { ears: ['fin', 'round'], crests: [['droplet', 50], ['reed', 50]], tails: ['tadpole', 'stub'], marking: 'dew', bands: [[180, 210]], glow: '#9FE1DC', spot: 'throat' },
  fire: { ears: ['flame', 'pointed'], crests: [['ember', 50], ['seedpods', 50]], tails: ['spark', 'emberwisp'], marking: 'belly', bands: [[20, 40], [40, 55]], glow: '#F28C38', spot: 'chest' },
  air: { ears: ['cloud', 'fern'], crests: [['none', 100]], tails: ['cloudwisp', 'longwisp'], marking: 'sky', bands: [[200, 220]], glow: '#BFE3F5', spot: 'brow' },
};

export function generate2(address, variant) {
  const { rng, uniform, choice, equal } = draws(`${address.toLowerCase()}:${variant}:2`);
  const element = equal(['earth', 'water', 'fire', 'air']), set = ELEMENTS[element];
  const params = {
    version: 2, element,
    bodyShape: choice([['egg', 35], ['bean', 25], ['capsule', 25], ['round', 15]]), bodyHeight: uniform(0.85, 1.25), bodyWidth: uniform(0.75, 1.15), belly: uniform(0, 0.30),
    headShape: choice([['round', 45], ['egg', 30], ['squarish', 25]]), headSize: uniform(0.50, 0.72), headTilt: uniform(-8, 8),
    earType: equal(set.ears), earSize: uniform(0.18, 0.50), earSpread: uniform(35, 75), crest: choice(set.crests),
    eyeStyle: choice([['round', 50], ['oval', 30], ['half-lid', 20]]), eyeSize: uniform(0.10, 0.20), eyeSpacing: uniform(0.32, 0.62), eyeHeight: uniform(0.45, 0.62), pupilSize: uniform(0.45, 0.70),
    snout: choice([['none', 40], ['button', 35], ['muzzle', 25]]), cheeks: rng() < 0.30, armType: choice([['stubs', 50], ['paws', 30], ['none', 20]]), legLength: uniform(0.15, 0.35),
    tailType: equal(set.tails), markings: choice([['none', 40], [set.marking, 60]]),
  };
  const band = set.bands[Math.floor(rng() * set.bands.length)];
  params.hue = uniform(band[0], band[1]); params.chroma = uniform(0.06, 0.13); params.lightness = uniform(0.58, 0.76); params.accentShift = uniform(15, 45); params.idlePhase = uniform(0, 1);
  params.glow = set.glow; params.spot = set.spot;
  return params;
}

/** packages/core layout(): continuous part sizes stay ratios; layout applies the parent size once. */
export function layout(params) {
  const yF = { egg: 1.25, bean: 1.10, capsule: 1.15, round: 1.00 }[params.bodyShape];
  const bh = 0.5 * params.bodyHeight * yF, bw = 0.5 * params.bodyWidth;
  const leg = params.legLength * params.bodyHeight, bodyC = 0.6 * leg + bh;
  const hr = 0.5 * params.headSize * params.bodyHeight, headC = bodyC + bh + 0.76 * hr;
  const earLen = params.earSize * 2 * hr * 1.8;
  return { yF, bh, bw, leg, bodyC, hr, headC, earLen };
}

// packages/app/src/portraits/colour.ts: OKLCH to sRGB, reducing only chroma until in gamut.
const multiply = (matrix, vector) => matrix.map(row => row[0] * vector[0] + row[1] * vector[1] + row[2] * vector[2]);
function linearRgb(lightness, chroma, hue) {
  const angle = hue * Math.PI / 180;
  const lms = multiply([[1, 0.3963377773761749, 0.2158037573099136], [1, -0.1055613458156586, -0.0638541728258133], [1, -0.0894841775298119, -1.2914855480194092]], [lightness, chroma * Math.cos(angle), chroma * Math.sin(angle)]);
  const xyz = multiply([[1.2268798758459243, -0.5578149944602171, 0.2813910456659647], [-0.0405757452148008, 1.112286803280317, -0.0717110580655164], [-0.0763729366746601, -0.4214933324022432, 1.5869240198367816]], lms.map(value => value ** 3));
  return multiply([[3.2409699419045226, -1.537383177570094, -0.4986107602930034], [-0.9692436362808796, 1.8759675015077202, 0.04155505740717559], [0.05563007969699366, -0.20397695888897652, 1.0569715142428786]], xyz);
}
export function colour(lightness, chroma, hue) {
  let low = 0, high = chroma, rgb = linearRgb(lightness, chroma, hue);
  const inGamut = values => values.every(value => value >= -1e-7 && value <= 1.0000001);
  if (!inGamut(rgb)) {
    for (let step = 0; step < 24; step++) {
      const candidate = (low + high) / 2;
      if (inGamut(linearRgb(lightness, candidate, hue))) low = candidate; else high = candidate;
    }
    rgb = linearRgb(lightness, low, hue);
  }
  rgb = rgb.map(value => Math.max(0, Math.min(1, value)));
  const css = '#' + rgb.map(value => Math.round(255 * (value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055)).toString(16).padStart(2, '0')).join('');
  return { linear: rgb, css };
}
/** Body and accent. Air's accent is the cream band (§4.4), as the PR #31 prototype draws it. */
export function palette(params) {
  const accent = params.element === 'air' ? colour(0.83, params.chroma, 80) : colour(params.lightness + 0.12, params.chroma, params.hue + params.accentShift);
  return { body: colour(params.lightness, params.chroma, params.hue), accent };
}
