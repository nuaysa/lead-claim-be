import { handleFonnteWebhookService } from "../services/webhook/fonnte.service";
import { AppError } from "../utils/response";
import { Request, Response } from "express";
import "dotenv/config";

export class WebhookController {
handleFonnteWebhookController = async (req: Request, res: Response) => {
   try {
    // const token = req.headers["x-fonnte-token"] as string;
    console.log("Fonnte Webhook Received:", JSON.stringify(req.body, null, 2));
    console.log("Fonnte Webhook Token:", req.headers);
  
    // if (!token || token !== process.env.FONNTE_WEBHOOK_TOKEN) {
    //   throw new AppError("Invalid Fonnte webhook token", 401);
    // }
    const { status, detail, sender, name, message, timestamp } = req.body;

    if (!sender || !message || !timestamp) {
      throw new AppError("Invalid payload from Fonnte", 400);
    }

    const result = await handleFonnteWebhookService({
      status,
      detail,
      sender,
      name,
      message,
      timestamp,
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
