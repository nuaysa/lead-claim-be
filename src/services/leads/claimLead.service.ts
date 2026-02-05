import { AppError } from "../../utils/response";
import prisma from "../../prisma";
import { Request, Response } from "express";

export const claimLeadService = async (req: Request, res: Response) => {
  try {
    const { leadId } = req.params;

    return await prisma.$transaction(async (tx) => {
      const lead = await tx.lead.findFirst({
        where: {
          id: +leadId,
          status: "UNCLAIMED",
        },
      });

      if (!lead) {
        res.status(400).send({ message: "Lead already claimed by another sales" });
      }

      const updatedLead = await tx.lead.update({
        where: { id: +leadId },
        data: {
          status: "CLAIMED",
          claimedById: req.user?.id,
          claimedAt: new Date(),
        },
      });

      res.status(201).send({
        message: "Lead claimed successfully",
        lead: updatedLead,
      });
    });
  } catch (err: any) {
    console.error("Error during claiming", err);
    res.status(500).send({ message: "An error occurred during claiming lead", error: err.message });
  }
};
