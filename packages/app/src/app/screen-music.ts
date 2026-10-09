import type { MusicTrack } from '../audio/index.js';
/**
 * The music under the screens outside the game (docs/explorations/sound-direction-2026-10.md, the settled set): The
 * burrow at the launcher and home, The town square in a burrow, at setup and while gathering. The game's states name
 * theirs in game/composition.ts.
 */
export const screenMusic = { launcher: 'burrow', home: 'burrow', burrow: 'square', setup: 'square', gathering: 'square' } as const satisfies Record<string, MusicTrack>;
