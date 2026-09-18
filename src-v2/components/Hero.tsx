import { ADRESSE } from '../../src/data/infos'
import { LOGO_CHEMIN, LOGO_HAUTEUR, LOGO_LARGEUR } from '../../src/data/logo-trace'
import Photo from '../../src/components/Photo'
import Statut from '../../src/components/Statut'

const DEVISE = ['Dining', 'Drinking', 'Dancing']

// Brins de chaînes au premier plan (x en %, longueur en vh, retard du balancement)
const BRINS = [
  { x: 64, l: 34, d: 0 },
  { x: 67.5, l: 46, d: -1.2 },
  { x: 71, l: 28, d: -2.1 },
  { x: 74, l: 52, d: -0.6 },
  { x: 77.5, l: 38, d: -1.7 },
  { x: 81, l: 58, d: -2.6 },
  { x: 84, l: 31, d: -0.9 },
  { x: 87.5, l: 44, d: -1.4 },
  { x: 91, l: 24, d: -2.3 },
  { x: 94, l: 36, d: -0.3 },
]

// Halos de lumière chaude en arrière-plan (position en %, taille en vmax, vitesse de parallaxe)
const HALOS = [
  { x: 72, y: 30, t: 34, v: 0.18 },
  { x: 86, y: 62, t: 26, v: 0.3 },
  { x: 58, y: 78, t: 22, v: 0.1 },
  { x: 12, y: 18, t: 18, v: 0.24 },
]

/** Logo FADA en tubes néon : même contour que le logo officiel, halo en traits superposés (sans filtre coûteux). */
function LogoNeon() {
  return (
    <svg
      className="neon"
      viewBox={`0 0 ${LOGO_LARGEUR} ${LOGO_HAUTEUR}`}
      aria-hidden="true"
      focusable="false"
    >
      <path className="neon__halo neon__halo--large" d={LOGO_CHEMIN} />
      <path className="neon__halo" d={LOGO_CHEMIN} />
      <path className="neon__tube" d={LOGO_CHEMIN} />
      <path className="neon__coeur" d={LOGO_CHEMIN} />
    </svg>
  )
}

export default function Hero() {
  return (
    <section id="accueil" className="hero">
      <div className="hero__decor" aria-hidden="true">
        <div className="hero__fond" data-vitesse="0.35">
          <Photo nom="bar-soiree" sizes="100vw" prioritaire cadrage="50% 35%" />
        </div>
        <div className="hero__voile" />
        {HALOS.map((h, i) => (
          <span
            key={i}
            className="hero__halo"
            data-vitesse={h.v}
            style={{ left: `${h.x}%`, top: `${h.y}%`, width: `${h.t}vmax`, height: `${h.t}vmax`, animationDelay: `${-i * 2.3}s` }}
          />
        ))}
        <div className="hero__chaines" data-vitesse="-0.25">
          {BRINS.map((b, i) => (
            <span
              key={i}
              className="hero__brin"
              style={{ left: `${b.x}%`, height: `${b.l}vh`, animationDelay: `${b.d}s` }}
            />
          ))}
        </div>
      </div>

      <div className="container hero__contenu">
        <p className="surtitre hero__surtitre">
          Restaurant festif · {ADRESSE.rue}, {ADRESSE.ville}
        </p>
        <h1 className="hero__titre">
          <span className="sr-only">FADA, Dining Drinking Dancing</span>
          <LogoNeon />
          <span className="hero__devise" aria-hidden="true">
            {DEVISE.map((mot) => (
              <span key={mot}>{mot}</span>
            ))}
          </span>
        </h1>
        <p className="hero__intro">
          Le spot festif en plein cœur de Lille, juste en face du Nouveau Siècle. Deux étages, deux ambiances, une seule
          promesse : bien manger, bien boire, faire la fête.
        </p>
        <Statut className="hero__statut" />
        <div className="hero__actions">
          <a href="#reserver" className="btn btn--plein">
            Réserver une table
          </a>
          <a href="#carte" className="btn btn--contour">
            Voir la carte
          </a>
        </div>
      </div>

      <a href="#maison" className="hero__descendre">
        <span>Descendre</span>
      </a>
    </section>
  )
}
