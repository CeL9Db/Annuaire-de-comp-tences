import { readFileSync } from "node:fs"
import { google } from "googleapis"
import { config } from "../config.ts"

const key = JSON.parse(readFileSync(config.googleKeyFile, "utf8"))

const auth = new google.auth.JWT({
  email: key.client_email,
  key: key.private_key,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
})

const sheets = google.sheets({ version: "v4", auth })

// Reads one tab: the column names (row 1) and the other rows as objects.
async function getTable(name: string) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: config.sheetId,
    range: `${name}!A1:Z`,
    valueRenderOption: "UNFORMATTED_VALUE",
  })

  const values = res.data.values ?? []
  const header = values[0] ?? []
  const lines = values.slice(1)
  if (name === "role") header[1] = "name"

  const rows = []
  for (const line of lines) {
    const row: Record<string, any> = {}
    header.forEach((col, i) => {
      row[col] = line[i] ?? null
    })
    rows.push(row)
  }
  return { header, rows }
}

// shortcut: Sheets allows 60 reads/min, so reads are cached 10 s (cleared on our writes); edits made by hand in the sheet show up after 10 s
const CACHE_MS = 10_000
const cache = new Map<string, { time: number; rows: any[] }>()

export async function readTable<T>(name: string): Promise<T[]> {
  const cached = cache.get(name)
  if (cached && Date.now() - cached.time < CACHE_MS) {
    return cached.rows
  }
  const { rows } = await getTable(name)
  cache.set(name, { time: Date.now(), rows })
  return rows as T[]
}

// Reads the tab (never from the cache), lets `change` edit the rows, and writes them all back in one call.
async function writeTable<T>(name: string, change: (rows: T[]) => T[]) {
  const { header, rows } = await getTable(name)
  const before = JSON.stringify(rows)
  const newRows: any[] = change(rows as T[])
  if (JSON.stringify(newRows) === before) return // nothing changed

  const values = []
  for (const row of newRows) {
    values.push(header.map((col) => row[col] ?? ""))
  }
  // the table got shorter: blank out the old rows left at the bottom
  while (values.length < rows.length) {
    values.push(header.map(() => ""))
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId: config.sheetId,
    range: `${name}!A2`,
    valueInputOption: "RAW", // keeps Discord IDs as text
    requestBody: { values },
  })
  cache.delete(name)
}

// Writes run one after another, so two requests never overwrite each other's changes.
let lastWrite: Promise<void> = Promise.resolve()

export function modifyTable<T>(name: string, change: (rows: T[]) => T[]) {
  const write = lastWrite.then(() => writeTable(name, change))
  lastWrite = write.catch(() => {}) // a failed write must not block the next ones
  return write
}
