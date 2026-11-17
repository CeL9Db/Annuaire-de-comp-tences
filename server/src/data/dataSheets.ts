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

// Lit un onglet entier et renvoie un tableau d'objets:
// Example : [{ id: 1, name: "Spring Boot" }, ...]
export async function readTable(name: string ) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: config.sheetId,
    range: `${name}!A1:Z`,
    valueRenderOption: "UNFORMATTED_VALUE",
  })

  const [header, ...rows] = res.data.values ?? [];
  if (!header) return [];


  return rows.map((row) =>
    Object.fromEntries(header.map((col, i) => [col, row[i] ?? null]))
  );
}

// Convertit une date Google Sheets (nombre de jours depuis le 30/12/1899) en Date JS pour pouvoir l'utiliser (à revoir après)
export function serialToDate(serial: any) {
  return new Date(Math.round((serial - 25569) * 86400000));
}