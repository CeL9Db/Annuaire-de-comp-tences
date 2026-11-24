import { readTable } from "./data/dataSheets.ts"

for (const name of ["technologie", "skill", "role", "session", "user"]) {
  const rows = await readTable(name)
  console.log(name, rows.length)
}
