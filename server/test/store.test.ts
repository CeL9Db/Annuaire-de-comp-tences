import { test, mock, beforeEach } from "node:test"
import assert from "node:assert/strict"

let tables: Record<string, any[]> = {}

mock.module("../src/store/sheets.ts", {
  namedExports: {
    readTable: async (name: string) => structuredClone(tables[name]),
    modifyTable: async (name: string, change: (rows: any[]) => any[]) => {
      tables[name] = change(structuredClone(tables[name]))
    },
  },
})
mock.module("../src/config.ts", {
  namedExports: { config: { sessionHours: 24 } },
})

const db = await import("../src/store/index.ts")
const { dateToSerial } = await import("../src/store/dates.ts")

const ALICE = "222222222222222222"
const BOB = "333333333333333333"

beforeEach(() => {
  tables = {
    user: [
      { id: ALICE, nickname: "alice", id_role: 2 },
      { id: BOB, nickname: "bob", id_role: 2 },
    ],
    technologie: [
      { id: 1, name: "React" },
      { id: 2, name: "ReactJS" },
    ],
    skill: [
      {
        id: 1,
        level: 2,
        date_update: 46000,
        id_user: ALICE,
        id_technologie: 1,
      },
      {
        id: 2,
        level: 4,
        date_update: 46000,
        id_user: ALICE,
        id_technologie: 2,
      },
      { id: 3, level: 3, date_update: 46000, id_user: BOB, id_technologie: 2 },
    ],
    session: [],
  }
})

test("setSkill updates the existing row instead of adding one", async () => {
  await db.setSkill(ALICE, 1, 5)
  const rows = tables.skill.filter(
    (s) => s.id_user === ALICE && s.id_technologie === 1,
  )
  assert.equal(rows.length, 1)
  assert.equal(rows[0].level, 5)
})

test("setSkill adds a row with the next id", async () => {
  await db.setSkill(BOB, 1, 1)
  assert.equal(tables.skill.length, 4)
  assert.equal(tables.skill[3].id, 4)
})

test("deleteSkill removes only that skill", async () => {
  await db.deleteSkill(ALICE, 1)
  assert.deepEqual(
    tables.skill.map((s) => s.id),
    [2, 3],
  )
})

test("listStudents joins tech names and finds the last update", async () => {
  tables.skill[1].date_update = 46001
  const alice = await db.getStudent(ALICE)
  assert.deepEqual(alice?.skills[0], {
    id_technologie: 1,
    name: "React",
    level: 2,
  })
  assert.equal(alice?.last_update, "2025-12-10T00:00:00.000Z") // serial 46001
})

test("mergeTechnology moves skills and keeps the higher level", async () => {
  await db.mergeTechnology(2, 1)

  assert.deepEqual(tables.technologie, [{ id: 1, name: "React" }])
  const alice = tables.skill.filter((s) => s.id_user === ALICE)
  assert.equal(alice.length, 1) // her two skills became one
  assert.equal(alice[0].level, 4)
  const bob = tables.skill.find((s) => s.id_user === BOB)
  assert.equal(bob.id_technologie, 1)
})

test("a valid session gives its user, an expired one is deleted", async () => {
  const { token } = await db.createSession(BOB)
  assert.equal((await db.getSessionUser(token))?.nickname, "bob")

  tables.session.push({
    token: "old",
    date_expire: dateToSerial(new Date(Date.now() - 1000)),
    id_user: ALICE,
  })
  assert.equal(await db.getSessionUser("old"), undefined)
  assert.equal(
    tables.session.find((s) => s.token === "old"),
    undefined,
  )
})

test("getLoggedInUser needs an unexpired session (bot)", async () => {
  tables.session.push({
    token: "old",
    date_expire: dateToSerial(new Date(Date.now() - 1000)),
    id_user: ALICE,
  })
  assert.equal(await db.getLoggedInUser(ALICE), undefined)
  assert.equal(await db.getLoggedInUser(BOB), undefined)

  await db.createSession(BOB)
  assert.equal((await db.getLoggedInUser(BOB))?.nickname, "bob")
})

test("deleteUserSessions logs the user out", async () => {
  const { token } = await db.createSession(BOB)
  await db.deleteUserSessions(BOB)
  assert.equal(await db.getSessionUser(token), undefined)
})

test("addUserIfMissing keeps the role of an existing user", async () => {
  tables.user[0].id_role = 1
  await db.addUserIfMissing(ALICE, "new name")
  assert.equal(tables.user.length, 2)
  assert.equal(tables.user[0].id_role, 1)
  assert.equal(tables.user[0].nickname, "alice")
})
