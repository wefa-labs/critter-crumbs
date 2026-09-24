import { createContext, useContext } from 'react';
import type { Audio } from './index.js';
export const AudioProvider = createContext<Audio | null>(null);
export function useAudio() { const audio = useContext(AudioProvider); if (!audio) throw new Error(); return audio; }
