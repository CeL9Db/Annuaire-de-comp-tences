import { useState, type FormEvent } from "react"
import { apiPath } from "../../../shared/apiPaths.ts"
import type { Technologie } from "../../../shared/types.ts"

type Props = {
  technologies: Technologie[]
  onSaved: (technology: Technologie) => void
}

export function TechnologyList({ technologies, onSaved }: Props) {
  const [selectedId, setSelectedId] = useState("")
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [saving, setSaving] = useState(false)
  const editing = selectedId !== ""

  function selectTechnology(id: string) {
    setSelectedId(id)
    const technology = technologies.find((tech) => String(tech.id) === id)
    setName(String(technology?.name ?? ""))
    setMessage("")
  }

  async function saveTechnology(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setMessage("")

    try {
      const url = editing
        ? apiPath.admin.technology(selectedId)
        : apiPath.admin.technologies

      const response = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      })

      const data = await response.json()
      if (!response.ok) {
        setMessage(data.error ?? "Impossible d’enregistrer la technologie.")
        return
      }

      onSaved(data)
      setName(editing ? data.name : "")
      setMessage(editing ? "Technologie renommée." : "Technologie ajoutée.")
    } catch {
      setMessage("Impossible d’enregistrer la technologie.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <section>
      <h2>Technologies</h2>
      <ul>
        {technologies.map((tech) => (
          <li key={tech.id}>{tech.name}</li>
        ))}
      </ul>

      <form onSubmit={saveTechnology}>
        <label>
          Technologie{" "}
          <select
            value={selectedId}
            onChange={(event) => selectTechnology(event.target.value)}
            disabled={saving}
          >
            <option value="">Nouvelle technologie</option>
            {technologies.map((tech) => (
              <option key={tech.id} value={tech.id}>
                {tech.name}
              </option>
            ))}
          </select>
        </label>{" "}
        <label>
          Nom{" "}
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={saving}
            required
          />
        </label>{" "}
        <button disabled={saving || !name.trim()}>
          {editing ? "Renommer" : "Ajouter"}
        </button>
      </form>

      {message && <p role="status">{message}</p>}
    </section>
  )
}
