import { useEffect, useState } from 'react'
import { statutActuel } from '../utils/horaires'

/** Statut ouvert ou fermé, recalculé toutes les 30 secondes. */
export function useStatut() {
  const [statut, setStatut] = useState(() => statutActuel())

  useEffect(() => {
    const id = window.setInterval(() => setStatut(statutActuel()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  return statut
}
