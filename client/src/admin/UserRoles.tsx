import { useEffect, useState } from "react"
import { apiPath } from "../../../shared/apiPaths.ts"
import { ROLE } from "../../../shared/constants.ts"
import type { User } from "../../../shared/types.ts"

const roleNames: Record<number, string> = {
  [ROLE.STUDENT]: "Étudiant",
  [ROLE.ADMIN]: "Administrateur",
  [ROLE.SUPER_ADMIN]: "Super-administrateur",
}

export function UserRoles() {
  const [users, setUsers] = useState<User[] | null>(null)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(apiPath.admin.users)
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then(setUsers)
      .catch(() => setError("Impossible de charger les utilisateurs."))
  }, [])

  async function changeRole(user: User) {
    const role = user.id_role === ROLE.ADMIN ? ROLE.STUDENT : ROLE.ADMIN
    setSaving(true)
    setError("")

    try {
      const res = await fetch(apiPath.admin.userRole(user.id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_role: role }),
      })
      if (!res.ok) throw new Error()

      const updated: User = await res.json()
      setUsers(
        (current) =>
          current?.map((item) => (item.id === updated.id ? updated : item)) ??
          null,
      )
    } catch {
      setError("Impossible de modifier le rôle.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <section>
      <h2>Gestion des rôles</h2>
      {error && <p role="alert">{error}</p>}
      {!users && !error && <p>Chargement…</p>}
      {users && (
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              {user.nickname} — {roleNames[user.id_role] ?? "Rôle inconnu"}{" "}
              {(user.id_role === ROLE.STUDENT ||
                user.id_role === ROLE.ADMIN) && (
                <button disabled={saving} onClick={() => changeRole(user)}>
                  {user.id_role === ROLE.ADMIN
                    ? "Retirer les droits admin"
                    : "Nommer administrateur"}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
