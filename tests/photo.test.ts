import {describe,it,expect} from 'vitest';
import {suggestNotions} from '../src/photo-notions';
describe('photo concept suggestions',()=>{
 it('recognizes scientific clues without requiring a literal chapter title',()=>{const s=suggestNotions('Déterminer la constante de temps et la charge du condensateur. Résoudre cette équation différentielle.');expect(s.map(n=>n.label)).toEqual(expect.arrayContaining(['Circuits RC','Équations différentielles']));expect(s.find(n=>n.label==='Circuits RC')?.evidence).toContain('condensateur');});
 it('handles accents and avoids partial-word matches',()=>{expect(suggestNotions('Un phare près du stade.')).toEqual([]);expect(suggestNotions('Mesurer le pH à l’équivalence.').map(s=>s.label)).toEqual(expect.arrayContaining(['Acide-base','Titrage']));});
 it('does not invent notions for unreadable or generic text',()=>{expect(suggestNotions('Déterminer la valeur. Justifier. 123')).toEqual([]);expect(suggestNotions('')).toEqual([]);});
 it('includes catalogue labels and limits the number of suggestions',()=>{expect(suggestNotions('Utiliser Python pour tracer la courbe',['Python']).map(s=>s.label)).toContain('Python');expect(suggestNotions('condensateur '.repeat(500))).toHaveLength(1);});
});
