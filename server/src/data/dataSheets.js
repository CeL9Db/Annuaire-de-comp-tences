///////////////////////////// FINI /////////////////////////////

// à utiliser ce fichier pour la connection de la bd, ainsi que 
// pour le convertisseur du format Date depuis Sheets
// connection se fait à l'aide de la clé API qui est dans le répertoir racine avec le nom google-key.json
// rajouter la fonc async qui va récupérer l'information à partir de la table. Le Nom que j'ai dans les test c readTable(Text: text)
// mettre peut-être unformatted_value pour la Date (à revoir)

///////////////////////////// FINI /////////////////////////////

import { google } from "googleapis";

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_KEY_FILE,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });
const SHEET_ID = process.env.SHEET_ID;

// Lit un onglet entier et renvoie un tableau d'objets:
// Example : [{ id: 1, name: "Spring Boot" }, ...]
export async function readTable(name) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${name}!A1:Z`,
    valueRenderOption: "UNFORMATTED_VALUE", // dates = nombres, pas de format FR
  });

  const [header, ...rows] = res.data.values ?? [];
  if (!header) return [];

  return rows.map((row) =>
    Object.fromEntries(header.map((col, i) => [col, row[i] ?? null]))
  );
}

// Convertit une date Google Sheets (nombre de jours depuis le 30/12/1899) en Date JS pour pouvoir l'utiliser (à revoir après)
export function serialToDate(serial) {
  return new Date(Math.round((serial - 25569) * 86400000));
}