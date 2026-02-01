import prisma from "../../prisma";
import { AppError } from "../../utils/response";

export const getUnclaimedLeadsService = async () => {
  try {
    const leads = await prisma.lead.findMany({
      where: {
        status: "UNCLAIMED",
      },
      orderBy: {
        requestDate: "desc",
      },
    });

    return {
      message: "Unclaimed leads fetched successfully",
      data: leads,
    };
  } catch (error) {
    console.error("Get unclaimed leads error:", error);
    throw new AppError("Failed to fetch unclaimed leads", 500);
  }
};
