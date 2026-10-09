import { expect, test } from 'vitest';
import { cutsOf, planSamples, planToken, pentatonicFrequency, soundTokens, variation, createPourSchedule } from '../src/audio/plan.js';
import { SAMPLES, type SampleName } from '../src/audio/assets.js';
import { createSoundEngine } from '../src/audio/engine.js';
import type { SoundToken } from '../src/world/index.js';
import { downstream, fakeAudio, fakeBuffer } from './fake-audio.js';

/* The settled set (docs/explorations/sound-direction-2026-10.md): recorded sounds where a take was chosen,
   bright synth bells for the crumbs; every cue keeps a synth version for before its sample has loaded. */
test('crumbs ring as bright bells on their pentatonic step; taking one back is the softer bell', () => {
  const add = planToken('crumb.add', { pitchStep: 4, random: () => .5 }), remove = planToken('crumb.remove', { pitchStep: 3, random: () => .5 });
  expect(add[0]).toMatchObject({ voice: 'bell', frequency: pentatonicFrequency(4) });
  expect(remove[0]).toMatchObject({ voice: 'bell', frequency: pentatonicFrequency(3) });
  expect(remove[0]!.gain).toBeLessThan(add[0]!.gain);
  expect(planToken('connect', { random: () => .5 }).map(note => note.voice)).toEqual(['bell', 'bell']);
});
test('cues with a chosen recording name their samples, each landing at the cue’s level', () => {
  expect(planSamples('ui.tap').map(trigger => trigger.sample)).toEqual(['pop']);
  expect(planSamples('reroll').map(trigger => trigger.sample)).toEqual(['spin']);
  expect(planSamples('pile.wall').map(trigger => trigger.sample)).toEqual(['boing']);
  expect(planSamples('statement.open').map(trigger => trigger.sample)).toEqual(['page']);
  expect(planSamples('scatter.confirm').map(trigger => trigger.sample)).toEqual(['scattered']);
  expect(planSamples('statements.reveal').map(trigger => trigger.sample)).toEqual(['reveal']);
  expect(planSamples('feast.open').map(trigger => trigger.sample)).toEqual(['feast']);
  expect(planSamples('feast.feed').map(trigger => trigger.sample)).toEqual(['munch']);
  expect(planSamples('feast.settle').map(trigger => trigger.sample)).toEqual(['feast-resolve', 'cheer']);
  expect(planSamples('crumb.add')).toEqual([]);
  const [pop] = planSamples('ui.tap', { level: -20 });
  expect(20 * Math.log10(pop!.gain) + SAMPLES.pop.peakDb).toBeCloseTo(-20, 9);
});
test('scattering closing with the scatter screen open has its own cue: the dusk sting', () => {
  expect(soundTokens['scatter.closed'].db).toBeLessThan(0);
  expect(planSamples('scatter.closed').map(trigger => trigger.sample)).toEqual(['dusk']);
});
/* Game Design §2.6: a typed amount is a short pour, not nothing and not thirty-three taps. */
test('a typed amount is a short run of bells stepping to where the count lands: up for giving, down for taking back', () => {
  const up = planToken('pour.hold', { pitchStep: 6, durationMs: 320, random: () => .5 }), down = planToken('pour.reverse', { pitchStep: 2, durationMs: 320, random: () => .5 });
  expect(up.map(note => note.voice)).toEqual(['bell', 'bell', 'bell', 'bell']);
  expect(up.map(note => note.frequency)).toEqual([3, 4, 5, 6].map(pentatonicFrequency));
  expect(down.map(note => note.frequency)).toEqual([5, 4, 3, 2].map(pentatonicFrequency));
  up.forEach((note, index) => expect(note.at).toBeCloseTo(index * .08, 9));
  const one = planToken('pour.hold', { pitchStep: 6, durationMs: 8, random: () => .5 });
  expect(one.map(note => note.frequency)).toEqual([pentatonicFrequency(6)]);
});
test('the settle fades the feast cue under its fanfare', () => {
  expect(cutsOf('feast.settle')).toEqual(['feast']);
  expect(cutsOf('feast.feed')).toEqual([]);
});

