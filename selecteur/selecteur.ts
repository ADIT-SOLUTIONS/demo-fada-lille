// Démo des maquettes : charge les deux versions en entier derrière un écran de chargement,
// puis passe de l'une à l'autre instantanément grâce à une pastille discrète.
import '@fontsource-variable/dm-sans'
import '@fontsource/instrument-serif/400.css'
import './selecteur.css'
import { LOGO_CHEMIN, LOGO_HAUTEUR, LOGO_LARGEUR } from '../src/data/logo-trace'
import { SOURCE_DEMO } from './protocole'

const VERSIONS = [
  { numero: 1, nom: 'Classique', chemin: 'v1/' },
  { numero: 2, nom: 'Immersive', chemin: 'v2/' },
]

const DUREE_MIN_CHARGEMENT = 900
const DUREE_MAX_CHARGEMENT = 45000

const demo = document.getElementById('demo')!
let actuelle = location.hash === '#2' ? 2 : 1

/* Écran de chargement : l'enseigne néon FADA se trace au fil du chargement, puis s'allume */

const chargement = document.createElement('div')
chargement.className = 'chargement'
chargement.innerHTML = `
  <div class="chargement__contenu" role="progressbar" aria-label="Chargement du site" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
    <svg class="chargement__logo" viewBox="0 0 ${LOGO_LARGEUR} ${LOGO_HAUTEUR}" aria-hidden="true">
      <path class="chargement__tube-eteint" d="${LOGO_CHEMIN}" />
      <path class="chargement__halo chargement__trace" d="${LOGO_CHEMIN}" pathLength="1" />
      <path class="chargement__tube chargement__trace" d="${LOGO_CHEMIN}" pathLength="1" />
      <path class="chargement__coeur chargement__trace" d="${LOGO_CHEMIN}" pathLength="1" />
    </svg>
    <p class="chargement__devise">Dining · Drinking · Dancing</p>
    <p class="chargement__pourcentage">0 %</p>
  </div>
`
const barre = chargement.querySelector<HTMLElement>('.chargement__contenu')!
const pourcentage = chargement.querySelector<HTMLElement>('.chargement__pourcentage')!

/* Cadres des deux versions */

const cadres = VERSIONS.map((v) => {
  const cadre = document.createElement('iframe')
  cadre.className = 'demo__cadre'
  cadre.title = `FADA, version ${v.numero} ${v.nom.toLowerCase()}`
  return cadre
})

/* Pastille et panneau de choix */

const selecteur = document.createElement('div')
selecteur.className = 'selecteur-version'
selecteur.innerHTML = `
  <div class="selecteur-version__panneau" id="selecteur-version-panneau">
    <p class="selecteur-version__titre">Version du site</p>
    <ul class="selecteur-version__liste">
      ${VERSIONS.map(
        (v) => `
        <li>
          <button type="button" class="selecteur-version__choix" data-version="${v.numero}">
            <span class="selecteur-version__repere" aria-hidden="true"></span>
            <span class="selecteur-version__numero">${v.numero}</span>
            <span class="selecteur-version__nom">${v.nom}</span>
          </button>
        </li>`,
      ).join('')}
    </ul>
  </div>
  <button type="button" class="selecteur-version__pastille" aria-expanded="false"
    aria-controls="selecteur-version-panneau" aria-label="Choisir la version du site"></button>
`
const pastille = selecteur.querySelector<HTMLButtonElement>('.selecteur-version__pastille')!
const choix = Array.from(selecteur.querySelectorAll<HTMLButtonElement>('.selecteur-version__choix'))

demo.append(...cadres, selecteur, chargement)

const envoyer = (cadre: HTMLIFrameElement, message: Record<string, unknown>) =>
  cadre.contentWindow?.postMessage({ source: SOURCE_DEMO, ...message }, location.origin)

/* Messages des versions */

const progression = VERSIONS.map(() => 0)
const pretes = VERSIONS.map(() => false)
const remontees = new Map<HTMLIFrameElement, () => void>()

