import { useEffect, useState } from "react"
import { apiPath } from "../../../shared/apiPaths.ts"
import type { Technologie } from "../../../shared/types.ts"
import { MergeTechnologies } from "../admin/MergeTechnologies.tsx"
import { TechnologyList } from "../admin/TechnologyList.tsx"
import { UserRoles } from "../admin/UserRoles.tsx"

export function AdminPage({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const [technologies, setTechnologies] = useState<Technologie[] | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch(apiPath.technologies)
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then(setTechnologies)
      .catch(() => setError("Impossible de charger les technologies."))
  }, [])

  function updateTechnology(saved: Technologie) {
    setTechnologies((current) => {
      const list = current ?? []
      if (list.some((tech) => tech.id === saved.id)) {
        return list.map((tech) => (tech.id === saved.id ? saved : tech))
      }
      return [...list, saved]
    })
  }

  return (
    <main>
      <h1>Administration</h1>
      {error && <p role="alert">{error}</p>}
      {technologies === null && !error && <p>Chargement des technologies…</p>}
      {technologies?.length === 0 && <p>Aucune technologie enregistrée.</p>}
      {technologies !== null && (
        <TechnologyList
          technologies={technologies}
          onSaved={updateTechnology}
        />
      )}
      {technologies && technologies.length >= 2 && (
        <MergeTechnologies technologies={technologies} />
      )}
      {isSuperAdmin && <UserRoles />}
    </main>
  )
}
