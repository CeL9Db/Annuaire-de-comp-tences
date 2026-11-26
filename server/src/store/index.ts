// What the app does with the sheet. Shared by the API routes and (later) the Discord bot.
import crypto from "node:crypto"
import { readTable, modifyTable } from "./sheets.ts"
import { serialToDate, dateToSerial } from "./dates.ts"
import { config } from "../config.ts"
import { ROLE } from "../../../shared/constants.ts"
import type {
  User,
  Session,
  Skill,
  Technologie,
  Student,
} from "../../../shared/types.ts"

// Biggest id in the table + 1.
function nextId(rows: { id: number }[]) {
  let max = 0
  for (const row of rows) {
    if (row.id > max) max = row.id
  }
  return max + 1
}

// --- users and sessions
export const listUsers = () => readTable<User>("user")

export async function setUserRole(
  id: string,
  role: typeof ROLE.ADMIN | typeof ROLE.STUDENT,
): Promise<User | undefined> {
  let user: User | undefined

  await modifyTable<User>("user", (users) => {
    user = users.find((entry) => entry.id === id)
    if (
      user &&
      (user.id_role === ROLE.ADMIN || user.id_role === ROLE.STUDENT)
    ) {
      user.id_role = role
    }
    return users
  })

  return user
}

export async function getUser(id: string) {
  const users = await readTable<User>("user")
  return users.find((u) => u.id === id)
}

// Adds the user on first login, keeps nickname and role if they already exist.
export async function addUserIfMissing(id: string, nickname: string) {
  await modifyTable<User>("user", (users) => {
    if (users.find((u) => u.id === id)) return users
    users.push({ id, nickname, id_role: ROLE.STUDENT })
    return users
  })
}

export async function createSession(id_user: string) {
  const token = crypto.randomBytes(32).toString("hex")
  const expires = new Date(Date.now() + config.sessionHours * 3_600_000)
  await modifyTable<Session>("session", (sessions) => {
    sessions.push({ token, date_expire: dateToSerial(expires), id_user })
    return sessions
  })
  return { token, expires }
}

// The user behind a token, or undefined if the token is unknown or expired (an expired one is deleted).
export async function getSessionUser(token: string | undefined) {
  if (!token) return undefined

  const sessions = await readTable<Session>("session")
  const session = sessions.find((s) => s.token === token)
  if (!session) return undefined

  const expired = serialToDate(session.date_expire) <= new Date()
  if (expired) {
    await deleteSession(token)
    return undefined
  }

  return getUser(session.id_user)
}

export async function deleteSession(token: string) {
  await modifyTable<Session>("session", (sessions) =>
    sessions.filter((s) => s.token !== token),
  )
}

export async function deleteUserSessions(id_user: string) {
  await modifyTable<Session>("session", (sessions) =>
    sessions.filter((s) => s.id_user !== id_user),
  )
}

// --- directory

export async function listTechnologies() {
  return readTable<Technologie>("technologie")
}

export async function listStudents() {
  const users = await readTable<User>("user")
  const skills = await readTable<Skill>("skill")
  const techs = await listTechnologies()

  const students: Student[] = []
  for (const user of users) {
    const student: Student = {
      id: user.id,
      nickname: user.nickname,
      skills: [],
      last_update: null,
    }
    let lastUpdate = 0

    for (const skill of skills) {
      if (skill.id_user !== user.id) continue
      const tech = techs.find((t) => t.id === skill.id_technologie)
      student.skills.push({
        id_technologie: skill.id_technologie,
        name: tech ? tech.name : "?",
        level: skill.level,
      })
      if (skill.date_update > lastUpdate) lastUpdate = skill.date_update
    }

    if (lastUpdate) {
      student.last_update = serialToDate(lastUpdate).toISOString()
    }
    students.push(student)
  }
  return students
}

export async function getStudent(id: string) {
  const students = await listStudents()
  return students.find((s) => s.id === id)
}

// --- skills (one row per user + technology)

export async function setSkill(
  id_user: string,
  id_technologie: number,
  level: number,
) {
  const now = dateToSerial(new Date())
  await modifyTable<Skill>("skill", (skills) => {
    const existing = skills.find(
      (s) => s.id_user === id_user && s.id_technologie === id_technologie,
    )
    if (existing) {
      existing.level = level
      existing.date_update = now
    } else {
      skills.push({
        id: nextId(skills),
        level,
        date_update: now,
        id_user,
        id_technologie,
      })
    }
    return skills
  })
}

export async function deleteSkill(id_user: string, id_technologie: number) {
  await modifyTable<Skill>("skill", (skills) =>
    skills.filter(
      (s) => !(s.id_user === id_user && s.id_technologie === id_technologie),
    ),
  )
}

// --- technologies (admin)

export async function addTechnology(name: string) {
  const tech = { id: 0, name }
  await modifyTable<Technologie>("technologie", (techs) => {
    tech.id = nextId(techs)
    techs.push(tech)
    return techs
  })
  return tech
}

export async function renameTechnology(id: number, name: string) {
  await modifyTable<Technologie>("technologie", (techs) => {
    const tech = techs.find((t) => t.id === id)
    if (tech) tech.name = name
    return techs
  })
}

// Moves every skill of `id` to `into`, then deletes `id`.
// A student who has both keeps the higher level. Assumption: replace with the merge rule handed out in class.
export async function mergeTechnology(id: number, into: number) {
  await modifyTable<Skill>("skill", (skills) => {
    const result: Skill[] = []
    for (const skill of skills) {
      if (skill.id_technologie !== id) {
        result.push(skill)
        continue
      }

      const existing = skills.find(
        (s) => s.id_user === skill.id_user && s.id_technologie === into,
      )
      if (!existing) {
        skill.id_technologie = into
        result.push(skill)
      } else if (skill.level > existing.level) {
        existing.level = skill.level
      }
      // otherwise the duplicate skill is dropped
    }
    return result
  })

  // skills first: if this second write fails, only an unused technology is left behind
  await modifyTable<Technologie>("technologie", (techs) =>
    techs.filter((t) => t.id !== id),
  )
}
