/**
 * What the Music setting becomes when its button is pressed. Music is on by default, but a browser lets none play
 * before the first press on the page, so a button that only flipped the setting would answer a first press by
 * switching off music nobody had heard. When no sound was playing as the press began, the press starts the music;
 * otherwise it flips the setting.
 */
export const musicAfterPress = (soundWasPlaying: boolean, on: boolean) => soundWasPlaying ? !on : true;

/**
 * Remembers whether sound was playing when the press now being handled began. The press itself unlocks sound, and by
 * the time its click arrives the sound may already be running, so the click cannot ask. `saw` is told of every event
 * that may unlock sound, before the sound is unlocked: a press begins with the pointer going down or with Enter or
 * Space, and a click that no such event led up to (assistive technology sends those) is a whole press by itself.
 */
export function createPressWatch(soundPlaying: () => boolean) {
  let atPress = false, pressing = false;
  return {
    saw(type: string, key?: string) {
      const begins = type === 'pointerdown' || type === 'keydown' && (key === 'Enter' || key === ' ');
      if (begins || type === 'click' && !pressing) atPress = soundPlaying();
      if (begins) pressing = true; else if (type === 'click') pressing = false;
    },
    soundAtPress: () => atPress,
  };
}
