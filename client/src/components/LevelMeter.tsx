// Affiche un niveau de 1 à 5 sous forme de 5 cases, comme des carreaux coloriés.
// Exemple pour level = 3 :  ■ ■ ■ □ □
//
// Classes CSS disponibles (styles.css) :
//   "meter-cell"         -> une case vide (bordure bleue)
//   "meter-cell is-on"   -> une case coloriée

type Props = {
  level: number
}

export function LevelMeter({ level }: Props) {
  return (
    <span className="meter">
      {/* Texte lu par les lecteurs d'écran, invisible à l'écran */}
      <span className="sr-only">Niveau {level} sur 5</span>

      {/* une case par niveau : coloriée si son numéro est <= level */}
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          aria-hidden="true"
          className={i <= level ? "meter-cell is-on" : "meter-cell"}
        />
      ))}
    </span>
  )
}
