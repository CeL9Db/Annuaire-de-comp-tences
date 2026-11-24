import { ROLE } from "../../shared/constants.ts"
import type { Request, Response, NextFunction } from "express"
import { sessions, users } from "../store.ts"
import { SESSION_COOKIE } from "../constants.ts"

// Sets res.locals.user, or answers 401 if the session cookie is missing, unknown or expired.
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const session = sessions.get(req.cookies[SESSION_COOKIE])
  if (!session || new Date(session.date_expire) <= new Date()) {
    if (session) sessions.delete(session.token)
    res.status(401).json({ error: "Non connecté" })
    return
  }
  const user = users.get(session.id_user)
  if (!user) {
    res.status(401).json({ error: "Non connecté" })
    return
  }
  res.locals.user = user
  next()
}

export function requireAdmin(_req: Request, res: Response, next: NextFunction) {
  const user = res.locals.user
  if (user.id_role !== ROLE.ADMIN) {
    res.status(403).json({ error: "Accès réservé aux administrateurs" })
    return
  }
  next()
}
