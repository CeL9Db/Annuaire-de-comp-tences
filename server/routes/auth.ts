import { Router } from "express"
import crypto from "node:crypto"
import { sessions, users } from "../store.ts"
import { requireAuth } from "../middleware/auth.ts"
import { config } from "../config.ts"
import { SESSION_COOKIE } from "../constants.ts"
import { ROLE } from "../../shared/constants.ts"

const router = Router()
const SESSION_MS = config.sessionHours * 60 * 60 * 1000

router.get("/login", (_req, res) => {
  // random state per login, checked in /callback (CSRF protection)
  const state = crypto.randomBytes(16).toString("hex")
  res.cookie("oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 5 * 60 * 1000,
  })

  const params = new URLSearchParams({
    client_id: config.discordClientId,
    redirect_uri: config.discordRedirectUri,
    response_type: "code",
    scope: "identify",
    state,
  })
  res.redirect(`https://discord.com/oauth2/authorize?${params}`)
})

router.get("/callback", async (req, res) => {
  const { code, state } = req.query
  if (typeof code !== "string" || !state || state !== req.cookies.oauth_state) {
    res.status(400).send("Connexion invalide, réessayez.")
    return
  }
  res.clearCookie("oauth_state")

  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    body: new URLSearchParams({
      client_id: config.discordClientId,
      client_secret: config.discordClientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: config.discordRedirectUri,
    }),
  })
  if (!tokenRes.ok) {
    res.status(502).send("Échec de la connexion Discord.")
    return
  }
  const { access_token } = await tokenRes.json()

  const meRes = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${access_token}` },
  })
  if (!meRes.ok) {
    res.status(502).send("Échec de la connexion Discord.")
    return
  }
  const discordUser = await meRes.json()

  if (!users.has(discordUser.id)) {
    users.set(discordUser.id, {
      id: discordUser.id,
      nickname: discordUser.global_name ?? discordUser.username,
      id_role: ROLE.STUDENT,
    })
  }

  const token = crypto.randomBytes(32).toString("hex")
  const expires = new Date(Date.now() + SESSION_MS)
  sessions.set(token, {
    token,
    date_expire: expires.toISOString(),
    id_user: discordUser.id,
  })
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    expires,
  })
  res.redirect("/")
})

router.get("/me", requireAuth, (_req, res) => {
  res.json(res.locals.user)
})

router.post("/logout", (req, res) => {
  sessions.delete(req.cookies[SESSION_COOKIE])
  res.clearCookie(SESSION_COOKIE)
  res.status(204).end()
})

export default router
