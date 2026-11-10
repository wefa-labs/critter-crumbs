import { createElement, createRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import { copy } from '@critter-crumbs/shared';
import { gameView } from '../src/app/feast-view.js';
import { EmptySheet, emptyResult } from '../src/app/results.js';
import { composeGame } from '../src/game/composition.js';
import { fixtureFeast, fixtureOpened } from '../src/dev/game-fixtures.js';

const settled = { phase: 'feast', remaining: 0, opened: true, playing: false } as const;
const sheet = (feast: ReturnType<typeof fixtureFeast>, opened: ReturnType<typeof fixtureOpened>) => renderToStaticMarkup(createElement(EmptySheet, { feast, opened, empty: emptyResult(feast, opened.result)!, heading: createRef<HTMLHeadingElement>() }));

/* Technical Spec §15 E14: a scatter that fails to open at the feast is named by results.unreadable and counts as not
   having scattered (T7). When not one saved scatter can be read, the results must not say that nobody scattered (QA
   copy-01): it is the screen a one-scatter smoke feast shows if that scatter cannot be opened. */
test('every scatter unreadable at the feast is its own state, naming whose crumbs couldn’t be read', () => {
  const feast = fixtureFeast(4, 'unreadable'), opened = fixtureOpened(feast, 'unreadable');
  expect(emptyResult(feast, opened.result)).toEqual({ state: 'unreadable', line: "Moss, Fern and Juniper scattered, but their crumbs couldn't be read, so there's nothing to share out." });
  expect(gameView({ ...settled, resultState: 'unreadable' }).state).toBe('unreadable');
  /* like nobody scattered, there is nothing to fold into the bar */
  expect(gameView({ ...settled, resultsOpen: false, resultState: 'unreadable' }).state).toBe('unreadable');
  expect(composeGame('unreadable', 'phone').surface.kind).toBe('sheet');
  const markup = sheet(feast, opened);
  expect(markup).toContain('Moss, Fern and Juniper scattered, but their crumbs couldn&#x27;t be read, so there&#x27;s nothing to share out.');
  expect(markup).toContain('0 of 4 scattered · 0 crumbs in all');
  expect(markup).not.toContain(copy['results.nobody'].replaceAll("'", '&#x27;'));
});

test('nobody scattering keeps its own sheet, and a scatter of yours missing from the published set says so on it', () => {
  const feast = fixtureFeast(4, 'nobody'), opened = fixtureOpened(feast, 'nobody'), missing = `0x${'ab'.repeat(32)}`;
  expect(emptyResult(feast, opened.result)).toEqual({ state: 'nobody', line: copy['results.nobody'] });
  const results = fixtureFeast(4, 'results');
  expect(emptyResult(results, fixtureOpened(results, 'results').result)).toBeNull();
  const markup = sheet(feast, { ...opened, missingUids: [missing] });
  expect(markup).toContain(copy['results.nobody'].replaceAll("'", '&#x27;'));
  expect(markup).toContain(`Keep this: ${missing}. Tell the burrow.`);
});
