import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import {catalogueSchema} from '../src/model';
import {deduplicate,LocalSearchProvider,defaults} from '../src/search';
const c=catalogueSchema.parse(JSON.parse(readFileSync('data/catalogue.json','utf8')));
const coverage=JSON.parse(readFileSync('data/coverage.json','utf8'));
const groups=deduplicate(c.resources),engine=new LocalSearchProvider(groups);
describe('catalogue complet découvert, sans limite de sélection',()=>{
 it('contient plus de mille références réelles des deux sources',()=>{expect(c.resources.length).toBeGreaterThan(1000);expect(new Set(c.resources.map(r=>r.source)).size).toBe(2)});
 it('a parcouru toutes les pages annoncées de Labolycée',()=>{const d=JSON.parse(readFileSync('data/discovered-labolycee.json','utf8'));expect(d.candidates.filter((r:any)=>r.kind==='exercise').length).toBe(d.expectedExercises);expect(d.errors).toEqual([])});
 it('ne masque aucune erreur de collecte',()=>{expect(coverage.finishedAt).toBeTruthy();expect(coverage.errors).toEqual([]);for(const source of Object.values(coverage.sources) as any[])expect(source.errors).toEqual([])});
 it('explique chaque fiche découverte non indexée',()=>{const indexed=new Set(c.resources.map(r=>r.pageUrl)),excluded=new Set(coverage.excluded.map((r:any)=>r.url));for(const file of ['labolycee','vecteurbac']){const d=JSON.parse(readFileSync(`data/discovered-${file}.json`,'utf8'));for(const r of d.candidates)expect(indexed.has(r.url)||excluded.has(r.url),r.url).toBe(true)}});
 it('préserve les pages sans PDF avec une action distincte',()=>{const pages=c.resources.filter(r=>r.subjectFormat==='source-page');expect(pages.length).toBeGreaterThan(0);expect(pages.every(r=>r.subjectUrl===r.pageUrl)).toBe(true)});
 it('retrouve des annales de chaque année du nouveau bac',()=>{for(const year of ['2021','2022','2023','2024','2025','2026'])expect(engine.searchSync({...defaults,year}).total).toBeGreaterThan(0)});
 it('recherche les notions combinées sur les données complètes',()=>{const r=engine.searchSync({...defaults,q:'Titrage pH-métrique et acide-base'});expect(r.total).toBeGreaterThan(10);expect(r.hits.every(h=>h.matched.length===2)).toBe(true)});
 it('regroupe les sujets uniquement si la référence et la session sont concordantes',()=>{const p=c.resources.find(r=>r.kind==='paper'&&r.examCode&&r.session&&r.center)!;expect(p).toBeTruthy();const copy={...p,id:'copy',pageUrl:p.pageUrl+'copy',source:(p.source==='Labolycée'?'Vecteur Bac':'Labolycée') as typeof p.source};expect(deduplicate([p,copy])).toHaveLength(1);expect(deduplicate([p,{...copy,session:'autre session'}])).toHaveLength(2)});
});
