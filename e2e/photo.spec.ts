import {test,expect} from '@playwright/test';

test('photo scan reads French text locally and finds similar exercises',async({page})=>{
 test.setTimeout(120000);
 const external:string[]=[];
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().includes('127.0.0.1'))external.push(r.url())});
 await page.goto('./');
 await page.getByRole('button',{name:'Trouver un sujet à partir',exact:false}).click();
 await expect(page.getByTestId('photo-camera')).toHaveAttribute('capture','environment');
 const png=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=1600;c.height=500;const ctx=c.getContext('2d')!;ctx.fillStyle='white';ctx.fillRect(0,0,1600,500);ctx.fillStyle='black';ctx.font='40px Arial';['Exercice : circuit RC et condensateur','1. Déterminer la constante de temps.','2. Résoudre une équation différentielle.'].forEach((s,i)=>ctx.fillText(s,50,100+i*100));return c.toDataURL('image/png').split(',')[1];});
 await page.getByTestId('photo-upload').setInputFiles({name:'exercice.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});
 await expect(page.getByLabel('Texte lu', {exact:false})).toHaveValue(/condensateur/i,{timeout:90000});
 await expect(page.getByRole('checkbox',{name:/Circuits RC/})).toBeChecked();
 await page.getByRole('button',{name:'Trouver des sujets similaires',exact:true}).click();
 await expect(page.locator('article').first()).toContainText('Circuits RC');
 await expect(page.getByLabel('Combiner les notions')).toHaveValue('OR');
 expect(page.url()).not.toContain('D%C3%A9terminer');
 expect(external).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('photo errors and editable text fallback',async({page})=>{
 await page.goto('./');await page.getByRole('button',{name:'Trouver un sujet à partir',exact:false}).click();
 await page.getByTestId('photo-upload').setInputFiles({name:'wrong.txt',mimeType:'text/plain',buffer:Buffer.from('not an image')});
 await expect(page.getByRole('alert')).toContainText('Choisissez une image');
 await page.getByLabel('Texte lu',{exact:false}).fill('Justifier la réponse');
 await expect(page.getByText('Aucune notion reconnue.',{exact:false})).toBeVisible();
 await page.getByLabel('Texte lu',{exact:false}).fill('Mesurer le pH à chaque ajout jusqu’à l’équivalence.');
 await expect(page.getByRole('checkbox',{name:/Acide-base/})).toBeChecked();
 await page.getByRole('checkbox',{name:/Acide-base/}).uncheck();
 await page.getByRole('checkbox',{name:/Titrage/}).uncheck();
 await expect(page.getByRole('button',{name:'Trouver des sujets similaires',exact:true})).toBeDisabled();
});
