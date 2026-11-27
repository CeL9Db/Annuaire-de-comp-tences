import { useEffect, useState } from "react"
import { apiPath } from "../../../shared/apiPaths"
import type { Student, Technologie } from "../../../shared/types"
import { Link } from "react-router-dom"
import { LevelMeter } from "../components/LevelMeter"

export function AnnuairePage() {

    // get entities
    const [students, setStudents] = useState<Student[] | null> (null)
    const [err, setError] = useState("")

    const [technologies, setTechnologies] = useState<Technologie[] | null> (null)
    const [selectedTech, setSelectedTech] = useState(0)
    const [minLevel, setMinLevel] = useState(1)

    const isFiltered = selectedTech !== 0 || minLevel !== 1

    // load students (re-runs when the filter changes)
    useEffect(() => {
    const params = new URLSearchParams() // prend params depuis l'url et vérifie s'il y'a quelques choses de choisi après
    if (selectedTech !== 0 || minLevel !== 1) {
        params.set("tech", String(selectedTech))
        params.set("minLevel", String(minLevel))
    }
    const url = params.size > 0 ? `${apiPath.students}?${params}` : apiPath.students

    setStudents(null) // pour recharger les étudiants
    fetch(url)
        .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
        })
        .then(setStudents)
        .catch(() => setError("Impossible de charger l'annuaire. Vérifiez que le serveur est lancé, puis rechargez la page."))
    }, [selectedTech, minLevel])

    // load technos
    useEffect(() => {
        fetch(apiPath.technologies)
            .then((res) => {
                if(!res.ok) throw new Error()
                return res.json()
            })
            .then(setTechnologies)
            .catch(() => setError("Impossible de charger la liste des technologies."))
    }, [])

    return (
        <main>
            <h1>Annuaire</h1>

            {/* Le filtre se lit comme une phrase */}
            <p className="filter">
                Montrer qui maîtrise{" "}
                <select
                    aria-label="Technologie"
                    value={selectedTech}
                    onChange={(e) => setSelectedTech(Number(e.target.value))}
                >
                    <option value={0}>n'importe quelle technologie</option>
                    {technologies?.map((tech) => (
                        <option key={tech.id} value={tech.id}>
                        {tech.name}
                        </option>
                    ))}
                </select>{" "}
                <span className="nowrap">
                    au niveau{" "}
                    <select
                        aria-label="Niveau minimum"
                        value={minLevel}
                        onChange={(e) => setMinLevel(Number(e.target.value))}
                    >
                        {[1, 2, 3, 4, 5].map((level) => (
                            <option key={level} value={level}>
                            {level}
                            </option>
                        ))}
                    </select>{" "}
                    ou plus.
                </span>
            </p>

            {err && <p role="alert">{err}</p>}
            {students === null && !err && <p className="muted">Chargement…</p>}

            {students?.length === 0 && (
                <p>
                    {isFiltered
                        ? "Personne ne correspond à ce filtre. Essayez un niveau plus bas ou une autre technologie."
                        : "Aucun étudiant inscrit pour l'instant."}
                </p>
            )}

            {students && students.length > 0 && (
                <>
                    <p className="result-count">
                        {students.length} étudiant{students.length > 1 ? "s" : ""}
                    </p>
                    <ul className="student-list">
                        {students.map((student) => (
                            <li key={student.id} className="student-row">
                                <Link to={`/etudiants/${student.id}`} className="student-name">
                                    {student.nickname}
                                </Link>

                                {student.skills.length === 0 ? (
                                    <span className="muted">Aucune compétence renseignée</span>
                                ) : (
                                    <ul className="skill-chips">
                                        {student.skills.map((skill) => (
                                            <li
                                                key={skill.id_technologie}
                                                className={
                                                    skill.id_technologie === selectedTech
                                                        ? "skill-chip is-match"
                                                        : "skill-chip"
                                                }
                                            >
                                                {skill.name}
                                                <LevelMeter level={skill.level} />
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </main>
    )
}
