import {test,expect} from '@playwright/test';
test('recherche, partage, navigation et sources',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('./');await expect(page.getByRole('heading',{name:'Qu’allez-vous réviser ?'})).toBeVisible();
 await expect(page.locator('article')).toHaveCount(8);
 await page.getByRole('button',{name:'Suivant →'}).click();await expect(page.getByText(/Page 2 sur \d+/)).toBeVisible();
 await page.getByLabel('Rechercher des notions ou un titre').fill('lessive de cendre');
 await page.getByRole('button',{name:'Rechercher',exact:true}).click();await expect(page.locator('article').filter({hasText:'La lessive de cendre'})).toHaveCount(1);
 await expect(page.locator('article').filter({hasText:'La lessive de cendre'}).getByText('Labolycée',{exact:true})).toBeVisible();
 await page.reload();await expect(page.getByLabel('Rechercher des notions ou un titre')).toHaveValue('lessive de cendre');
 await page.getByLabel('Rechercher des notions ou un titre').fill('zzzzxyz');await page.getByRole('button',{name:'Rechercher',exact:true}).click();await expect(page.getByText('Aucun résultat dans cet index.')).toBeVisible();
 await page.getByRole('button',{name:'Réinitialiser la recherche'}).click();await expect(page.locator('article')).toHaveCount(8);
 await page.getByRole('button',{name:'Sujets complets',exact:true}).click();await expect(page.locator('article').first()).toContainText('SUJET COMPLET');
 expect(await page.locator('iframe').count()).toBe(0);
 for(const a of await page.locator('article a[target="_blank"]').all()){expect(await a.getAttribute('href')).toMatch(/^https:\/\/(www\.)?(labolycee\.org|vecteurbac\.fr)\//);}
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('button',{name:'Activer le mode sombre'}).click();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 expect(errors).toEqual([]);
});
test('clavier et filtres',async({page})=>{
 await page.goto('./');await page.keyboard.press('Tab');await expect(page.getByText('Aller à la recherche')).toBeFocused();
 await page.getByLabel('Rechercher des notions ou un titre').focus();await page.keyboard.type('Doppler');await page.keyboard.press('Enter');await expect(page.locator('article').first()).toContainText('Doppler');
 await page.getByText('Filtres Année, source, corrigé').click();await page.getByLabel('Année',{exact:true}).selectOption('2025');await expect(page.locator('article').first()).toContainText('2025');
});
test('tags, mode OU et lecteur conditionnel avec repli',async({page})=>{
 await page.route('**/catalogue.json',async route=>{const response=await route.fetch();const c=await response.json();c.resources[0].embed={allowed:true,permissionUrl:c.resources[0].pageUrl,reason:'Fixture de test, jamais publiée'};await route.fulfill({response,json:c})});
 await page.route('https://www.vecteurbac.fr/**/*.pdf',route=>route.fulfill({status:403,body:'Simulation de blocage'}));
 await page.goto('./?q=Radar%20p%C3%A9dagogique');
 await page.getByRole('button',{name:'Lire ici',exact:true}).click();await expect(page.getByRole('heading',{name:/Radar pédagogique/})).toBeVisible();
 await expect(page.getByTitle('Sujet PDF')).toBeVisible();await page.getByLabel('Page',{exact:true}).fill('2');await page.getByLabel('Zoom').selectOption('150');
 await page.getByRole('button',{name:'Le document ne s’affiche pas'}).click();await expect(page.getByText('L’affichage intégré n’est pas disponible.',{exact:false})).toBeVisible();await expect(page.getByRole('link',{name:'Ouvrir le sujet original'})).toBeVisible();
 await page.getByRole('button',{name:'Retour aux résultats',exact:false}).click();
 await page.getByLabel('Rechercher des notions ou un titre').fill('');await page.getByRole('button',{name:'Rechercher',exact:true}).click();
 await page.getByLabel('Ajouter une notion',{exact:true}).fill('Effet Doppler');await page.getByRole('button',{name:'Ajouter',exact:true}).click();
 await page.getByLabel('Ajouter une notion',{exact:true}).fill('Acide-base');await page.getByRole('button',{name:'Ajouter',exact:true}).click();
 const countAND=await page.locator('.results-toolbar h2').textContent();
 await page.getByLabel('Combiner les notions',{exact:true}).selectOption('OR');await expect(page.locator('article').first()).toBeVisible();
 expect(Number((await page.locator('.results-toolbar h2').textContent())?.match(/\d+/)?.[0])).toBeGreaterThan(Number(countAND?.match(/\d+/)?.[0]));
});
