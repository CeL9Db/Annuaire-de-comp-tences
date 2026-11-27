import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { apiPath } from "../../../shared/apiPaths"
import type { Student } from "../../../shared/types"
import { LevelMeter } from "../components/LevelMeter"

export function FicheEtudiantPage() {
  const { id } = useParams()
  const [student, setStudent] = useState<Student | null>(null)
  const [err, setError] = useState("")

  useEffect(() => {
    if (!id) return
    setStudent(null)
    setError("")
    fetch(apiPath.student(id))
      .then((res) => {
        if (res.status === 404) throw new Error("Cet étudiant n'existe pas ou a été supprimé.")
        if (!res.ok) throw new Error("Impossible de charger la fiche. Rechargez la page.")
        return res.json()
      })
      .then(setStudent)
      .catch((e) => setError(e.message))
  }, [id])

  if (err) {
    return (
      <main>
        <Link to="/" className="back-link">Retour à l'annuaire</Link>
        <p role="alert">{err}</p>
      </main>
    )
  }
  if (!student) return <main><p className="muted">Chargement…</p></main>

  // les compétences les plus fortes en premier
  const skills = [...student.skills].sort((a, b) => b.level - a.level)

  return (
    <main>
      <Link to="/" className="back-link">Retour à l'annuaire</Link>
      <h1>{student.nickname}</h1>

      <p className="profile-updated">
        {student.last_update
          ? `Compétences mises à jour le ${new Date(student.last_update).toLocaleDateString("fr-FR")}`
          : "Aucune compétence mise à jour pour l'instant"}
      </p>

      {skills.length === 0 ? (
        <p>Aucune compétence renseignée.</p>
      ) : (
        <ul className="skill-table">
          {skills.map((skill) => (
            <li key={skill.id_technologie}>
              <span>{skill.name}</span>
              <LevelMeter level={skill.level} />
              <span className="skill-score">{skill.level}/5</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
