import {canonical} from './notions';
export const chapterGroups:Record<string,string[]>={
 'Acides et bases':['Acide-base'],
 'Description et étude du mouvement':['Deuxième loi de Newton','Mouvement dans un champ de pesanteur uniforme','Mouvement dans un champ électrique uniforme','Satellites, lois de Kepler','Vecteur variation de vitesse'],
 'Titrages':['Titrage','Titrage pH-métrique','Titrage conductimétrique'],
 'Ondes et signaux':['Ondes','Ondes mécaniques','Effet Doppler','Intensité sonore'],
 'Diffraction et interférences':['Diffraction','Interférences'],
 'Électricité et circuits':['Circuits RC','Électricité'],
 'Énergie et mouvement':['Énergie mécanique','Théorème de l’énergie cinétique','Oscillateurs'],
 'Lumière et photons':['Photon','Photon – interaction lumière-matière','Effet photoélectrique'],
 'Spectroscopie et absorbance':['Spectroscopie','Spectroscopie IR','Beer-Lambert','Loi de Beer-Lambert'],
 'Synthèse organique':['Synthèse organique','Stratégie de synthèse','Mécanisme réactionnel'],
 'Équilibres chimiques':['Quotient de réaction',"La transformation d'un système chimique est-elle toujours totale ?"],
 'Piles et électrolyse':['Piles',"Piles et constante d'équilibre",'Électrolyse'],
 'Python':['Python','Python (Chimie )','Python (Chimie)','Python (Physique)'],
};
export function chapterMembers(label:string){return (chapterGroups[label]??[label]).map(canonical)}
export function chapterMatches(chapter:string,notions:string[]){return chapterMembers(chapter).some(n=>notions.includes(n))}
export function listChapters(notions:string[]){const labels=[...new Set(notions.map(canonical))];const grouped=new Set(Object.values(chapterGroups).flat().map(canonical));return [...Object.keys(chapterGroups).filter(c=>chapterMatches(c,labels)),...labels.filter(n=>!grouped.has(n))].sort((a,b)=>a.localeCompare(b,'fr'));}
