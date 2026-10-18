import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { copy } from '@critter-crumbs/shared';
import { GameIcon } from '../game/icons.js';
const ModalAnnouncements = createContext<(host: HTMLElement | null) => void>(() => {});
const Notifications = createContext<(text: string, origin?: Element | null) => void>(() => {});
export const useModalAnnouncements = () => useContext(ModalAnnouncements);
/** Discrete outcomes get a visible notification as well as the existing polite announcement. */
export const useNotification = () => useContext(Notifications);
interface Notification { text: string; origin: Element | null }
/**
 * Keep exactly two live regions inside the active modal's accessible tree. A screen that shows the alert in its own
 * surface (the launcher's sheet) asks for it unseen here: it is still read out, once.
 */
export function Announcements({ alert, alertSeen = true, announcement, clearAnnouncement, children }: { alert: string; alertSeen?: boolean; announcement: string; clearAnnouncement: (text: string) => void; children: ReactNode }) {
  const [pageHost, setPageHost] = useState<HTMLDivElement | null>(null), [modalHost, setModalHost] = useState<HTMLElement | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [hovered, setHovered] = useState(false), [focused, setFocused] = useState(false);
  const [announcementVersion, setAnnouncementVersion] = useState(0);
  const register = useCallback((host: HTMLElement | null) => { if (host) { clearAnnouncement(''); setNotification(null); } setModalHost(host); }, [clearAnnouncement]);
  const notify = useCallback((text: string, origin: Element | null = document.activeElement) => {
    clearAnnouncement(text);
    setAnnouncementVersion(value => value + 1);
    setNotification({ text, origin });
  }, [clearAnnouncement]);
  useEffect(() => { if (alert) setNotification(null); }, [alert]);
  useEffect(() => {
    if (!notification) { setHovered(false); setFocused(false); return; }
    if (hovered || focused) return;
    const timer = window.setTimeout(() => setNotification(null), 6000);
    return () => window.clearTimeout(timer);
  }, [notification, hovered, focused]);
  function dismiss() {
    if (document.activeElement?.closest('.app-toast')) {
      if (notification?.origin instanceof HTMLElement && notification.origin.isConnected) notification.origin.focus();
      else document.getElementById('content')?.focus();
    }
    setNotification(null);
  }
  const host = modalHost ?? pageHost;
  return <ModalAnnouncements value={register}><Notifications value={notify}>{children}</Notifications><div ref={setPageHost} className="announcement-host" />{host ? createPortal(<>
    <div id="alert" role="alert" aria-live="assertive" aria-atomic="true" className={alert && (alertSeen || modalHost) ? 'notice error' : 'sr-only'}>{alert}</div>
    <div id="announce" className="sr-only" aria-live="polite" aria-atomic="true"><span key={announcementVersion}>{announcement}</span></div>
    {notification ? <div className="app-toast" role="group" aria-label={copy['notification.label']}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      <span className="notification-leaf" aria-hidden="true"><GameIcon name="leaf" /></span><span>{notification.text}</span>
      <button type="button" aria-label={copy['notification.dismiss']} onClick={dismiss}><GameIcon name="close" /></button>
    </div> : null}
  </>, host) : null}</ModalAnnouncements>;
}
