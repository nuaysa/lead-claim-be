import { AppError } from "../../utils/response";
import prisma from "../../prisma";
import { Response } from "express";

export const claimLeadService = async (leadId: number, salesId: number, res: Response) => {
  return await prisma.$transaction(async (tx) => {
    const lead = await tx.lead.findFirst({
      where: {
        id: leadId,
        status: "UNCLAIMED",
      },
    });

    if (!lead) {
      throw new AppError("Lead already claimed by another sales", 409);
    }

    const updatedLead = await tx.lead.update({
      where: { id: leadId },
      data: {
        status: "CLAIMED",
        claimedById: salesId,
        claimedAt: new Date(),
      },
    });

    return res.status(201).send({
      message: "Lead claimed successfully",
      lead: updatedLead,
    });
  });
};
