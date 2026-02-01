import prisma from "../../prisma";
import { AppError } from "../../utils/response";

interface FonntePayload {
  sender: string;
  name?: string;
  message: string;
  timestamp: Date;
}

export const handleFonnteWebhookService = async (
  payload: FonntePayload
) => {
  try {
    const phone = payload.sender.replace(/\D/g, "");

    const existingLead = await prisma.lead.findFirst({
      where: {
        phone,
        status: "UNCLAIMED",
      },
    });

    if (existingLead) {
      return {
        isNew: false,
        leadId: existingLead.id,
      };
    }

    const lead = await prisma.lead.create({
      data: {
        name: payload.name || "Unknown",
        phone,
        source: "fonnte",
        status: "UNCLAIMED",
        requestDate: payload.timestamp,
      },
    });

    return {
      isNew: true,
      leadId: lead.id,
    };
  } catch (error) {
    console.error("Fonnte webhook service error:", error);
    throw new AppError("Failed to process Fonnte webhook", 500);
  }
};
