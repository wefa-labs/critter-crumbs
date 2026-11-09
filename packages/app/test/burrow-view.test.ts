import { describe, expect, it } from 'vitest';
import { feastAction, feastDay, feastProgress, feastsUnderWay, otherFeasts, phasesKey, youLast, type BurrowFeast, type BurrowMember } from '../src/app/burrow-view.js';
import { CLOVER, FERN, JUNIPER, MOSS } from '../src/app/painted-scene.js';

/* What the burrow's page reads off its view and its feasts' views: which feasts are under way, who has done this phase's
   part (PRD R5 and P3), and the one action on a feast's card. Time is given, never read. */
const HOUR = 3600000, now = 100 * HOUR;
const feast = (id: string, status: BurrowFeast['status'], gatheringEndsAt: number, scatteringEndsAt: number): BurrowFeast =>
  ({ id, title: id, status, gatheringEndsAt, scatteringEndsAt, participantsFrozenAt: null, participants: [] });
const feasts = [
  feast('scattering', 'open', now - HOUR, now + 30 * HOUR),
  feast('gathering', 'open', now + 50 * HOUR, now + 90 * HOUR),
  feast('closing soon', 'open', now - 2 * HOUR, now + 2 * HOUR),
  feast('feasted', 'open', now - 30 * HOUR, now - 10 * HOUR),
  feast('draft', 'draft', now + 70 * HOUR, now + 99 * HOUR),
  feast('cancelled', 'cancelled', now - 50 * HOUR, now - 40 * HOUR),
  feast('void', 'void', now - 20 * HOUR, now - 5 * HOUR),
];

describe('the feasts under way', () => {
  it('are those gathering or scattering at the given time, the one that closes next first', () => {
    expect(feastsUnderWay(feasts, now).map(({ feast, phase, closes }) => [feast.id, phase, closes]))
      .toEqual([['closing soon', 'scattering', now + 2 * HOUR], ['scattering', 'scattering', now + 30 * HOUR], ['gathering', 'gathering', now + 50 * HOUR]]);
  });

  it('leave the rest as rows, the latest first: a draft, then those that feasted, ended or were cancelled', () => {
    expect(otherFeasts(feasts, now).map(one => one.id)).toEqual(['draft', 'void', 'feasted', 'cancelled']);
  });

  it('follow the time they are given: once gathering closes, a gathering feast is scattering', () => {
    expect(feastsUnderWay([feasts[1]!], now + 51 * HOUR).map(one => one.phase)).toEqual(['scattering']);
    expect(feastsUnderWay([feasts[1]!], now + 91 * HOUR)).toEqual([]);
  });

  it("give a row the day scattering closed for a feast that feasted, and the day gathering closed, or would, for the rest", () => {
    expect(feastDay(feasts[3]!, 'feast')).toBe(now - 10 * HOUR);
    expect(feastDay(feasts[6]!, 'void')).toBe(now - 20 * HOUR);
    expect(feastDay(feasts[4]!, 'draft')).toBe(now + 70 * HOUR);
  });
});

describe("a feast's progress, as the burrow sees it", () => {
  const targets = [MOSS, FERN, JUNIPER].map((address, position) => ({ id: `0x${String(position + 1).padStart(64, '0')}` as `0x${string}`, ownerAddress: address as `0x${string}`, name: address, position, kind: 'person' as const }));

  it('while scattering, is everyone taking part in the order the feast froze them, and whether they have scattered', () => {
    const progress = feastProgress({ kind: 'people', participants: [FERN, MOSS, CLOVER] as `0x${string}`[], participation: { written: [], scattered: [MOSS.toLowerCase()] }, targets }, 'scattering');
    expect(progress).toEqual([{ address: FERN, done: false }, { address: MOSS, done: true }, { address: CLOVER, done: false }]);
  });

  it('while gathering a people feast, is everyone it has a critter for, and whether their statement is written', () => {
    const progress = feastProgress({ kind: 'people', participants: [], participation: { written: [targets[1]!.id], scattered: [] }, targets }, 'gathering');
    expect(progress).toEqual([{ address: MOSS, done: false }, { address: FERN, done: true }, { address: JUNIPER, done: false }]);
  });

  it("while gathering an options feast, is nobody's: its statements are its creator's to write", () => {
    expect(feastProgress({ kind: 'options', participants: [], participation: { written: [], scattered: [] }, targets }, 'gathering')).toBeNull();
  });
});

describe("the one action on a feast's card", () => {
  const feastOf = (kind: 'people' | 'options', createdBy: string, participants: string[] = []) => ({ kind, createdBy: createdBy as `0x${string}`, participants: participants as `0x${string}`[] });

  it('is Scatter crumbs while scattering for everyone taking part, also before the feast\'s own view has arrived', () => {
    expect(feastAction('scattering', null, MOSS)).toBe('scatter.title');
    expect(feastAction('scattering', feastOf('options', FERN, [FERN, MOSS]), MOSS.toLowerCase())).toBe('scatter.title');
  });

  it('is nothing while scattering for a member who joined after the set froze: they are in the next feast', () => {
    expect(feastAction('scattering', feastOf('people', FERN, [FERN, JUNIPER]), MOSS)).toBeNull();
  });

  it("is your statement while a people feast gathers, also before the feast's own view has arrived", () => {
    expect(feastAction('gathering', feastOf('people', FERN), MOSS)).toBe('gathering.yours.title');
    expect(feastAction('gathering', null, MOSS)).toBe('gathering.yours.title');
  });

  it("is the option statements for an options feast's creator, and nothing for its other members while it gathers", () => {
    expect(feastAction('gathering', feastOf('options', MOSS), MOSS.toLowerCase())).toBe('gathering.options.title');
    expect(feastAction('gathering', feastOf('options', MOSS), FERN)).toBeNull();
  });
});

describe('the phases of the burrow\'s feasts', () => {
  it('change as one key when a deadline passes, and not before', () => {
    expect(phasesKey(feasts, now)).toBe(phasesKey(feasts, now + HOUR));
    expect(phasesKey(feasts, now + 3 * HOUR)).not.toBe(phasesKey(feasts, now));
  });
});

describe("the burrow's order on its floor", () => {
  it('keeps the burrow\'s order and puts you last, whatever the case of your address', () => {
    const members = [MOSS, JUNIPER, FERN].map(address => ({ address }) as BurrowMember);
    expect(youLast(members, JUNIPER.toLowerCase()).map(member => member.address)).toEqual([MOSS, FERN, JUNIPER]);
  });
});
