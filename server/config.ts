// The only file that reads .env: missing required values crash at startup, not mid-request.
function required(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing ${name} in .env`)
  return value
}

export const config = {
  port: Number(process.env.PORT ?? 3000),
  sessionHours: Number(process.env.SESSION_DURATION_HOURS ?? 24),
  discordClientId: required("DISCORD_CLIENT_ID"),
  discordClientSecret: required("DISCORD_CLIENT_SECRET"),
  discordRedirectUri: required("DISCORD_REDIRECT_URI"),
  googleKeyFile: required("GOOGLE_KEY_FILE"),
  sheetId: required("SHEET_ID"),
}
