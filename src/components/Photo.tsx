import type { CSSProperties } from 'react'
import { PHOTOS, type NomPhoto } from '../data/photos'

type Props = {
  nom: NomPhoto
  /** Largeur d'affichage, pour que le navigateur choisisse le bon fichier (attribut sizes). */
  sizes: string
  className?: string
  prioritaire?: boolean
  /** Cadrage (object-position), par exemple '50% 30%'. */
  cadrage?: string
}

const chemin = (nom: string, largeur: number, principale: number) =>
  `/images/${nom}${largeur === principale ? '' : `-${largeur}`}.webp`

/** Photo WebP responsive avec ses dimensions réelles (pas de décalage de mise en page). */
export default function Photo({ nom, sizes, className, prioritaire, cadrage }: Props) {
  const photo = PHOTOS[nom]
  const principale = photo.largeurs[0]
  const srcSet = photo.largeurs.map((l) => `${chemin(nom, l, principale)} ${l}w`).join(', ')
  const src = chemin(nom, photo.largeurs[Math.min(1, photo.largeurs.length - 1)], principale)
  const style = cadrage ? ({ objectPosition: cadrage } as CSSProperties) : undefined

  return (
    <img
      className={className}
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      width={photo.largeur}
      height={photo.hauteur}
      alt={photo.alt}
      loading={prioritaire ? 'eager' : 'lazy'}
      fetchPriority={prioritaire ? 'high' : undefined}
      decoding="async"
      style={style}
    />
  )
}