addEventListener('message', (evenement) => {
  const donnees = evenement.data
  const index = cadres.findIndex((c) => c.contentWindow === evenement.source)
  if (evenement.origin !== location.origin || index < 0 || donnees?.source !== SOURCE_DEMO) return
  if (donnees.type === 'progression') progression[index] = Math.max(progression[index], Number(donnees.valeur) || 0)
  if (donnees.type === 'pret') {
    progression[index] = 1
    pretes[index] = true
  }
  if (donnees.type === 'en-haut') remontees.get(cadres[index])?.()
  if (donnees.type === 'menu' && index === actuelle - 1) demo.classList.toggle('demo--menu-ouvert', Boolean(donnees.ouvert))
})

// Les écouteurs sont en place : les versions peuvent commencer à charger
cadres.forEach((cadre, i) => (cadre.src = `${import.meta.env.BASE_URL}${VERSIONS[i].chemin}`))

/* Affichage d'une version */

/** Remonte une version en haut de page (sans animation) et attend qu'elle l'ait fait. */
function remonter(cadre: HTMLIFrameElement) {
  return new Promise<void>((resoudre) => {
    const fin = () => {
      remontees.delete(cadre)
      resoudre()
    }
    remontees.set(cadre, fin)
    envoyer(cadre, { type: 'haut' })
    setTimeout(fin, 250)
  })
}

function montrer(numero: number) {
  actuelle = numero
  cadres.forEach((cadre, i) => {
    const active = i === numero - 1
    cadre.classList.toggle('demo__cadre--actif', active)
    cadre.inert = !active
    cadre.setAttribute('aria-hidden', String(!active))
    envoyer(cadre, { type: 'visibilite', visible: active })
  })
  choix.forEach((bouton) => bouton.setAttribute('aria-current', String(Number(bouton.dataset.version) === numero)))
  demo.classList.remove('demo--menu-ouvert')
  history.replaceState(null, '', numero === 1 ? location.pathname : '#2')
  cadres[numero - 1].contentWindow?.focus()
}

function basculerPanneau(ouvert: boolean) {
  selecteur.classList.toggle('selecteur-version--ouvert', ouvert)
  pastille.setAttribute('aria-expanded', String(ouvert))
}

pastille.addEventListener('click', () => basculerPanneau(!selecteur.classList.contains('selecteur-version--ouvert')))

choix.forEach((bouton) =>
  bouton.addEventListener('click', async () => {
    const numero = Number(bouton.dataset.version)
    basculerPanneau(false)
    if (numero === actuelle) return
    await remonter(cadres[numero - 1])
    montrer(numero)
  }),
)

// Un clic dans une version (autre document) fait perdre le focus à la démo : on ferme le panneau
addEventListener('blur', () => basculerPanneau(false))
document.addEventListener('pointerdown', (e) => {
  if (!selecteur.contains(e.target as Node)) basculerPanneau(false)
})
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && selecteur.classList.contains('selecteur-version--ouvert')) {
    basculerPanneau(false)
    pastille.focus()
  }
})

/* Suivi du chargement */

const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches
const debutChargement = performance.now()
let affiche = 0

function animerChargement() {
  const cible = progression.reduce((a, b) => a + b, 0) / progression.length
  const toutPret = pretes.every(Boolean)
  const ecoule = performance.now() - debutChargement
  affiche = reduit ? cible : affiche + (cible - affiche) * 0.08
  if (toutPret && cible - affiche < 0.01) affiche = 1

  const valeur = Math.min(99, Math.floor(affiche * 100))
  pourcentage.textContent = `${affiche === 1 ? 100 : valeur} %`
  barre.setAttribute('aria-valuenow', String(affiche === 1 ? 100 : valeur))
  chargement.style.setProperty('--progression', affiche.toFixed(4))

  if ((affiche === 1 && ecoule >= DUREE_MIN_CHARGEMENT) || ecoule > DUREE_MAX_CHARGEMENT) {
    if (!toutPret) console.warn('Démo : une version met trop de temps à charger, affichage quand même.')
    terminerChargement()
    return
  }
  requestAnimationFrame(animerChargement)
}

async function terminerChargement() {
  chargement.style.setProperty('--progression', '1')
  chargement.classList.add('chargement--allume')
  await Promise.all(cadres.map(remonter))
  montrer(actuelle)
  demo.classList.remove('demo--chargement')
  setTimeout(() => chargement.classList.add('chargement--fini'), reduit ? 0 : 750)
  setTimeout(() => chargement.remove(), reduit ? 100 : 1500)
}

requestAnimationFrame(animerChargement)
