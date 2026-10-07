import { expect, test } from 'playwright/test';

test('the versioned painter draws safe named October portraits, sleep and fed state', async ({ page }) => {
  await page.goto('/');
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
    return { title: awake.querySelector('title')?.textContent, injected: awake.querySelectorAll('script').length, role: awake.getAttribute('role'), hidden: asleep.getAttribute('aria-hidden'), asleep: asleep.dataset.asleep, eyes: awake.querySelectorAll('.portrait__eye').length, top: Number(awake.dataset.top), mouth:delighted.style.getPropertyValue('--mouth'), ears:awake.querySelectorAll('.portrait__ear').length };
  });
  expect(result).toMatchObject({ title: '<script>unsafe</script>', injected: 0, role: 'img', hidden: 'true', asleep: 'true', eyes: 2, mouth:'1', ears:2 });
  expect(result.top).toBeGreaterThan(0);
});
