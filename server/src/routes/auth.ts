import { Router } from "express"
import crypto from "node:crypto"
import { addUserIfMissing, createSession, deleteSession } from "../store/index.ts"
import { requireAuth } from "../middleware/auth.ts"
import { config } from "../config.ts"
import { SESSION_COOKIE } from "../constants.ts"
import { apiPath } from "../../../shared/apiPaths.ts"

const router = Router()

router.get(apiPath.auth.login, (_req, res) => {
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

router.get(apiPath.auth.callback, async (req, res) => {
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

  await addUserIfMissing(
    discordUser.id,
    discordUser.global_name ?? discordUser.username,
  )
  const { token, expires } = await createSession(discordUser.id)
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    expires,
  })
  res.redirect("/")
})

router.get(apiPath.auth.me, requireAuth, (_req, res) => {
  res.json(res.locals.user)
})

router.post(apiPath.auth.logout, async (req, res) => {
  const token = req.cookies[SESSION_COOKIE]
  if (token) await deleteSession(token)
  res.clearCookie(SESSION_COOKIE)
  res.status(204).end()
})

export default router
