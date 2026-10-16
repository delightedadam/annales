import {load} from 'cheerio';
import {getPage} from './source-http';
import {clean} from './connectors';
import {safeUrl} from '../src/model';
export type Candidate={url:string;kind:'exercise'|'paper';discoveredOn:string;title:string;parentUrl?:string};
export type Discovery={candidates:Candidate[];listingPages:string[];expectedExercises?:number;errors:{url:string;message:string}[]};
export async function discoverLabo():Promise<Discovery>{
 const start=new URL('https://www.labolycee.org/exercices');start.searchParams.set('cursus','Tale Spécialité Physique Chimie');
 const queue=[start.href],visited=new Set<string>(),candidates=new Map<string,Candidate>(),errors:Discovery['errors']=[];let expectedExercises:number|undefined;
 for(let i=0;i<queue.length;i++){
  const url=queue[i];if(visited.has(url))continue;visited.add(url);
  try{
   const $=load(await getPage(url));
   const selected=$('select[name="cursus"] option[selected]').attr('value');
   if(selected!=='Tale Spécialité Physique Chimie')throw Error('Le filtre de cursus n’est pas appliqué');
   const text=clean($('main').text());
   const count=text.match(/(\d+) exercices\s*·\s*page/i);if(count)expectedExercises=Number(count[1]);
   $('article h3 a[href^="/exercices/"]').each((_,a)=>{const u=new URL($(a).attr('href')!,url).href;candidates.set(u,{url:u,kind:'exercise',discoveredOn:url,title:clean($(a).text())});});
   $('a[href*="page="]').each((_,a)=>{const u=new URL($(a).attr('href')!,url);if(u.pathname==='/exercices'&&u.searchParams.get('cursus')==='Tale Spécialité Physique Chimie'&&!visited.has(u.href)&&!queue.includes(u.href))queue.push(u.href);});
  }catch(e){errors.push({url,message:String(e)});}
 }
 // Complete papers can exist before their individual exercise pages are published.
 const papersRoot='https://www.labolycee.org/sujets';
 try{
  const root=load(await getPage(papersRoot));visited.add(papersRoot);
  const years=root('select[name="annee"] option').map((_,e)=>root(e).attr('value')).get().filter(y=>/^20\d{2}$/.test(y)&&Number(y)>=2021);
  for(const year of years){const url=`${papersRoot}?annee=${year}`;try{
   const $=load(await getPage(url));visited.add(url);
   $('article.carte-sujet h3 a').each((_,a)=>{const title=clean($(a).text());if(/sciences de l.ingénieur|concours|STI2D|ST2S|\bSTL\b/i.test(title))return;const u=new URL($(a).attr('href')!,url).href;candidates.set(u,{url:u,kind:'paper',discoveredOn:url,title});});
  }catch(e){errors.push({url,message:String(e)});}}
 }catch(e){errors.push({url:papersRoot,message:String(e)});}
 return {candidates:[...candidates.values()],listingPages:[...visited],expectedExercises,errors};
}
export async function discoverVecteur():Promise<Discovery>{
 const geo='https://www.vecteurbac.fr/terminale-specialite-physique-chimie-menu-geographique/';
 const themes='https://www.vecteurbac.fr/terminale-specialite-physique-chimie-menu-thematique/';
 const candidates=new Map<string,Candidate>(),visited:string[]=[],errors:Discovery['errors']=[];
 const add=(href:string|undefined,kind:Candidate['kind'],title:string,discoveredOn:string,parentUrl?:string)=>{if(!href)return;const url=new URL(href,discoveredOn).href;if(safeUrl(url)&&new URL(url).hostname.includes('vecteurbac')&&!/sciences-de-lingenieur|sti2d|stl-|st2s|premiere/.test(url))candidates.set(url,{url,kind,title:clean(title),discoveredOn,parentUrl});};
 try{
  const $=load(await getPage(geo));visited.push(geo);
  $('.entry-content table tr').each((_,tr)=>{
   const cells=$(tr).find('td'),paper=cells.first().find('a').first();const parent=paper.attr('href');
   if(!parent||/sciences-de-lingenieur|sti2d|stl-|st2s/.test(parent))return;
   add(parent,'paper',paper.text(),geo);
   cells.slice(1).find('a').each((_,a)=>add($(a).attr('href'),'exercise',$(a).text(),geo,parent));
  });
  const index=load(await getPage(themes));visited.push(themes);
  const links=[...new Set(index('.entry-content a').map((_,e)=>index(e).attr('href')).get().filter(u=>/\/terminale-specialite-(chimie|physique)-/.test(u)))];
  for(const url of links){try{
   const d=load(await getPage(url));visited.push(url);
   d('.entry-content h2 a').each((_,a)=>{
    const block=d(a).closest('.wp-block-group'),text=clean(block.text());
    if(!/Exercice/i.test(text)||/Sciences de l.ingénieur|STI2D|ST2S|STL\b/i.test(text))return;
    const href=d(a).attr('href');if(href&&/statistiques|terminale-specialite-(chimie|physique)-/.test(href))return;
    add(href,'exercise',d(a).text(),url);
   });
  }catch(e){errors.push({url,message:String(e)});}}
 }catch(e){errors.push({url:geo,message:String(e)});}
 return {candidates:[...candidates.values()],listingPages:visited,errors};
}
