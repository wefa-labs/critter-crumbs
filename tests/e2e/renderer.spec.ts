import { expect, test } from 'playwright/test';

test('all 49 controls survive context loss, one retry and switching renderers',async({page})=>{
 test.setTimeout(60000);
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.setViewportSize({width:1440,height:1000});await page.goto('/__preview/rendering');
 await page.locator('select').selectOption('49');await expect(page.locator('.stage')).toHaveCount(49);
 await expect(page.locator('[data-mesh="ready"]').first()).toBeVisible();
 expect(await page.locator('[data-mesh="ready"]').count()).toBeLessThanOrEqual(9);
 await page.getByRole('button',{name:'Lose the 3D context',exact:true}).click();
 await expect(page.getByRole('button',{name:'Try 3D again',exact:true})).toBeVisible();await expect(page.locator('canvas')).toHaveCount(0);
 await page.getByRole('button',{name:'Give a crumb to Critter 49',exact:true}).press('Enter');
 await page.getByRole('button',{name:'Try 3D again',exact:true}).click();await expect(page.locator('canvas')).toHaveCount(1);
 await expect.poll(async()=>{const text=await page.locator('output').textContent();return text?JSON.parse(text).counts[48]:null;}).toBe(1);
 await page.getByRole('checkbox',{name:'Simple view',exact:true}).check();await expect(page.locator('canvas')).toHaveCount(0);
 await page.getByRole('checkbox',{name:'Simple view',exact:true}).uncheck();await expect(page.locator('canvas')).toHaveCount(1);
 await expect.poll(async()=>JSON.parse((await page.locator('output').textContent())!).counts[48]).toBe(1);
 await page.getByRole('button',{name:'Lose the 3D context',exact:true}).click();await expect(page.locator('canvas')).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Try 3D again',exact:true})).toHaveCount(0);expect(errors).toEqual([]);
});

test('replacing the stage world disposes the old renderer without a dead-world callback',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/__preview/rendering');
 for(const count of ['6','49','10']){await page.locator('select').selectOption(count);await expect(page.locator('.stage')).toHaveCount(Number(count));await expect(page.locator('[data-mesh="ready"]').first()).toBeVisible();}
 await page.getByRole('checkbox',{name:'Simple view',exact:true}).check();await expect(page.locator('canvas')).toHaveCount(0);
 expect(errors).toEqual([]);
});
