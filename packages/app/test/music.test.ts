import { expect, test } from 'vitest';
import { MUSIC, type MusicTrack } from '../src/audio/assets.js';
import { createAudioBank } from '../src/audio/bank.js';
import { createMusicPlayer } from '../src/audio/music.js';
import { crossfadeFor, equalPower, MUSIC_MIX, nextStart } from '../src/audio/music-plan.js';
import { renderLoop } from '../src/audio/playback.js';
import { screenMusic } from '../src/app/screen-music.js';
import { downstream, fakeAudio, fakeBuffer } from './fake-audio.js';

test('a loop starts its next pass one crossfade before it ends; short loops crossfade over a quarter of their length', () => {
  expect(nextStart(10, 86.3, 2)).toBeCloseTo(94.3, 9);
  expect(crossfadeFor(86.3)).toBe(2);
  expect(crossfadeFor(1.7)).toBeCloseTo(.425, 9);
});

test('equal-power fades keep the summed power constant through a crossfade', () => {
  const up = equalPower(33, true), down = equalPower(33, false);
  expect([up[0], up[32], down[0]]).toEqual([0, 1, 1]);
  expect(down[32]).toBeCloseTo(0, 9);
  for (let i = 0; i < 33; i++) expect(up[i]! ** 2 + down[i]! ** 2).toBeCloseTo(1, 6);
});

test('a sound loads once however often it is asked for, and a missing file stays silent', async () => {
  let fetched = 0;
  const bank = createAudioBank({
    fetch: async url => { fetched++; if (url.includes('missing')) throw new Error('404'); return new ArrayBuffer(8); },
    decode: async bytes => ({ duration: bytes.byteLength }) as unknown as AudioBuffer,
  });
  const [first, second] = await Promise.all([bank.load('/audio/sfx/pop.mp3'), bank.load('/audio/sfx/pop.mp3')]);
  expect(first).toBe(second); expect(fetched).toBe(1);
  expect(bank.get('/audio/sfx/pop.mp3')).toBe(first);
  expect(await bank.load('/audio/missing.mp3')).toBeNull();
  expect(bank.get('/audio/missing.mp3')).toBeUndefined();
});

test('a sound that failed to load is tried again when next asked for, and a released one loads afresh', async () => {
  let fetched = 0, online = false;
  const bank = createAudioBank({
    fetch: async () => { fetched++; if (!online) throw new Error('offline'); return new ArrayBuffer(8); },
    decode: async bytes => fakeBuffer(bytes.byteLength),
  });
  expect(await bank.load('/audio/sfx/pop.mp3')).toBeNull();
  online = true;
  const loaded = await bank.load('/audio/sfx/pop.mp3');
  expect(loaded).not.toBeNull(); expect(fetched).toBe(2);
  bank.release('/audio/sfx/pop.mp3');
  expect(bank.get('/audio/sfx/pop.mp3')).toBeUndefined();
  expect(await bank.load('/audio/sfx/pop.mp3')).not.toBe(loaded); expect(fetched).toBe(3);
});

/* Game Design G8: two overlapping passes with an equal-power crossfade, so the file's seam need not be perfect. */
test('a loop keeps one pass scheduled ahead; each later pass rises as the one before it falls', () => {
  const audio = fakeAudio(), out = audio.context.createGain();
  const loop = renderLoop(audio.context, out, fakeBuffer(10), 1);
  loop.pump(0);
  expect(audio.sources.map(pass => pass.startedAt)).toEqual([1]);
  loop.pump(.9);
  expect(audio.sources).toHaveLength(1);
  loop.pump(1);
  expect(audio.sources.map(pass => pass.startedAt)).toEqual([1, 9]);
  loop.pump(9);
  expect(audio.sources.map(pass => pass.startedAt)).toEqual([1, 9, 17]);
  const fades = audio.sources.map(pass => downstream(pass).gain.events.map(event => [event.kind, event.at, event.span]));
  expect(fades[0]).toEqual([['fall', 9, 2]]);
  expect(fades[1]).toEqual([['rise', 9, 2], ['fall', 17, 2]]);
  for (const pass of audio.sources) expect(downstream(pass, 2)).toBe(out);
});

