// Données centralisées du site, partagées par les deux versions (src/ et src-v2/).
// Sources : fadalille.fr, cartes PDF officielles du 24/06/2026, presse (voir docs/recherche.md).
// Les valeurs entre crochets sont des placeholders à remplacer.

export const NOM = 'FADA'
export const NOM_COMPLET = 'FADA – Dining Drinking Dancing'

export const ADRESSE = {
  rue: '10 rue de Pas',
  cp: '59800',
  ville: 'Lille',
  repere: 'En face du Nouveau Siècle',
  lat: 50.6372884,
  lon: 3.0615296,
}

export const ACCES = [
  { mode: 'Métro', detail: 'Station Rihour' },
  { mode: 'Bus', detail: 'Arrêt Rihour' },
  { mode: 'V’Lille', detail: 'Station Place du Nouveau Siècle' },
  { mode: 'Parking', detail: 'Parking Nouveau Siècle' },
]

export const CONTACT = {
  telephone: '06 70 33 85 29',
  telephoneLien: '+33670338529',
  // Adresse donnée par le site pour les réservations au bar
  emailBar: 'contact@socialgroup.fr',
  // Adresse de contact générale (mentions légales, Facebook)
  email: 'fadalille@socialgroup.fr',
}

export const RESEAUX = {
  instagram: { label: '@fada.lille', url: 'https://www.instagram.com/fada.lille/' },
  instagramMessage: 'https://ig.me/m/fada.lille',
  tiktok: { label: '@fada.lille', url: 'https://www.tiktok.com/@fada.lille' },
  facebook: { label: 'FADA - LILLE', url: 'https://www.facebook.com/61574677502408' },
}

/** Réservation en ligne (Zenchef, identifiant du restaurant 376545). À vérifier avec les gérants. */
export const RESERVATION = {
  table: 'https://bookings.zenchef.com/results?rid=376545&pid=1001',
  privatisation: 'https://bookings.zenchef.com/privatisation?rid=376545&pid=1001',
}

/** Cartes complètes en PDF (liens publiés sur le Linktree de FADA). */
export const CARTES_PDF = {
  restaurant: 'https://api.zenchef.com/api/v2/files/a2199558-b319-456c-9fc8-2c34e6e89ec7/download',
  bar: 'https://api.zenchef.com/api/v2/files/a2199d68-6880-4e31-8d27-9e42621b0d11/download',
  vins: 'https://api.zenchef.com/api/v2/files/a164c8fe-5744-4f20-9e1f-55bb46ab08c2/download',
  groupe: 'https://api.zenchef.com/api/v2/files/a235a1e6-eda0-4bee-8c44-e0fcfc6ee315/download',
}

export const LIENS_CARTE = {
  itineraire: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `FADA, ${ADRESSE.rue}, ${ADRESSE.cp} ${ADRESSE.ville}`,
  )}`,
  osm: `https://www.openstreetmap.org/?mlat=${ADRESSE.lat}&mlon=${ADRESSE.lon}#map=18/${ADRESSE.lat}/${ADRESSE.lon}`,
  embed: `https://www.openstreetmap.org/export/embed.html?bbox=3.0585%2C50.6361%2C3.0645%2C50.6385&layer=mapnik&marker=${ADRESSE.lat}%2C${ADRESSE.lon}`,
}

/** Les deux étages (site officiel). */
export const ETAGES = {
  bar: {
    niveau: 'Au rez-de-chaussée',
    nom: 'Le bar',
    places: '100 places assises',
    terrasse: 'Terrasse couverte de 160 couverts',
    texte:
      'Cocktails maison, bières, une belle sélection de vins, une carte à partager et du son qui monte au fil de la soirée. Ambiance chill, vivante et généreuse.',
    jours: 'Du mardi au samedi',
  },
  restaurant: {
    niveau: 'À l’étage',
    nom: 'Le restaurant festif',
    places: '100 couverts',
    texte:
      'Une atmosphère méditerranéenne, une carte de saison ensoleillée, des lumières qui claquent, des DJs, des lives et une vraie énergie de fête.',
    jours: 'Mardi soir, puis jeudi, vendredi et samedi midi et soir',
  },
}

export const HISTOIRE = {
  ouverture: 'Juin 2025',
  groupe: 'Social Group',
  // Le Bonbon Lille, 03/06/2025
  texte:
    'FADA a ouvert le 6 juin 2025 au 10 rue de Pas. Le lieu est porté par le Social Group (Cartel, Amor Amor, Candy Shot, Babylone), avec Christophe Savey et Louis Guerbau.',
}

export const SERVICES = [
  'DJ sets',
  'Concerts',
  'Terrasse couverte',
  'Retransmissions sportives',
  'Soirées d’entreprise',
  'Privatisation',
]

