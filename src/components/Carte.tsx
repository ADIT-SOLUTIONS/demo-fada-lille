import { useRef, useState, type KeyboardEvent } from 'react'
import { BOISSONS, CARTE, CARTES_PDF, SIGNATURE } from '../data/infos'
import Logo from './Logo'
import Photo from './Photo'

const PHOTOS_CARTE = ['assiette-jambon', 'assiettes-partage', 'assiette-legumes', 'cocktail-mousse'] as const

export default function Carte() {
  const [active, setActive] = useState(CARTE[0].id)
  const onglets = useRef<Array<HTMLButtonElement | null>>([])

  // Navigation au clavier entre les onglets (flèches, début, fin)
  const surTouche = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const cibles: Record<string, number> = {
      ArrowRight: (index + 1) % CARTE.length,
      ArrowLeft: (index - 1 + CARTE.length) % CARTE.length,
      Home: 0,
      End: CARTE.length - 1,
    }
    if (!(e.key in cibles)) return
    e.preventDefault()
    const suivant = cibles[e.key]
    setActive(CARTE[suivant].id)
    onglets.current[suivant]?.focus()
  }

  return (
    <section id="carte" className="section carte">
      <div className="container">
        <div className="carte__feuille">
          <header className="carte__entete" data-reveal>
            <h2 className="carte__titre">
              <span className="sr-only">La carte</span>
              <Logo className="carte__logo" />
              <span className="carte__mot" aria-hidden="true">
                Dining
              </span>
            </h2>
            <p className="carte__accroche">La fête commence dans l’assiette.</p>
            <p className="carte__intro">
              Une cuisine méditerranéenne de saison, pensée pour être partagée. Les assiettes arrivent, les verres se
              remplissent, et la nuit prend le relais.
            </p>
          </header>

          <div className="onglets" role="tablist" aria-label="Rubriques de la carte">
            {CARTE.map((rubrique, i) => (
              <button
                key={rubrique.id}
                ref={(el) => {
                  onglets.current[i] = el
                }}
                type="button"
                role="tab"
                id={`onglet-${rubrique.id}`}
                aria-selected={active === rubrique.id}
                aria-controls={`panneau-${rubrique.id}`}
                tabIndex={active === rubrique.id ? 0 : -1}
                className="onglets__bouton"
                onClick={() => setActive(rubrique.id)}
                onKeyDown={(e) => surTouche(e, i)}
              >
                {rubrique.titre}
              </button>
            ))}
          </div>

          {CARTE.map((rubrique) => (
            <div
              key={rubrique.id}
              role="tabpanel"
              id={`panneau-${rubrique.id}`}
              aria-labelledby={`onglet-${rubrique.id}`}
              hidden={active !== rubrique.id}
              className="rubrique"
            >
              <h3 className="rubrique__titre">{rubrique.titre}</h3>
              <ul className="plats">
                {rubrique.plats.map((plat) => (
                  <li key={plat.nom} className="plat">
                    <div className="plat__ligne">
                      <span className="plat__nom">{plat.nom}</span>
                      <span className="plat__prix">{plat.prix}</span>
                    </div>
                    {plat.detail && <p className="plat__detail">{plat.detail}</p>}
                  </li>
                ))}
              </ul>
              {rubrique.note && <p className="rubrique__note">{rubrique.note}</p>}
            </div>
          ))}

          <aside className="signature" data-reveal aria-labelledby="signature-nom">
            <div className="signature__tigre" aria-hidden="true" />
            <div className="signature__corps">
              <p className="signature__surtitre">Le cocktail de la maison</p>
              <h3 id="signature-nom" className="signature__nom">
                {SIGNATURE.nom}
              </h3>
              <p className="signature__prix">{SIGNATURE.prix}</p>
              <ul className="signature__ingredients" aria-label="Ingrédients">
                {SIGNATURE.ingredients.map((ingredient) => (
                  <li key={ingredient}>{ingredient}</li>
                ))}
              </ul>
            </div>
          </aside>

          <ul className="boissons" data-reveal>
            {BOISSONS.map((b) => (
              <li key={b.nom} className="boissons__item">
                <span className="boissons__nom">{b.nom}</span>
                <span className="boissons__detail">{b.detail}</span>
                <span className="boissons__prix">{b.prix}</span>
              </li>
            ))}
          </ul>

          <div className="carte__pdf" data-reveal>
            <p>Cartes complètes :</p>
            <a href={CARTES_PDF.restaurant} target="_blank" rel="noopener noreferrer">
              Restaurant <span className="sr-only">(PDF, nouvelle fenêtre)</span>
            </a>
            <a href={CARTES_PDF.bar} target="_blank" rel="noopener noreferrer">
              Bar <span className="sr-only">(PDF, nouvelle fenêtre)</span>
            </a>
            <a href={CARTES_PDF.vins} target="_blank" rel="noopener noreferrer">
              Vins <span className="sr-only">(PDF, nouvelle fenêtre)</span>
            </a>
          </div>
        </div>

        <div className="carte__photos">
          {PHOTOS_CARTE.map((nom) => (
            <figure key={nom} className="carte__photo" data-reveal>
              <Photo nom={nom} sizes="(min-width: 961px) 22vw, 46vw" />
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
