/*
  Déroulé de la séquence « Deux étages, deux ambiances », en secondes de timeline GSAP (0 à DUREE).
  L'état de la scène 3D est une fonction pure du temps : texte (GSAP) et image (Three.js) restent synchronisés,
  même quand le défilement s'arrête pendant le lissage.
*/

export const DUREE = 10

/** Fenêtres d'affichage des quatre textes (début, fin). */
export const ETAPES = [
  { debut: 0, fin: 1.8 },
  { debut: 2.2, fin: 4.5 },
  { debut: 5.9, fin: 7.9 },
  { debut: 8.5, fin: DUREE },
] as const

const serrer = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x))
export const lisse = (a: number, b: number, x: number) => {
  const t = serrer((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}

/** Position de la caméra et point visé, par étapes (temps, position, cible). */
export const CLES_CAMERA: Array<{ t: number; position: [number, number, number]; cible: [number, number, number] }> = [
  { t: 0, position: [4.1, 4.75, 3.3], cible: [0, 4.9, 0] },
  { t: 1, position: [3.75, 4.68, 3.0], cible: [0, 4.8, 0] },
  { t: 3, position: [2.5, 4.5, 1.95], cible: [0, 4.35, 0] },
  { t: 4.6, position: [1.0, 4.1, 0.78], cible: [0, 3.1, -0.2] },
  { t: 6, position: [0.1, 2.5, 0.02], cible: [-0.2, 0.6, -0.5] },
  { t: 6.7, position: [0.12, 1.05, 0.05], cible: [-0.8, 0.7, -3.0] },
  { t: 7.5, position: [1.0, 1.15, 1.5], cible: [-0.9, 0.9, -3.2] },
  { t: 9, position: [2.7, 1.25, 3.3], cible: [0, 3.0, 0] },
  { t: DUREE, position: [2.85, 1.25, 3.45], cible: [0, 3.05, 0] },
]

/** Indice fractionnaire dans CLES_CAMERA pour un temps donné (interpolation linéaire par morceaux). */
export function indiceCamera(t: number) {
  const cles = CLES_CAMERA
  if (t <= cles[0].t) return 0
  for (let i = 0; i < cles.length - 1; i++) {
    if (t <= cles[i + 1].t) return i + (t - cles[i].t) / (cles[i + 1].t - cles[i].t)
  }
  return cles.length - 1
}

/** Moment d'allumage de chaque ampoule, selon son ordre. */
export const allumage = (ordre: number, total: number) => 1.0 + 1.9 * (ordre / total)

/** Intensité d'une ampoule : grésillement bref à l'allumage puis lumière stable. */
export function intensiteAmpoule(t: number, ordre: number, total: number) {
  const f = serrer((t - allumage(ordre, total)) / 0.2)
  if (f <= 0) return 0
  if (f >= 1) return 1
  const x = f * 7.3 + ordre * 0.37
  return f * (0.3 + 0.7 * ((x - Math.floor(x)) > 0.35 ? 1 : 0))
}

export function etatScene(t: number) {
  const neonBrut = serrer((t - 8.0) / 0.7)
  const x = neonBrut * 9.1
  const neon = neonBrut >= 1 ? 1 : neonBrut * ((x - Math.floor(x)) > 0.4 ? 1 : 0.15)
  return {
    reflets: lisse(1.4, 3.2, t),
    balancement: 0.3 + 0.9 * lisse(3, 5, t) - 0.5 * lisse(7, 9, t),
    niches: lisse(2.4, 3.6, t),
    bar: lisse(5.4, 6.8, t),
    neon,
  }
}
