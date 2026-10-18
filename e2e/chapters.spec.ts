import {test,expect} from '@playwright/test';
test('select several chapters, combine and share',async({page})=>{
 await page.goto('./');await page.getByText('Choisir des chapitres',{exact:false}).click();
 await expect(page.locator('.chapter-picker').getByRole('checkbox')).toHaveCount(19);
 await page.getByRole('checkbox',{name:/Chapitre 1 — Transformations acide-base/}).check();
 await page.getByRole('checkbox',{name:/Chapitre 3 — Deuxième loi de Newton/}).check();
 await page.getByRole('button',{name:'Sujets complets',exact:true}).click();
 await expect(page.locator('article').first()).toBeVisible();
 await expect(page.locator('article').first()).toContainText('Chapitres sélectionnés présents');
 const count=Number((await page.locator('.results-toolbar h2').innerText()).match(/\d+/)?.[0]);
 await page.getByLabel('Combiner les notions').selectOption('OR');
 expect(Number((await page.locator('.results-toolbar h2').innerText()).match(/\d+/)?.[0])).toBeGreaterThan(count);
 await page.reload();await page.getByText('Choisir des chapitres',{exact:false}).click();
 await expect(page.getByRole('checkbox',{name:/Chapitre 1 — Transformations acide-base/})).toBeChecked();
 await expect(page.getByRole('checkbox',{name:/Chapitre 3 — Deuxième loi de Newton/})).toBeChecked();
 await page.getByRole('button',{name:'Effacer les chapitres sélectionnés'}).click();
 await expect(page.getByRole('checkbox',{name:/Chapitre 1 — Transformations acide-base/})).not.toBeChecked();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
