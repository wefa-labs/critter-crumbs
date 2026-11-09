import { describe, expect, it } from 'vitest';
import { returnPath } from '../src/app/learn-return.js';
import { stepFrom } from '../src/app/learn-steps.js';

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

describe('coming back to the first steps', () => {
  it('finds the step they were left on, kept with their place in the history', () => {
    expect(stepFrom({ step: 3 })).toBe(3);
    expect(stepFrom({ from: '/feasts/0b1c', step: 4 })).toBe(4);
    expect(stepFrom({ from: '/', step: 0 })).toBe(0);
  });

  it('starts at the first step when they are opened afresh, or the place holds no step they have', () => {
    expect(stepFrom(null)).toBe(0);
    expect(stepFrom({ from: '/' })).toBe(0);
    expect(stepFrom({ step: 5 })).toBe(0);
    expect(stepFrom({ step: -1 })).toBe(0);
    expect(stepFrom({ step: 1.5 })).toBe(0);
    expect(stepFrom({ step: '3' })).toBe(0);
  });
});
