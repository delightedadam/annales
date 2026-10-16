import {readFile,writeFile,rename} from 'node:fs/promises';
import {discoverLabo,discoverVecteur,type Candidate,type Discovery} from './discover';
import {getPage,fetchedAt} from './source-http';
import {parsePage} from './connectors';
import {catalogueSchema,type Resource} from '../src/model';
const periodic=process.argv.includes('--periodic');
if(!periodic&&!process.argv.includes('--audit'))throw Error('La collecte complète ponctuelle exige --audit.');
const permissions=JSON.parse(await readFile('data/permissions.json','utf8'));
const allowed=(source:string)=>!periodic||(permissions[source]?.periodic&&permissions[source]?.evidenceUrl);
if(!['Labolycée','Vecteur Bac'].some(allowed)){console.log('Aucune collecte autorisée : aucune requête, catalogue conservé.');process.exit(0);}
const old=catalogueSchema.parse(JSON.parse(await readFile('data/catalogue.json','utf8')));
const records=new Map(old.resources.map(r=>[r.pageUrl,r]));
const report:any={startedAt:new Date().toISOString(),finishedAt:null,sources:{},errors:[],excluded:[],processed:0};
let writing=Promise.resolve();
function checkpoint(){writing=writing.then(async()=>{await writeFile('data/catalogue.tmp',JSON.stringify({...old,generatedAt:new Date().toISOString(),resources:[...records.values()]},null,2));await rename('data/catalogue.tmp','data/catalogue.json');await writeFile('data/coverage.json',JSON.stringify(report,null,2));});return writing;}
async function run(source:string,discover:()=>Promise<Discovery>){
 if(!allowed(source)){report.sources[source]={skipped:true,reason:'Autorisation périodique non documentée',errors:[]};return;}
 console.log(`${source} : découverte du catalogue…`);
 const discovery=await discover();report.sources[source]={...discovery,candidates:discovery.candidates.length,indexed:0};
 await writeFile(`data/discovered-${source==='Labolycée'?'labolycee':'vecteurbac'}.json`,JSON.stringify(discovery,null,2));
 console.log(`${source} : ${discovery.candidates.length} fiches découvertes sur ${discovery.listingPages.length} pages.`);
 const queue=[...discovery.candidates],seen=new Set(queue.map(c=>c.url));
 for(let i=0;i<queue.length;i++){
  const candidate:Candidate=queue[i];
  try{
   const record=parsePage(await getPage(candidate.url),candidate.url,candidate);
   record.verifiedAt=fetchedAt(candidate.url);
   const previous=records.get(candidate.url);
   if(previous){record.indexedAt=previous.indexedAt;if(record.subjectUrl===previous.subjectUrl)record.links.subject=previous.links.subject;if(record.correctionUrl===previous.correctionUrl)record.links.correction=previous.links.correction;}
   records.set(record.pageUrl,record);report.sources[source].indexed++;
   if(source==='Labolycée'&&record.parentUrl&&!seen.has(record.parentUrl)){seen.add(record.parentUrl);queue.push({url:record.parentUrl,kind:'paper',discoveredOn:record.pageUrl,title:''});}
  }catch(e){const message=String(e);const item={url:candidate.url,discoveredOn:candidate.discoveredOn,message};if(message.includes('Hors périmètre'))report.excluded.push(item);else report.errors.push(item);}
  report.processed++;
  if(i%20===0||i===queue.length-1){console.log(`${source} : ${i+1}/${queue.length}, ${report.sources[source].indexed} indexées, ${report.errors.length} erreurs au total.`);await checkpoint();}
 }
 report.sources[source].candidates=queue.length;
}
await Promise.all([run('Labolycée',discoverLabo),run('Vecteur Bac',discoverVecteur)]);
report.finishedAt=new Date().toISOString();report.references=records.size;
await checkpoint();console.log(`Terminé : ${records.size} références ; ${report.errors.length} erreurs à examiner.`);
if(report.errors.length||Object.values(report.sources).some((s:any)=>s.errors.length))process.exitCode=1;
