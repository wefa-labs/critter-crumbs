import { copy } from '@critter-crumbs/shared';
import { GameIcon } from '../game/icons.js';
import { musicAfterPress } from './music-choice.js';

/**
 * The Music toggle where there is no Settings to open: on the launcher, the first steps and a visitor's header. It
 * shows music as on only once it can be heard, and a press that starts the sound leaves the setting on
 * (music-choice.ts). `soundAtPress` says whether sound was playing when the press began.
 */
export function MusicButton({ on, sounding, soundAtPress, choose }: { on: boolean; sounding: boolean; soundAtPress: () => boolean; choose: (on: boolean) => void }) {
  return (
    <button type="button" className="music-button" aria-pressed={on && sounding} aria-label={copy['sound.music.label']} onClick={() => choose(musicAfterPress(soundAtPress(), on))}>
      <GameIcon name="music" />
    </button>
  );
}
