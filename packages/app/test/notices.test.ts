import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { appNotices, NoticeProvider, ScreenNotices } from '../src/app/notices.js';

/* The notices that stand while their cause lasts (flow page, SCREENS.notices; the November UI audit, screen 53). They
   used to reach only the screen-reader announcer (QA edge-states-08); now they are also in view. */
describe('the standing notices', () => {
  it("stack the clock before ENS names, in the copy's words, and are none while all is well", () => {
    expect(appNotices(null, undefined)).toEqual([]);
    const notices = appNotices(12, 'err.ensUnavailable');
    expect(notices.map(notice => notice.key)).toEqual(['err.clockSkew', 'err.ensUnavailable']);
    expect(notices.map(notice => notice.text)).toEqual(["Your device clock is off by about 12 minutes. Deadlines here use the feast's clock, not yours.", "Couldn't look up ENS names right now, so addresses are shown instead."]);
    expect(notices.every(notice => notice.trouble)).toBe(true);
    expect(appNotices(1, undefined)[0]!.text).toBe("Your device clock is off by about 1 minute. Deadlines here use the feast's clock, not yours.");
  });

  it('show where a screen puts them, one notice each, without a live region of their own', () => {
    const markup = renderToStaticMarkup(createElement(NoticeProvider, { notices: appNotices(12, 'err.ensUnavailable'), children: createElement(ScreenNotices) }));
    expect(markup.match(/class="sheet-notice"/g)).toHaveLength(2);
    expect(markup).toContain('off by about 12 minutes');
    expect(markup).not.toMatch(/aria-live|role="(status|alert)"/);
  });

  it("leave the game's floor to the game's own notice", () => {
    expect(renderToStaticMarkup(createElement(NoticeProvider, { notices: appNotices(12, 'err.ensUnavailable'), children: createElement(ScreenNotices, { game: true }) }))).toBe('');
  });

  it('show nothing when there is none, or outside the app', () => {
    expect(renderToStaticMarkup(createElement(NoticeProvider, { notices: [], children: createElement(ScreenNotices) }))).toBe('');
    expect(renderToStaticMarkup(createElement(ScreenNotices))).toBe('');
  });
});
