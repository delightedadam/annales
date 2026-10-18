import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {load} from 'cheerio';
import {getPage,fetchedAt} from './source-http';
import {parsePage,clean} from './connectors';
import {resourceSchema,safeUrl,type Resource} from '../src/model';
const periodic=process.argv.includes('--periodic');
if(!periodic&&!process.argv.includes('--audit'))throw Error('Use --audit for a one-off collection.');
const permissions=JSON.parse(await readFile('data/permissions.json','utf8'));
const allowed=(source:string)=>!periodic||(permissions[source]?.periodic&&permissions[source]?.evidenceUrl);
if(!['Labolycée','Vecteur Bac'].some(allowed)){console.log('Première collection disabled; no changes.');process.exit(0);}
const records=new Map<string,Resource>();
if(periodic){const previous=await readFile('data/premiere.json','utf8').then(JSON.parse);for(const r of previous.resources as Resource[])if(!allowed(r.source))records.set(r.id,r);}
const report={startedAt:new Date().toISOString(),finishedAt:'',sources:{} as Record<string,any>,errors:[] as {url:string;message:string}[]};
const secure=(href:string,base:string)=>{const u=new URL(href,base);if(u.protocol==='http:'&&u.hostname==='www.vecteurbac.fr')u.protocol='https:';return safeUrl(u.href)?u.href:'';};
async function labo(){
 if(!allowed('Labolycée'))return;
 const cursus='1ère EC Spécialité Physique Chimie';const start=new URL('https://www.labolycee.org/exercices');start.searchParams.set('cursus',cursus);
 const queue=[start.href],seen=new Set<string>(),pages=new Set<string>();let expected=0;
 for(let i=0;i<queue.length;i++){const url=queue[i];if(seen.has(url))continue;seen.add(url);const $=load(await getPage(url));if($('select[name="cursus"] option[selected]').attr('value')!==cursus)throw Error('Curriculum filter failed');expected=Number(clean($('main').text()).match(/(\d+) exercices\s*·\s*page/i)?.[1])||expected;
  $('article h3 a[href^="/exercices/"]').each((_,a)=>{pages.add(secure($(a).attr('href')!,url));});
  $('a[href*="page="]').each((_,a)=>{const u=new URL($(a).attr('href')!,url);if(u.pathname==='/exercices'&&u.searchParams.get('cursus')===cursus&&!queue.includes(u.href))queue.push(u.href);});
 }
 if(expected!==pages.size)throw Error(`Expected ${expected} exercises, discovered ${pages.size}`);
 report.sources['Labolycée']={listingPages:[...seen],discovered:pages.size,expected,indexed:0};
 for(const url of pages){try{const r=parsePage(await getPage(url),url);if(r.level!=='Première')throw Error('Unexpected curriculum');r.verifiedAt=fetchedAt(url);records.set(r.id,r);report.sources['Labolycée'].indexed++;}catch(e){report.errors.push({url,message:String(e)});}if(records.size%20===0)console.log(`Labolycée: ${report.sources['Labolycée'].indexed}/${pages.size}`);}
}
async function vecteur(){
 if(!allowed('Vecteur Bac'))return;
 const index='https://www.vecteurbac.fr/1ere-e3c-liste-des-sujets/';const html=await getPage(index),$=load(html),pages=new Set<string>();
 const papers:{url:string;code:string;year:number|null;children:string[]}[]=[];
 $('.entry-content table tr').each((_,row)=>{const cells=$(row).find('td'),a=cells.first().find('a');if(!a.length)return;const href=secure(a.attr('href')!,index);const children=cells.slice(2).find('a[href]').map((_,e)=>secure($(e).attr('href')!,index)).get().filter(u=>u&&!u.endsWith('.pdf'));children.forEach(u=>pages.add(u));if(/\.pdf$/i.test(href)){const heading=$(row).closest('figure').prevAll('h1,h2').first().text();papers.push({url:href,code:clean(a.text()),year:Number(heading.match(/20\d{2}/)?.[0])||null,children});}});
 // Topic pages can contain additional exercise entries not included in the paper table.
 const root='https://www.vecteurbac.fr/1ere-e3c/',d=load(await getPage(root));const topics=[...new Set(d('.entry-content a[href]').map((_,a)=>secure(d(a).attr('href')!,root)).get().filter(u=>/1ere-e3c-(chimie|physique)-/.test(u)))];
 for(const url of topics){const t=load(await getPage(url));t('.entry-content h2 a[href]').each((_,a)=>{const u=secure(t(a).attr('href')!,url);if(u&&!/1ere-e3c|statistiques/.test(u)&&!u.endsWith('.pdf'))pages.add(u);});}
 report.sources['Vecteur Bac']={listingPages:[index,root,...topics],discovered:pages.size,papers:papers.length,indexed:0};
 for(const url of pages){try{const html=await getPage(url),p=load(html);if(!p('.entry-content a[href*="1ere-e3c"]').length)throw Error('Première specialty not confirmed');const r=parsePage(html,url,{kind:'exercise',discoveredOn:index});r.level='Première';r.id=createHash('sha256').update('Première|'+url).digest('hex').slice(0,16);const origin=p('.entry-content p').map((_,e)=>clean(p(e).text())).get().join(' ');r.year=Number(origin.match(/(?:Sujet|E3C|EC)\s*(20\d{2})/i)?.[1])||null;r.parentUrl=index;r.verifiedAt=fetchedAt(url);records.set(r.id,r);report.sources['Vecteur Bac'].indexed++;}catch(e){report.errors.push({url,message:String(e)});}if(report.sources['Vecteur Bac'].indexed%20===0)console.log(`Vecteur Bac: ${report.sources['Vecteur Bac'].indexed}/${pages.size}`);}
 for(const paper of papers){const child=[...records.values()].filter(r=>paper.children.includes(r.pageUrl)),now=new Date().toISOString();const r=resourceSchema.parse({id:createHash('sha256').update('Première|'+paper.url).digest('hex').slice(0,16),source:'Vecteur Bac',pageUrl:index+'#'+encodeURIComponent(paper.code),title:`Première — ${paper.code}`,kind:'paper',examCode:paper.code,level:'Première',subject:'Physique-chimie',year:paper.year,session:null,center:null,exerciseNumber:null,notions:[...new Map(child.flatMap(r=>r.notions).map(n=>[n.label,n])).values()],subjectUrl:paper.url,subjectFormat:'pdf',correctionUrl:null,parentUrl:null,childUrls:paper.children,embed:{allowed:false,permissionUrl:null,reason:'Consultation du document sur sa source uniquement.'},indexedAt:now,verifiedAt:fetchedAt(index),contentHash:createHash('sha256').update(html).digest('hex'),links:{page:'ok',subject:'unchecked',correction:'absent'}});records.set(r.id,r);}
}
await Promise.all([labo().catch(e=>report.errors.push({url:'Labolycée discovery',message:String(e)})),vecteur().catch(e=>report.errors.push({url:'Vecteur Bac discovery',message:String(e)}))]);
report.finishedAt=new Date().toISOString();
await writeFile('data/premiere-coverage.json',JSON.stringify(report,null,2));
if(report.errors.length){console.log(report.errors);process.exitCode=1;}else if(records.size){await writeFile('data/premiere.json',JSON.stringify({version:1,generatedAt:report.finishedAt,resources:[...records.values()]},null,2));}
console.log(`Première: ${records.size} references, ${report.errors.length} errors.`);
