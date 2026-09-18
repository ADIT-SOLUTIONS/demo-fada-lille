import { LOGO_CHEMIN, LOGO_HAUTEUR, LOGO_LARGEUR } from '../data/logo-trace'

type Props = { className?: string; titre?: string }

/** Logo FADA redessiné d'après le fichier officiel (couleur : currentColor). */
export default function Logo({ className, titre }: Props) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${LOGO_LARGEUR} ${LOGO_HAUTEUR}`}
      role={titre ? 'img' : undefined}
      aria-label={titre}
      aria-hidden={titre ? undefined : true}
      focusable="false"
    >
      <path d={LOGO_CHEMIN} fill="currentColor" fillRule="evenodd" />
    </svg>
  )
}
