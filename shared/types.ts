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

export type Session = {
  token: string
  date_expire: number // Sheets date, see serialToDate
  id_user: string
}

// API shape of GET /api/students and GET /api/students/:id (not a sheet tab)
export type Student = {
  id: string
  nickname: string
  skills: { id_technologie: number; name: string; level: number }[]
  last_update: string | null // ISO date of the newest skill change
}
