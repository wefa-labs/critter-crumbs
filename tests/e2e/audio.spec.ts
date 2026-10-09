import { expect, test } from 'playwright/test';
test('offline DSP meets finite and bounded-pour timing and peak limits, with every recording at its cue’s level', async ({ page }) => {
  const errors: string[]=[]; page.on('pageerror',error => errors.push(error.message));
  await page.goto('/__preview/audio'); await page.getByRole('button',{name:'Check sound cues',exact:true}).click();
  await expect(page.getByTestId('audio-result')).toHaveText('Pass');
  /* a header, 15 synth cues, 10 cues with their recordings, the pour over both beds, the quiet crumb and a whole feast */
  await expect(page.getByRole('row')).toHaveCount(32);
  await expect(page.getByRole('row', { name: /recorded/ })).toHaveCount(10);
  await expect(page.getByText('"created":false',{exact:false})).toBeVisible(); expect(errors).toEqual([]);
});
