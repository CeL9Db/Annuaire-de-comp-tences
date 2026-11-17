// shortcut: in-memory, lost on restart — replace with the Google Sheet data layer (same shapes as DATABASE.md)
import type { User, Session } from "../shared/types.ts"

export const users = new Map<string, User>()
export const sessions = new Map<string, Session>()
