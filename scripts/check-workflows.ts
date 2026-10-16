import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {parseDocument} from 'yaml';
for(const file of ['deploy','refresh']){
 const doc=parseDocument(await readFile(`.github/workflows/${file}.yml`,'utf8'),{uniqueKeys:true});
 assert.equal(doc.errors.length,0,`${file}: YAML invalide`);
 const w=doc.toJS();assert(w.on&&w.jobs);
 for(const job of Object.values(w.jobs) as any[]){assert(job['runs-on']);for(const s of job.steps){assert(Boolean(s.uses)!==Boolean(s.run));if(s.uses)assert(/^[\w-]+\/[\w-]+@[\w.-]+$/.test(s.uses));}}
 if(file==='deploy'){assert(w.on.push.branches.includes('main'));assert(w.jobs.build.steps.some((s:any)=>s.run==='pnpm test'));assert(w.jobs.build.steps.some((s:any)=>s.run==='pnpm build'));assert.equal(w.jobs.deploy.needs,'build');assert.equal(w.jobs.deploy.permissions.pages,'write');assert.equal(w.jobs.deploy.permissions['id-token'],'write');assert(w.jobs.deploy.if.includes("refs/heads/main"));}
 else {assert(w.jobs.collect.if.includes('COLLECTION_ENABLED'));assert(w.jobs.collect.steps.some((s:any)=>s.run==='pnpm collect:all --periodic'));}
 console.log(`${file}.yml : syntaxe et invariants de publication validés`);
}
