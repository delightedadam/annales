import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {catalogueSchema} from '../src/model';
import {deduplicate,makeIndex} from '../src/search';
const catalogue=catalogueSchema.parse(JSON.parse(await readFile('data/catalogue.json','utf8')));
const premiere=catalogueSchema.parse(JSON.parse(await readFile('data/premiere.json','utf8')));
const resources=[...catalogue.resources,...premiere.resources].filter(r=>r.links.page!=='missing');
const groups=deduplicate(resources);
await mkdir('public',{recursive:true});
await writeFile('public/catalogue.json',JSON.stringify({...catalogue,resources}));
await writeFile('public/search-index.json',JSON.stringify(makeIndex(groups)));
const coverage=await readFile('data/coverage.json','utf8').then(JSON.parse).catch(()=>null);
const firstCoverage=JSON.parse(await readFile('data/premiere-coverage.json','utf8'));
if(coverage)for(const [name,extra] of Object.entries(firstCoverage.sources)){const e=extra as any;const source=coverage.sources[name];source.candidates+=e.discovered+ (e.papers??0);source.indexed+=e.indexed+(e.papers??0);source.listingPages.push(...e.listingPages);}
if(coverage)await writeFile('public/coverage.json',JSON.stringify({finishedAt:coverage.finishedAt,premiereUpdatedAt:firstCoverage.finishedAt,references:resources.length,results:groups.length,sources:Object.fromEntries(Object.entries(coverage.sources).map(([name,s]:[string,any])=>[name,{discovered:s.candidates,indexed:s.indexed,listingPages:s.listingPages?.length,expectedExercises:s.expectedExercises,discoveryErrors:s.errors?.length??0}])),errors:coverage.errors.length,excluded:coverage.excluded.length}));
console.log(`${resources.length} références, ${groups.length} résultats après regroupement des doublons confirmés. Aucun PDF publié.`);
