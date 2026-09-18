import type { NomPhoto } from '../data/photos'
import Photo from './Photo'

const GALERIE: Array<{ nom: NomPhoto; legende: string }> = [
  { nom: 'lustre-mezzanine', legende: 'Le lustre de chaînes, sur toute la hauteur' },
  { nom: 'scene-rideau', legende: 'La scène en arc et son rideau rouge' },
  { nom: 'fenetre-demi-lune', legende: 'Banquettes tigrées sous les demi-lunes' },
  { nom: 'vitrine-affiches', legende: 'FADA is the New Siècle' },
  { nom: 'terrasse', legende: 'La terrasse, 160 couverts' },
  { nom: 'table-menu', legende: 'La fièvre de tous les soirs' },
]

export default function Lieu() {
  return (
    <section id="lieu" className="section lieu">
      <div className="container">
        <header className="section__entete section__entete--ligne" data-reveal>
          <div>
            <p className="surtitre">Le lieu</p>
            <h2 className="titre">
              Chaînes dorées,
              <br />
              velours rouge
            </h2>
          </div>
          <p className="section__texte">
            Murs terracotta, mezzanine vitrée, banquettes au motif tigré, niches en arc et suspensions en raffia : un
            décor pensé pour les longues soirées.
          </p>
        </header>

        <div className="galerie">
          {GALERIE.map(({ nom, legende }) => (
            <figure key={nom} className="galerie__item" data-reveal>
              <Photo nom={nom} sizes="(min-width: 961px) 31vw, (min-width: 641px) 46vw, 46vw" />
              <figcaption>{legende}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
