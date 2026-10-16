import { normalize } from './model';
export const dictionary = [
 ['Effet Doppler','Doppler','décalage Doppler'],
 ['Acide-base','Acide-Base','réactions acido-basiques','acido basique'],
 ['Titrage pH-métrique','dosage pH-métrique','titrage phmetrique'],
 ['Titrage','dosage par titrage'],
 ['Circuits RC','circuit RC','condensateur RC','dipôle RC'],
 ['Équations différentielles','équation différentielle'],
 ['Deuxième loi de Newton','2e loi de Newton','2nde loi de Newton','seconde loi de Newton','principe fondamental de la dynamique'],
 ['Mouvement dans un champ de pesanteur uniforme','champ de pesanteur','mouvement dans un champ de pesanteur','chute libre'],
 ['Effet photoélectrique'],['Électrolyse'],['Diffraction'],['Interférences'],['Thermodynamique'],
 ['Satellites, lois de Kepler','lois de Kepler','satellites'],['Fluides','Fluide','mécanique des fluides'],
 ['Mécanisme réactionnel','mécanismes réactionnels'],['Cinétique','cinétique chimique'],['Ondes'],['Titrage conductimétrique']
];
const canonicalByTerm=new Map(dictionary.flatMap(group=>group.map(term=>[normalize(term),group[0]] as const)));
const aliasesByConcept=new Map(dictionary.map(group=>[group[0],group]));
const entries=dictionary.flatMap(a=>a.map(v=>({label:a[0],term:normalize(v)}))).sort((a,b)=>b.term.length-a.term.length);
export function canonical(s:string) {return canonicalByTerm.get(normalize(s))??s;}
export function aliases(s:string) {return aliasesByConcept.get(canonical(s))??[s];}
export function parseQuery(q:string) {
 let rest=` ${normalize(q)} `; const concepts:string[]=[]; const exact:string[]=[];
 for(const e of entries) if(rest.includes(` ${e.term} `)){ if(!concepts.includes(e.label)) concepts.push(e.label); if(e.term===normalize(e.label)) exact.push(e.label); rest=rest.split(` ${e.term} `).join(' '); }
 const terms=rest.split(/\s+/).filter(t=>t&&!['et','ou','de','du','des','dans','un','une','le','la','les','d','l'].includes(t));
 return {concepts,exact,terms};
}
