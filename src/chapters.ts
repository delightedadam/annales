import {canonical} from './notions';
const legacyGroups:Record<string,string[]>={
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

export const chapters: {title:string;direct:string[];related:string[]}[] = [
  {
    "title": "Transformations acide-base et méthodes physiques d'analyse",
    "direct": [
      "Acide-base",
      "Beer-Lambert",
      "Loi de Beer-Lambert",
      "Kohlrausch",
      "Spectroscopie",
      "Spectroscopie IR"
    ],
    "related": []
  },
  {
    "title": "Description d'un mouvement",
    "direct": [
      "Vecteur variation de vitesse"
    ],
    "related": [
      "Deuxième loi de Newton",
      "Mouvement dans un champ de pesanteur uniforme",
      "Mouvement dans un champ électrique uniforme",
      "Satellites, lois de Kepler"
    ]
  },
  {
    "title": "Deuxième loi de Newton",
    "direct": [
      "Deuxième loi de Newton"
    ],
    "related": []
  },
  {
    "title": "Mouvement dans un champ uniforme",
    "direct": [
      "Mouvement dans un champ de pesanteur uniforme",
      "Mouvement dans un champ électrique uniforme"
    ],
    "related": []
  },
  {
    "title": "Méthodes chimiques d'analyse",
    "direct": [
      "Titrage",
      "Titrage pH-métrique",
      "Titrage conductimétrique"
    ],
    "related": []
  },
  {
    "title": "Evolution temporelle d'un système",
    "direct": [
      "Cinétique"
    ],
    "related": []
  },
  {
    "title": "Mouvement dans un champ de gravitation",
    "direct": [
      "Satellites, lois de Kepler"
    ],
    "related": []
  },
  {
    "title": "Sens d'évolution spontané d'un système",
    "direct": [
      "Quotient de réaction",
      "La transformation d'un système chimique est-elle toujours totale ?",
      "Piles",
      "Piles et constante d'équilibre"
    ],
    "related": []
  },
  {
    "title": "Forcer le sens d'évolution d'un système",
    "direct": [
      "Électrolyse"
    ],
    "related": []
  },
  {
    "title": "Force des acides et des bases",
    "direct": [],
    "related": [
      "Acide-base",
      "Titrage pH-métrique"
    ]
  },
  {
    "title": "Les phénomènes ondulatoires",
    "direct": [
      "Ondes",
      "Ondes mécaniques",
      "Effet Doppler",
      "Intensité sonore",
      "Diffraction",
      "Interférences"
    ],
    "related": []
  },
  {
    "title": "Formation des images",
    "direct": [
      "Lunette astronomique",
      "Images et couleurs"
    ],
    "related": []
  },
  {
    "title": "Dynamique d'un système électrique",
    "direct": [
      "Circuits RC"
    ],
    "related": [
      "Électricité"
    ]
  },
  {
    "title": "Stratégie en synthèse organique",
    "direct": [
      "Synthèse organique",
      "Stratégie de synthèse",
      "Mécanisme réactionnel"
    ],
    "related": []
  },
  {
    "title": "Modèle du gaz parfait",
    "direct": [],
    "related": [
      "Thermodynamique"
    ]
  },
  {
    "title": "Premier principe de la thermodynamique",
    "direct": [],
    "related": [
      "Thermodynamique"
    ]
  },
  {
    "title": "Transformations nucléaires",
    "direct": [
      "Nucléaire"
    ],
    "related": []
  },
  {
    "title": "Ecoulement d'un fluide",
    "direct": [],
    "related": [
      "Fluides"
    ]
  },
  {
    "title": "Description de la lumière par un flux de photons",
    "direct": [
      "Photon",
      "Photon – interaction lumière-matière",
      "Effet photoélectrique"
    ],
    "related": []
  }
];

export function chapterMembers(label:string){const c=chapters.find(c=>c.title===label);return (c?[...c.direct,...c.related]:legacyGroups[label]??[label]).map(canonical)}
export function chapterMatchQuality(label:string,notions:string[]):'direct'|'related'|null{
 const available=notions.map(canonical),c=chapters.find(c=>c.title===label);
 if((c?.direct??legacyGroups[label]??[label]).map(canonical).some(n=>available.includes(n)))return 'direct';
 return c?.related.map(canonical).some(n=>available.includes(n))?'related':null;
}
export function chapterMatches(chapter:string,notions:string[]){return chapterMatchQuality(chapter,notions)!==null}
export function listChapters(notions:string[]=[],level='Terminale'){
 if(level!=='Première')return chapters.map(c=>c.title);
 const labels=[...new Set(notions.map(canonical))],grouped=new Set(Object.values(legacyGroups).flat().map(canonical));
 return [...Object.keys(legacyGroups).filter(c=>chapterMatches(c,labels)),...labels.filter(n=>!grouped.has(n))].sort((a,b)=>a.localeCompare(b,'fr'));
}
