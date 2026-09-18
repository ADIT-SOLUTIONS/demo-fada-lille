// Photos du site (public/images, générées par scripts/images.py). La première largeur est le fichier sans suffixe.

export type InfosPhoto = { largeurs: number[]; largeur: number; hauteur: number; alt: string }

export const PHOTOS = {
  'bar-soiree': {
    largeurs: [1400, 900, 600],
    largeur: 1400,
    hauteur: 2100,
    alt: 'Le bar de FADA un soir de service : barmans au comptoir, suspensions tressées et mur de carreaux lumineux',
  },
  'salle-plongee': {
    largeurs: [1400, 900, 600],
    largeur: 1400,
    hauteur: 2100,
    alt: 'Vue plongeante depuis la mezzanine : tables hautes, banquette tigrée et lustre de chaînes dorées',
  },
  'lustre-mezzanine': {
    largeurs: [1280, 800],
    largeur: 1280,
    hauteur: 960,
    alt: 'Le lustre de chaînes sur toute la hauteur, la mezzanine vitrée et l’écran FADA',
  },
  'niches-arc': {
    largeurs: [1000, 640],
    largeur: 1000,
    hauteur: 1500,
    alt: 'Tables dressées devant les niches en arc rétroéclairées et les banquettes tigrées',
  },
  'scene-rideau': {
    largeurs: [1000, 640],
    largeur: 1000,
    hauteur: 1500,
    alt: 'La scène en arc, rideau rouge et filet de lumière',
  },
  'fenetre-demi-lune': {
    largeurs: [1000, 640],
    largeur: 1000,
    hauteur: 1500,
    alt: 'Table sous une fenêtre en demi-lune, banquette au motif tigré',
  },
  terrasse: {
    largeurs: [1000, 640],
    largeur: 1000,
    hauteur: 1498,
    alt: 'Table en terrasse au soleil, cocktails, vin et bières sur les pavés',
  },
  'table-menu': {
    largeurs: [1000, 640],
    largeur: 1000,
    hauteur: 1500,
    alt: 'Table dressée avec la carte « La fièvre de tous les soirs »',
  },
  'vitrine-affiches': {
    largeurs: [1000, 640],
    largeur: 1000,
    hauteur: 1498,
    alt: 'Affiches FADA en vitrine : « FADA is the New Siècle », « La fête à l’envers »',
  },
  'assiette-jambon': {
    largeurs: [900, 600],
    largeur: 900,
    hauteur: 1350,
    alt: 'Assiette de jambon affiné, crème et fruits',
  },
  'assiettes-partage': {
    largeurs: [900, 600],
    largeur: 900,
    hauteur: 1350,
    alt: 'Plusieurs assiettes à partager sur une table',
  },
  'assiette-legumes': {
    largeurs: [900, 600],
    largeur: 900,
    hauteur: 1350,
    alt: 'Assiette de poisson cru, concombre, radis et fleurs',
  },
  dessert: {
    largeurs: [900, 600],
    largeur: 900,
    hauteur: 1350,
    alt: 'Dessert glacé et coulis rouge, sous une lampe de table',
  },
  'cocktail-mousse': {
    largeurs: [900, 600],
    largeur: 900,
    hauteur: 1350,
    alt: 'Cocktail en coupe, mousse et tranche de fruit de la passion',
  },
  'spritz-table': {
    largeurs: [900, 600],
    largeur: 900,
    hauteur: 1350,
    alt: 'Spritz et verres de vin sur une table animée',
  },
  'shot-bar': {
    largeurs: [900, 600],
    largeur: 900,
    hauteur: 1350,
    alt: 'Un client lève son verre au bar, sous une lumière rose',
  },
  degustation: {
    largeurs: [900, 600],
    largeur: 900,
    hauteur: 1350,
    alt: 'Dégustation de vin devant une niche lumineuse',
  },
  'neon-dj': {
    largeurs: [460],
    largeur: 460,
    hauteur: 667,
    alt: 'Enseigne néon FADA au-dessus du bar, DJ aux platines devant le rideau rouge',
  },
} satisfies Record<string, InfosPhoto>

export type NomPhoto = keyof typeof PHOTOS
