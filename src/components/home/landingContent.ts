import type { TypeDemandeDevis } from '../../types';

export type StudyCard = Readonly<{
  code: TypeDemandeDevis;
  title: string;
  description: string;
}>;

export type FaqItem = Readonly<{
  question: string;
  answer: string;
  imagePosition: string;
}>;

export const TRUST_ITEMS = [
  'Demande gratuite',
  'Sans engagement',
  'Bureaux d’études qualifiés',
  'Suivi en ligne',
  'Documents centralisés',
] as const;

// Textes proposés pour validation : docs/accueil-contenus-a-valider.md.
export const STUDIES_INTRO = "Découvrez les études proposées pour votre terrain ou votre projet, puis demandez un devis pour la mission qui correspond à votre besoin.";

export const STUDY_CARDS: readonly StudyCard[] = [
  { code: 'ASSAINISSEMENT', title: "Étude d'assainissement", description: "Votre logement n’est pas raccordé au tout-à-l’égout ? Cette étude analyse le sol, sa perméabilité et les contraintes de votre parcelle pour déterminer une solution de traitement des eaux usées adaptée." },
  { code: 'G0', title: 'G0 – Étude préliminaire de site', description: "Des sondages, des essais sur le terrain et des analyses permettent de connaître la nature du sol et de repérer ses contraintes avant de préparer votre projet de construction." },
  { code: 'G1_ES_PGC', title: 'G1 ES/PGC – Étude de site / Principes Généraux de Construction', description: "Cette étude identifie les principaux risques géotechniques du terrain et définit les premiers principes de construction. Elle aide à mieux connaître la parcelle avant une vente ou un achat." },
  { code: 'G2_AVP', title: 'G2 AVP – Étude géotechnique de conception (Avant-Projet)', description: "À partir des caractéristiques du sol et des premières esquisses du bâtiment, cette étude propose des solutions de fondation adaptées à votre projet, avec des investigations complémentaires si nécessaire." },
  { code: 'G2_PRO', title: 'G2 PRO – Étude géotechnique de conception (Projet)', description: "À partir des plans définitifs, cette étude précise les dimensions, la profondeur et la capacité de charge des fondations pour affiner la conception de votre projet." },
  { code: 'G5', title: 'G5 – Diagnostic géotechnique', description: "Une mission ciblée pour comprendre un problème de sol ou de fondations sur un ouvrage existant : fissures, affaissement ou glissement de terrain. Elle peut aussi accompagner un projet d’extension ou de surélévation." },
] as const;

export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: 'Qui réalisera mon étude de sol ?',
    answer: "Un bureau d’études partenaire disponible dans votre secteur pourra vous transmettre un devis. Un système de notation des bureaux d’études partenaires vous aidera à faire le meilleur choix.",
    imagePosition: 'center',
  },
  {
    question: 'Comment se passe la prise de rendez-vous ?',
    answer: "Vous proposez une période qui vous convient puis validez la date finale d’intervention avec le bureau d’études retenu. Les informations détaillées du bureau d’étude vous seront fournies pour faciliter les échanges, si des précisions sont à apporter.",
    imagePosition: 'left',
  },
  {
    question: 'Comment se déroule le suivi du projet ?',
    answer: 'Un système de suivi et de notification vous informe des diverses avancées de votre projet.',
    imagePosition: 'right',
  },
] as const;
