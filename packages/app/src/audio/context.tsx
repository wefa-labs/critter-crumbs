import { createContext, useContext, useEffect } from 'react';
import type { Audio, MusicTrack } from './index.js';
export const AudioProvider = createContext<Audio | null>(null);
export function useAudio() { const audio = useContext(AudioProvider); if (!audio) throw new Error(); return audio; }
/** The music under a screen: a track, null for quiet, or undefined to leave playing whatever the last screen chose. */
export function useMusic(track: MusicTrack | null | undefined) {
  const audio = useAudio();
  useEffect(() => { if (track !== undefined) audio.music(track); }, [audio, track]);
}
