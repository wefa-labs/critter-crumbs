import { test } from 'playwright/test';
test('capture the matching reference',async({page})=>{
 await page.goto('http://127.0.0.1:4184');
 await page.evaluate(()=>{localStorage.setItem('scatter-layouts:view-8',JSON.stringify({state:'scatter',size:8,pile:'exact',scene:'window',device:'phone',on:{inked:true,daylight:false,ink:false,dusk:false,cel:false}}));});
 await page.reload();await page.waitForSelector('.screen');
 await page.evaluate(()=>{document.querySelectorAll<HTMLElement>('.frame').forEach(node=>node.style.transform='none');});
 await page.locator('.screen').first().screenshot({path:'.scratch/screens/reference-phone.png'});
});
