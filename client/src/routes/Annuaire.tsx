import { useEffect, useState } from "react"
import { apiPath } from "../../../shared/apiPaths"
import { Student, Technologie } from "../../../shared/types"
import { Link } from "react-router-dom"

export function AnnuairePage() {
    
    // get entities
    const [students, setStudents] = useState<Student[] | null> (null)
    const [err, setError] = useState("")
    
    const [technologies, setTechnologies] = useState<Technologie[] | null> (null)
    const [selectedTech, setSelectedTech] = useState(0)
    const [minLevel, setMinLevel] = useState(1)

    // load students
    useEffect(() => {
        fetch(apiPath.students)
            .then((res) => {
                if(!res.ok) throw new Error()
                return res.json()
            })
            .then(setStudents)
            .catch(() => setError("Impossible de visualiser votre annuaire."))
    }, [])
    
    // load technos
    useEffect(() => {
        fetch(apiPath.technologies)
            .then((res) => {
                if(!res.ok) throw new Error()
                return res.json()
            })
            .then(setTechnologies)
            .catch(() => setError("Impossible de visualiser les technologies"))
    }, [])

    return (
        <main>
            <h1>Annuaire des compétences</h1>
            
            <select
                value={selectedTech}
                onChange={(e) => setSelectedTech(Number(e.target.value))}
                >
                <option value={0}>Toutes les technologies</option>
                {technologies?.map((tech) => (
                    <option key={tech.id} value={tech.id}>
                    {tech.name}
                    </option>
                ))}
            </select>

            {err && <p role="alert">{err}</p>}
            {students === null && !err && <p>Chargement..</p>}
            {students?.length === 0 && <p>Aucun étudiant pour l'instant.</p>}
            <ul>
                {students?.map((student) => (
                    <li key={student.id}>
                        <Link to={`/etudiants/${student.id}`}>{student.nickname}</Link>
                        {" : "}
                        {student.skills.map((skill) => `${skill.name} (${skill.level})`).join(", ")}
                    </li>
                ))}
            </ul>
        </main>
    )
}