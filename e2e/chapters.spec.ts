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

test('separate numbered programmes preserve course order',async({page})=>{
 await page.goto('./');await page.getByText('Choisir des chapitres',{exact:false}).click();
 const labels=page.locator('.chapter-picker strong');await expect(labels.first()).toContainText('Chapitre 1 — Transformations acide-base');await expect(labels.nth(1)).toContainText('Chapitre 2 — Description');
 await page.getByRole('button',{name:'Programme de Première',exact:true}).click();await expect(page.getByLabel('Niveau',{exact:true})).toHaveValue('Première');await expect(labels).toHaveCount(18);await expect(labels.first()).toHaveText('Chapitre 1 — Quantité de matière et concentrations');
 await page.getByRole('checkbox',{name:/Chapitre 3 — Réactions/}).check();await expect(page.locator('article').first()).toContainText('Première');await expect(page.locator('article').first()).toContainText('Oxydoréduction');
 await page.getByRole('button',{name:'Programme de Terminale',exact:true}).click();await expect(labels).toHaveCount(19);await expect(page.locator('.chapter-picker input:checked')).toHaveCount(0);
});
