import prisma from "../../prisma";
import { AppError } from "../../utils/response";

export const getUnclaimedLeadsService = async (page = 1, limit = 5) => {
  try {
    const skip = (page - 1) * limit;

    const total = await prisma.lead.count({
      where: {
        status: "UNCLAIMED",
      },
    });

    const leads = await prisma.lead.findMany({
      where: {
        status: "UNCLAIMED",
      },
      orderBy: {
        requestDate: "desc",
      },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      message: "Unclaimed leads fetched successfully",
      data: leads,
      pagination: {
        total,
        totalPages,
        page,
        limit,
      },
    };
  } catch (error) {
    console.error("Get unclaimed leads error:", error);
    throw new AppError("Failed to fetch unclaimed leads", 500);
  }
};
