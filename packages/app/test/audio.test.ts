import { expect, test } from 'vitest';
import { planToken, pentatonicFrequency, soundTokens, variation, createPourSchedule } from '../src/audio/plan.js';
test('all finite tokens stay inside their declared envelope and peak with bounded microvariation', () => {
  for (const token of Object.keys(soundTokens) as (keyof typeof soundTokens)[]) {
    const definition = soundTokens[token]; if (!definition.ms) continue;
    for (const random of [() => 0, () => .5, () => 1]) {
      const notes = planToken(token, { pitchStep: 2, random });
      expect(notes.length).toBeGreaterThan(0);
      expect(Math.max(...notes.map(note => note.at + note.duration))).toBeLessThanOrEqual(definition.ms / 1000 + .01 + 1e-9);
      expect(notes.reduce((sum, note) => sum + note.gain, 0)).toBeLessThanOrEqual(10 ** (definition.db / 20) + 1e-12);
    }
  }
  expect(variation('tick', () => 0)).toEqual({ cents: -25, gain: .92, delay: -.01 });
  expect(variation('pluck', () => 1)).toEqual({ cents: 10, gain: 1.08, delay: .01 });
});
test('pentatonic pitch maps5percent steps to the capped tenth degree', () => {
  const steps = [0,2,4,7,9,12,14,16,19,21,24];
  steps.forEach((semitones, index) => expect(pentatonicFrequency(index)).toBeCloseTo(261.625565 * 2 ** (semitones / 12), 6));
  expect(pentatonicFrequency(100)).toBe(pentatonicFrequency(10));
});
test('pour schedules bounded lookahead grains, changes rate and stops after release', () => {
  const pour = createPourSchedule(); pour.start(0, 8);
  expect(pour.grains(.02)).toEqual([0]); expect(pour.grains(.1)).toEqual([]);
  expect(pour.grains(.125)).toEqual([.125]); pour.rate(40);
  expect(pour.grains(.3).length).toBeGreaterThan(1); pour.stop(); expect(pour.grains(2)).toEqual([]);
  pour.start(10, 40); expect(pour.grains(10.02)).toEqual([10]);
});
