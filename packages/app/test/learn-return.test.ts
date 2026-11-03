import { describe, expect, it } from 'vitest';
import { returnPath } from '../src/app/learn-return.js';

describe('leaving the first steps', () => {
  it('returns to the screen that opened them', () => {
    expect(returnPath({ from: '/feasts/0b1c' })).toBe('/feasts/0b1c');
    expect(returnPath({ from: '/burrows/9f2e' })).toBe('/burrows/9f2e');
    expect(returnPath({ from: '/' })).toBe('/');
  });

  it('leads to the launcher when they were opened by their own address, with nothing recorded', () => {
    expect(returnPath(null)).toBe('/');
    expect(returnPath(undefined)).toBe('/');
    expect(returnPath({})).toBe('/');
    expect(returnPath({ from: 7 })).toBe('/');
  });

  it('never leads back into the steps, or off the site', () => {
    expect(returnPath({ from: '/how-it-works' })).toBe('/');
    expect(returnPath({ from: 'https://example.com/' })).toBe('/');
    expect(returnPath({ from: '//example.com/' })).toBe('/');
    expect(returnPath({ from: 'feasts/0b1c' })).toBe('/');
  });
});
