import { requireAuth, requireAdmin } from "./middleware/auth.ts"
import express from "express"
import cookieParser from "cookie-parser"
import authRouter from "./routes/auth.ts"
import { config } from "./config.ts"

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use("/auth", authRouter)
app.use("/api/admin", requireAuth, requireAdmin)

app.get("/api/admin/check", (_req, res) => {
  res.json({ message: "Accès administrateur autorisé" })
})

app.listen(config.port, () =>
  console.log(`API on http://localhost:${config.port}`),
)
