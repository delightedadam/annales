import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import robotsParser from 'robots-parser';
import {parsePage} from './connectors';
import {catalogueSchema,safeUrl,type Resource} from '../src/model';
const seeds:string[]=JSON.parse(await readFile('data/seeds.json','utf8'));
const permissions=JSON.parse(await readFile('data/permissions.json','utf8'));
const periodic=process.argv.includes('--periodic');
if(!periodic&&!process.argv.includes('--audit'))throw new Error('Utiliser --audit pour une collecte ponctuelle contrôlée, ou --periodic avec autorisation documentée.');
const agent='RepereAnnales/1.0 (metadata search; no PDF copying)';
await mkdir('.cache',{recursive:true});
const old=await readFile('data/catalogue.json','utf8').then(s=>catalogueSchema.parse(JSON.parse(s)).resources).catch(()=>[] as Resource[]);
const records=new Map(old.map(r=>[r.pageUrl,r]));
const robots=new Map<string,ReturnType<typeof robotsParser>>();
const log:unknown[]=[]; let errors=0;
async function request(url:string,method='GET',headers:Record<string,string>={}){
 if(!safeUrl(url))throw new Error('URL non autorisée');
 const origin=new URL(url).origin;
 if(!robots.has(origin)){
  const r=await fetch(origin+'/robots.txt',{headers:{'User-Agent':agent},signal:AbortSignal.timeout(20000),redirect:'error'});
  if(!r.ok)throw new Error('robots.txt inaccessible : collecte suspendue');
  robots.set(origin,robotsParser(origin+'/robots.txt',await r.text()));
 }
 if(robots.get(origin)!.isAllowed(url,agent)===false)throw new Error('robots.txt interdit ce chemin');
 await new Promise(r=>setTimeout(r,1600));
 return fetch(url,{method,headers:{'User-Agent':agent,...headers},signal:AbortSignal.timeout(25000),redirect:'error'});
}
async function check(url:string){try{const r=await request(url,'HEAD');return r.ok?'ok':r.status===404||r.status===410?'missing':'error';}catch{return 'error';}}
for(const url of seeds){
 if(process.argv.includes('--only')&&url!==process.argv[process.argv.indexOf('--only')+1])continue;
 const source=url.includes('labolycee')?'Labolycée':'Vecteur Bac';
 if(periodic&&(!permissions[source]?.periodic||!permissions[source]?.evidenceUrl)){log.push({url,status:'skipped',reason:'Autorisation périodique non documentée'});continue;}
 try{
  const key=createHash('sha256').update(url).digest('hex');
  const cache=await readFile(`.cache/${key}.json`,'utf8').then(JSON.parse).catch(()=>({}));
  const r=await request(url,'GET',cache.etag?{'If-None-Match':cache.etag}:{});
  const previous=records.get(url);
  if(r.status===404||r.status===410){if(previous){previous.links.page='missing';previous.verifiedAt=new Date().toISOString();}log.push({url,status:'removed'});continue;}
  if(r.status===304&&previous){previous.verifiedAt=new Date().toISOString();previous.links.subject=await check(previous.subjectUrl);previous.links.correction=previous.correctionUrl?await check(previous.correctionUrl):'absent';log.push({url,status:'unchanged'});continue;}
  if(!r.ok)throw new Error(`HTTP ${r.status}`);
  const record=parsePage(await r.text(),url);
  record.links.subject=await check(record.subjectUrl);
  record.links.correction=record.correctionUrl?await check(record.correctionUrl):'absent';
  if(previous)record.indexedAt=previous.indexedAt;
  records.set(url,record);
  await writeFile(`.cache/${key}.json`,JSON.stringify({etag:r.headers.get('etag')}));
  log.push({url,status:'ok',title:record.title,links:record.links});console.log(record.title);
 }catch(e){errors++;log.push({url,status:'error',message:String(e)});const previous=records.get(url);if(previous)previous.links.page='error';console.error(url,String(e));}
}
const result=catalogueSchema.parse({version:1,generatedAt:new Date().toISOString(),resources:[...records.values()]});
await writeFile('data/collection-report.json',JSON.stringify({at:new Date().toISOString(),errors,log},null,2));
if(result.resources.length){await writeFile('data/catalogue.tmp',JSON.stringify(result,null,2));await rename('data/catalogue.tmp','data/catalogue.json');}
if(errors)process.exitCode=1;
