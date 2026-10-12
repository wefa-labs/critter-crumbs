import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';

/* The dark look is a second set of values for some of the same tokens (decision of 2026-10-11, replacing Design System
   D1). Design System §12.2 asks 4.5 : 1 of text and 3 : 1 of an edge that carries meaning; both looks are held to it. */
const read = (name: string) => JSON.parse(readFileSync(new URL(`../src/styles/${name}`, import.meta.url), 'utf8')) as Record<string, string | number>;
const light = read('tokens.json'), dark = { ...light, ...read('tokens.dark.json') };
function colour(tokens: Record<string, string | number>, name: string): string {
  const value = String(tokens[name]), alias = /^var\(--cc-([a-z0-9-]+)\)$/.exec(value);
  return alias ? colour(tokens, alias[1]!) : value;
}
function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map(at => parseInt(hex.slice(at, at + 2), 16) / 255).map(part => part <= .03928 ? part / 12.92 : ((part + .055) / 1.055) ** 2.4);
  return .2126 * r! + .7152 * g! + .0722 * b!;
}
function contrast(tokens: Record<string, string | number>, front: string, back: string) {
  const [lighter, darker] = [luminance(colour(tokens, front)), luminance(colour(tokens, back))].sort((a, b) => b - a);
  return (lighter! + .05) / (darker! + .05);
}

test('the dark look only gives new values to tokens the light look already has', () => {
  expect(Object.keys(read('tokens.dark.json')).filter(name => !(name in light))).toEqual([]);
});

test.each([['light', light], ['dark', dark]] as const)('text reads on every ground of the %s look', (_name, tokens) => {
  for (const [front, back] of [['text', 'bg'], ['text', 'bg-raised'], ['text', 'bg-sunken'], ['text-2', 'bg'], ['text-2', 'bg-sunken'], ['text-3', 'bg'], ['action-text', 'action'], ['ok-text', 'ok-bg'], ['error-text', 'error-bg']] as const)
    expect(contrast(tokens, front, back), `${front} on ${back}`).toBeGreaterThanOrEqual(4.5);
});

test.each([['light', light], ['dark', dark]] as const)('outlines and the focus ring stand out from the page in the %s look', (_name, tokens) => {
  for (const [front, back] of [['line-strong', 'bg'], ['line-strong', 'bg-sunken'], ['focus', 'bg'], ['ok', 'bg'], ['error', 'bg']] as const)
    expect(contrast(tokens, front, back), `${front} on ${back}`).toBeGreaterThanOrEqual(3);
});

test('the dark page is dark and its text light, and the drawing ink stays dark in both', () => {
  expect(luminance(colour(dark, 'bg'))).toBeLessThan(.05);
  expect(luminance(colour(dark, 'text'))).toBeGreaterThan(.7);
  expect(colour(dark, 'ink')).toBe(colour(light, 'ink'));
});
