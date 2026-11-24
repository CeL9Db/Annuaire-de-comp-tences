import express from "express"
import cookieParser from "cookie-parser"
import authRouter from "./routes/auth.ts"
import { config } from "./config.ts"

const app = express()
app.use(express.json())
app.use(cookieParser())
// routers hold full paths, see shared/apiPaths.ts
app.use(authRouter)

app.listen(config.port, () =>
  console.log(`API on http://localhost:${config.port}`),
)
