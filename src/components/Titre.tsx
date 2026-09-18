type Props = { lignes: string[]; className?: string; id?: string }

/** Titre de section, une ligne par élément (permet d'animer les lignes une à une). */
export default function Titre({ lignes, className = 'titre', id }: Props) {
  return (
    <h2 className={className} id={id}>
      {lignes.map((ligne, i) => (
        <span key={i} className="titre__ligne" style={{ '--i': i } as React.CSSProperties}>
          <span className="titre__texte">{ligne}</span>
        </span>
      ))}
    </h2>
  )
}
