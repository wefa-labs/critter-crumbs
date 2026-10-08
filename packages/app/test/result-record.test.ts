import { expect, test } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { copy } from '@critter-crumbs/shared';
import { ResultRecord } from '../src/app/result-record.js';
import { fixtureFeast, fixtureOpened } from '../src/dev/game-fixtures.js';

/* PRD F9: "Any member may post it; the creator is prompted first." Design System §9: the creator sees the button first. */
test('the creator is prompted to record a public result; every other member finds it folded', () => {
  const feast = fixtureFeast(8, 'recording'), { result } = fixtureOpened(feast, 'recording');
  const render = (address: string) => renderToStaticMarkup(createElement(ResultRecord, { feast, result, api: {} as never, me: { address } as never, account: () => null, run: async () => {}, busy: false }));
  const creator = render(feast.createdBy), member = render(feast.participants.find(address => address !== feast.createdBy)!);
  expect(creator).toContain(copy['results.local.cta']);
  expect(creator).not.toContain('<details');
  expect(member).toContain(`<summary>${copy['results.local.cta']}</summary>`);
  for (const markup of [creator, member]) expect(markup).toContain(copy['results.public']);
});

test('a private feast offers no record at all', () => {
  const feast = { ...fixtureFeast(8, 'results') }, { result } = fixtureOpened(feast, 'results');
  expect(renderToStaticMarkup(createElement(ResultRecord, { feast, result, api: {} as never, me: { address: feast.createdBy } as never, account: () => null, run: async () => {}, busy: false }))).toBe('');
});
