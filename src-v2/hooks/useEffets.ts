import { useEffect } from 'react'

/*
  Effets de la version immersive, sans bibliothèque :
  - parallaxe : propriété CSS `translate` des éléments [data-vitesse] et des photos listées ci-dessous ;
  - relief : les photos s'inclinent sous le pointeur (propriété `rotate`, perspective portée par le parent),
    et suivent le défilement sur écran tactile.
  Une seule boucle requestAnimationFrame, déclenchée par le défilement : toutes les mesures sont lues
  d'abord, puis toutes les positions écrites (aucun aller-retour de mise en page).
  Les propriétés `translate` et `rotate` se combinent avec le `transform` des apparitions au défilement.
*/

/**
 * Photos en grille : chaque colonne glisse à sa vitesse. Le décalage est calculé sur la position de la grille
 * entière (et non de chaque photo) : les photos d'une même colonne bougent ensemble, sans se chevaucher.
 */
const PARALLAXE_GRILLES: Array<{ grille: string; items: string; vitesses: number[] }> = [
  { grille: '.galerie', items: '.galerie__item', vitesses: [0.02, 0.1, 0.05] },
  { grille: '.carte__photos', items: '.carte__photo', vitesses: [0.02, 0.07, 0.035, 0.09] },
  { grille: '.soirees__photos', items: '.soirees__photo', vitesses: [0.0, 0.08] },
]

const RELIEF = '.carte__photo, .galerie__item, .soirees__photo, .reservation, .signature'
const INCLINAISON_MAX = 7

type Cible = { el: HTMLElement; vitesse: number; decalage: number; relief: boolean; reference?: HTMLElement }

export function useEffets() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const tactile = matchMedia('(hover: none), (pointer: coarse)').matches

    const cibles: Cible[] = []
    const connues = new Map<HTMLElement, Cible>()
    const ajouter = (el: HTMLElement, vitesse: number, relief = false, reference?: HTMLElement) => {
      const cible = connues.get(el) ?? { el, vitesse: 0, decalage: 0, relief: false }
      cible.vitesse = vitesse
      cible.relief = cible.relief || relief
      cible.reference = reference ?? cible.reference
      if (!connues.has(el)) {
        connues.set(el, cible)
        cibles.push(cible)
      }
    }
    document.querySelectorAll<HTMLElement>('[data-vitesse]').forEach((el) => ajouter(el, Number(el.dataset.vitesse)))
    // Colonnes repérées par leur position horizontale : recalculées quand la grille change de forme
    const repererColonnes = () =>
      PARALLAXE_GRILLES.forEach(({ grille, items, vitesses }) => {
        const conteneur = document.querySelector<HTMLElement>(grille)
        if (!conteneur) return
        const photos = Array.from(conteneur.querySelectorAll<HTMLElement>(items))
        const colonnes = [...new Set(photos.map((el) => Math.round(el.offsetLeft / 10)))].sort((a, b) => a - b)
        photos.forEach((el) => {
          const colonne = colonnes.indexOf(Math.round(el.offsetLeft / 10))
          ajouter(el, vitesses[colonne % vitesses.length] * (tactile ? 0.6 : 1) || 0.0001, false, conteneur)
        })
      })
    repererColonnes()
    if (tactile) document.querySelectorAll<HTMLElement>(RELIEF).forEach((el) => ajouter(el, connues.get(el)?.vitesse ?? 0, true))

    let raf = 0
    const maj = () => {
      raf = 0
      const h = window.innerHeight
      const mesures = cibles.map((c) => (c.reference ?? c.el).getBoundingClientRect())
      cibles.forEach((c, i) => {
        const r = mesures[i]
        const haut = c.reference ? r.top : r.top - c.decalage // position sans la parallaxe déjà appliquée
        if (haut > h + 300 || haut + r.height < -300) return
        const ecart = haut + r.height / 2 - h / 2
        if (c.vitesse) {
          c.decalage = Math.round(-ecart * c.vitesse * 10) / 10
          c.el.style.translate = `0 ${c.decalage}px`
        }
        if (c.relief) {
          // Écran tactile : la photo bascule doucement en passant dans l'écran
          const angle = Math.max(-1, Math.min(1, ecart / h)) * 5
          c.el.style.rotate = `1 0 0 ${(-angle).toFixed(2)}deg`
        }
      })
    }
    const demander = () => {
      if (!raf) raf = requestAnimationFrame(maj)
    }
    const redimensionner = () => {
      repererColonnes()
      demander()
    }
    window.addEventListener('scroll', demander, { passive: true })
    window.addEventListener('resize', redimensionner)
    maj()

    /* Relief au pointeur (ordinateur) */
    const nettoyages: Array<() => void> = []
    if (!tactile) {
      document.querySelectorAll<HTMLElement>(RELIEF).forEach((el) => {
        let rafRelief = 0
        let px = 0.5
        let py = 0.5
        const appliquer = () => {
          rafRelief = 0
          const rx = (0.5 - py) * INCLINAISON_MAX * 2
          const ry = (px - 0.5) * INCLINAISON_MAX * 2
          const angle = Math.hypot(rx, ry)
          el.style.rotate = angle < 0.01 ? '' : `${(rx / angle).toFixed(3)} ${(ry / angle).toFixed(3)} 0 ${angle.toFixed(2)}deg`
          el.style.setProperty('--lx', `${(px * 100).toFixed(1)}%`)
          el.style.setProperty('--ly', `${(py * 100).toFixed(1)}%`)
        }
        const bouger = (e: PointerEvent) => {
          const r = el.getBoundingClientRect()
          px = (e.clientX - r.left) / r.width
          py = (e.clientY - r.top) / r.height
          el.classList.add('en-relief')
          if (!rafRelief) rafRelief = requestAnimationFrame(appliquer)
        }
        const sortir = () => {
          cancelAnimationFrame(rafRelief)
          rafRelief = 0
          el.classList.remove('en-relief')
          el.style.rotate = ''
        }
        el.addEventListener('pointermove', bouger)
        el.addEventListener('pointerleave', sortir)
        nettoyages.push(() => {
          el.removeEventListener('pointermove', bouger)
          el.removeEventListener('pointerleave', sortir)
          cancelAnimationFrame(rafRelief)
        })
      })
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', demander)
      window.removeEventListener('resize', redimensionner)
      nettoyages.forEach((n) => n())
      cibles.forEach((c) => {
        c.el.style.translate = ''
        c.el.style.rotate = ''
      })
    }
  }, [])
}
