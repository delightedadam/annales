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

const previousPremiereChapters = [
  {
    "title": "Première : Quantité de matière et concentrations",
    "direct": [
      "Quantité de matière"
    ],
    "related": []
  },
  {
    "title": "Première : Absorbance et dosage par étalonnage",
    "direct": [
      "Loi de Beer-Lambert",
      "Beer-Lambert"
    ],
    "related": []
  },
  {
    "title": "Première : Réactions d’oxydoréduction",
    "direct": [
      "Oxydoréduction"
    ],
    "related": []
  },
  {
    "title": "Première : Avancement et bilan de matière",
    "direct": [
      "Tableau d’avancement"
    ],
    "related": []
  },
  {
    "title": "Première : Titrages colorimétriques",
    "direct": [
      "Titrage"
    ],
    "related": []
  },
  {
    "title": "Première : Structure et polarité des entités chimiques",
    "direct": [
      "Polarité"
    ],
    "related": []
  },
  {
    "title": "Première : Cohésion, solubilité et extraction",
    "direct": [
      "Solubilité"
    ],
    "related": []
  },
  {
    "title": "Première : Structure des molécules organiques et spectroscopie IR",
    "direct": [
      "Structure des entités organiques",
      "Spectroscopie IR"
    ],
    "related": []
  },
  {
    "title": "Première : Synthèse en chimie organique",
    "direct": [
      "Synthèse organique"
    ],
    "related": []
  },
  {
    "title": "Première : Combustions et énergie chimique",
    "direct": [
      "Combustions"
    ],
    "related": []
  },
  {
    "title": "Première : Interactions, forces et champs",
    "direct": [
      "Interactions fondamentales"
    ],
    "related": []
  },
  {
    "title": "Première : Statique des fluides",
    "direct": [
      "Fluides"
    ],
    "related": []
  },
  {
    "title": "Première : Mouvement et variation du vecteur vitesse",
    "direct": [
      "Vecteur variation de vitesse"
    ],
    "related": []
  },
  {
    "title": "Première : Énergie électrique",
    "direct": [
      "Électricité"
    ],
    "related": []
  },
  {
    "title": "Première : Travail, énergie cinétique et énergie mécanique",
    "direct": [
      "Théorème de l’énergie cinétique",
      "Énergie mécanique"
    ],
    "related": []
  },
  {
    "title": "Première : Ondes mécaniques",
    "direct": [
      "Ondes mécaniques"
    ],
    "related": []
  },
  {
    "title": "Première : Lentilles, images et couleurs",
    "direct": [
      "Images et couleurs"
    ],
    "related": []
  },
  {
    "title": "Première : Lumière, photons et interaction lumière-matière",
    "direct": [
      "Photon",
      "Photon – interaction lumière-matière"
    ],
    "related": []
  }
];

// Course titles and order supplied by the user.
export const premiereChapters = [
  {
    "title": "Première : Composition d'un système chimique",
    "direct": [
      "Quantité de matière",
      "Loi de Beer-Lambert",
      "Beer-Lambert"
    ],
    "related": []
  },
  {
    "title": "Première : Modélisation d'une transformation",
    "direct": [
      "Oxydoréduction",
      "Tableau d’avancement",
      "Titrage"
    ],
    "related": []
  },
  {
    "title": "Première : Ondes mécaniques",
    "direct": [
      "Ondes mécaniques"
    ],
    "related": []
  },
  {
    "title": "Première : Images et couleurs",
    "direct": [
      "Images et couleurs"
    ],
    "related": []
  },
  {
    "title": "Première : Modèle ondulatoire et particulaire de la lumière",
    "direct": [
      "Photon",
      "Photon – interaction lumière-matière"
    ],
    "related": []
  },
  {
    "title": "Première : Structure des entités",
    "direct": [
      "Polarité"
    ],
    "related": []
  },
  {
    "title": "Première : De la cohésion à la solubilité d'espèces chimiques",
    "direct": [
      "Solubilité"
    ],
    "related": []
  },
  {
    "title": "Première : Interactions fondamentales et notion de champ",
    "direct": [
      "Interactions fondamentales"
    ],
    "related": []
  },
  {
    "title": "Première : Mouvement d'un système",
    "direct": [
      "Vecteur variation de vitesse"
    ],
    "related": []
  },
  {
    "title": "Première : Aspects énergétiques des systèmes mécaniques",
    "direct": [
      "Énergie mécanique",
      "Théorème de l’énergie cinétique"
    ],
    "related": []
  },
  {
    "title": "Première : Structure des composés organiques",
    "direct": [
      "Structure des entités organiques",
      "Spectroscopie IR"
    ],
    "related": []
  },
  {
    "title": "Première : Synthèse organique",
    "direct": [
      "Synthèse organique"
    ],
    "related": []
  },
  {
    "title": "Première : Énergie stockée dans la matière organique",
    "direct": [
      "Combustions"
    ],
    "related": []
  },
  {
    "title": "Première : Aspects énergétiques des systèmes électriques",
    "direct": [
      "Électricité"
    ],
    "related": []
  },
  {
    "title": "Première : Fluide au repos",
    "direct": [
      "Fluides"
    ],
    "related": []
  }
];
export function chapterMembers(label:string){const c=[...chapters,...premiereChapters,...previousPremiereChapters].find(c=>c.title===label);return (c?[...c.direct,...c.related]:legacyGroups[label]??[label]).map(canonical)}
export function chapterMatchQuality(label:string,notions:string[]):'direct'|'related'|null{
 const available=notions.map(canonical),c=[...chapters,...premiereChapters,...previousPremiereChapters].find(c=>c.title===label);
 if((c?.direct??legacyGroups[label]??[label]).map(canonical).some(n=>available.includes(n)))return 'direct';
 return c?.related.map(canonical).some(n=>available.includes(n))?'related':null;
}
export function chapterMatches(chapter:string,notions:string[]){return chapterMatchQuality(chapter,notions)!==null}
export function listChapters(_notions:string[]=[],level='Terminale'){
 return (level==='Première'?premiereChapters:chapters).map(c=>c.title);
}
