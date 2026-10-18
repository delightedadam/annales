import {test,expect} from '@playwright/test';
test('Première is optional, searchable and preserved in links',async({page})=>{
 await page.goto('./');await expect(page.getByLabel('Niveau',{exact:true})).toHaveValue('Terminale');
 await page.getByLabel('Niveau',{exact:true}).selectOption('Première');
 await expect(page.locator('article').first()).toContainText('Première');
 await page.getByLabel('Rechercher des notions ou un titre').fill('oxydoréduction');
 await page.getByRole('button',{name:'Rechercher',exact:true}).click();
 await expect(page.locator('article').first()).toContainText('Oxydoréduction');
 await page.reload();await expect(page.getByLabel('Niveau',{exact:true})).toHaveValue('Première');
 await expect(page.locator('article').first()).toContainText('Première');
 await page.getByRole('button',{name:'Trouver un sujet à partir',exact:false}).click();
 await page.getByLabel('Texte lu',{exact:false}).fill('Oxydoréduction');
 await page.getByRole('button',{name:'Trouver des sujets similaires',exact:true}).click();
 await expect(page.getByLabel('Niveau',{exact:true})).toHaveValue('Première');
 await expect(page.locator('article').first()).toContainText('Première');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
