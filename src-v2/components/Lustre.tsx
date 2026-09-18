import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { ETAGES, HISTOIRE } from '../../src/data/infos'
import Photo from '../../src/components/Photo'
import Titre from '../../src/components/Titre'
import { DUREE, ETAPES } from './lustre/sequence'
import type { Scene3D } from './lustre/scene3d'

gsap.registerPlugin(ScrollTrigger, useGSAP)
ScrollTrigger.config({ ignoreMobileResize: true })

/*
  « Deux étages, deux ambiances » : le lustre de chaînes en 3D temps réel (Three.js), section épinglée.
  La caméra part de la mezzanine, les ampoules s'allument, elle plonge dans le rideau de chaînes, ressort
  au-dessus du bar et finit en contre-plongée, face à l'enseigne néon. La timeline GSAP pilote les textes ;
  la scène lit le même temps (lustre/sequence.ts).
  Sans WebGL, avec « réduire les animations » ou sur un écran trop bas : photo du vrai lustre et textes à la suite.
*/

const CHIFFRES = [
  { valeur: '100', libelle: 'places assises au bar' },
  { valeur: '160', libelle: 'couverts en terrasse' },
  { valeur: '100', libelle: 'couverts à l’étage' },
]

function webglDisponible() {
  try {
    const gl = document.createElement('canvas').getContext('webgl2')
    // Libère tout de suite ce contexte de test : le navigateur limite le nombre de contextes actifs
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    return !!gl
  } catch {
    return false
  }
}

