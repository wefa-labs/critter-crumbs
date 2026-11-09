import { test, expect, type Page } from 'playwright/test';
import { connectLocal, readJson } from './session.js';

/** The seeded burrow's owner, rehearsal critter 1, opens Start a feast for an options feast with three options. */
async function openOptionsSetup(page: Page, request: Parameters<Parameters<typeof test>[2]>[0]['request']) {
  const seeded = await request.post('/api/dev/seed', { data: { kind: 'options', phase: 'draft' } });
  expect(seeded.ok()).toBe(true);
  const { burrowId } = await seeded.json() as { burrowId: string };
  await page.goto('/');
  await connectLocal(page, 1);
  await page.goto(`/burrows/${burrowId}/feasts/new`);
  await page.getByRole('radio', { name: 'To options', exact: true }).check();
  for (let added = 1; added < 3; added++) await page.getByRole('button', { name: 'Add an option', exact: true }).click();
}

// The form's boxes are cards (Design System §3.4) and its groups have no box at all, as the flow page draws them: a
// pill radius on a tall box curves through its own fields (QA lifecycle-14).
test('the set-up form draws its choices and options as cards, not capsules', async ({ page, request }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openOptionsSetup(page, request);
  const radii = await page.locator('form .choice, form .option-card').evaluateAll(cards => cards.map(card => parseFloat(getComputedStyle(card).borderTopLeftRadius)));
  expect(radii).toHaveLength(6 + 3);
  for (const radius of radii) { expect(radius).toBeGreaterThan(0); expect(radius).toBeLessThanOrEqual(22); }
  const groups = await page.locator('form fieldset').evaluateAll(groups => groups.map(group => getComputedStyle(group).borderTopStyle));
  expect(groups).toHaveLength(3);
  for (const border of groups) expect(border).toBe('none');
});

// The type and the privacy pair are native radios under their legends, and crumbs per critter steps in tens between
// 10 and 1,000 (PRD P9), so the keyboard and the screen reader lose nothing (UI audit X4).
test('the set-up form’s cards are radios and its stepper keeps to the bounds', async ({ page, request }) => {
  await openOptionsSetup(page, request);
  const closed = page.getByRole('group', { name: 'Who gave what', exact: true }).getByRole('radio', { name: 'Closed — nobody sees individual scatters', exact: true });
  await expect(closed).toBeChecked();
  await closed.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('radio', { name: 'Open to the burrow after the feast', exact: true })).toBeChecked();
  await expect(page.getByRole('radio', { name: 'To people', exact: true })).toHaveAccessibleDescription('Recognising contribution. Everyone writes what they did.');
  const crumbs = page.getByRole('spinbutton', { name: 'Crumbs per critter', exact: true }), fewer = page.getByRole('button', { name: 'Fewer crumbs', exact: true });
  await expect(crumbs).toHaveValue('100');
  await page.getByRole('button', { name: 'More crumbs', exact: true }).click();
  await expect(crumbs).toHaveValue('110');
  for (let press = 0; press < 10; press++) await fewer.click();
  await expect(crumbs).toHaveValue('10');
  await expect(fewer).toHaveAttribute('aria-disabled', 'true');
  await fewer.click({ force: true });
  await expect(crumbs).toHaveValue('10');
  const more = page.getByRole('button', { name: 'More crumbs', exact: true });
  await crumbs.fill('995');
  await more.click();
  await expect(crumbs).toHaveValue('1000');
  await expect(more).toHaveAttribute('aria-disabled', 'true');
});

// What the cards and the stepper choose is what the draft keeps (PRD F4), saved through the form as a member would.
test('a draft saved from the cards and the stepper keeps what they chose', async ({ page, request }) => {
  await openOptionsSetup(page, request);
  await page.getByRole('textbox', { name: 'Feast title', exact: true }).fill('Autumn budget');
  const names = page.getByRole('textbox', { name: 'Option name', exact: true });
  for (const [index, name] of ['Garden', 'Library', 'Workshop'].entries()) await names.nth(index).fill(name);
  await page.getByRole('button', { name: 'More crumbs', exact: true }).click();
  await page.getByRole('radio', { name: 'Public — anyone with the link, and recorded on-chain', exact: true }).check();
  await page.getByRole('radio', { name: 'Open to the burrow after the feast', exact: true }).check();
  await page.getByRole('button', { name: 'Save draft', exact: true }).click();
  await expect(page).toHaveURL(/\/feasts\/[0-9a-f-]{36}$/);
  const { body } = await readJson<{ kind: string; crumbsPerCritter: number; aggregatePublic: boolean; individualOpen: boolean; targets: { name: string }[] }>(page, `/api/feasts/${page.url().split('/').pop()}`);
  expect(body).toMatchObject({ kind: 'options', crumbsPerCritter: 110, aggregatePublic: true, individualOpen: true });
  expect(body.targets.map(target => target.name)).toEqual(['Garden', 'Library', 'Workshop']);
});

