import { useStatut } from '../hooks/useStatut'

/** Pastille « Ouvert jusqu'à… » / « Fermé, ouvre… », à l'heure de Lille. */
export default function Statut({ className = '' }: { className?: string }) {
  const statut = useStatut()
  return (
    <p className={`statut ${statut.ouvert ? 'statut--ouvert' : ''} ${className}`} aria-live="polite">
      <span className="statut__point" aria-hidden="true" />
      {statut.libelle}
    </p>
  )
}
