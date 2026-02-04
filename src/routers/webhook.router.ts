import { WebhookController } from "../controllers/webhook.controller";
import { Router } from "express";
export class WebhookRouter {
  private webhookController: WebhookController;
  private router: Router;

  constructor() {
    this.webhookController = new WebhookController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", (req, res) => {
      return res.status(200).json({ ok: true });
    });
    this.router.post("/", this.webhookController.handleFonnteWebhookController);
  }

  getRouter() {
    return this.router;
  }
}
