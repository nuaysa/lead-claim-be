import { handleFonnteWebhookService } from "../services/webhook/fonnte.service";
import { AppError } from "../utils/response";
import { Request, Response } from "express";
import "dotenv/config";

export class WebhookController {
  handleFonnteWebhookController = async (req: Request, res: Response) => {
    try {
      const token = req.headers["authorization"]?.toString().replace("Bearer ", "") || "";

      if (token !== process.env.FONNTE_TOKEN) {
        throw new AppError("Invalid Fonnte token", 401);
      }
      console.log("Received Fonnte webhook:", JSON.stringify(req.body, null, 2));
      console.log("Authorization Token:", token);
      
      const { sender, name, message, timestamp } = req.body;

      if (!sender || !message || !timestamp) {
        throw new AppError("Invalid payload from Fonnte", 400);
      }

      const result = await handleFonnteWebhookService({
        sender,
        name,
        message,
        timestamp, // ⬅️ RAW
      });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      if (err instanceof AppError) {
        return res.status(err.status).json({
          success: false,
          message: err.message,
        });
      }

      console.error("Fonnte webhook controller error:", err);

      return res.status(500).json({
        success: false,
        message: "Webhook processing failed",
      });
    }
  };
}
