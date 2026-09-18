import { ETAGES, HISTOIRE } from '../data/infos'
import Photo from './Photo'

const CHIFFRES = [
  { valeur: '100', libelle: 'places assises au bar' },
  { valeur: '160', libelle: 'couverts en terrasse couverte' },
  { valeur: '100', libelle: 'couverts au restaurant' },
  { valeur: '2', libelle: 'étages, deux ambiances' },
]

export default function Maison() {
  const { bar, restaurant } = ETAGES
  return (
    <section id="maison" className="section maison">
      <div className="container">
        <header className="section__entete section__entete--ligne" data-reveal>
          <div>
            <p className="surtitre">La maison</p>
            <h2 className="titre">
              Deux étages,
              <br />
              deux ambiances
            </h2>
          </div>
          <p className="section__texte">
            Au rez-de-chaussée, le bar et sa grande terrasse. À l’étage, le restaurant festif. Une seule promesse : bien
            manger, bien boire, faire la fête.
          </p>
        </header>

        <div className="etages">
          {[
            { etage: bar, photo: 'salle-plongee' as const, cadrage: '50% 75%', details: [bar.places, bar.terrasse] },
            { etage: restaurant, photo: 'niches-arc' as const, cadrage: '50% 45%', details: [restaurant.places, 'Cuisine méditerranéenne de saison'] },
          ].map(({ etage, photo, cadrage, details }) => (
            <article key={etage.nom} className="etage" data-reveal>
              <figure className="etage__photo">
                <Photo nom={photo} sizes="(min-width: 961px) 40vw, (min-width: 641px) 50vw, 100vw" cadrage={cadrage} />
              </figure>
              <div className="etage__corps">
                <p className="etage__niveau">{etage.niveau}</p>
                <h3 className="etage__nom">{etage.nom}</h3>
                <p className="etage__texte">{etage.texte}</p>
                <ul className="etage__details">
                  {details.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                  <li>{etage.jours}</li>
                </ul>
              </div>
            </article>
          ))}
        </div>

        <div className="histoire" data-reveal>
          <div className="histoire__texte">
            <p className="histoire__date">Depuis {HISTOIRE.ouverture.toLowerCase()}</p>
            <p>{HISTOIRE.texte}</p>
          </div>
          <dl className="chiffres">
            {CHIFFRES.map((c) => (
              <div key={c.libelle} className="chiffres__item">
                <dt>{c.libelle}</dt>
                <dd>{c.valeur}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
