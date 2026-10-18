import {describe,it,expect} from 'vitest';
import data from './fixtures/catalogue-initial.json';
import {catalogueSchema} from '../src/model';
import {deduplicate,LocalSearchProvider,defaults,readQuery,writeQuery} from '../src/search';
const terminale=catalogueSchema.parse(data).resources[0];
const first={...terminale,id:'first',level:'Première' as const};
const engine=new LocalSearchProvider(deduplicate([terminale,first]));
describe('school levels',()=>{
 it('keeps Terminale as the default and never merges levels',()=>{expect(engine.groups).toHaveLength(2);const r=engine.searchSync(defaults);expect(r.total).toBe(1);expect(r.hits[0].group.primary.level).toBe('Terminale')});
 it('filters Première independently and can include both',()=>{expect(engine.searchSync({...defaults,level:'Première'}).hits[0].group.primary.level).toBe('Première');expect(engine.searchSync({...defaults,level:'all'}).total).toBe(2)});
 it('preserves the level in shared links and rejects unknown URL values',()=>{for(const level of ['Première','Terminale','all'])expect(readQuery(writeQuery({...defaults,level})).level).toBe(level);expect(readQuery('?level=bad').level).toBe('Terminale')});
});
