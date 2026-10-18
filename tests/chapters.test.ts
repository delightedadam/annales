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

it('keeps Premiere separate from the numbered Terminale course',()=>{expect(listChapters([],'Première')).toHaveLength(15);expect(listChapters([],'Première')[0]).toBe('Première : Composition d\'un système chimique');expect(listChapters([],'Terminale')).toHaveLength(19)});

it('matches the complete Premiere course order supplied by the user',()=>{expect(listChapters([],'Première')).toEqual(["Première : Composition d'un système chimique","Première : Modélisation d'une transformation","Première : Ondes mécaniques","Première : Images et couleurs","Première : Modèle ondulatoire et particulaire de la lumière","Première : Structure des entités","Première : De la cohésion à la solubilité d'espèces chimiques","Première : Interactions fondamentales et notion de champ","Première : Mouvement d'un système","Première : Aspects énergétiques des systèmes mécaniques","Première : Structure des composés organiques","Première : Synthèse organique","Première : Énergie stockée dans la matière organique","Première : Aspects énergétiques des systèmes électriques","Première : Fluide au repos"])});
