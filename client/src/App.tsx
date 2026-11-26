import { ROLE } from "../../shared/constants.ts"
import { AdminPage } from "./admin/AdminPage.tsx"

import { useEffect, useState } from "react"
import type { User } from "../../shared/types.ts"
import { apiPath } from "../../shared/apiPaths.ts"

export function App() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    fetch(apiPath.auth.me)
      .then((res) => (res.ok ? res.json() : null))
      .then(setUser)
  }, [])

  async function logout() {
    await fetch(apiPath.auth.logout, { method: "POST" })
    setUser(null)
  }

  if (!user) return <a href={apiPath.auth.login}>Se connecter avec Discord</a>

  return (
    <>
      <p>
        Connecté : {user.nickname}
        <button onClick={logout}>Se déconnecter</button>
      </p>
      {(user.id_role === ROLE.ADMIN || user.id_role === ROLE.SUPER_ADMIN) && (
        <AdminPage isSuperAdmin={user.id_role === ROLE.SUPER_ADMIN} />
      )}
    </>
  )
}
