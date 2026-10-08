import { useEffect, useState } from 'react';
import { DESKTOP_MIN_WIDTH } from './layout.js';

/**
 * Whether the window is wide enough for the side panel. On desktop the focused critter's statement is always open in
 * the panel, so "reading" is a phone state only: a screen asks this before treating an open statement as a state.
 */
export function useDesktop() {
  const query = `(min-width: ${DESKTOP_MIN_WIDTH}px)`;
  const [desktop, setDesktop] = useState(() => typeof matchMedia === 'function' && matchMedia(query).matches);
  useEffect(() => {
    const media = matchMedia(query), change = () => setDesktop(media.matches);
    change(); media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, [query]);
  return desktop;
}
