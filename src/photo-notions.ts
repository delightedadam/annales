import {aliases, canonical, dictionary} from './notions';
import {normalize} from './model';

// Suggestions only: evidence comes from the user's text, never from source metadata.
const clues:Record<string,string[]>={
 'Circuits RC':['condensateur','constante de temps','charge du condensateur','décharge'],
 'Acide-base':['pH','pKa','acide faible','base forte','couple acide base'],
 'Titrage':['équivalence','solution titrante','volume équivalent'],
 'Titrage pH-métrique':['suivi pH métrique','titrage suivi par pH métrie'],
 'Titrage conductimétrique':['titrage conductimetrique','suivi conductimetrique'],
 'Cinétique':['temps de demi réaction','vitesse de réaction','suivi cinétique'],
 'Deuxième loi de Newton':['bilan des forces','somme des forces','vecteur accélération'],
 'Mouvement dans un champ de pesanteur uniforme':['trajectoire parabolique','projectile','chute libre'],
 'Satellites, lois de Kepler':['orbite','satellite','période de révolution'],
 'Thermodynamique':['transfert thermique','capacité thermique','premier principe','bilan énergétique'],
 'Diffraction':['largeur de la tache centrale','fente','réseau de diffraction'],
 'Interférences':['interfrange','fentes de Young','différence de marche'],
 'Effet Doppler':['décalage de fréquence','radar'],
 'Effet photoélectrique':['travail d extraction','photon','fréquence seuil'],
 'Fluides':['Bernoulli','débit volumique','poussée d Archimède'],
 'Lunette astronomique':['lunette afocale','distance focale','grossissement'],
 'Spectroscopie':['spectre infrarouge','spectre IR','absorbance','Beer Lambert'],
 'Intensité sonore':['niveau sonore','décibel'],
 'Équations différentielles':['équation différentielle'],
};
export function suggestNotions(text:string, labels:string[]=[]){
 const normalized=` ${normalize(text.slice(0,20000))} `;
 return [...new Set([...labels,...dictionary.map(g=>g[0]),...Object.keys(clues)].map(canonical))]
 .map(label=>({label,evidence:[...new Set([...aliases(label),...(clues[label]??[])])].filter(term=>normalized.includes(` ${normalize(term)} `))}))
 .filter(item=>item.evidence.length>0).sort((a,b)=>b.evidence.length-a.evidence.length||a.label.localeCompare(b.label,'fr')).slice(0,12);
}
