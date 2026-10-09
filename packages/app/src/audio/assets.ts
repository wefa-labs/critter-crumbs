/**
 * The settled sound set (docs/explorations/sound-direction-2026-10.md). The files live in public/audio/; where each came
 * from and how it was processed is in docs/research/audio-assets.md.
 */
export type SampleName = 'pop' | 'spin' | 'boing' | 'page' | 'munch' | 'cheer' | 'sparkle' | 'scattered' | 'reveal' | 'dusk' | 'feast' | 'feast-resolve';
export type MusicTrack = 'burrow' | 'square' | 'feeding' | 'full';

/**
 * Recorded sounds on the effects bus. `peakDb` is each file's true peak after encoding, so a cue's level is the peak it
 * reaches. A `musical` sound is a sting or the feast cue: a loop about to start waits for it to finish.
 */
export const SAMPLES: Record<SampleName, { url: string; peakDb: number; musical?: true }> = {
  pop: { url: '/audio/sfx/pop.mp3', peakDb: -2.2 },
  spin: { url: '/audio/sfx/spin.mp3', peakDb: -0.1 },
  boing: { url: '/audio/sfx/boing.mp3', peakDb: -1 },
  page: { url: '/audio/sfx/page.mp3', peakDb: -0.5 },
  munch: { url: '/audio/sfx/munch.mp3', peakDb: -2 },
  cheer: { url: '/audio/sfx/cheer.mp3', peakDb: -1.1 },
  sparkle: { url: '/audio/sfx/sparkle.mp3', peakDb: -0.6 },
  scattered: { url: '/audio/stings/scattered.mp3', peakDb: -2.9, musical: true },
  reveal: { url: '/audio/stings/reveal.mp3', peakDb: -3.3, musical: true },
  dusk: { url: '/audio/stings/dusk.mp3', peakDb: -2.7, musical: true },
  feast: { url: '/audio/music/feast.mp3', peakDb: -1.6, musical: true },
  'feast-resolve': { url: '/audio/music/feast-resolve.mp3', peakDb: -1.7, musical: true },
};

/** The looping tracks on the music bus, all at -16 LUFS integrated. */
export const MUSIC: Record<MusicTrack, { url: string }> = {
  burrow: { url: '/audio/music/burrow.mp3' },
  square: { url: '/audio/music/square.mp3' },
  feeding: { url: '/audio/music/feeding.mp3' },
  full: { url: '/audio/music/full.mp3' },
};
