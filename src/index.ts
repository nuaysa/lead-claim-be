import express, { Application, Request, Response } from "express"
import cors from 'cors'
import { AuthRouter } from "./routers/auth.router"
import { LeadRouter } from "./routers/lead.router"
import { WebhookRouter } from "./routers/webhook.router"

const PORT: number = 8000

const app:Application = express()
app.use(express.json())
app.use (cors({
    origin: [`${process.env.BASE_URL_FE}`],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  }))

app.get("/api", (req: Request, res: Response) => {
    res.status(200).send("API running")
})

const authRouter = new AuthRouter();
const leadRouter = new LeadRouter();
const webhookRouter = new WebhookRouter();

app.use("/api/auth", authRouter.getRouter());
app.use("/api/webhook", webhookRouter.getRouter());
app.use("/api/leads", leadRouter.getRouter());

app.listen(PORT, () => {
    console.log(`server running on -> http://localhost:${PORT}/api`)
})