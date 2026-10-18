import {load} from 'cheerio';
import {createHash} from 'node:crypto';
import {resourceSchema,type Resource,normalize,safeUrl} from '../src/model';
import {canonical,dictionary} from '../src/notions';
export const clean=(s:string)=>s.replace(/\s+/g,' ').trim();
export type PageContext={kind:'exercise'|'paper';parentUrl?:string;discoveredOn?:string;title?:string};
export function parsePage(html:string,pageUrl:string,context?:PageContext):Resource {
 const $=load(html), labo=new URL(pageUrl).hostname.includes('labolycee');
 const record=labo ? (context?.kind==='paper'?parseLaboPaper($,pageUrl,html):parseLabolycee($,pageUrl,html)) : parseVecteur($,pageUrl,html,context);
 const referenceText=$(labo?'.epreuve-commentaire p,.notes-pedago p':'.entry-content p').map((_,e)=>clean($(e).text())).get().join(' ');
 const codes=[...new Set((referenceText.match(/\b\d{2}\s*[-–]\s*P[A-Z0-9-]{4,}\b/g)||[]).map(s=>s.replace(/\s/g,'').replace('–','-')))];
 record.examCode=codes.length===1?codes[0]:null;
 return record;
}
type Dom=ReturnType<typeof load>;
function base(pageUrl:string,html:string){const now=new Date().toISOString();return {id:createHash('sha256').update(pageUrl).digest('hex').slice(0,16),pageUrl,level:'Terminale' as const,subject:'Physique-chimie' as const,indexedAt:now,verifiedAt:now,contentHash:createHash('sha256').update(html).digest('hex'),embed:{allowed:false,permissionUrl:null,reason:'Autorisation d’intégration du sujet non établie ; accès sur le site source.'},links:{page:'ok',subject:'unchecked',correction:'unchecked'}};}
function absolute(path:string|undefined,url:string){if(!path)return null;const v=new URL(path,url).href;return safeUrl(v)?v:null;}
function evidence(labels:string[],pageUrl:string){const byConcept=new Map<string,string>();for(const label of labels.map(clean).filter(Boolean)){if(!byConcept.has(canonical(label)))byConcept.set(canonical(label),label);}return [...byConcept].map(([label,evidence])=>({label,evidenceUrl:pageUrl,evidence}));}
export function parseLabolycee($:Dom,pageUrl:string,html:string):Resource {
 const origin=clean($('.fiche-origine').first().text());
 if(!/Terminale Spécialité Physique Chimie|1ère EC Spécialité Physique Chimie/i.test(origin))throw new Error(origin?'Hors périmètre : '+origin:'Cursus absent');
 const labels=$('.fiche-navigation .badge-thema').map((_,e)=>clean($(e).text())).get();
 const notes=clean($('.notes-pedago').first().text());
 // Only explicit phrases in this exercise's notes, never related cards or PDF text.
 for(const group of dictionary)for(const term of group)if(` ${normalize(notes)} `.includes(` ${normalize(term)} `)){labels.push(term);break;}
 const pdfUrl=absolute($('.onglet[data-url]').first().attr('data-url'),pageUrl);
 const subjectUrl=pdfUrl??pageUrl;
 const correctionUrl=absolute($('.onglet-corrige').first().attr('data-url'),pageUrl);
 return resourceSchema.parse({...base(pageUrl,html),level:origin.startsWith('1ère')?'Première':'Terminale',source:'Labolycée',title:clean($('h1').first().text()),kind:'exercise',year:Number(origin.match(/\b(20\d{2})\b/)?.[1])||null,center:origin.split('·')[1]?.replace(/20\d{2}/,'').trim()||null,session:origin.match(/Jour\s+\d+|Session de remplacement/i)?.[0]||null,exerciseNumber:Number(origin.match(/Exercice n°\s*(\d+)/i)?.[1])||null,notions:evidence(labels,pageUrl),subjectUrl,subjectFormat:pdfUrl?'pdf':'source-page',correctionUrl,parentUrl:absolute($('a[href^="/sujets/"]').first().attr('href'),pageUrl),childUrls:[],links:{page:'ok',subject:pdfUrl?'unchecked':'ok',correction:correctionUrl?'unchecked':'absent'}});
}
export function parseVecteur($:Dom,pageUrl:string,html:string,context?:PageContext):Resource {
 const body=$('.entry-content'),title=clean($('.entry-title').first().text());
 if(!title||!body.length)throw new Error('Page Vecteur Bac non reconnue');
 const kind=context?.kind??(/terminale-specialite-physique-chimie-(?:septembre-)?20/.test(pageUrl)?'paper':'exercise');
 const parent=body.find('p a').filter((_,e)=>/\/(?:terminale-.*(?:20\d{2}|sujet-zero)|sujet-zero-sujet)/.test($(e).attr('href')||'')).first();
 const origin=kind==='paper'?title:clean(parent.text());
 if(/sciences de l.ingénieur|STI2D|ST2S|\bSTL\b/i.test(origin)||/sciences de l.ingénieur/i.test(clean(body.find('p').first().text())))throw Error('Hors périmètre : autre cursus');
 if(!origin&&!context)throw new Error('Épreuve de spécialité non identifiée');
 const links=[...new Set(body.find('a[href]').map((_,e)=>absolute($(e).attr('href'),pageUrl)).get().filter(u=>u&&/\.pdf(?:$|\?)/i.test(u)))] as string[];
 const pdfUrl=links.find(l=>!/correction|corrige/i.test(l)),subjectUrl=pdfUrl??pageUrl,correctionUrl=links.find(l=>/correction|corrige/i.test(l))||null;
 if(!pdfUrl&&!context)throw new Error('PDF absent : structure modifiée');
 const labels=body.find('ul li a').map((_,e)=>clean($(e).text())).get();
 const center=origin.match(/Amérique du nord|Amérique du sud|Antilles(?:[ -]Guyane)?|Centres étrangers|Métropole|Polynésie|Nouvelle[ -]Calédonie|Asie|Liban|Pondichéry|La Réunion/i)?.[0]??null;
 const day=origin.match(/(?:sujet|jour)\s+\d+(?:\s+Bis)?/i)?.[0]?.replace(/sujet/i,'Jour');
 const month=origin.match(/septembre|remplacement|secours/i)?.[0];
 const session=[month,day].filter(Boolean).join(' ')||null;
 return resourceSchema.parse({...base(pageUrl,html),source:'Vecteur Bac',title,kind,year:Number(origin.match(/\b((?:19|20)\d{2})\b/)?.[1])||null,center,session,exerciseNumber:kind==='exercise'?Number(clean(body.text()).match(/Exercice\s*(\d+)/i)?.[1])||null:null,notions:evidence(labels,pageUrl),subjectUrl,subjectFormat:pdfUrl?'pdf':'source-page',correctionUrl,parentUrl:kind==='exercise'?(absolute(parent.attr('href'),pageUrl)??context?.parentUrl??null):null,childUrls:kind==='paper'?body.find('h2 a').map((_,e)=>absolute($(e).attr('href'),pageUrl)).get().filter(u=>u&&!/statistiques|terminale-specialite-(physique|chimie)-/.test(u)):[],links:{page:'ok',subject:pdfUrl?'unchecked':'ok',correction:correctionUrl?'unchecked':'absent'}});
}
export function parseLaboPaper($:Dom,pageUrl:string,html:string):Resource {
 const header=$('.fiche-entete');const title=clean(header.find('h1').text());
 if(!title)throw Error('Structure de sujet complet non reconnue');
 if(/sciences de l.ingénieur|concours/i.test(title))throw Error('Hors périmètre : autre épreuve');
 const pdfUrl=absolute($('.epreuve-fichiers a.sujet').attr('href'),pageUrl),subjectUrl=pdfUrl??pageUrl;
 const correctionUrl=absolute($('.epreuve-fichiers a.corrige').attr('href'),pageUrl);
 const labels=$('article .carte-thema').map((_,e)=>clean($(e).text())).get();
 return resourceSchema.parse({...base(pageUrl,html),source:'Labolycée',title,kind:'paper',year:Number(header.find('a[href^="/annees/"]').first().text().match(/20\d{2}/)?.[0])||null,center:clean(header.find('a[href^="/centres/"]').first().text())||null,session:clean(header.find('.badge-jour').text())||null,exerciseNumber:null,notions:evidence(labels,pageUrl),subjectUrl,subjectFormat:pdfUrl?'pdf':'source-page',correctionUrl,parentUrl:null,childUrls:$('article h3 a[href^="/exercices/"]').map((_,e)=>absolute($(e).attr('href'),pageUrl)).get().filter(Boolean),links:{page:'ok',subject:pdfUrl?'unchecked':'ok',correction:correctionUrl?'unchecked':'absent'}});
}
