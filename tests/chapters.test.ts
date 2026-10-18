import {describe,it,expect} from 'vitest';
import data from '../data/catalogue.json';
import {catalogueSchema} from '../src/model';
import {deduplicate,LocalSearchProvider,defaults,readQuery,writeQuery} from '../src/search';
import {chapterMatches,chapterMatchQuality,listChapters} from '../src/chapters';
const engine=new LocalSearchProvider(deduplicate(catalogueSchema.parse(data).resources));
describe('multiple chapters',()=>{
 it('requires both chapters in AND mode and allows either in OR mode',()=>{const q={...defaults,kind:'paper',chapters:["Transformations acide-base et méthodes physiques d'analyse",'Deuxième loi de Newton']};const and=engine.searchSync(q),or=engine.searchSync({...q,mode:'OR'});expect(and.total).toBeGreaterThan(0);expect(or.total).toBeGreaterThan(and.total);expect(and.hits.every(h=>q.chapters.every(c=>chapterMatches(c,h.group.notions)))).toBe(true)});
 it('keeps chapters and level in shared URLs',()=>{const q={...defaults,level:'Première',chapters:['Titrages','Énergie et mouvement']};expect(readQuery(writeQuery(q))).toEqual(q)});
 it('uses only visible source evidence',()=>{const q={...defaults,source:'Vecteur Bac',chapters:["Transformations acide-base et méthodes physiques d'analyse",'Deuxième loi de Newton']};const hits=engine.searchSync(q).hits;expect(hits.every(h=>h.group.variants.every(v=>v.source==='Vecteur Bac')&&q.chapters.every(c=>chapterMatches(c,h.group.notions)))).toBe(true)});
 it('retains ungrouped chapters and avoids duplicates',()=>{const titles=listChapters([]);expect(titles).toHaveLength(19);expect(new Set(titles).size).toBe(19);expect(titles[0]).toBe("Transformations acide-base et méthodes physiques d'analyse");expect(titles[18]).toBe('Description de la lumière par un flux de photons')});
});

it('marks broad source tags as uncertain rather than confirmed subchapters',()=>{expect(chapterMatchQuality('Modèle du gaz parfait',['Thermodynamique'])).toBe('related');expect(chapterMatchQuality('Deuxième loi de Newton',['Satellites, lois de Kepler'])).toBeNull();const result=engine.searchSync({...defaults,chapters:['Modèle du gaz parfait']});expect(result.total).toBeGreaterThan(0);expect(result.hits.every(h=>h.label.includes('à vérifier'))).toBe(true)});
