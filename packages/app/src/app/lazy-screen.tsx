import { Component, lazy, type ReactNode } from 'react';
import { copy } from '@critter-crumbs/shared';
import { Page } from './ui.js';

/**
 * Screens whose code arrives after the page (QA production-build-06). A module that did not arrive, which the browser
 * reports as a TypeError, is asked for once more: Chromium fetches it again, and so does WebKit after a dropped
 * connection, though WebKit keeps a 404, or a request that keeps failing, for the rest of the tab (measured on the
 * bundle; docs/decisions.md, 2026-11-09). A stylesheet that did not load is not asked for again: Vite has marked it as
 * seen and would not fetch it twice, so the screen would be drawn without it.
 */
export const retryOnce = <T,>(load: () => Promise<T>) => load().catch((error: unknown) => { if (error instanceof TypeError) return load(); throw error; });

/** React.lazy, with a lost request asked for once more. */
export const lazyScreen: typeof lazy = load => lazy(() => retryOnce(load));

/**
 * Around the screens whose code arrives later (app.tsx). When it does not arrive, as in a tab opened before a new
 * deployment, whose files are gone, or once a retry is lost too, the screen's place says so with Reload instead of the
 * page going blank; so does a screen that fails to draw for any other reason. Nothing reloads by itself, so a page
 * that keeps failing cannot loop. A screen drawn over another, your critter's profile, also offers `back` to the one
 * beneath, which may hold work not yet saved.
 */
export class ScreenBoundary extends Component<{ children: ReactNode; back?: (() => void) | undefined }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    const { back, children } = this.props;
    /* the outage notice's title, as PendingPage has it, with this failure's own line and Reload */
    return this.state.failed ? <Page title={copy['app.unavailable']}>
      <p>{copy['err.screenLoad']}</p>
      <button onClick={() => location.reload()}>{copy['action.reload']}</button>
      {back ? <button className="secondary" onClick={back}>{copy['action.back']}</button> : null}
    </Page> : children;
  }
}
