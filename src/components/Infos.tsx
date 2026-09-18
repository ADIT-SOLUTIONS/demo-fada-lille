import { ACCES, ADRESSE, AVIS, CONTACT, DATE_AVIS, HORAIRES, LIENS_CARTE, NOTES_HORAIRES, PRESSE } from '../data/infos'
import { useStatut } from '../hooks/useStatut'
import { formatHeure } from '../utils/horaires'
import Titre from './Titre'

export default function Infos() {
  const statut = useStatut()

  return (
    <section id="infos" className="section infos">
      <div className="container">
        <header className="section__entete" data-reveal>
          <p className="surtitre">Infos pratiques</p>
          <Titre lignes={['Horaires & accès']} />
        </header>

        <div className="infos__grille">
          <div className="panneau horaires" data-reveal>
            <div className="horaires__entete">
              <h3 className="panneau__titre">Horaires</h3>
              <p className={`statut statut--petit ${statut.ouvert ? 'statut--ouvert' : ''}`}>
                <span className="statut__point" aria-hidden="true" />
                {statut.libelle}
              </p>
            </div>

            <table className="horaires__table">
              <caption className="sr-only">Horaires d’ouverture de FADA</caption>
              <tbody>
                {HORAIRES.map((creneau) => {
                  const actif = creneau.jour === statut.jourService
                  return (
                    <tr key={creneau.nom} className={actif ? 'is-actif' : ''} aria-current={actif ? 'date' : undefined}>
                      <th scope="row">{creneau.nom}</th>
                      <td>
                        {'ferme' in creneau ? (
                          <span className="horaires__ferme">Fermé</span>
                        ) : (
                          <>
                            {formatHeure(creneau.ouverture)} – {formatHeure(creneau.fermeture)}
                            {creneau.note && <span className="horaires__etoile"> *</span>}
                          </>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <ul className="horaires__notes">
              {NOTES_HORAIRES.map((note, i) => (
                <li key={note}>
                  {i === 0 && <span aria-hidden="true">* </span>}
                  {note}
                </li>
              ))}
            </ul>
          </div>

          <div className="panneau acces" data-reveal>
            <div className="acces__carte">
              <iframe
                title="Plan d’accès à FADA, 10 rue de Pas à Lille"
                src={LIENS_CARTE.embed}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="acces__corps">
              <h3 className="panneau__titre">Nous trouver</h3>
              <address className="acces__adresse">
                {ADRESSE.rue}
                <br />
                {ADRESSE.cp} {ADRESSE.ville}
                <span>{ADRESSE.repere}</span>
              </address>
              <ul className="acces__modes">
                {ACCES.map((a) => (
                  <li key={a.mode}>
                    <span>{a.mode}</span>
                    {a.detail}
                  </li>
                ))}
              </ul>
              <ul className="acces__contacts">
                <li>
                  <span>Téléphone</span>
                  <a href={`tel:${CONTACT.telephoneLien}`}>{CONTACT.telephone}</a>
                </li>
                <li>
                  <span>E-mail</span>
                  <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
                </li>
              </ul>
              <div className="acces__actions">
                <a href={LIENS_CARTE.itineraire} className="btn btn--plein" target="_blank" rel="noopener noreferrer">
                  Itinéraire
                </a>
                <a href={LIENS_CARTE.osm} className="btn btn--contour" target="_blank" rel="noopener noreferrer">
                  Voir le plan
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="echos" data-reveal>
          <ul className="notes" aria-label={`Notes des clients, ${DATE_AVIS}`}>
            {AVIS.map((a) => (
              <li key={a.source} className="notes__item">
                <span className="notes__valeur">
                  {a.note}
                  <span className="notes__sur">/5</span>
                </span>
                <span className="notes__source">
                  {a.source}
                  <br />
                  {a.nombre}
                </span>
              </li>
            ))}
          </ul>
          <ul className="presse" aria-label="Dans la presse">
            {PRESSE.map((article) => (
              <li key={article.media}>
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="presse__lien">
                  <span className="presse__media">
                    {article.media}, {article.date}
                  </span>
                  <span className="presse__titre">{article.titre ? `« ${article.titre} »` : 'Lire l’article'}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
