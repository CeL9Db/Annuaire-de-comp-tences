import { ROLE } from "../../shared/constants.ts"
import { AdminPage } from "./routes/Admin.tsx"

import { useEffect, useState } from "react"
import type { User } from "../../shared/types.ts"
import { apiPath } from "../../shared/apiPaths.ts"

import { Link, Navigate, NavLink, Route, Routes } from "react-router-dom"

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

  if (!user) {
    return (
      <main className="login">
        <h1>Annuaire des compétences</h1>
        <p>
          Retrouvez qui maîtrise quelle technologie dans la promo, et tenez vos
          propres compétences à jour.
        </p>
        <div>
          <a className="button" href={apiPath.auth.login}>
            Se connecter avec Discord
          </a>
        </div>
      </main>
    )
  }

  const isAdmin = user.id_role === ROLE.ADMIN || user.id_role === ROLE.SUPER_ADMIN

  return (
    <>
      <header className="site-header">
        <Link to="/" className="site-name">
          Annuaire des compétences
        </Link>

        <nav className="site-nav">
          {/* NavLink ajoute la classe "active" sur le lien de la page courante */}
          <NavLink to="/" end>
            Annuaire
          </NavLink>
          <NavLink to="/mes-competences">Mes compétences</NavLink>
          {isAdmin && <NavLink to="/admin">Administration</NavLink>}
        </nav>

        <div className="site-user">
          <span>{user.nickname}</span>
          <button className="button-quiet" onClick={logout}>
            Se déconnecter
          </button>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<AnnuairePage />} />
        <Route
          path="/admin"
          element={
            isAdmin ? (
              <AdminPage isSuperAdmin={user.id_role === ROLE.SUPER_ADMIN} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route path="/etudiants/:id" element={<FicheEtudiantPage />} />
        <Route path="/mes-competences" element={<MesCompetencesPage />} />
        <Route path="*" element={<main><p>Page introuvable.</p></main>} />
      </Routes>
    </>
  )
}
