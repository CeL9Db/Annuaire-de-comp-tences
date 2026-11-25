import { Router } from "express"
import type { Request, Response, NextFunction } from "express"
import {
  listTechnologies,
  listStudents,
  getStudent,
  getUser,
  setSkill,
  deleteSkill,
} from "../store/index.ts"
import { requireAuth, isAdmin } from "../middleware/auth.ts"
import { apiPath } from "../../../shared/apiPaths.ts"

const router = Router()

router.get(apiPath.technologies, async (_req, res) => {
  res.json(await listTechnologies())
})

router.get(apiPath.students, async (req, res) => {
  const students = await listStudents()

  if (!req.query.tech && !req.query.minLevel) {
    res.json(students)
    return
  }

  const techId = Number(req.query.tech ?? 0) // 0 = any technology
  const minLevel = Number(req.query.minLevel ?? 1)

  const result = students.filter((student) => {
    for (const skill of student.skills) {
      const rightTech = techId === 0 || skill.id_technologie === techId
      if (rightTech && skill.level >= minLevel) return true
    }
    return false
  })
  res.json(result)
})

router.get(apiPath.student(), async (req: Request<{ id: string }>, res) => {
  const student = await getStudent(req.params.id)
  if (!student) {
    res.status(404).json({ error: "Étudiant introuvable" })
    return
  }
  res.json(student)
})

// --- skills: the student themselves or an admin

type SkillRequest = Request<{ id: string; techId: string }>

// Use after requireAuth: checks it is you or an admin, and that the student and technology exist.
async function canEditSkill(
  req: SkillRequest,
  res: Response,
  next: NextFunction,
) {
  const me = res.locals.user
  const studentId = req.params.id
  const techId = Number(req.params.techId)

  if (studentId !== me.id && !isAdmin(me)) {
    res
      .status(403)
      .json({ error: "Vous ne pouvez modifier que vos compétences" })
    return
  }

  const student = await getUser(studentId)
  if (!student) {
    res.status(404).json({ error: "Étudiant introuvable" })
    return
  }

  const techs = await listTechnologies()
  const tech = techs.find((t) => t.id === techId)
  if (!tech) {
    res.status(404).json({ error: "Technologie introuvable" })
    return
  }

  next()
}

router.put(
  apiPath.skill(),
  requireAuth,
  canEditSkill,
  async (req: SkillRequest, res: Response) => {
    const level = req.body?.level
    const levelOk = Number.isInteger(level) && level >= 1 && level <= 5
    if (!levelOk) {
      res.status(400).json({ error: "Le niveau doit être un entier de 1 à 5" })
      return
    }

    await setSkill(req.params.id, Number(req.params.techId), level)
    res.json(await getStudent(req.params.id))
  },
)

router.delete(
  apiPath.skill(),
  requireAuth,
  canEditSkill,
  async (req: SkillRequest, res: Response) => {
    await deleteSkill(req.params.id, Number(req.params.techId))
    res.json(await getStudent(req.params.id))
  },
)

export default router
