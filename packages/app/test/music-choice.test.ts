import { expect, test } from 'vitest';
import { createPressWatch, musicAfterPress } from '../src/app/music-choice.js';

/* docs/decisions.md, 2026-10-08: music is on by default and starts with the first tap, as browsers require. */
test('the first press on a silent page starts the music and leaves the setting on', () => {
  expect(musicAfterPress(false, true)).toBe(true);
});
test('a press while sound is playing flips the setting', () => {
  expect(musicAfterPress(true, true)).toBe(false);
  expect(musicAfterPress(true, false)).toBe(true);
});
test('a press on a silent page turns music on even if it was switched off before', () => {
  expect(musicAfterPress(false, false)).toBe(true);
});

/* The press that starts the sound must still read as a press on a silent page, however soon the sound begins: in the
   browser tests the sound is running before the same press's click arrives. */
function press() { let playing = false; const watch = createPressWatch(() => playing); return { watch, start: () => { playing = true; }, stop: () => { playing = false; } }; }

test('a press remembers the silence it began in, although its own unlocking starts the sound before its click', () => {
  const { watch, start } = press();
  watch.saw('pointerdown'); start(); watch.saw('pointerup'); watch.saw('click');
  expect(watch.soundAtPress()).toBe(false);
  // the next press begins with the sound playing
  watch.saw('pointerdown'); watch.saw('pointerup'); watch.saw('click');
  expect(watch.soundAtPress()).toBe(true);
});

test('Enter and Space begin a press; other keys do not, though they may start the sound', () => {
  const { watch, start } = press();
  watch.saw('keydown', 'Enter'); start(); watch.saw('click');
  expect(watch.soundAtPress()).toBe(false);
  const tabbed = press();
  tabbed.watch.saw('keydown', 'Tab'); tabbed.start();
  tabbed.watch.saw('keydown', ' '); tabbed.watch.saw('click');
  expect(tabbed.watch.soundAtPress()).toBe(true);
});

test('a click that nothing led up to is a whole press and reads the sound as it lands', () => {
  const { watch, start, stop } = press();
  watch.saw('click');
  expect(watch.soundAtPress()).toBe(false);
  start(); watch.saw('click');
  expect(watch.soundAtPress()).toBe(true);
  // a pointer press abandoned without a click does not leave its reading behind for long: the next press reads afresh
  stop(); watch.saw('pointerdown'); start(); watch.saw('pointerdown');
  expect(watch.soundAtPress()).toBe(true);
});
