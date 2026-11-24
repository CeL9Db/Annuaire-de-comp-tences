import { ROLE } from "../../shared/constants.ts"
import { AdminPage } from "./admin/AdminPage.tsx"

import { useEffect, useState } from "react"
import type { User } from "../../shared/types.ts"

export function App() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    fetch("/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then(setUser)
  }, [])

  async function logout() {
    await fetch("/auth/logout", { method: "POST" })
    setUser(null)
  }

  if (!user) return <a href="/auth/login">Se connecter avec Discord</a>

  return (
    <>
      <p>
        Connecté : {user.nickname}
        <button onClick={logout}>Se déconnecter</button>
      </p>
      {user.id_role === ROLE.ADMIN && <AdminPage />}
    </>
  )
}
