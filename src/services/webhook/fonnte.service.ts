import { AppError } from "@/utils/response";
import prisma from "../../prisma";
interface FonntePayload {
  sender: string;
  name?: string;
  message: string;
  timestamp: number | string;
}

export const handleFonnteWebhookService = async (
  payload: FonntePayload
) => {
  try {
    const phone = payload.sender.replace(/\D/g, "");

    if (!phone || phone.length < 9) {
      return {
        isNew: false,
        reason: "Invalid sender",
      };
    }

    const existingLead = await prisma.lead.findFirst({
      where: { phone },
    });

    if (existingLead) {
      return {
        isNew: false,
        leadId: existingLead.id,
      };
    }

    const requestDate = new Date(
      Number(payload.timestamp) * 1000
    );

    const lead = await prisma.lead.create({
      data: {
        name: payload.name || "Unknown",
        phone,
        source: "fonnte",
        status: "UNCLAIMED",
        requestDate,
      },
    });

    return {
      isNew: true,
      leadId: lead.id,
    };
  } catch (error) {
    console.error("Fonnte webhook error:", error);
    throw new AppError(
      "Failed to process Fonnte webhook",
      500
    );
  }
};
