import path from "node:path"

export function required(name: string) {
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
  // relative to the project root, whatever folder node runs from
  googleKeyFile: path.resolve(
    import.meta.dirname,
    "../..",
    required("GOOGLE_KEY_FILE"),
  ),
  sheetId: required("SHEET_ID"),
}
