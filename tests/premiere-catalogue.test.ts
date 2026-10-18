import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import {catalogueSchema} from '../src/model';
import {deduplicate,LocalSearchProvider,defaults} from '../src/search';
const catalogue=catalogueSchema.parse(JSON.parse(readFileSync('data/premiere.json','utf8')));
const report=JSON.parse(readFileSync('data/premiere-coverage.json','utf8'));
describe('Première catalogue',()=>{
 it('contains only Première physics and chemistry with both sources',()=>{expect(catalogue.resources.every(r=>r.level==='Première'&&r.subject==='Physique-chimie')).toBe(true);expect(new Set(catalogue.resources.map(r=>r.source)).size).toBe(2)});
 it('accounts for all announced Labolycée exercises and collection errors',()=>{expect(report.errors).toEqual([]);expect(report.sources['Labolycée'].expected).toBe(77);expect(report.sources['Labolycée'].indexed).toBe(report.sources['Labolycée'].expected);expect(report.sources['Vecteur Bac'].indexed).toBe(report.sources['Vecteur Bac'].discovered)});
 it('has original links and provenance, without allowing PDF embedding',()=>{expect(catalogue.resources.every(r=>!r.embed.allowed&&r.pageUrl.startsWith('https://'))).toBe(true);expect(catalogue.resources.filter(r=>r.kind==='paper').length).toBeGreaterThan(0);expect(catalogue.resources.some(r=>r.notions.some(n=>n.label==='Oxydoréduction'))).toBe(true)});
 it('is excluded by default and can be searched when selected',()=>{const engine=new LocalSearchProvider(deduplicate(catalogue.resources));expect(engine.searchSync(defaults).total).toBe(0);expect(engine.searchSync({...defaults,level:'Première',q:'oxydoréduction'}).total).toBeGreaterThan(0)});
});
