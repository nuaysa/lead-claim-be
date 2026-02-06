import prisma from "../../prisma";
import { AppError } from "../../utils/response";

export const getMyLeadsService = async (salesId: number, page = 1, limit = 5) => {
  try {
    const skip = (page - 1) * limit;

    const total = await prisma.lead.count({
      where: {
        claimedById: salesId,
      },
    });

    const leads = await prisma.lead.findMany({
      where: {
        claimedById: salesId,
      },
      orderBy: {
        claimedAt: "desc",
      },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      message: "My leads fetched successfully",
      data: leads,
      page,
      limit,
      total,
      totalPages,
    };
  } catch (error) {
    console.error("Get my leads error:", error);

    throw new AppError("Failed to fetch your leads", 500);
  }
};
