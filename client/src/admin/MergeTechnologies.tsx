import { useState } from "react"
import type { Technologie } from "../../../shared/types.ts"

export function MergeTechnologies({
  technologies,
}: { technologies: Technologie[] }) {
  const [keepId, setKeepId] = useState("")
  const [duplicateId, setDuplicateId] = useState("")

  const options = technologies.map((tech) => (
    <option key={tech.id} value={tech.id}>
      {tech.name}
    </option>
  ))

  return (
    <section>
      <h2>Fusionner deux technologies</h2>
      <p>
        <label>
          Technologie à conserver{" "}
          <select value={keepId} onChange={(e) => setKeepId(e.target.value)}>
            <option value="">Choisir</option>
            {options}
          </select>
        </label>
      </p>
      <p>
        <label>
          Doublon à supprimer{" "}
          <select
            value={duplicateId}
            onChange={(e) => setDuplicateId(e.target.value)}
          >
            <option value="">Choisir</option>
            {options}
          </select>
        </label>
      </p>
      {keepId && duplicateId && (
        <p>
          {keepId === duplicateId
            ? "Choisissez deux technologies différentes."
            : "Aperçu uniquement. Aucune modification enregistrée."}
        </p>
      )}
    </section>
  )
}