export const AVIS = [
  { source: 'Google', note: '4,5', nombre: '765 avis' },
  { source: 'Zenchef, avis vérifiés', note: '4,6', nombre: '246 avis' },
]
export const DATE_AVIS = 'septembre 2026'

export const PRESSE: Array<{ media: string; date: string; titre?: string; url: string }> = [
  {
    media: 'La Voix du Nord',
    date: '30 mai 2025',
    titre: 'Pourquoi le resto-festif “Fada” est le lieu dont on va parler à Lille',
    url: 'https://www.lavoixdunord.fr/1590940/article/2025-05-30/pourquoi-le-resto-festif-fada-est-le-lieu-dont-va-parler-lille',
  },
  {
    media: 'Le Bonbon Lille',
    date: '3 juin 2025',
    url: 'https://www.lebonbon.fr/lille/pepites/social-group-ouvre-resto-festif-vieux-lille/',
  },
]

/**
 * Horaires en minutes depuis minuit. Une fermeture après minuit dépasse 1440
 * (ex. 02h du matin = 26 * 60). `jour` suit Date.getDay() : 0 = dimanche.
 * Source : site officiel (Google et TripAdvisor diffèrent légèrement, à confirmer avec les gérants).
 */
export type Creneau =
  | { jour: number; nom: string; ouverture: number; fermeture: number; note?: string }
  | { jour: number; nom: string; ferme: true }

const h = (heures: number) => heures * 60

export const HORAIRES: Creneau[] = [
  { jour: 1, nom: 'Lundi', ferme: true },
  { jour: 2, nom: 'Mardi', ouverture: h(17), fermeture: h(25) },
  { jour: 3, nom: 'Mercredi', ouverture: h(17), fermeture: h(25) },
  { jour: 4, nom: 'Jeudi', ouverture: h(17), fermeture: h(26) },
  { jour: 5, nom: 'Vendredi', ouverture: h(17), fermeture: h(26) },
  { jour: 6, nom: 'Samedi', ouverture: h(12), fermeture: h(26), note: 'sur réservation' },
  { jour: 0, nom: 'Dimanche', ferme: true },
]

export const NOTES_HORAIRES = [
  'Samedi : uniquement sur réservation.',
  'Au bar, cuisine à partir de 18h45. Terrasse : dernière commande à 22h30, fermeture à 23h.',
]

/* Carte (PDF officiels du 24/06/2026) */

export type Plat = { nom: string; detail?: string; prix: string }
export type Rubrique = { id: string; titre: string; note?: string; plats: Plat[] }