// A deadline already past used to read "Scattering has to close after gathering." (QA edge-states-09).
test('saving a draft whose gathering deadline has already passed says so', async ({ page, request }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openOptionsSetup(page, request);
  await page.getByRole('textbox', { name: 'Feast title', exact: true }).fill('Our budget');
  const names = page.getByRole('textbox', { name: 'Option name', exact: true });
  for (const [index, name] of ['Garden', 'Library', 'Workshop'].entries()) await names.nth(index).fill(name);
  await page.getByLabel('Gathering closes', { exact: true }).fill('2020-01-01T12:00');
  const save = page.getByRole('button', { name: 'Save draft', exact: true });
  await save.click();
  await expect(page.locator('.place-actions .sheet-notice')).toHaveText('That gathering deadline has already passed. Choose a later time.');
  await expect(save).toHaveAccessibleDescription('That gathering deadline has already passed. Choose a later time.');
});

// PRD R6: a people feast needs three critters in the burrow at creation; Save draft waits, with the reason beside it.
test('a people feast in a burrow of two holds Save draft and says why, and an options feast does not', async ({ page }) => {
  await page.goto('/');
  await connectLocal(page, 1);
  const burrowId = await page.evaluate(async () => {
    const write = async (path: string, body: unknown) => (await fetch(path, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })).json() as Promise<{ id: string }>;
    const { id } = await write('/api/burrows', { name: 'Garden council' });
    await write(`/api/burrows/${id}/members`, { address: '0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF' });
    return id;
  });
  await page.goto(`/burrows/${burrowId}/feasts/new`);
  // the pair face each other on the floor, as the flow page's too-few frame draws them
  await expect(page.locator('.screen-floor .floor-critter')).toHaveCount(2);
  expect(await page.locator('.screen-floor .floor-critter').evaluateAll(critters => critters.map(critter => critter.getAttribute('data-face')))).toEqual(['right', 'left']);
  const save = page.getByRole('button', { name: 'Save draft', exact: true });
  await expect(save).toHaveAttribute('aria-disabled', 'true');
  await expect(save).toHaveAccessibleDescription('A people feast needs at least 3 critters. This burrow has 2.');
  await page.getByRole('textbox', { name: 'Feast title', exact: true }).fill('Our shared work');
  await save.click({ force: true });
  await page.getByRole('textbox', { name: 'Feast title', exact: true }).press('Enter');
  await expect(page).toHaveURL(new RegExp(`/burrows/${burrowId}/feasts/new$`));
  await page.getByRole('radio', { name: 'To options', exact: true }).check();
  await expect(save).toHaveAttribute('aria-disabled', 'false');
  await expect(page.getByText('A people feast needs at least 3 critters. This burrow has 2.', { exact: true })).toHaveCount(0);
});

// Opening a draft after its gathering deadline offered a dialog that could only fail (QA copy-08, item 2).
test('a draft whose gathering deadline has passed says it cannot open, and what to do instead', async ({ page, request }) => {
  const seeded = await request.post('/api/dev/seed', { data: { kind: 'options', phase: 'draft' } }); expect(seeded.ok()).toBe(true);
  const { feasts } = await seeded.json() as { feasts: { id: string; gatheringEndsAt: number }[] }, draft = feasts[0]!;
  expect((await request.post('/api/dev/time', { data: { now: draft.gatheringEndsAt + 60000 } })).ok()).toBe(true);
  await page.goto('/');
  await connectLocal(page, 1);
  await page.goto(`/feasts/${draft.id}`);
  await expect(page.getByText("This draft's gathering deadline has passed, so it can't open. Cancel it and start a new feast with later times.", { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Open the feast', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Cancel this feast', exact: true })).toBeVisible();
});
