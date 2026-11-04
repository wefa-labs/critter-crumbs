import { useEffect, useState } from 'react';
import type { AppApi } from './session.js';
export { deadlineLine, phaseCopy } from './deadline-lines.js';
export function useTrustedTime(api: AppApi) {
  const [now, setNow] = useState(api.now());
  useEffect(() => { const timer = setInterval(() => setNow(api.now()), 1000); return () => clearInterval(timer); }, [api]);
  return now;
}
