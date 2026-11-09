import { expect, test } from 'playwright/test';

/* Every build paints version 2 as Garden Spirits, and the development server keeps the October inked drawing at
   ?critters=2 (ADR 0006). Both draw a portrait as Design System §5.7 asks: the name as text, an image when it stands
   alone and hidden beside its name, two eyes, an authored top, asleep and delighted (§5.4). Ears are not counted: they
   belong to the critter, not the portrait (§5.2 draws some without), and Moss is now an earless moth. */
for (const [look, search, garden] of [['Garden Spirits', '', true], ['the October inked drawing', '?critters=2', false]] as const) test(`the versioned painter draws safe named portraits, sleep and fed state as ${look}`, async ({ page }) => {
  await page.goto(`/${search}`);
  const result = await page.evaluate(async () => {
    const painterPath = '/src/portraits/painter.ts';
    const generatorPath = '/src/game/pipeline.ts';
    const { paintCritter } = await import(painterPath);
    const { generateCritter } = await import(generatorPath);
    const params = generateCritter('0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf', 0, '2');
    const awake = paintCritter(document, params, { name: '<script>unsafe</script>', size: 64 });
    const delighted = paintCritter(document, params, { name: 'Moss', delighted: true });
    const asleep = paintCritter(document, params, { name: 'Moss', asleep: true, decorative: true });
    document.body.append(awake, asleep);
    return { title: awake.querySelector('title')?.textContent, injected: awake.querySelectorAll('script').length, role: awake.getAttribute('role'), hidden: asleep.getAttribute('aria-hidden'), asleep: asleep.dataset.asleep, eyes: awake.querySelectorAll('.portrait__eye').length, top: Number(awake.dataset.top), mouth:delighted.style.getPropertyValue('--mouth'), garden:awake.classList.contains('garden') };
  });
  expect(result).toMatchObject({ title: '<script>unsafe</script>', injected: 0, role: 'img', hidden: 'true', asleep: 'true', eyes: 2, mouth:'1', garden });
  expect(result.top).toBeGreaterThan(0);
});
