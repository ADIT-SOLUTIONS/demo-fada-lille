import { CARTES_PDF, MENU_GROUPE, RESERVATION, SERVICES } from '../data/infos'
import Photo from './Photo'
import Titre from './Titre'

export default function Soirees() {
  return (
    <section id="soirees" className="section soirees">
      <div className="container soirees__grille">
        <div className="soirees__texte" data-reveal>
          <p className="surtitre">Dancing</p>
          <Titre lignes={['Des DJs,', 'des lives']} />
          <p className="soirees__accroche">Des lumières qui claquent et une vraie énergie de fête.</p>
          <p className="soirees__intro">
            À l’étage, des DJs et des lives transforment le dîner en soirée. Au rez-de-chaussée, le son monte au fil de
            la nuit, et les grands événements sportifs sont retransmis.
          </p>
          <ul className="puces">
            {SERVICES.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>

          <div className="privatiser">
            <h3 className="privatiser__titre">Privatiser FADA</h3>
            <p>
              Anniversaires, soirées d’entreprise, repas d’affaires : privatisations pour les pros et les particuliers,
              sur demande. Menu groupe à {MENU_GROUPE.prix}.
            </p>
            <div className="privatiser__actions">
              <a href={RESERVATION.privatisation} className="btn btn--creme" target="_blank" rel="noopener noreferrer">
                Demander un devis
              </a>
              <a href={CARTES_PDF.groupe} className="btn btn--contour-creme" target="_blank" rel="noopener noreferrer">
                Menu groupe (PDF)
              </a>
            </div>
          </div>
        </div>

        <div className="soirees__photos" data-reveal>
          <figure className="soirees__photo soirees__photo--grande">
            <Photo nom="shot-bar" sizes="(min-width: 961px) 30vw, 60vw" />
          </figure>
          <figure className="soirees__photo">
            <Photo nom="neon-dj" sizes="(min-width: 961px) 16vw, 36vw" />
          </figure>
          <figure className="soirees__photo">
            <Photo nom="degustation" sizes="(min-width: 961px) 16vw, 36vw" />
          </figure>
        </div>
      </div>
    </section>
  )
}
