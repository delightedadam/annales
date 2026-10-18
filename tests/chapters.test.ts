import {describe,it,expect} from 'vitest';
import data from '../data/catalogue.json';
import {catalogueSchema} from '../src/model';
import {deduplicate,LocalSearchProvider,defaults,readQuery,writeQuery} from '../src/search';
import {chapterMatches,listChapters} from '../src/chapters';
const engine=new LocalSearchProvider(deduplicate(catalogueSchema.parse(data).resources));
describe('multiple chapters',()=>{
 it('requires both chapters in AND mode and allows either in OR mode',()=>{const q={...defaults,kind:'paper',chapters:['Acides et bases','Description et étude du mouvement']};const and=engine.searchSync(q),or=engine.searchSync({...q,mode:'OR'});expect(and.total).toBeGreaterThan(0);expect(or.total).toBeGreaterThan(and.total);expect(and.hits.every(h=>q.chapters.every(c=>chapterMatches(c,h.group.notions)))).toBe(true)});
 it('keeps chapters and level in shared URLs',()=>{const q={...defaults,level:'Première',chapters:['Titrages','Énergie et mouvement']};expect(readQuery(writeQuery(q))).toEqual(q)});
 it('uses only visible source evidence',()=>{const q={...defaults,source:'Vecteur Bac',chapters:['Acides et bases','Description et étude du mouvement']};const hits=engine.searchSync(q).hits;expect(hits.every(h=>h.group.variants.every(v=>v.source==='Vecteur Bac')&&q.chapters.every(c=>chapterMatches(c,h.group.notions)))).toBe(true)});
 it('retains ungrouped chapters and avoids duplicates',()=>{expect(listChapters(['Acide-base','Nucléaire','Titrage','Titrage pH-métrique'])).toEqual(['Acides et bases','Nucléaire','Titrages'])});
});
