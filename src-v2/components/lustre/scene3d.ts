import * as THREE from 'three'
import { LOGO_CONTOURS, LOGO_HAUTEUR, LOGO_LARGEUR } from '../../../src/data/logo-trace'
import { MEZZANINE, NB_AMPOULES, PLAFOND, RAYON_BRIN, RAYON_SALLE, RAYON_VIDE, disposition } from './disposition'
import { CLES_CAMERA, etatScene, indiceCamera, intensiteAmpoule } from './sequence'
import * as S from './shaders'

export type Scene3D = {
  rendre: (temps: number) => void
  redimensionner: (largeur: number, hauteur: number) => void
  detruire: () => void
}

type OptionsScene = {
  mobile: boolean
  largeur: number
  hauteur: number
  /** Vrai quand la scène n'est plus attendue (démontage, perte du contexte) : la préparation s'arrête. */
  abandon: () => boolean
}

const pause = (ms = 0) => new Promise<void>((resoudre) => setTimeout(resoudre, ms))
const vec3 = (p: [number, number, number]) => new THREE.Vector3(...p)

/** Enseigne néon : tubes qui suivent le contour du logo officiel, largeur donnée en mètres. */
function geometriesNeon(largeur: number) {
  const k = largeur / LOGO_LARGEUR
  const coeur: THREE.BufferGeometry[] = []
  const halo: THREE.BufferGeometry[] = []
  for (const contour of LOGO_CONTOURS) {
    const points = contour.map(([x, y]) => new THREE.Vector3((x - LOGO_LARGEUR / 2) * k, (LOGO_HAUTEUR / 2 - y) * k, 0))
    const chemin = new THREE.CurvePath<THREE.Vector3>()
    points.forEach((p, i) => chemin.add(new THREE.LineCurve3(p, points[(i + 1) % points.length])))
    const segments = Math.max(48, Math.round(chemin.getLength() / 0.012))
    coeur.push(new THREE.TubeGeometry(chemin, segments, 0.011, 6, true))
    halo.push(new THREE.TubeGeometry(chemin, segments, 0.05, 6, true))
  }
  return { coeur, halo }
}

/**
 * Construit la scène par étapes, en rendant la main au navigateur entre chacune, puis compile tous les
 * shaders en parallèle (KHR_parallel_shader_compile) avant de la livrer : aucun blocage pendant le défilement.
 */
