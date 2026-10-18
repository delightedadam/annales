import {test,expect} from '@playwright/test';
test('select several chapters, combine and share',async({page})=>{
 await page.goto('./');await page.getByText('Choisir des chapitres',{exact:false}).click();
 await page.getByRole('checkbox',{name:/Acides et bases/}).check();
 await page.getByRole('checkbox',{name:/Description et étude du mouvement/}).check();
 await page.getByRole('button',{name:'Sujets complets',exact:true}).click();
 await expect(page.locator('article').first()).toBeVisible();
 await expect(page.locator('article').first()).toContainText('Chapitres sélectionnés présents');
 const count=Number((await page.locator('.results-toolbar h2').innerText()).match(/\d+/)?.[0]);
 await page.getByLabel('Combiner les notions').selectOption('OR');
 expect(Number((await page.locator('.results-toolbar h2').innerText()).match(/\d+/)?.[0])).toBeGreaterThan(count);
 await page.reload();await page.getByText('Choisir des chapitres',{exact:false}).click();
 await expect(page.getByRole('checkbox',{name:/Acides et bases/})).toBeChecked();
 await expect(page.getByRole('checkbox',{name:/Description et étude du mouvement/})).toBeChecked();
 await page.getByRole('button',{name:'Effacer les chapitres sélectionnés'}).click();
 await expect(page.getByRole('checkbox',{name:/Acides et bases/})).not.toBeChecked();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
