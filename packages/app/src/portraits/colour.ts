import type { CritterParameters } from '@critter-crumbs/core';

type Triple = [number, number, number];
const multiply = (matrix: Triple[], vector: Triple): Triple => matrix.map(row => row[0] * vector[0] + row[1] * vector[1] + row[2] * vector[2]) as Triple;
// CSS Color 4 §19 matrices. This renderer conversion does not alter GEN_VERSION 1.
function linear(lightness: number, chroma: number, hue: number): Triple {
  const angle = hue * Math.PI / 180;
  const lms = multiply([[1, 0.3963377773761749, 0.2158037573099136], [1, -0.1055613458156586, -0.0638541728258133], [1, -0.0894841775298119, -1.2914855480194092]], [lightness, chroma * Math.cos(angle), chroma * Math.sin(angle)]);
  const xyz = multiply([[1.2268798758459243, -0.5578149944602171, 0.2813910456659647], [-0.0405757452148008, 1.112286803280317, -0.0717110580655164], [-0.0763729366746601, -0.4214933324022432, 1.5869240198367816]], lms.map(value => value ** 3) as Triple);
  return multiply([[3.2409699419045226, -1.537383177570094, -0.4986107602930034], [-0.9692436362808796, 1.8759675015077202, 0.04155505740717559], [0.05563007969699366, -0.20397695888897652, 1.0569715142428786]], xyz);
}
/** Preserve lightness and hue, reducing only chroma until the colour fits sRGB. */
export function colour(lightness: number, chroma: number, hue: number) {
  let low = 0, high = chroma, rgb = linear(lightness, chroma, hue);
  const inGamut = (values: Triple) => values.every(value => value >= -1e-7 && value <= 1.0000001);
  if (!inGamut(rgb)) {
    for (let step = 0; step < 24; step++) {
      const candidate = (low + high) / 2;
      if (inGamut(linear(lightness, candidate, hue))) low = candidate; else high = candidate;
    }
    rgb = linear(lightness, low, hue);
  }
  rgb = rgb.map(value => Math.max(0, Math.min(1, value))) as Triple;
  const css = '#' + rgb.map(value => Math.round(255 * (value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055)).toString(16).padStart(2, '0')).join('');
  return { linear: rgb, css };
}
export function palette(params: CritterParameters) {
  return { body: colour(params.lightness, params.chroma, params.hue), accent: colour(params.lightness + 0.12, params.chroma, params.hue + params.accentShift) };
}