test('a stopped loop ends every pass and schedules no more', () => {
  const audio = fakeAudio(), out = audio.context.createGain();
  const loop = renderLoop(audio.context, out, fakeBuffer(1.7), 0);
  loop.pump(0); loop.pump(.1);
  expect(audio.sources).toHaveLength(2);
  expect(audio.sources[1]!.startedAt).toBeCloseTo(1.275, 9);
  loop.stop(.5); loop.pump(2);
  expect(audio.sources.map(pass => pass.stoppedAt)).toEqual([.5, .5]);
  expect(audio.sources).toHaveLength(2);
});

const settle = () => new Promise(resolve => setTimeout(resolve, 0));
/** A music player over a bank whose files arrive when the test says so; a track lasts as many seconds as its bytes. */
function musicRig(holdUntil: () => number = () => 0) {
  const audio = fakeAudio(), bus = audio.context.createGain(), fetches: string[] = [];
  const answers = new Map<string, { resolve: (bytes: ArrayBuffer) => void; reject: (error: Error) => void }>();
  const bank = createAudioBank({
    fetch: url => new Promise<ArrayBuffer>((resolve, reject) => { fetches.push(url); answers.set(url, { resolve, reject }); }),
    decode: async bytes => fakeBuffer(bytes.byteLength),
  });
  const player = createMusicPlayer(audio.context, bus, bank, holdUntil);
  return {
    audio, bus, bank, player, fetches,
    async arrive(track: MusicTrack, seconds = 80) { answers.get(MUSIC[track].url)!.resolve(new ArrayBuffer(seconds)); await settle(); },
    async fail(track: MusicTrack) { answers.get(MUSIC[track].url)!.reject(new Error('offline')); await settle(); },
  };
}
/** A playing pass reaches the bus through its own fade, the track's fade and the duck. */
const trackGain = (pass: Parameters<typeof downstream>[0]) => downstream(pass, 2).gain;

test('music is fetched when a screen first wants it, fades in and loops', async () => {
  const { audio, bus, player, fetches, arrive } = musicRig();
  player.play('burrow', 0);
  expect(fetches).toEqual([MUSIC.burrow.url]);
  expect(audio.sources).toHaveLength(0);
  audio.advance(.5); await arrive('burrow');
  const [first] = audio.sources;
  expect(first!.startedAt).toBeGreaterThanOrEqual(.5);
  expect(first!.startedAt).toBeLessThan(.6);
  expect(trackGain(first!).value).toBe(0);
  expect(trackGain(first!).events).toEqual([{ kind: 'target', value: 1, at: first!.startedAt, span: MUSIC_MIX.fadeInS / 4 }]);
  expect(downstream(first!, 4)).toBe(bus);
  audio.advance(first!.startedAt!); player.pump(first!.startedAt!);
  expect(audio.sources.map(pass => pass.startedAt)).toEqual([first!.startedAt, first!.startedAt! + 78]);
});

test('a new screen fades the old track out, lets its buffer go and brings its own in; a shared track plays on', async () => {
  const { audio, bank, player, fetches, arrive } = musicRig();
  player.play('square', 0); await arrive('square');
  player.play('square', 5);
  expect(audio.sources).toHaveLength(1);
  audio.advance(20); player.play('feeding', 20);
  const [old] = audio.sources;
  expect(trackGain(old!).events.at(-1)).toEqual({ kind: 'target', value: 0, at: 20, span: MUSIC_MIX.fadeOutS / 4 });
  expect(old!.stoppedAt).toBe(20 + MUSIC_MIX.fadeOutS);
  expect(bank.get(MUSIC.square.url)).toBeUndefined();
  expect(fetches).toEqual([MUSIC.square.url, MUSIC.feeding.url]);
  await arrive('feeding');
  expect(audio.sources).toHaveLength(2);
  expect(player.inspect()).toEqual({ track: 'feeding', wanted: 'feeding' });
});

