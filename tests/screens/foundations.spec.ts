import { expect, test } from 'playwright/test';
for (const size of [{width:390,height:844},{width:1440,height:900}]) test(`October foundation ${size.width}`,async({page})=>{
 await page.setViewportSize(size);await page.goto('/dev/screens?capture&state=scatter');
 await expect(page.locator('.circle-spot')).toHaveCount(8);await expect(page.locator('.circle-spot .portrait-v2')).toHaveCount(8);
 await expect(page.locator('.wall-band image').first()).toBeVisible();
 await page.screenshot({path:`.scratch/screens/foundation-${size.width}.png`});
});
