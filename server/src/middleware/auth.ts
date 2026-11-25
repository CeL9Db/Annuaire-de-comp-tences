import type { Request, Response, NextFunction } from "express"
import { getSessionUser } from "../db/db.ts"
import { SESSION_COOKIE } from "../constants.ts"
import { ROLE } from "../../../shared/constants.ts"
import type { User } from "../../../shared/types.ts"

// Sets res.locals.user, or answers 401 if the session cookie is missing, unknown or expired.
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const user = await getSessionUser(req.cookies[SESSION_COOKIE])
  if (!user) {
    res.status(401).json({ error: "Non connecté" })
    return
  }
  res.locals.user = user
  next()
}

export const isAdmin = (user: User) => user.id_role === ROLE.ADMIN

// Use after requireAuth.
export function requireAdmin(_req: Request, res: Response, next: NextFunction) {
  if (!isAdmin(res.locals.user)) {
    res.status(403).json({ error: "Réservé aux administrateurs" })
    return
  }
  next()
}
