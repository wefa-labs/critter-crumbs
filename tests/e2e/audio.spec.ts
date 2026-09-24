import { expect, test } from 'playwright/test';
test('offline DSP meets finite and bounded-pour timing and peak limits', async ({ page }) => {
  const errors: string[]=[]; page.on('pageerror',error => errors.push(error.message));
  await page.goto('/__preview/audio'); await page.getByRole('button',{name:'Check sound cues',exact:true}).click();
  await expect(page.getByTestId('audio-result')).toHaveText('Pass');
  await expect(page.getByRole('row')).toHaveCount(18);
  await expect(page.getByText('"created":false',{exact:false})).toBeVisible(); expect(errors).toEqual([]);
});
