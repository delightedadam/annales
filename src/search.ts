import {chapterMatches} from './chapters';
import MiniSearch from 'minisearch';
import {normalize,type Resource} from './model';
import {aliases,canonical,parseQuery} from './notions';
export type Query={level?:string;chapters?:string[];q:string;tags:string[];mode:'AND'|'OR';kind:string;source:string;year:string;corrected:boolean;sort:string;page:number};
export const defaults:Query={level:'Terminale',q:'',tags:[],mode:'AND',kind:'all',source:'all',year:'all',corrected:false,sort:'relevance',page:1};
export const indexOptions={fields:['title','notionsText','synonyms'],storeFields:['title'],processTerm:normalize};
export type Group={id:string;primary:Resource;variants:Resource[];notions:string[]};
export function deduplicate(records:Resource[]):Group[]{
 const groups=new Map<string,Group>();
 for(const r of records){
  const title=normalize(r.title.replace(/\s*\(sujet et corrigé\)\s*$/i,''));
  // No fuzzy title merging: require matching examination context as well.
  const key=r.kind==='paper'&&r.examCode&&r.year&&r.center&&r.session?[r.level,r.kind,r.examCode,r.year,normalize(r.center),normalize(r.session)].join('|'):r.year&&r.center&&r.session&&r.exerciseNumber?[r.level,r.kind,title,r.year,normalize(r.center),normalize(r.session),r.exerciseNumber].join('|'):r.level+'|'+r.pageUrl;
  const existing=groups.get(key);
  if(existing){existing.variants.push(r);existing.notions=[...new Set([...existing.notions,...r.notions.map(n=>canonical(n.label))])];}
  else groups.set(key,{id:r.id,primary:r,variants:[r],notions:[...new Set(r.notions.map(n=>canonical(n.label)))]});
 }
 return [...groups.values()];
}
export function indexDocuments(groups:Group[]){return groups.map(g=>({id:g.id,title:g.primary.title,notionsText:g.notions.join(' '),synonyms:g.notions.flatMap(aliases).join(' ')}));}
export function makeIndex(groups:Group[]){const index=new MiniSearch(indexOptions);index.addAll(indexDocuments(groups));return index;}
export type Hit={group:Group;score:number;label:string;matched:string[]};
export type SearchResponse={hits:Hit[];total:number;page:number;pages:number};
export interface SearchProvider {search(query:Query):Promise<SearchResponse>}
export class LocalSearchProvider implements SearchProvider {
 constructor(public groups:Group[],private index:MiniSearch=makeIndex(groups)){}
 async search(q:Query):Promise<SearchResponse>{return this.searchSync(q);}
 searchSync(q:Query):SearchResponse{
  const parsed=parseQuery(q.q);const concepts=[...new Set([...q.tags.map(canonical),...parsed.concepts])];
  const tokenResults=parsed.terms.map(term=>new Map(this.index.search(term,{prefix:true,fuzzy:term.length>=5?0.2:false,boost:{title:2,notionsText:5,synonyms:3}}).map(r=>[String(r.id),r.score])));
  const hits:Hit[]=[];
  for(const group of this.groups){
   const available=group.variants.filter(r=>r.links.page!=='missing'&&(q.source==='all'||r.source===q.source));
   if(!available.length)continue;
   if((q.level??'Terminale')!=='all'&&available[0].level!==(q.level??'Terminale'))continue;
   const primary=available[0];
   if(q.kind!=='all'&&primary.kind!==q.kind||q.year!=='all'&&String(primary.year)!==q.year||q.corrected&&!available.some(r=>r.correctionUrl&&r.links.correction!=='missing'))continue;
   const visibleNotions=[...new Set(available.flatMap(r=>r.notions.map(n=>canonical(n.label))))];
   const chapterChecks=(q.chapters??[]).map(c=>chapterMatches(c,visibleNotions));
   const matched=concepts.filter(n=>visibleNotions.includes(n));
   // The text index is a candidate generator; source-scoped matching cannot borrow metadata from a hidden source.
   const sourceText=parsed.terms.length&&q.source!=='all'?normalize([primary.title,...visibleNotions.flatMap(aliases)].join(' ')):'';
   const textMatches=tokenResults.map((m,i)=>q.source==='all'?m.has(group.id):m.has(group.id)&&sourceText.split(' ').some(t=>t.startsWith(parsed.terms[i])||distanceOne(t,parsed.terms[i])));
   const conditions=[...chapterChecks,...concepts.map(n=>matched.includes(n)),...textMatches];
   if(conditions.length&&!(q.mode==='AND'?conditions.every(Boolean):conditions.some(Boolean)))continue;
   const exact=matched.length===concepts.length&&concepts.length>0&&parsed.terms.length===0;
   const synonym=exact&&parsed.concepts.some(n=>!parsed.exact.includes(n));
   const label=chapterChecks.length?(chapterChecks.every(Boolean)?'Chapitres sélectionnés présents':'Certains chapitres présents'):!conditions.length?'Catalogue vérifié':exact?(synonym?'Synonyme vérifié':'Notions exactes'):matched.length?'Correspondance partielle':'Correspondance textuelle · à vérifier';
   const score=chapterChecks.filter(Boolean).length*100+matched.length*100+tokenResults.reduce((s,m)=>s+(m.get(group.id)||0),0);
   hits.push({group:{...group,primary,variants:available,notions:visibleNotions},score,label,matched});
  }
  hits.sort((a,b)=>q.sort==='newest'?(b.group.primary.year??0)-(a.group.primary.year??0):q.sort==='oldest'?(a.group.primary.year??9999)-(b.group.primary.year??9999):b.score-a.score||a.group.primary.title.localeCompare(b.group.primary.title,'fr'));
  const pages=Math.max(1,Math.ceil(hits.length/8)),page=Math.min(pages,Math.max(1,q.page));
  return {hits:hits.slice((page-1)*8,page*8),total:hits.length,page,pages};
 }
}
function distanceOne(a:string,b:string){if(b.length<5||Math.abs(a.length-b.length)>1)return false;let i=0,j=0,errors=0;while(i<a.length&&j<b.length){if(a[i]===b[j]){i++;j++;continue;}if(++errors>1)return false;if(a.length>=b.length)i++;if(b.length>=a.length)j++;}return errors+(a.length-i)+(b.length-j)<=1;}
export function readQuery(search:string):Query{const p=new URLSearchParams(search);return {...(p.has('chapter')?{chapters:p.getAll('chapter').slice(0,40)}:{}),level:p.get('level')==='premiere'?'Première':p.get('level')==='all'?'all':'Terminale',q:(p.get('q')||'').slice(0,300),tags:p.getAll('notion').slice(0,20),mode:p.get('mode')==='OR'?'OR':'AND',kind:['exercise','paper'].includes(p.get('type')||'')?p.get('type')!:'all',source:['Labolycée','Vecteur Bac'].includes(p.get('source')||'')?p.get('source')!:'all',year:/^20\d{2}$/.test(p.get('year')||'')?p.get('year')!:'all',corrected:p.get('correction')==='1',sort:['newest','oldest'].includes(p.get('sort')||'')?p.get('sort')!:'relevance',page:Math.max(1,Math.min(10000,Number(p.get('page'))||1))};}
export function writeQuery(q:Query){const p=new URLSearchParams();(q.chapters??[]).forEach(c=>p.append('chapter',c));if(q.level==='Première')p.set('level','premiere');if(q.level==='all')p.set('level','all');if(q.q)p.set('q',q.q);q.tags.forEach(t=>p.append('notion',t));if(q.mode!=='AND')p.set('mode',q.mode);if(q.kind!=='all')p.set('type',q.kind);if(q.source!=='all')p.set('source',q.source);if(q.year!=='all')p.set('year',q.year);if(q.corrected)p.set('correction','1');if(q.sort!=='relevance')p.set('sort',q.sort);if(q.page>1)p.set('page',String(q.page));return p.toString();}
