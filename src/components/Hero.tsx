import { ADRESSE } from '../data/infos'
import Logo from './Logo'
import Photo from './Photo'
import Statut from './Statut'

const DEVISE = ['Dining', 'Drinking', 'Dancing']
const BANDEAU = ['Dining', 'Drinking', 'Dancing', 'FADA is the New Siècle', 'Le diable s’habille en FADA', 'La fièvre de tous les soirs']

export default function Hero() {
  return (
    <section id="accueil" className="hero">
      <div className="container hero__grille">
        <div className="hero__texte">
          <p className="surtitre">
            Restaurant festif · {ADRESSE.rue}, {ADRESSE.ville}
          </p>
          <h1 className="hero__titre">
            <span className="sr-only">FADA, Dining Drinking Dancing</span>
            <Logo className="hero__logo" />
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

        <figure className="hero__photo">
          <Photo nom="bar-soiree" sizes="(min-width: 961px) 42vw, (min-width: 641px) 60vw, 100vw" prioritaire cadrage="50% 40%" />
        </figure>
      </div>

      <div className="bandeau" aria-hidden="true">
        <div className="bandeau__tigre" />
        <div className="bandeau__defile">
          {[0, 1].map((copie) => (
            <p key={copie} className="bandeau__ligne">
              {BANDEAU.map((mot) => (
                <span key={mot}>{mot}</span>
              ))}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}