/** A sound engine over recorded stand-ins: `loaded` are the recordings that have arrived. */
function engineRig(loaded: Partial<Record<SampleName, AudioBuffer>> = {}) {
  const audio = fakeAudio(), engine = createSoundEngine(audio.context, audio.context.destination, () => .5, name => loaded[name]);
  const trigger = (token: SoundToken, level: number = soundTokens[token].db) => engine.cue({ token, pitchStep: 2, level, action: 'trigger', durationMs: 0 }, audio.context.currentTime);
  return { audio, engine, trigger };
}
test('a cue plays its recording at the cue’s level once the file has arrived, and its synth version until then', () => {
  const pop = fakeBuffer(.8), arrived = engineRig({ pop }), waiting = engineRig();
  arrived.trigger('ui.tap'); waiting.trigger('ui.tap');
  expect(arrived.audio.playing(pop)).toHaveLength(1);
  expect(arrived.audio.oscillators).toHaveLength(0);
  expect(20 * Math.log10(downstream(arrived.audio.playing(pop)[0]!).gain.value) + SAMPLES.pop.peakDb).toBeCloseTo(soundTokens['ui.tap'].db, 9);
  expect(waiting.audio.oscillators.length).toBeGreaterThan(0);
});
test('at the feast a critter nibbles and its bell still rings', () => {
  const munch = fakeBuffer(1.36), { audio, trigger } = engineRig({ munch });
  trigger('feast.feed');
  expect(audio.playing(munch)).toHaveLength(1);
  expect(audio.oscillators.length).toBeGreaterThan(0);
});
/* The feast cue is ten seconds and the settle comes when the last critter is fed, so the fanfare lands on the settle and the cue fades under it. */
test('the settle lands the fanfare, cheers a moment later and fades the feast cue under them', () => {
  const feast = fakeBuffer(9.58), resolve = fakeBuffer(3.01), cheer = fakeBuffer(2.48), { audio, engine, trigger } = engineRig({ feast, 'feast-resolve': resolve, cheer });
  trigger('feast.open');
  expect(engine.musicalUntil()).toBeCloseTo(9.6, 9);
  audio.advance(5.45); trigger('feast.settle');
  const cue = audio.playing(feast)[0]!;
  expect(cue.stoppedAt).toBeGreaterThan(5.45);
  expect(cue.stoppedAt).toBeLessThan(5.45 + .5);
  expect(audio.playing(resolve)[0]!.startedAt).toBeCloseTo(5.47, 9);
  expect(audio.playing(cheer)[0]!.startedAt).toBeCloseTo(5.82, 9);
  expect(downstream(audio.playing(cheer)[0]!).gain.value).toBeLessThan(downstream(audio.playing(resolve)[0]!).gain.value);
  expect(audio.oscillators).toHaveLength(0);
  expect(engine.musicalUntil()).toBeCloseTo(5.47 + 3.01, 9);
});
test('the loops wait on a sting or the feast cue, never on an effect; stopping frees them at once', () => {
  const pop = fakeBuffer(.8), scattered = fakeBuffer(3.01), { audio, engine, trigger } = engineRig({ pop, scattered });
  trigger('ui.tap');
  expect(engine.musicalUntil()).toBe(0);
  trigger('scatter.confirm');
  expect(engine.musicalUntil()).toBeCloseTo(3.03, 9);
  audio.advance(1); engine.stop(1);
  expect(engine.musicalUntil()).toBe(0);
  /* leaving a screen fades a sting still ringing over a quarter of a second; it is never cut dead */
  const sting = audio.playing(scattered)[0]!;
  expect(sting.stoppedAt).toBeCloseTo(1.25, 9);
  expect(downstream(sting).gain.events.at(-1)).toMatchObject({ kind: 'ramp', value: 0, at: 1.25 });
});
test('skipping the feast stops its cue within 100 ms', () => {
  const feast = fakeBuffer(9.58), { audio, engine, trigger } = engineRig({ feast });
  trigger('feast.open'); audio.advance(2);
  engine.cue({ token: 'feast.open', pitchStep: 0, level: 0, action: 'stop', durationMs: 100 }, 2);
  expect(audio.playing(feast)[0]!.stoppedAt).toBeCloseTo(2.1, 9);
  expect(engine.musicalUntil()).toBe(0);
});
/* A public result opens already skipped: the feast begins and is skipped in one tick, and must make no sound. */
test('a stop that lands before a recording has begun cancels it outright', () => {
  const feast = fakeBuffer(9.58), { audio, engine, trigger } = engineRig({ feast });
  trigger('feast.open');
  engine.cue({ token: 'feast.open', pitchStep: 0, level: 0, action: 'stop', durationMs: 100 }, 0);
  const cue = audio.playing(feast)[0]!;
  expect(cue.startedAt).toBeCloseTo(.02, 9);
  expect(cue.stoppedAt).toBeLessThanOrEqual(cue.startedAt!);
  expect(cue.outputs).toHaveLength(0);
  expect(engine.musicalUntil()).toBe(0);
});
/* A suspended context freezes its clock, so a fade still running when the tab is hidden would play when it returns. */
test('when the tab is hidden every sound ends at once, leaving no fade to play on return', () => {
  const scattered = fakeBuffer(3.01), { audio, engine, trigger } = engineRig({ scattered });
  trigger('scatter.confirm');
  audio.advance(.9); trigger('feast.open');
  const standIn = audio.oscillators.filter(voice => voice.startedAt! >= .9);
  expect(standIn.length).toBeGreaterThan(0);
  audio.advance(1); engine.silence(1);
  expect(audio.playing(scattered)[0]!.stoppedAt).toBe(1);
  for (const voice of standIn) expect(voice.stoppedAt).toBe(1);
  expect(engine.inspect()).toMatchObject({ activeVoices: 0, recordings: 0 });
  expect(engine.musicalUntil()).toBe(0);
});
test('one recording never piles up more than four deep: a fifth nibble fades the first', () => {
  const munch = fakeBuffer(1.36), { audio, trigger } = engineRig({ munch });
  for (let i = 0; i < 5; i++) { audio.advance(i * .1); trigger('feast.feed'); }
  const nibbles = audio.playing(munch);
  expect(nibbles).toHaveLength(5);
  expect(nibbles[0]!.stoppedAt).toBeGreaterThan(.4);
  expect(nibbles[0]!.stoppedAt).toBeLessThan(.6);
  expect(nibbles.slice(1).every(nibble => nibble.stoppedAt === null)).toBe(true);
});
/* Sound direction: rising bell grains over a sparkle bed; the breath stands in until the sparkle has loaded. */
test('a pour plays its bell grains over the sparkle loop, which ends with the pour', () => {
  const sparkle = fakeBuffer(1.7), { audio, engine } = engineRig({ sparkle });
  engine.cue({ token: 'pour.hold', pitchStep: 2, level: -14, action: 'start', durationMs: 0, rate: 20 }, 0); engine.pump(0);
  expect(audio.playing(sparkle).map(pass => pass.startedAt)).toEqual([.02]);
  audio.advance(.1); engine.pump(.1);
  expect(audio.playing(sparkle)).toHaveLength(2);
  expect(audio.playing(sparkle)[1]!.startedAt).toBeCloseTo(.02 + 1.7 - .425, 9);
  expect(audio.oscillators.length).toBeGreaterThan(0);
  engine.cue({ token: 'pour.hold', pitchStep: 2, level: -14, action: 'stop', durationMs: 60 }, .5);
  for (const pass of audio.playing(sparkle)) expect(pass.stoppedAt).toBeCloseTo(.56, 9);
  expect(engine.inspect().pouring).toBe(false);
});
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
  expect(variation('bell', () => 1)).toEqual({ cents: 10, gain: 1.08, delay: .01 });
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
