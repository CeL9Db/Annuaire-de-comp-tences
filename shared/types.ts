// Rows of the Google Sheet (one tab per type, row 1 = column names), shared by server and client
export type User = {
  id: string
  nickname: string
  id_role: number
}

export type Role = {
  id: number
  name: string
}

export type Technologie = {
  id: number
  name: string
}

export type Skill = {
  id: number
  level: number
  date_update: number // Sheets date, see serialToDate
  id_user: string
  id_technologie: number
}

// shortcut: date_expire is ISO while sessions live in server/store.ts, becomes a Sheets number when moved to the sheet
export type Session = {
  token: string
  date_expire: string
  id_user: string
}