export default function Lustre() {
  const racine = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(
        {
          anime: '(prefers-reduced-motion: no-preference) and (min-height: 480px)',
          mobile: '(max-width: 760px)',
        },
        (contexte) => {
          const { anime, mobile } = contexte.conditions as { anime: boolean; mobile: boolean }
          const bloc = racine.current
          if (!anime || !bloc || !webglDisponible()) return

          bloc.classList.add('lustre--anime')
          const q = gsap.utils.selector(bloc)
          const scene = q('.lustre__scene')[0] as HTMLElement
          const canvas = q('.lustre__canvas')[0] as HTMLCanvasElement
          const etapes = q('.lustre__etape') as HTMLElement[]
          const jauge = q('.lustre__jauge-valeur')[0] as HTMLElement

          let scene3d: Scene3D | null = null
          let raf = 0
          let annule = false
          let chargement = false
          let generation = 0

          const tl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: scene,
              start: 'top top',
              end: () => `+=${window.innerHeight * (mobile ? 4 : 5)}`,
              pin: true,
              scrub: 0.8,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          })
          tl.to({}, { duration: DUREE }, 0)
          tl.to(q('.lustre__indice'), { autoAlpha: 0, duration: 0.4 }, 0.3)
          ETAPES.forEach(({ debut, fin }, i) => {
            const etape = etapes[i]
            const lignes = etape.querySelectorAll('.lustre__anime')
            if (i > 0) {
              tl.fromTo(etape, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, immediateRender: false }, debut)
              tl.fromTo(lignes, { y: 28, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, stagger: 0.08, ease: 'power2.out', immediateRender: false }, debut)
            }
            if (fin < DUREE) {
              tl.to(lignes, { y: -24, autoAlpha: 0, duration: 0.35, stagger: 0.04, ease: 'power1.in' }, fin - 0.4)
              tl.to(etape, { autoAlpha: 0, duration: 0.1 }, fin)
            }
          })
          // Les étapes suivantes restent cachées tant que le défilement ne les a pas atteintes
          gsap.set(etapes.slice(1), { autoAlpha: 0 })

          // Rendu : uniquement quand la scène est à l'écran
          let derniereJauge = ''
          const boucle = () => {
            raf = requestAnimationFrame(boucle)
            // Démo : quand cette version est cachée derrière l'autre (classe posée par selecteur/cadre.ts), rien à dessiner
            if (!scene3d || document.documentElement.classList.contains('cadre-masque')) return
            const temps = tl.time()
            scene3d.rendre(temps)
            const valeur = (temps / DUREE).toFixed(3)
            if (valeur !== derniereJauge) {
              derniereJauge = valeur
              jauge.style.transform = `scaleY(${valeur})`
            }
          }
          const demarrer = () => {
            if (!raf) raf = requestAnimationFrame(boucle)
          }
          const arreter = () => {
            cancelAnimationFrame(raf)
            raf = 0
          }

          // La scène n'apparaît qu'une fois entièrement préparée (shaders compilés) ; la photo reste en secours
          const charger = () => {
            chargement = true
            const numero = ++generation
            const abandon = () => annule || numero !== generation
            import('./lustre/scene3d')
              .then(({ creerScene }) => creerScene(canvas, { mobile, largeur: scene.clientWidth, hauteur: scene.clientHeight, abandon }))
              .then((prete) => {
                if (abandon()) {
                  prete.detruire()
                  return
                }
                scene3d = prete
                scene3d.redimensionner(scene.clientWidth, scene.clientHeight)
                bloc.classList.remove('lustre--sans-3d')
                bloc.classList.add('lustre--prete')
              })
              .catch((erreur) => {
                if (abandon()) return
                console.warn('Scène 3D indisponible, photo affichée à la place.', erreur)
                bloc.classList.add('lustre--sans-3d')
              })
          }

          // Contexte WebGL perdu (pilote graphique réinitialisé, mémoire saturée) : photo, puis reconstruction
          const surPerteContexte = (evenement: Event) => {
            evenement.preventDefault() // autorise le navigateur à restaurer le contexte
            generation++
            scene3d?.detruire()
            scene3d = null
            bloc.classList.remove('lustre--prete')
            bloc.classList.add('lustre--sans-3d')
          }
          const surRestaurationContexte = () => {
            if (!annule && chargement) charger()
          }
          canvas.addEventListener('webglcontextlost', surPerteContexte)
          canvas.addEventListener('webglcontextrestored', surRestaurationContexte)

          const redimension = new ResizeObserver(() => scene3d?.redimensionner(scene.clientWidth, scene.clientHeight))
          redimension.observe(scene)

          // Scène préparée dès l'ouverture du site (en arrière-plan) pour être prête avant d'y arriver
          charger()
          const vue = new IntersectionObserver(([entree]) => (entree.isIntersecting ? demarrer() : arreter()), {
            rootMargin: '10% 0px',
          })
          vue.observe(scene)

          document.fonts?.ready.then(() => ScrollTrigger.refresh())

          return () => {
            annule = true
            arreter()
            vue.disconnect()
            redimension.disconnect()
            canvas.removeEventListener('webglcontextlost', surPerteContexte)
            canvas.removeEventListener('webglcontextrestored', surRestaurationContexte)
            scene3d?.detruire()
            scene3d = null
            bloc.classList.remove('lustre--anime', 'lustre--prete', 'lustre--sans-3d')
          }
        },
      )
    },
    { scope: racine },
  )

  const { bar, restaurant } = ETAGES

  return (
    <section id="maison" className="lustre" ref={racine} aria-labelledby="lustre-titre">
      <div className="lustre__scene">
        <div className="lustre__plateau" aria-hidden="true">
          <canvas className="lustre__canvas" />
          <Photo nom="lustre-mezzanine" sizes="100vw" className="lustre__poster" cadrage="55% 40%" />
          <div className="lustre__voile" />
        </div>

        <div className="container lustre__textes">
          <article className="lustre__etape lustre__etape--intro">
            <p className="surtitre lustre__anime">La maison</p>
            <Titre lignes={['Deux étages,', 'deux ambiances']} className="titre lustre__anime" id="lustre-titre" />
            <p className="lustre__texte lustre__anime">
              Un lustre de chaînes dorées sur toute la hauteur relie les deux niveaux. Une seule promesse : bien manger,
              bien boire, faire la fête.
            </p>
          </article>

          <article className="lustre__etape">
            <p className="lustre__niveau lustre__anime">{restaurant.niveau}</p>
            <h3 className="lustre__nom lustre__anime">{restaurant.nom}</h3>
            <p className="lustre__texte lustre__anime">{restaurant.texte}</p>
            <ul className="lustre__details lustre__anime">
              <li>{restaurant.places}</li>
              <li>{restaurant.jours}</li>
            </ul>
          </article>

          <article className="lustre__etape">
            <p className="lustre__niveau lustre__anime">{bar.niveau}</p>
            <h3 className="lustre__nom lustre__anime">{bar.nom}</h3>
            <p className="lustre__texte lustre__anime">{bar.texte}</p>
            <ul className="lustre__details lustre__anime">
              <li>{bar.places}</li>
              <li>{bar.terrasse}</li>
              <li>{bar.jours}</li>
            </ul>
          </article>

          <article className="lustre__etape lustre__etape--fin">
            <p className="lustre__niveau lustre__anime">Depuis {HISTOIRE.ouverture.toLowerCase()}</p>
            <p className="lustre__devise lustre__anime">FADA is the New Siècle.</p>
            <p className="lustre__texte lustre__anime">{HISTOIRE.texte}</p>
            <dl className="lustre__chiffres lustre__anime">
              {CHIFFRES.map((c) => (
                <div key={c.libelle}>
                  <dt>{c.libelle}</dt>
                  <dd>{c.valeur}</dd>
                </div>
              ))}
            </dl>
          </article>
        </div>

        <div className="lustre__jauge" aria-hidden="true">
          <span className="lustre__jauge-valeur" />
        </div>
        <p className="lustre__indice" aria-hidden="true">
          Faites défiler pour descendre
        </p>
      </div>
    </section>
  )
}
