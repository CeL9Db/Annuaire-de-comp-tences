// Rows of the Google Sheet (see DATABASE.md), shared by server and client
export type User = {
  id: string
  nickname: string
  id_role: number
}

export type Session = {
  token: string
  date_expire: string
  id_user: string
}
