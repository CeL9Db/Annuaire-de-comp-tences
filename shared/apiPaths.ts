type Id = string | number

export const apiPath = {
  auth: {
    login: "/auth/login",
    callback: "/auth/callback", // also DISCORD_REDIRECT_URI in .env and the Discord portal
    me: "/auth/me",
    logout: "/auth/logout",
  },
  technologies: "/api/technologies",
  students: "/api/students", // ?tech=<technology id>&minLevel=<1-5>
  student: (id: Id = ":id") => `/api/students/${id}`,
  skill: (id: Id = ":id", techId: Id = ":techId") =>
    `/api/students/${id}/skills/${techId}`,
  admin: {
    sessions: (userId: Id = ":userId") => `/api/admin/sessions/${userId}`,
    technologies: "/api/admin/technologies",
    technology: (id: Id = ":id") => `/api/admin/technologies/${id}`,
    merge: (id: Id = ":id") => `/api/admin/technologies/${id}/merge`,
  },
} as const
