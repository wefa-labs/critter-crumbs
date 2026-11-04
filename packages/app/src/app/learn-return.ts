/** Your critter's profile, which opens over the screen its face was pressed on and goes back to it (app.tsx). */
export const YOUR_CRITTER_PATH = '/your-critter';

/**
 * Where Skip and Got it lead, and where your critter's profile goes back to. `navigate` (ui.tsx) records the screen a
 * link was pressed on, so the steps return to it: the feast for someone who came by its link, or the profile for a
 * member who opened them there. Opened by their own address, with nothing recorded, they lead to the launcher, which is
 * home for a connected member.
 */
export function returnPath(state: unknown): string {
  const from = typeof state === 'object' && state !== null && 'from' in state ? state.from : undefined;
  return typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') && from !== '/how-it-works' ? from : '/';
}
