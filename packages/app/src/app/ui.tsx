import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from 'react';
import { generateCritter, ApiClientError } from '@critter-crumbs/core';
import { copy, formatCopy, type CopyId, type Profile, type Target } from '@critter-crumbs/shared';
import { CrumbGlyph } from '../game/mound.js';
import { Loader } from '../game/sheet-parts.js';
import { disposePortrait } from '../portraits/index.js';
import { paintCritter } from '../portraits/painter.js';
import { critterVersion } from '../portraits/version.js';
import { useModalAnnouncements } from './announcements.js';
import type { AppApi } from './session.js';

export const displayName = (profile: Pick<Profile, 'ensName' | 'displayName' | 'address'>) => profile.ensName || profile.displayName || shortAddress(profile.address);
export const shortAddress = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`;
/** A stored name that is only the address falls back to the §5.5 short form; the full address is shown separately. */
export const memberLabel = (name: string, address: string) => name.toLowerCase() === address.toLowerCase() ? shortAddress(address) : name;
export const targetLabel = (target: Target) => target.ownerAddress?.toLowerCase() === target.name.toLowerCase() ? shortAddress(target.name) : target.name;
export function navigate(path: string) { history.pushState(null, '', path); window.dispatchEvent(new PopStateEvent('popstate')); }
export function Link({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return <a href={href} className={className} onClick={event => { if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { event.preventDefault(); navigate(href); } }}>{children}</a>;
}
export function Page({ title, children, context, screen, primary = true }: { title: string; context?: string; screen?: string; primary?: boolean; children: ReactNode }) {
  useEffect(() => { document.title = context ? formatCopy('app.contextTitle', { screen: screen ?? title, burrow: context }) : formatCopy('app.pageTitle', { title }); document.getElementById('content')?.focus(); document.querySelector<HTMLElement>('[data-initial-focus="true"]')?.focus(); }, [title, context, screen]);
  return <>{primary ? <h1>{title}</h1> : <p className="feast-title">{title}</p>}{children}</>;
}
/**
 * While the session is read, a screen's code arrives or a route's data is on its way: three bobbing crumbs. `bare`
 * fills the screen, for a moment when it is not yet known what the screen will be; otherwise the crumbs wait under the
 * page's own header.
 */
export function Opening({ bare = false }: { bare?: boolean }) {
  return <div className={bare ? 'core-game opening' : 'opening'}><Loader crumb={<CrumbGlyph />} /><p className="sr-only">{copy['app.loading']}</p></div>;
}
/** A route whose data has not arrived: the bobbing crumbs, or the outage notice with a retry. Error copy never becomes a page title. */
export function PendingPage({ error, retry, bare = false }: { error: unknown; retry: () => void; bare?: boolean }) {
  return error ? <Page title={copy['app.unavailable']}><p>{copy['err.storeUnreachable']}</p><button onClick={retry}>{copy['action.retry']}</button></Page> : <Opening bare={bare} />;
}
export function PortraitImage({ address, variant, name, size = 40, asleep = false, decorative = true, fed = 0 }: { address: string; variant: number; name: string; size?: 40 | 64 | 96 | 'stage'; asleep?: boolean; decorative?: boolean; fed?: number }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const svg = paintCritter(document, generateCritter(address, variant, critterVersion), { name, size, asleep, decorative, fed });
    host.current?.replaceChildren(svg);
    return () => { disposePortrait(svg); svg.remove(); };
  }, [address, variant, name, size, asleep, decorative, fed]);
  return <div className={size === 'stage' ? 'stage' : 'portrait-slot'} ref={host} />;
}
/** A native modal dialog: opened on mount, announced, and focus returned where it was when it closes. */
export function useModalDialog(ref: RefObject<HTMLDialogElement | null>) {
  const announceWithin = useModalAnnouncements();
  useEffect(() => { const dialog = ref.current!; const previous = document.activeElement; dialog.showModal(); announceWithin(dialog); dialog.querySelector<HTMLElement>('input, textarea')?.focus(); return () => { announceWithin(null); dialog.close(); if (previous instanceof HTMLElement && previous.isConnected) previous.focus(); else document.getElementById('content')?.focus(); }; }, [announceWithin]);
}
export function Dialog({ title, children, onClose, busy = false }: { title: string; children: ReactNode; onClose: () => void; busy?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null), id = useId();
  useModalDialog(ref);
  return <dialog ref={ref} aria-labelledby={id} onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}>
    <div className="dialog-heading"><h2 id={id}>{title}</h2><button className="secondary" disabled={busy} onClick={onClose}>{copy['action.close']}</button></div>{children}
  </dialog>;
}
export function Field({ label, children, help }: { label: CopyId; children: ReactNode; help?: CopyId }) {
  return <label className="field"><span>{copy[label]}</span>{children}{help ? <small>{copy[help]}</small> : null}</label>;
}
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
