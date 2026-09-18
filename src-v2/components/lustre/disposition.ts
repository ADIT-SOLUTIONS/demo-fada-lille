/*
  Le lustre de FADA : des rideaux de chaînes dorées suspendus en cascade sur toute la hauteur de la salle
  (voir les photos lustre-mezzanine et salle-plongee). Chaque étage du lustre est un cylindre de chaînes,
  plus étroit et plus bas que le précédent, au bord inférieur taillé en spirale. Des ampoules tubes à filament
  pendent à l'intérieur. Unités : mètres, sol du bar à y = 0.
*/

export const PLAFOND = 6.6
export const MEZZANINE = 3.2
export const RAYON_VIDE = 2.8 // bord de la mezzanine autour du vide
export const RAYON_SALLE = 6.8
export const RAYON_BRIN = 0.0055
export const MAILLON = 0.014 // pas d'un maillon de chaîne

export type Brin = { x: number; haut: number; z: number; longueur: number; phase: number; etage: number }
export type Ampoule = { x: number; y: number; z: number; ordre: number }
export type Anneau = { x: number; y: number; z: number; rayon: number }

/** Pseudo-hasard reproductible : même lustre à chaque chargement. */
export function hasard(graine: number) {
  const x = Math.sin(graine * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

const ETAGES = 6

export function disposition(mobile: boolean) {
  const espacement = mobile ? 0.058 : 0.042
  const brins: Brin[] = []
  const anneaux: Anneau[] = []
  const ampoules: Omit<Ampoule, 'ordre'>[] = []

  for (let k = 0; k < ETAGES; k++) {
    const cx = 0.14 * Math.cos(k * 1.35)
    const cz = 0.14 * Math.sin(k * 1.35)
    const rayon = 1.08 - k * 0.13
    const haut = PLAFOND - 0.12 - k * 0.46
    const base = 1.35 + k * 0.24
    const nombre = Math.round((Math.PI * 2 * rayon) / espacement)
    const departSpirale = k * 1.9

    anneaux.push({ x: cx, y: haut, z: cz, rayon })
    for (let i = 0; i < nombre; i++) {
      const a = (i / nombre) * Math.PI * 2
      // Bord inférieur en spirale : la longueur grandit d'un tour à l'autre, avec une marche franche
      const tour = (((a + departSpirale) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
      const longueur = base + 0.42 * (tour / (Math.PI * 2)) + (hasard(k * 1000 + i) - 0.5) * 0.05
      brins.push({
        x: cx + Math.cos(a) * rayon,
        haut,
        z: cz + Math.sin(a) * rayon,
        longueur,
        phase: hasard(k * 7000 + i * 3) * Math.PI * 2,
        etage: k,
      })
    }

    // Ampoules tubes à l'intérieur de chaque étage, à des hauteurs variées
    const nbAmpoules = k < 2 ? 4 : 3
    for (let j = 0; j < nbAmpoules; j++) {
      const a = (j / nbAmpoules) * Math.PI * 2 + k * 0.8 + hasard(k * 31 + j) * 0.6
      const r = rayon * (0.45 + hasard(k * 17 + j) * 0.3)
      const y = haut - 0.35 - hasard(k * 53 + j) * (base * 0.75)
      ampoules.push({ x: cx + Math.cos(a) * r, y, z: cz + Math.sin(a) * r })
    }
  }

  // Ordre d'allumage : du haut vers le bas, avec un peu de désordre
  const ordres = ampoules
    .map((a, i) => ({ i, cle: -a.y + hasard(i * 9.1) * 0.9 }))
    .sort((p, q) => p.cle - q.cle)
    .map((p) => p.i)
  const ampoulesOrdonnees: Ampoule[] = ampoules.map((a, i) => ({ ...a, ordre: ordres.indexOf(i) }))

  return { brins, anneaux, ampoules: ampoulesOrdonnees }
}

export const NB_AMPOULES = 4 + 4 + 3 * (ETAGES - 2)
