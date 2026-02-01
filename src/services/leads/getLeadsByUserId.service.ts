import prisma from "../../prisma";
import { AppError } from "../../utils/response";

export const getMyLeadsService = async (salesId: number) => {
  try {
    const leads = await prisma.lead.findMany({
      where: {
        claimedById: salesId,
      },
      orderBy: {
        claimedAt: "desc",
      },
    });

    return {
      message: "MyLeads leads fetched successfully",
      data: leads,
    };
  } catch (error) {
    console.error("Get my leads error:", error);

    throw new AppError(
      "Failed to fetch your leads",
      500
    );
  }
};
