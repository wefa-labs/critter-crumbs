import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { copy, whyCopy } from '@critter-crumbs/shared';
import { Why } from '../src/app/why.js';

/* The page behind "Why nobody can peek" (docs/reviews/first-steps-2026-11, F4 and decisions D2 and D3), rendered to
   static markup: its sections in the review's order, every line of it shown, the only two ways out of the app, and none
   of the words the app never says. */
describe('the page behind Why nobody can peek', () => {
  const markup = renderToStaticMarkup(createElement(Why, { sound: null }));
  const words = (html: string) => html.replace(/<[^>]+>/g, '').replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');
  const each = (pattern: RegExp, html = markup) => [...html.matchAll(pattern)].map(match => words(match[1]!));
  const machinery = /<div class="why-machinery">(.*?)<\/div>/.exec(markup)![1]!;

  it('is named by the question it answers, which every link to it repeats', () => {
    expect(each(/<h1[^>]*>(.*?)<\/h1>/g)).toEqual(['Why nobody can peek']);
    expect(copy['why.title']).toBe('Why nobody can peek');
  });

  it('says what you are promised, the one thing it will not pretend, the words, what runs where and the source, in that order', () => {
    expect(each(/<h2[^>]*>(.*?)<\/h2>/g)).toEqual(['What you are promised', 'One thing we will not pretend', 'The words', 'What runs where', 'The source']);
  });

  it('leads each promise, word and place with its key word in bold, then says the rest', () => {
    const lists = [...markup.matchAll(/<ul class="why-leads">(.*?)<\/ul>/g)].map(match => match[1]!);
    expect(lists.map(list => list.match(/<li>/g)!.length)).toEqual([5, 4, 5]);
    expect(each(/<li><b>(.*?)<\/b>/g, lists[0])).toEqual([
      'No one can read what you gave until the feast.', 'We cannot make one up.', 'We cannot quietly lose one.', 'Everyone gets the same numbers.', 'Nothing about you is measured.',
    ]);
    expect(each(/<li><b>(.*?)<\/b>/g, lists[1])).toEqual(['Burrow', 'Critters', 'Scatter', 'Feast']);
    expect(each(/<li><b>(.*?)<\/b>/g, lists[2])).toEqual(['Your device', 'Critter Crumbs', 'Gnosis Chain', 'Base', 'Ethereum']);
  });

  it('names Shutter, EAS, Gnosis Chain and Base only in the machinery, which is quieted to the secondary colour', () => {
    for (const name of ['Shutter', 'EAS', 'Gnosis Chain', 'Base']) expect(words(machinery)).toContain(name);
    const elsewhere = words(markup.replace(machinery, ''));
    for (const name of ['Shutter', 'EAS', 'Gnosis', 'Base']) expect(elsewhere).not.toContain(name);
  });

  it('shows every line it has, so none is kept that the page has lost', () => {
    const shown = words(markup);
    for (const [id, line] of Object.entries(whyCopy)) expect(shown, id).toContain(line);
  });

  it('leaves the app only by the source’s two links, which say they go to GitHub', () => {
    expect([...markup.matchAll(/<a ([^>]*)>(.*?)<\/a>/g)].map(([, attributes, label]) => [label, /href="([^"]*)"/.exec(attributes!)?.[1], /rel="([^"]*)"/.exec(attributes!)?.[1]])).toEqual([
      ['Read the code on GitHub', 'https://github.com/wefa-labs/critter-crumbs', 'noopener'],
      ['Read the technical spec on GitHub', 'https://github.com/wefa-labs/critter-crumbs/blob/main/docs/04-technical-spec.md', 'noopener'],
    ]);
    expect(each(/<button[^>]*>(.*?)<\/button>/g)).toEqual(['Got it']);
  });

  it('never uses the words the app keeps out of what anyone is shown', () => {
    expect([copy['why.title'], ...Object.values(whyCopy)].join(' ')).not.toMatch(/\b(seal|round|cache|vote|ballot|wallet)/i);
  });
});
