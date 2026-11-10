import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import { createCloseRecord, participantSetHash, tally } from '@critter-crumbs/core';
import { canonicalJSON, parseAllocationPayload, type Address, type Hex } from '@critter-crumbs/shared';
import { giverCsv } from '../src/app/csv.js';
import { RecordReceipt } from '../src/app/result-record.js';
import { GiverTable, ResultsList } from '../src/app/results.js';
import type { OpenedFeast } from '../src/app/feast-session.js';
import type { MemberFeast } from '../src/app/feast-view.js';
import { fixtureFeast, fixtureOpened, fixtureRecord } from '../src/dev/game-fixtures.js';
/* every build draws Garden Spirits, whose renderer main.ts installs before the first screen */
import '../src/portraits/garden/install.js';

const uid = (n: number) => `0x${n.toString(16).padStart(64, '0')}` as Hex;
/** The feast opened from these complete scatters, through the same tally every member's browser runs. */
function openWith(feast: MemberFeast, scatters: [Address, number[]][]): OpenedFeast {
  const participants = participantSetHash(feast.participants);
  const ballots = scatters.map(([attester, amounts], index) => ({ seq: String(index + 1), uid: uid(index + 1), attester,
    plaintext: canonicalJSON(parseAllocationPayload({ v: 1, feast: feast.id, scatterer: attester, participants, allocation: feast.targets.map((target, i) => [target.id, amounts[i]!]), nonce: '0000000000000026' })) }));
  const closeRecord = createCloseRecord(feast.id, ballots, feast.scatteringEndsAt);
  return { closeRecord, missingUids: [], givers: scatters.map(([attester, amounts], index) => ({ seq: String(index + 1), uid: uid(index + 1), attester, amounts })),
    result: tally({ feastId: feast.id, publishedSetHash: closeRecord.publishedSetHash, crumbsIssued: 100, targets: feast.targets, participants: feast.participants, ballots }) };
}

/* The gallery's burrow of four (Moss, Fern, Juniper, Clover) sharing out a budget: the critters are three options, so no
   member is one of them, and the burrow knows Clover by no name at all. */
const people = fixtureFeast(4, 'givers'), [moss, fern, , clover] = people.participants as [Address, Address, Address, Address];
const options: MemberFeast = { ...people, kind: 'options',
  targets: ['Garden', 'Library', 'Workshop'].map((name, position) => ({ id: uid(100 + position), ownerAddress: null, name, position, kind: 'option' as const })),
  portraits: [0, 1, 2].map(position => ({ targetId: uid(100 + position), variant: 0 })),
  participantNames: people.targets.map(target => ({ address: target.ownerAddress!, name: target.ownerAddress === clover ? null : target.name })) };

/* PRD R5 and F9: the burrow is told who did not scatter, and who gave what when individual scatters are open; Design
   System §10, results.didNotScatter, results.giver.you, results.local.done (QA lifecycle-04, rules-05). */
test('an options feast names its members as the burrow knows them: who didn’t scatter, who gave what and its CSV, who recorded it', () => {
  const opened = openWith(options, [[moss, [50, 30, 20]], [fern, [0, 100, 0]]]);
  expect(renderToStaticMarkup(createElement(ResultsList, { feast: options, opened }))).toContain('0x1efF…A718 and Juniper didn&#x27;t scatter.');
  const givers = renderToStaticMarkup(createElement(GiverTable, { feast: options, opened, viewer: moss }));
  expect(givers).toContain('Moss (you)</th>');
  expect(givers).toContain('Fern</th>');
  expect(giverCsv(options, opened)).toBe('giver,address,Garden,Library,Workshop\r\nMoss,0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf,50,30,20\r\nFern,0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF,0,100,0\r\n');
  const record = { ...fixtureRecord(options, opened), attester: fern };
  expect(renderToStaticMarkup(createElement(RecordReceipt, { record, feast: options }))).toContain('Rehearsal result recorded by Fern.');
});

/* People feasts behave as before: a member is the critter they are in the feast, under the name it was frozen with, even
   after they change the name the burrow knows them by. */
test('a people feast still names each member by their critter in it, whatever the burrow calls them now', () => {
  const renamed: MemberFeast = { ...people, participantNames: people.participantNames.map(entry => ({ ...entry, name: `${entry.name} the Second` })) };
  const opened = fixtureOpened(renamed, 'givers');
  const markup = [renderToStaticMarkup(createElement(ResultsList, { feast: renamed, opened })), renderToStaticMarkup(createElement(GiverTable, { feast: renamed, opened, viewer: moss })), giverCsv(renamed, opened)].join('\n');
  expect(markup).toContain('Moss');
  expect(markup).not.toContain('the Second');
});
