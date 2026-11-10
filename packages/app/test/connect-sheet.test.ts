import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { copy } from '@critter-crumbs/shared';
import type { AccountOption } from '@critter-crumbs/core';
import { ConnectSheet } from '../src/app/connect.js';

/* A feast link tapped in a chat app opens in the phone's own browser or the chat app's, where there is nothing to
   connect with: the first screen most council members on phones will meet. The sheet says what to do there and offers
   the page's link to take to the app they connect with (QA production-build-07). */
describe('choosing how to connect', () => {
  const sheet = (options: AccountOption[]) => renderToStaticMarkup(createElement(ConnectSheet, {
    options, discovering: false, reason: '', waiting: null, busy: false, choose: () => {}, cancel: () => {}, run: async () => {},
  }));
  /* what a member reads, as why.test.ts reads the page behind Why nobody can peek */
  const words = (html: string) => html.replace(/<[^>]+>/g, '').replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');

  it('says what to do when this browser has nothing to connect with, and offers the page’s link to take there', () => {
    const markup = sheet([]);
    expect(words(markup)).toContain(copy['connect.empty']);
    // what to do there, in the words the run sheet gives members (docs/build/rehearsal.md §2), without saying "wallet"
    expect(copy['connect.empty']).toMatch(/open it in the app you connect with/);
    expect(markup).toMatch(new RegExp(`<button type="button"[^>]*>${copy['connect.link.copy']}</button>`));
  });

  it('lists the apps on offer by their own names, with no link to copy, when there are some', () => {
    const markup = sheet([{ id: 'injected', name: copy['connect.injected'] }]);
    expect(words(markup)).toContain(copy['connect.injected']);
    expect(words(markup)).not.toContain(copy['connect.empty']);
    expect(words(markup)).not.toContain(copy['connect.link.copy']);
  });
});
