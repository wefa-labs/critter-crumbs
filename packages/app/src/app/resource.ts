import { useEffect, useRef, useState } from 'react';
import { ApiClientError } from '@critter-crumbs/core';
import type { AppApi } from './session.js';

/**
 * A route's data, read when it opens, every 30 seconds while the tab is in view and when it comes back into view.
 * Only screens that arrive after the page read it, so it lives apart from ui.tsx, which the shell holds: ui.tsx
 * re-exports it, and it arrives with those screens (scripts/build-budget.mjs).
 */
export function useResource<T>(api: AppApi, path: string, canReplace?: (previous: T, next: T) => boolean) {
  const [value, setValue] = useState<{ data: T | null; error: unknown }>({ data: null, error: null });
  const accept = useRef(canReplace); accept.current = canReplace;
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true, request = 0;
    const read = async () => { const current = ++request; api.invalidate(); try { const data = await api.get(path); if (active && current === request) setValue(previous => previous.data && accept.current?.(previous.data, data as unknown as T) === false ? { ...previous, error: new ApiClientError('err.sessionExpired', 401) } : { data: data as unknown as T, error: null }); } catch (error) { if (active && current === request) setValue(previous => ({ ...previous, error })); } };
    void read();
    const poll = window.setInterval(() => { if (!document.hidden) void read(); }, 30000);
    const onVisible = () => { if (!document.hidden) void read(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { active = false; clearInterval(poll); document.removeEventListener('visibilitychange', onVisible); };
  }, [api, path, version]);
  return { ...value, refresh: () => setVersion(value => value + 1) };
}