export const CARTE: Rubrique[] = [
  {
    id: 'partager',
    titre: 'À partager',
    plats: [
      { nom: 'Patatas bravas', detail: 'Pommes de terre croustillantes, aïoli maison, sauce bravas relevée', prix: '6 €' },
      { nom: 'Chaud-froid de tomates cerises', detail: 'Yaourt citronné, basilic, jus de citron et tuile de parmesan', prix: '10 €' },
      { nom: 'Falafels & baba ganoush fumé', detail: 'Herbes fraîches (persil, coriandre, menthe), sésame et citron confit', prix: '11 €' },
      { nom: 'Chorizo grillé', detail: 'Chorizo snacké, houmous de petits pois, pesto de roquette, noisettes et citron confit', prix: '12 €' },
      { nom: 'Croque-monsieur truffé', detail: 'Tartufata, jambon rostello et mozzarella gratinée', prix: '12 €' },
      { nom: 'Tacos poulet karaage', detail: 'Salsa verde, pimentón, tomates, jalapeños vert et rouge, citron', prix: '14 €' },
      { nom: 'Sélection de charcuterie italienne', prix: '18 €' },
      { nom: 'Assiette à partager', detail: 'Falafels et baba ganoush, charcuterie, patatas bravas, chorizo grillé', prix: '24 €' },
    ],
  },
  {
    id: 'entrees',
    titre: 'Entrées',
    plats: [
      { nom: 'Aubergine brûlée', detail: 'Tahini, ail confit, brunoise de poivrons et menthe fraîche', prix: '10 €' },
      { nom: 'Nectarines rôties, nduja & miel', detail: 'Pâte de nduja, miel, labneh infusé à l’ail, citron et basilic frais', prix: '12 €' },
      { nom: 'Jambon de Parme et mangue', detail: 'Jambon de Parme affiné, mangue et crème fraîche', prix: '13 €' },
      { nom: 'Carpaccio de thon', detail: 'Gelée de sauce soja et tempura de salicorne', prix: '14 €' },
      { nom: 'Polpette al sugo et vieux parmesan', detail: 'Sauce pomodoro', prix: '15 €' },
    ],
  },
  {
    id: 'plats',
    titre: 'Plats',
    note: 'Un plat minimum par personne au restaurant.',
    plats: [
      { nom: 'Risotto verde', detail: 'Petits pois, pois gourmands, gorgonzola, noix et huile verte', prix: '19 €' },
      { nom: 'Salade César', detail: 'Poulet karaage croustillant, romaine, sauce César', prix: '20 €' },
      { nom: 'Filet de maigre', detail: 'Purée de chou-fleur, noisettes grillées, sauce aux agrumes et gel citron', prix: '23 €' },
      { nom: 'Tortiglioni à la truffe', detail: 'Crème onctueuse, burrata et herbes fraîches', prix: '26 €' },
      { nom: 'Linguine aux gambas', detail: 'Bisque et gambas snackées', prix: '27 €' },
      { nom: 'Pluma ibérique', detail: 'Sauce romesco, jalapeños et patatas bravas', prix: '29 €' },
      { nom: 'Bœuf wagyu', detail: 'Jus réduit, purée au beurre noisette, courgettes rôties', prix: '39 €' },
      { nom: 'Oreille d’éléphant à la milanaise', detail: 'À partager, linguine sauce pomodoro basilic', prix: '75 €' },
    ],
  },
  {
    id: 'desserts',
    titre: 'Desserts',
    plats: [
      { nom: 'Affogato', detail: 'Glace vanille, expresso (supplément Amaretto)', prix: '7 € / 10 €' },
      { nom: 'Mousse au chocolat', detail: 'Brownie aux trois chocolats, fleur de sel, noisettes caramélisées', prix: '11 €' },
      { nom: 'Tiramisu maison', detail: 'Biscuit savoiardi et cacao 70 %', prix: '11 €' },
      { nom: 'Cheesecake mangue passion', detail: 'Insert mangue, brunoise mangue-passion et crumble', prix: '12 €' },
      { nom: 'Colonel', detail: 'Sorbet citron et Grey Goose', prix: '12 €' },
      { nom: 'Bananas Kitch', detail: 'Glace vanille, fraises, chocolat noir fondu, banane, cerises, chantilly', prix: '14 €' },
    ],
  },
  {
    id: 'cocktails',
    titre: 'Cocktails',
    plats: [
      { nom: 'Panama', detail: 'Rhum Havana Especial, liqueur de cacao, gingembre, passion, citron vert', prix: '10 €' },
      { nom: 'Amor Amor', detail: 'Gin infusé à l’hibiscus, orange sanguine, citron vert, pomme, kombucha, mûre', prix: '10 €' },
      { nom: 'Madre', detail: 'Vodka, citron, orange, grenadine, gingembre, eau gazeuse', prix: '10 €' },
      { nom: 'Frida', detail: 'Gin infusé à l’hibiscus, tonic, fleur d’oranger', prix: '10 €' },
      { nom: 'Negroni', detail: 'Campari, vermouth rouge, gin, orange', prix: '10 €' },
      { nom: 'Mojito / Royal', detail: 'Rhum, citron vert, menthe, cassonade (Royal au champagne)', prix: '10 € / 13 €' },
      { nom: 'Porn Star Martini', detail: 'Vodka vanille, passion, citron, maracuja, shot de prosecco', prix: '12 €' },
      { nom: 'Espresso martini', detail: 'Le classique, noisette ou tiramisu', prix: '12 à 14 €' },
      { nom: 'Spritz', detail: 'Aperol, Saint-Germain, Italicus, limoncello, Campari, Sarti Rosa', prix: '10 à 14 €' },
      { nom: 'Mocktails', detail: 'Virgin mojito, Au nom de la rose, Crodino virgin spritz', prix: '7 à 9 €' },
    ],
  },
]

/** Le seul cocktail qui porte le nom de la maison. */
export const SIGNATURE = {
  nom: 'FADA Mule',
  prix: '11 €',
  ingredients: ['Tequila Patrón', 'Citron vert', 'Ginger beer', 'Menthe fraîche', 'Sirop de piment oiseau', 'Angostura'],
}

export const BOISSONS = [
  { nom: 'Bières pression', detail: 'Jupiler, Kwak rouge, Goose IPA, Victoria…', prix: '4 à 5 € (25 cl)' },
  { nom: 'Vins au verre', detail: 'Blancs, rouges, rosés de Provence', prix: '6 à 11 € (12 cl)' },
  { nom: 'Champagne', detail: 'Besserat de Bellefon, Moët & Chandon', prix: '11 et 12 € la coupe' },
]

export const MENU_GROUPE = { prix: '49 €' }
