import { ROLE } from "../../shared/constants.ts"
import { AdminPage } from "./routes/Admin.tsx"

import { useEffect, useState } from "react"
import type { User } from "../../shared/types.ts"
import { apiPath } from "../../shared/apiPaths.ts"

import { Link, Navigate, Route, Routes } from "react-router-dom"

import { AnnuairePage } from "./routes/Annuaire.tsx"
import { FicheEtudiantPage } from "./routes/FicheEtudiant.tsx"
import { MesCompetencesPage } from "./routes/MesCompetences.tsx"

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

  const isAdmin = user.id_role === ROLE.ADMIN || user.id_role === ROLE.SUPER_ADMIN
  return (
    <>
      <nav>
        <Link to="/">Annuaire</Link> |{" "}
        <Link to="/mes-competences">Mes compétences</Link> |{" "}
        {isAdmin && (
          <>
            <Link to="/admin">Compte Administrateur</Link>
          </>
        )}
        <span>
          Connecté : {user.nickname}{" "}
          <button onClick={logout}>Se déconnecter</button>
        </span>
      </nav>

      <Routes>
        <Route path="/" element={<AnnuairePage/>} />
        <Route path="/admin" element={
          isAdmin ? (
            <AdminPage isSuperAdmin={user.id_role === ROLE.SUPER_ADMIN} />
          ) : (
            <Navigate to="/"/>
          )
        }/>
        <Route path="/etudiants/:id" element={<FicheEtudiantPage/>} />
        <Route path="/mes-competences" element={<MesCompetencesPage/>} />
      </Routes>
    </>
  )
}
