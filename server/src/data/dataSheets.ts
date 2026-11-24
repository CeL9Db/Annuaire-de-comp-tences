import { readFileSync } from "node:fs"
import { google } from "googleapis"
import { config } from "../../config.ts"

const key = JSON.parse(readFileSync(config.googleKeyFile, "utf8"))

const auth = new google.auth.JWT({
  email: key.client_email,
  key: key.private_key,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
})

const sheets = google.sheets({ version: "v4", auth })

export async function readTable(name: string) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: config.sheetId,
    range: `${name}!A1:Z`,
    valueRenderOption: "UNFORMATTED_VALUE",
  })

  const [header, ...rows] = res.data.values ?? []
  if (!header) return []
  if (name === "role") header[1] = "name"

  return rows.map((row) =>
    Object.fromEntries(header.map((col, i) => [col, row[i] ?? null])),
  )
}
