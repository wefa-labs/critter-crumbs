import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
const ModalAnnouncements = createContext<(host: HTMLElement | null) => void>(() => {});
export const useModalAnnouncements = () => useContext(ModalAnnouncements);
/**
 * Keep exactly two live regions inside the active modal's accessible tree. A screen that shows the alert in its own
 * surface (the launcher's sheet) asks for it unseen here: it is still read out, once.
 */
export function Announcements({ alert, alertSeen = true, announcement, clearAnnouncement, children }: { alert: string; alertSeen?: boolean; announcement: string; clearAnnouncement: (text: string) => void; children: ReactNode }) {
  const [pageHost, setPageHost] = useState<HTMLDivElement | null>(null), [modalHost, setModalHost] = useState<HTMLElement | null>(null);
  const register = useCallback((host: HTMLElement | null) => { if (host) clearAnnouncement(''); setModalHost(host); }, [clearAnnouncement]);
  const host = modalHost ?? pageHost;
  return <ModalAnnouncements value={register}>{children}<div ref={setPageHost} />{host ? createPortal(<><div id="alert" role="alert" aria-live="assertive" aria-atomic="true" className={alert && (alertSeen || modalHost) ? 'notice error' : 'sr-only'}>{alert}</div><div id="announce" className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</div></>, host) : null}</ModalAnnouncements>;
}
