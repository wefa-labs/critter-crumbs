import { Component, lazy, type ReactNode } from 'react';
import { copy } from '@critter-crumbs/shared';
import { PendingPage } from './ui.js';

/**
 * Screens whose code arrives after the page (QA production-build-06). A module that did not arrive, which the browser
 * reports as a TypeError, is asked for once more: Chromium and WebKit both fetch it again, though WebKit keeps a lost
 * dependency's failure until the page is loaded again. A stylesheet that did not load is not: Vite has marked it as
 * seen and would not fetch it twice, so the screen would be drawn without it.
 */
export const retryOnce = <T,>(load: () => Promise<T>) => load().catch((error: unknown) => { if (error instanceof TypeError) return load(); throw error; });

/** React.lazy, with a lost request asked for once more. */
export const lazyScreen: typeof lazy = load => lazy(() => retryOnce(load));

/**
 * Around the screens whose code arrives later (app.tsx). When it does not arrive, as in a tab opened before a new
 * deployment, whose files are gone, or once a retry is lost too, the screen's place says so with Reload instead of the
 * page going blank. Nothing reloads by itself, so a page that keeps failing cannot loop. A screen drawn over another,
 * your critter's profile, also offers `back` to the one beneath, which may hold work not yet saved.
 */
export class ScreenBoundary extends Component<{ children: ReactNode; back?: (() => void) | undefined }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    const { back, children } = this.props;
    return this.state.failed ? <PendingPage error retry={() => location.reload()} line="err.screenLoad" action="action.reload">
      {back ? <button className="secondary" onClick={back}>{copy['action.back']}</button> : null}
    </PendingPage> : children;
  }
}
