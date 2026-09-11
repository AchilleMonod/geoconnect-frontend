import type { DocumentCategory } from '../../constants/documentCategories';

type DocumentGuide = Readonly<{
  category: DocumentCategory;
  title: string;
  description: string;
  instructions?: readonly string[];
  link?: Readonly<{ href: string; label: string }>;
}>;

const GEOPORTAIL = { href: 'https://www.geoportail.gouv.fr/carte', label: 'Vers geoportail.gouv.fr' };

// Proposition issue de la spécification. Points éditoriaux ouverts dans
// docs/accueil-contenus-a-valider.md ; aucune procédure inventée pour les réseaux.
export const DOCUMENT_GUIDES: readonly DocumentGuide[] = [
  {
    category: 'EXTRAIT_CADASTRAL', title: 'Extrait cadastral',
    description: 'L’extrait cadastral permet au bureau d’études de délimiter vos parcelles, de préparer un devis plus précis et d’étudier les accès au terrain.',
    instructions: ['Sur Géoportail, recherchez votre terrain et affichez le fond de carte « Parcelles cadastrales ».'],
    link: GEOPORTAIL,
  },
  {
    category: 'PLAN_TOPOGRAPHIQUE', title: 'Plan topographique',
    description: 'Le plan topographique aide le bureau d’études à apprécier le relief et les accès au terrain pour préparer son intervention, notamment sur une parcelle en pente.',
    instructions: ['Sur Géoportail, affichez le fond « Carte topographique IGN ». Choisissez une vue assez large pour situer les reliefs autour de votre terrain.'],
    link: GEOPORTAIL,
  },
  {
    category: 'PHOTO_ACCES', title: 'Photo des accès',
    description: 'Les photos aident le bureau d’études à déterminer quels engins peuvent accéder au terrain. Un smartphone convient : prenez plusieurs vues et veillez à la luminosité.',
    instructions: ['Photographiez le terrain depuis le chemin d’accès.', 'Prenez une photo du chemin pour montrer sa nature.', 'Si l’accès est complexe, ajoutez une photo de l’intersection avec la route principale.'],
  },
  {
    category: 'PLAN_RESEAUX_PRIVES', title: 'Plan des réseaux privés',
    description: 'Ce plan permet de repérer les canalisations et les réseaux électriques enterrés pour anticiper les précautions à prendre lors des forages.',
  },
  {
    category: 'PLAN_SITUATION', title: 'Plan de situation',
    description: 'Ce document situe votre projet dans la commune et permet d’identifier le terrain et ses accès.',
    instructions: ['Vous pouvez joindre ce document à votre demande d’étude. Vérifiez qu’il contient au moins un extrait cadastral, une vue satellite et une photo des accès au terrain.'],
  },
];
