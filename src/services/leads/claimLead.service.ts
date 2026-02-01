import { AppError } from "../../utils/response";
import prisma from "../../prisma";

export const claimLeadService = async (
  leadId: number,
  salesId: number
) => {
  return await prisma.$transaction(async (tx) => {
    const lead = await tx.lead.findFirst({
      where: {
        id: leadId,
        status: "UNCLAIMED",
      },
    });

    if (!lead) {
      throw new AppError(
        "Lead already claimed by another sales",
        409
      );
    }

    const updatedLead = await tx.lead.update({
      where: { id: leadId },
      data: {
        status: "CLAIMED",
        claimedById: salesId,
        claimedAt: new Date(),
      },
    });

    return updatedLead;
  });
};
