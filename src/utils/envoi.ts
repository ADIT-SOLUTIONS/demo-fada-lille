import { CONTACT } from '../data/infos'

/*
  Envoi du formulaire de demande (groupes, privatisations).
  Pas de serveur pour l'instant : la demande ouvre la messagerie du visiteur avec un e-mail prérempli.
  Pour brancher un vrai service, passer MODE à 'formspree' et renseigner FORMSPREE_URL
  (ou remplacer envoyerDemande par un appel à l'API de son choix).
*/
const MODE = 'mailto' as 'mailto' | 'formspree'
const FORMSPREE_URL = '[URL_FORMSPREE]' // ex. https://formspree.io/f/xxxxxxx

export type Demande = {
  nom: string
  email: string
  telephone: string
  date: string
  personnes: string
  message: string
}

function corps(d: Demande) {
  const lignes = [`Nom : ${d.nom}`, `E-mail : ${d.email}`]
  if (d.telephone) lignes.push(`Téléphone : ${d.telephone}`)
  if (d.date) lignes.push(`Date souhaitée : ${d.date}`)
  if (d.personnes) lignes.push(`Nombre de personnes : ${d.personnes}`)
  lignes.push('', d.message)
  return lignes.join('\n')
}

/** Renvoie 'ouvert' (messagerie ouverte) ou 'envoye' (service en ligne). */
export async function envoyerDemande(d: Demande): Promise<'ouvert' | 'envoye'> {
  if (MODE === 'formspree') {
    const reponse = await fetch(FORMSPREE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(d),
    })
    if (!reponse.ok) throw new Error(`Envoi impossible (${reponse.status})`)
    return 'envoye'
  }
  const sujet = `Demande de privatisation${d.date ? ` le ${d.date}` : ''} : ${d.nom}`
  window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps(d))}`
  return 'ouvert'
}
