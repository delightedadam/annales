import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import robotsParser from 'robots-parser';
import {safeUrl} from '../src/model';
const agent='RepereAnnales/1.0 (metadata search; no PDF copying)';
const policies=new Map<string,ReturnType<typeof robotsParser>>();
const lastRequest=new Map<string,number>();
const fetchedTimes=new Map<string,number>();
export const fetchedAt=(url:string)=>new Date(fetchedTimes.get(url)??Date.now()).toISOString();
export const cacheKey=(url:string)=>createHash('sha256').update(url).digest('hex');
export async function getPage(url:string):Promise<string>{
 if(!safeUrl(url))throw Error(`URL interdite : ${url}`);
 await mkdir('.cache/pages',{recursive:true});
 const path=`.cache/pages/${cacheKey(url)}.json`;
 const cached=await readFile(path,'utf8').then(JSON.parse).catch(()=>null);
 if(cached&&Date.now()-cached.at<24*60*60*1000){fetchedTimes.set(url,cached.at);return cached.html;}
 const origin=new URL(url).origin;
 if(!policies.has(origin)){
  const r=await fetch(origin+'/robots.txt',{headers:{'User-Agent':agent},redirect:'error',signal:AbortSignal.timeout(30000)});
  if(!r.ok)throw Error('robots.txt inaccessible');
  policies.set(origin,robotsParser(origin+'/robots.txt',await r.text()));
  lastRequest.set(origin,Date.now());
 }
 if(policies.get(origin)!.isAllowed(url,agent)===false)throw Error(`Chemin interdit par robots.txt : ${url}`);
 const wait=Math.max(0,1600-(Date.now()-(lastRequest.get(origin)||0)));
 await new Promise(r=>setTimeout(r,wait));
 lastRequest.set(origin,Date.now());
 const r=await fetch(url,{headers:{'User-Agent':agent},redirect:'manual',signal:AbortSignal.timeout(30000)});
 // Only public HTTPS pages on the same audited source may redirect.
 if([301,302,303,307,308].includes(r.status)){
  const target=new URL(r.headers.get('location')||'',url).href;
  if(target===url||!safeUrl(target)||new URL(target).hostname.replace(/^www\./,'')!==new URL(url).hostname.replace(/^www\./,''))throw Error('Redirection inattendue');
  const html=await getPage(target),at=fetchedTimes.get(target)??Date.now();fetchedTimes.set(url,at);await writeFile(path,JSON.stringify({at,html}));return html;
 }
 if(!r.ok)throw Error(`HTTP ${r.status}`);
 if(!r.headers.get('content-type')?.includes('text/html'))throw Error('Seules les pages HTML sont collectées');
 const html=await r.text(),at=Date.now();fetchedTimes.set(url,at);await writeFile(path,JSON.stringify({at,html}));return html;
}
