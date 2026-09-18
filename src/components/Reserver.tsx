import { useState, type ChangeEvent, type FormEvent } from 'react'
import { CONTACT, RESEAUX, RESERVATION } from '../data/infos'
import { envoyerDemande, type Demande } from '../utils/envoi'

const VIDE: Demande = { nom: '', email: '', telephone: '', date: '', personnes: '', message: '' }

export default function Reserver() {
  const [demande, setDemande] = useState<Demande>(VIDE)
  const [etat, setEtat] = useState<'repos' | 'ouvert' | 'envoye' | 'erreur'>('repos')

  const champ = (cle: keyof Demande) => ({
    name: cle,
    id: `demande-${cle}`,
    value: demande[cle],
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setDemande((d) => ({ ...d, [cle]: e.target.value })),
  })

  const envoyer = async (e: FormEvent) => {
    e.preventDefault()
    try {
      setEtat(await envoyerDemande(demande))
    } catch {
      setEtat('erreur')
    }
  }

  return (
    <section id="reserver" className="section reserver">
      <div className="reserver__tigre" aria-hidden="true" />
      <div className="container">
        <header className="section__entete" data-reveal>
          <p className="surtitre">Réserver</p>
          <h2 className="titre">Une table, un verre, une soirée</h2>
        </header>

        <div className="reservations">
          <article className="reservation" data-reveal>
            <p className="reservation__niveau">À l’étage</p>
            <h3 className="reservation__titre">Le restaurant</h3>
            <p>Réservation en ligne uniquement, du mardi au samedi. Un plat minimum par personne.</p>
            <div className="reservation__actions">
              <a href={RESERVATION.table} className="btn btn--plein" target="_blank" rel="noopener noreferrer">
                Réserver une table
              </a>
            </div>
          </article>

          <article className="reservation" data-reveal>
            <p className="reservation__niveau">Au rez-de-chaussée</p>
            <h3 className="reservation__titre">Le bar</h3>
            <p>Du mardi au samedi, réservation par message Instagram ou par e-mail.</p>
            <div className="reservation__actions">
              <a href={RESEAUX.instagramMessage} className="btn btn--plein" target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
              <a
                href={`mailto:${CONTACT.emailBar}?subject=${encodeURIComponent('Réservation au bar')}`}
                className="btn btn--contour"
              >
                E-mail
              </a>
            </div>
          </article>

          <article className="reservation" data-reveal>
            <p className="reservation__niveau">Sur demande</p>
            <h3 className="reservation__titre">Groupes & privatisation</h3>
            <p>Pour un anniversaire, une équipe ou une soirée d’entreprise, décrivez votre projet ci-dessous.</p>
            <div className="reservation__actions">
              <a href="#demande" className="btn btn--contour">
                Faire une demande
              </a>
            </div>
          </article>
        </div>

        <form id="demande" className="demande" onSubmit={envoyer} data-reveal>
          <h3 className="demande__titre">Demande de groupe ou de privatisation</h3>
          <div className="demande__grille">
            <div className="champ">
              <label htmlFor="demande-nom">Nom</label>
              <input {...champ('nom')} type="text" autoComplete="name" required />
            </div>
            <div className="champ">
              <label htmlFor="demande-email">E-mail</label>
              <input {...champ('email')} type="email" autoComplete="email" required />
            </div>
            <div className="champ">
              <label htmlFor="demande-telephone">
                Téléphone <span className="champ__facultatif">(facultatif)</span>
              </label>
              <input {...champ('telephone')} type="tel" autoComplete="tel" />
            </div>
            <div className="champ">
              <label htmlFor="demande-date">Date souhaitée</label>
              <input {...champ('date')} type="date" />
            </div>
            <div className="champ">
              <label htmlFor="demande-personnes">Nombre de personnes</label>
              <input {...champ('personnes')} type="number" min="1" inputMode="numeric" />
            </div>
            <div className="champ champ--large">
              <label htmlFor="demande-message">Votre projet</label>
              <textarea {...champ('message')} rows={4} required />
            </div>
          </div>
          <div className="demande__bas">
            <button type="submit" className="btn btn--plein">
              Envoyer la demande
            </button>
            <p className="demande__etat" role="status">
              {etat === 'ouvert' && 'Votre messagerie s’ouvre avec la demande préremplie.'}
              {etat === 'envoye' && 'Merci, votre demande a bien été envoyée.'}
              {etat === 'erreur' && `L’envoi n’a pas fonctionné. Écrivez-nous à ${CONTACT.email}.`}
            </p>
          </div>
        </form>
      </div>
    </section>
  )
}