export async function creerScene(canvas: HTMLCanvasElement, options: OptionsScene): Promise<Scene3D> {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
  // Au-delà de 1,5 le gain visuel est faible et le coût GPU double ; la définition baisse encore si l'appareil peine
  const ratioMax = Math.min(window.devicePixelRatio, 1.5)
  const ratioMin = Math.min(1, ratioMax) * 0.6
  let ratio = ratioMax
  renderer.setPixelRatio(ratio)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.15
  const fondNuit = new THREE.Color('#0b0302')
  renderer.setClearColor(fondNuit)

  const aJeter: Array<{ dispose: () => void }> = []
  const detruire = () => {
    aJeter.forEach((o) => o.dispose())
    renderer.dispose()
  }
  const etape = async (ms = 0) => {
    await pause(ms)
    if (options.abandon()) {
      detruire()
      throw new Error('Préparation de la scène 3D abandonnée')
    }
  }

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(options.mobile ? 62 : 50, 1, 0.03, 40)
  const { brins, anneaux, ampoules } = disposition(options.mobile)

  /* Uniforms partagés par tous les matériaux (mêmes objets : une mise à jour suffit) */
  const commun = {
    uAmpoules: { value: ampoules.map((a) => new THREE.Vector3(a.x, a.y, a.z)) },
    uIntensites: { value: new Array<number>(NB_AMPOULES).fill(0) },
    uTemps: { value: 0 },
    uSalle: { value: 0 },
    uBrouillard: { value: new THREE.Color('#0d0402') },
    uDensite: { value: 0.0045 },
  }
  const matiere = (vertexShader: string, fragmentShader: string, extra: Record<string, THREE.IUniform> = {}, reglages: Partial<THREE.ShaderMaterialParameters> = {}) => {
    const m = new THREE.ShaderMaterial({ uniforms: { ...commun, ...extra }, vertexShader, fragmentShader, ...reglages })
    aJeter.push(m)
    return m
  }
  const garder = <T extends { dispose: () => void }>(o: T) => {
    aJeter.push(o)
    return o
  }

  /* Chaînes : un seul appel de dessin pour tous les brins */
  const cylindre = new THREE.CylinderGeometry(RAYON_BRIN, RAYON_BRIN, 1, 5, options.mobile ? 16 : 22, true).translate(0, -0.5, 0)
  const geoBrins = garder(new THREE.InstancedBufferGeometry())
  geoBrins.index = cylindre.index
  geoBrins.setAttribute('position', cylindre.getAttribute('position'))
  geoBrins.instanceCount = brins.length
  geoBrins.setAttribute('aBrin', new THREE.InstancedBufferAttribute(new Float32Array(brins.flatMap((b) => [b.x, b.haut, b.z, b.longueur])), 4))
  geoBrins.setAttribute('aPhase', new THREE.InstancedBufferAttribute(new Float32Array(brins.map((b) => b.phase)), 1))
  cylindre.dispose()
  const uniformsChaines = { uBalancement: { value: 0.3 }, uReflets: { value: 0 }, uOr: { value: new THREE.Color('#c98a4b') } }
  const chaines = new THREE.Mesh(geoBrins, matiere(S.chaineVertex, S.chaineFragment, uniformsChaines))
  chaines.frustumCulled = false
  scene.add(chaines)
  await etape()

  /* Anneaux qui portent chaque étage de chaînes */
  const matMetal = matiere(S.surfaceVertex, S.surfaceFragment, { uCouleur: { value: new THREE.Color('#8a5a2b') }, uBrillance: { value: 2.5 } })
  anneaux.forEach((a) => {
    const anneau = new THREE.Mesh(garder(new THREE.TorusGeometry(a.rayon, 0.014, 6, 72).rotateX(Math.PI / 2)), matMetal)
    anneau.position.set(a.x, a.y, a.z)
    scene.add(anneau)
  })

  /* Ampoules tubes, cordons et halos */
  const tube = new THREE.CylinderGeometry(0.017, 0.017, 0.28, 10, 1, false)
  const geoAmpoules = garder(new THREE.InstancedBufferGeometry())
  geoAmpoules.index = tube.index
  geoAmpoules.setAttribute('position', tube.getAttribute('position'))
  geoAmpoules.setAttribute('normal', tube.getAttribute('normal'))
  geoAmpoules.instanceCount = NB_AMPOULES
  tube.dispose()
  const tubes = new THREE.Mesh(geoAmpoules, matiere(S.ampouleVertex, S.ampouleFragment))
  tubes.frustumCulled = false
  scene.add(tubes)

  const cordons = new THREE.LineSegments(
    garder(new THREE.BufferGeometry().setFromPoints(ampoules.flatMap((a) => [new THREE.Vector3(a.x, PLAFOND, a.z), new THREE.Vector3(a.x, a.y + 0.14, a.z)]))),
    garder(new THREE.LineBasicMaterial({ color: '#2a140a' })),
  )
  scene.add(cordons)

  const quad = new THREE.PlaneGeometry(1, 1)
  const geoHalos = garder(new THREE.InstancedBufferGeometry())
  geoHalos.index = quad.index
  geoHalos.setAttribute('position', quad.getAttribute('position'))
  geoHalos.setAttribute('uv', quad.getAttribute('uv'))
  geoHalos.instanceCount = NB_AMPOULES + 1
  quad.dispose()
  const halos = new THREE.Mesh(
    geoHalos,
    matiere(
      S.haloVertex,
      S.haloFragment,
      { uTaille: { value: 0.55 }, uCentre: { value: new THREE.Vector3(0.05, 4.3, 0.05) }, uTailleCentre: { value: 4.2 }, uForce: { value: 1 } },
      { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending },
    ),
  )
  halos.frustumCulled = false
  halos.renderOrder = 10
  scene.add(halos)
  await etape()

  /* Salle : murs, sol, plafond, mezzanine et garde-corps vitré */
  const uniformsSalle = { uNiches: { value: 0 }, uBar: { value: 0 }, uNeon: { value: 0 } }
  const murs = new THREE.Mesh(
    garder(new THREE.CylinderGeometry(RAYON_SALLE, RAYON_SALLE, PLAFOND, 128, 1, true)),
    matiere(S.surfaceVertex, S.murFragment, { ...uniformsSalle, uCouleur: { value: new THREE.Color('#9b3a1a') } }, { side: THREE.BackSide }),
  )
  murs.position.y = PLAFOND / 2
  const sol = new THREE.Mesh(garder(new THREE.CircleGeometry(RAYON_SALLE, 72).rotateX(-Math.PI / 2)), matiere(S.surfaceVertex, S.solFragment, uniformsSalle))
  const plafond = new THREE.Mesh(garder(new THREE.CircleGeometry(RAYON_SALLE, 72).rotateX(Math.PI / 2)), matiere(S.surfaceVertex, S.plafondFragment))
  plafond.position.y = PLAFOND
  scene.add(murs, sol, plafond)

  const matDalle = matiere(S.surfaceVertex, S.surfaceFragment, { uCouleur: { value: new THREE.Color('#7a2c14') }, uBrillance: { value: 0.2 } }, { side: THREE.DoubleSide })
  const dessus = new THREE.Mesh(garder(new THREE.RingGeometry(RAYON_VIDE, RAYON_SALLE, 96, 1).rotateX(-Math.PI / 2)), matDalle)
  dessus.position.y = MEZZANINE
  const dessous = new THREE.Mesh(garder(new THREE.RingGeometry(RAYON_VIDE, RAYON_SALLE, 96, 1).rotateX(Math.PI / 2)), matDalle)
  dessous.position.y = MEZZANINE - 0.32
  const chant = new THREE.Mesh(garder(new THREE.CylinderGeometry(RAYON_VIDE, RAYON_VIDE, 0.32, 96, 1, true)), matDalle)
  chant.position.y = MEZZANINE - 0.16
  const vitre = new THREE.Mesh(
    garder(new THREE.CylinderGeometry(RAYON_VIDE, RAYON_VIDE, 1, 96, 1, true)),
    matiere(S.surfaceVertex, S.vitreFragment, {}, { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }),
  )
  vitre.position.y = MEZZANINE + 0.5
  const main = new THREE.Mesh(garder(new THREE.TorusGeometry(RAYON_VIDE, 0.022, 6, 128).rotateX(Math.PI / 2)), matMetal)
  main.position.y = MEZZANINE + 1
  scene.add(dessus, dessous, chant, vitre, main)
  await etape()

  /* Enseigne néon FADA sur le rideau rouge, au rez-de-chaussée */
  const neon = new THREE.Group()
  const { coeur, halo } = geometriesNeon(2.3)
  const uniformsNeon = { uNeon: uniformsSalle.uNeon }
  const matNeon = matiere(S.neonVertex, S.neonFragment, { ...uniformsNeon, uHalo: { value: 0 } })
  const matHaloNeon = matiere(S.neonVertex, S.neonFragment, { ...uniformsNeon, uHalo: { value: 1 } }, {
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  coeur.forEach((g) => neon.add(new THREE.Mesh(garder(g), matNeon)))
  halo.forEach((g) => {
    const m = new THREE.Mesh(garder(g), matHaloNeon)
    m.renderOrder = 9
    neon.add(m)
  })
  const rayonNeon = RAYON_SALLE - 0.14
  neon.position.set(Math.cos(S.ANGLE_NEON) * rayonNeon, 2.3, Math.sin(S.ANGLE_NEON) * rayonNeon)
  neon.lookAt(0, 2.3, 0)
  scene.add(neon)
  await etape()

  /* Trajectoire de la caméra */
  const trajet = new THREE.CatmullRomCurve3(CLES_CAMERA.map((c) => vec3(c.position)), false, 'centripetal')
  const visee = new THREE.CatmullRomCurve3(CLES_CAMERA.map((c) => vec3(c.cible)), false, 'centripetal')
  const cible = new THREE.Vector3()

  /* Cadrage */
  let largeur = 1
  let hauteur = 1
  const redimensionner = (l: number, h: number) => {
    largeur = Math.max(1, Math.round(l))
    hauteur = Math.max(1, Math.round(h))
    renderer.setSize(largeur, hauteur, false)
    camera.aspect = largeur / hauteur
    // Écran en portrait : champ plus large pour garder le lustre entier
    camera.fov = camera.aspect < 0.8 ? 66 : options.mobile ? 60 : 50
    camera.updateProjectionMatrix()
  }

  // Définition adaptative : si les images s'espacent trop (GPU saturé), on baisse la résolution par paliers
  const durees: number[] = []
  let derniereImage = 0
  const ajusterQualite = () => {
    const maintenant = performance.now()
    const duree = maintenant - derniereImage
    derniereImage = maintenant
    if (duree > 250) {
      durees.length = 0 // reprise après une pause du rendu
      return
    }
    durees.push(duree)
    if (durees.length < 40) return
    const mediane = durees.sort((a, b) => a - b)[20]
    durees.length = 0
    if (mediane > 22 && ratio > ratioMin) {
      ratio = Math.max(ratioMin, ratio * 0.8)
      renderer.setPixelRatio(ratio)
      renderer.setSize(largeur, hauteur, false)
    }
  }

  const origine = performance.now()
  const intensites = commun.uIntensites.value

  const rendre = (t: number) => {
    ajusterQualite()
    const temps = (performance.now() - origine) / 1000
    let somme = 0
    for (let i = 0; i < ampoules.length; i++) {
      intensites[i] = intensiteAmpoule(t, ampoules[i].ordre, ampoules.length)
      somme += intensites[i]
    }
    const e = etatScene(t)
    commun.uTemps.value = temps
    commun.uSalle.value = somme / ampoules.length
    uniformsChaines.uBalancement.value = e.balancement
    uniformsChaines.uReflets.value = e.reflets
    uniformsSalle.uNiches.value = e.niches
    uniformsSalle.uBar.value = e.bar
    uniformsSalle.uNeon.value = e.neon

    const u = indiceCamera(t) / (CLES_CAMERA.length - 1)
    trajet.getPoint(u, camera.position)
    visee.getPoint(u, cible)
    // Légère respiration de la caméra, même à l'arrêt
    camera.position.x += Math.sin(temps * 0.4) * 0.025
    camera.position.y += Math.sin(temps * 0.31) * 0.018
    camera.lookAt(cible)
    renderer.render(scene, camera)
  }

  redimensionner(options.largeur, options.hauteur)

  // Compilation de tous les shaders avant le premier affichage, sans bloquer la page
  camera.position.copy(trajet.getPoint(0))
  camera.lookAt(visee.getPoint(0))
  await renderer.compileAsync(scene, camera)
  await etape()

  // Premier rendu à blanc (canvas encore invisible) : envoi des géométries au GPU, ampoules allumées
  intensites.fill(1)
  commun.uSalle.value = 1
  uniformsSalle.uNeon.value = 1
  renderer.render(scene, camera)
  await etape()
  rendre(0)

  return { rendre, redimensionner, detruire }
}
