import { Router } from "express"
import type { Request, Response } from "express"
import {
  listTechnologies,
  deleteUserSessions,
  addTechnology,
  renameTechnology,
  mergeTechnology,
} from "../store/index.ts"
import { requireAuth, requireAdmin } from "../middleware/auth.ts"
import { apiPath } from "../../../shared/apiPaths.ts"

const router = Router()

router.delete(
  apiPath.admin.sessions(),
  requireAuth,
  requireAdmin,
  async (req: Request<{ userId: string }>, res: Response) => {
    await deleteUserSessions(req.params.userId)
    res.status(204).end()
  },
)

// Returns an error message, or "" if the name is free.
async function checkName(name: string, idToSkip?: number) {
  if (name === "") return "Nom requis"

  const techs = await listTechnologies()
  for (const tech of techs) {
    if (tech.id === idToSkip) continue
    // String(): a name like "2023" comes back from Sheets as a number
    if (String(tech.name).toLowerCase() === name.toLowerCase()) {
      return "Cette technologie existe déjà"
    }
  }
  return ""
}

router.post(
  apiPath.admin.technologies,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const name = String(req.body?.name ?? "").trim()

    const error = await checkName(name)
    if (error) {
      res.status(400).json({ error })
      return
    }

    res.status(201).json(await addTechnology(name))
  },
)

router.put(
  apiPath.admin.technology(),
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const id = Number(req.params.id)
    const name = String(req.body?.name ?? "").trim()

    const techs = await listTechnologies()
    if (!techs.find((t) => t.id === id)) {
      res.status(404).json({ error: "Technologie introuvable" })
      return
    }

    const error = await checkName(name, id)
    if (error) {
      res.status(400).json({ error })
      return
    }

    await renameTechnology(id, name)
    res.json({ id, name })
  },
)

// Merges technology :id (the duplicate) into body.into, then deletes :id.
router.post(
  apiPath.admin.merge(),
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const id = Number(req.params.id)
    const into = Number(req.body?.into)

    if (id === into) {
      res.status(400).json({ error: "Choisir deux technologies différentes" })
      return
    }

    const techs = await listTechnologies()
    const duplicate = techs.find((t) => t.id === id)
    const target = techs.find((t) => t.id === into)
    if (!duplicate || !target) {
      res.status(404).json({ error: "Technologie introuvable" })
      return
    }

    await mergeTechnology(id, into)
    res.status(204).end()
  },
)

export default router