test('quiet stops the music, and a track dropped before it arrived never starts', async () => {
  const { audio, bank, player, arrive } = musicRig();
  player.play('burrow', 0); player.play(null, 1);
  await arrive('burrow');
  expect(audio.sources).toHaveLength(0);
  expect(bank.get(MUSIC.burrow.url)).toBeUndefined();
  player.play('full', 2); await arrive('full');
  player.play(null, 9);
  expect(audio.sources[0]!.stoppedAt).toBe(9 + MUSIC_MIX.fadeOutS);
  expect(player.inspect()).toEqual({ track: null, wanted: null });
  expect(player.active()).toBe(false);
});

/* Game Design §4.2, Readable: "Silence, then the bed": the results loop waits for the fanfare, the reveal's for its sting. */
test('a new track waits for a sting or the feast cue to finish', async () => {
  let clear = 0;
  const { audio, player, arrive } = musicRig(() => clear);
  player.play('full', 0); clear = 12; audio.advance(9.2); await arrive('full');
  expect(audio.sources[0]!.startedAt).toBe(12 - MUSIC_MIX.stingTailS);
  expect(trackGain(audio.sources[0]!).events[0]).toMatchObject({ kind: 'target', value: 1, at: 12 - MUSIC_MIX.stingTailS });
});

test('Music off stops the loop and frees it; on brings the screen’s track back', async () => {
  const { audio, bank, player, fetches, arrive } = musicRig();
  player.play('feeding', 0); await arrive('feeding');
  player.setEnabled(false, 30);
  expect(audio.sources[0]!.stoppedAt).toBe(30 + MUSIC_MIX.fadeOutS);
  expect(bank.get(MUSIC.feeding.url)).toBeUndefined();
  expect(player.active()).toBe(false);
  player.play('full', 40);
  expect(fetches).toEqual([MUSIC.feeding.url]);
  player.setEnabled(true, 50);
  expect(fetches).toEqual([MUSIC.feeding.url, MUSIC.full.url]);
  await arrive('full');
  expect(player.inspect().track).toBe('full');
});

test('the music steps back 6 dB under an open statement and returns after', async () => {
  const { audio, player, arrive } = musicRig();
  player.play('feeding', 0); await arrive('feeding');
  player.duck(true, 3); player.duck(false, 8);
  expect(MUSIC_MIX.duckDb).toBe(-6);
  expect(downstream(audio.sources[0]!, 3).gain.events).toEqual([
    { kind: 'target', value: 10 ** (MUSIC_MIX.duckDb / 20), at: 3, span: MUSIC_MIX.duckS },
    { kind: 'target', value: 1, at: 8, span: MUSIC_MIX.duckS },
  ]);
});

test('a track that cannot load stays quiet and is asked for again by the next screen that wants it', async () => {
  const { audio, player, fetches, fail, arrive } = musicRig();
  player.play('burrow', 0); await fail('burrow');
  expect(audio.sources).toHaveLength(0);
  expect(fetches).toEqual([MUSIC.burrow.url]);
  player.play('square', 1); player.play('burrow', 2);
  expect(fetches).toEqual([MUSIC.burrow.url, MUSIC.square.url, MUSIC.burrow.url]);
  await arrive('burrow');
  expect(player.inspect().track).toBe('burrow');
});

/* docs/explorations/sound-direction-2026-10.md, the settled set: where each loop plays outside the game. */
test('the burrow plays at the launcher and home; the town square in a burrow, at setup and while gathering', () => {
  expect(screenMusic).toEqual({ launcher: 'burrow', home: 'burrow', burrow: 'square', setup: 'square', gathering: 'square' });
});
