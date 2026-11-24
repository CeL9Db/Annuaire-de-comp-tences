export const apiPath = {
  auth: {
    login: "/auth/login",
    callback: "/auth/callback", // also DISCORD_REDIRECT_URI in .env and the Discord portal
    me: "/auth/me",
    logout: "/auth/logout",
  },
  technologies: "/api/technologies",
  students: "/api/students", // ?tech=<technology id>&minLevel=<1-5>
  student: "/api/students/:id",
  skill: "/api/students/:id/skills/:techId",
  admin: {
    sessions: "/api/admin/sessions/:userId",
    technologies: "/api/admin/technologies",
    technology: "/api/admin/technologies/:id",
    merge: "/api/admin/technologies/:id/merge",
  },
} as const
