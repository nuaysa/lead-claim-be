import { AppError } from "../../utils/response";
import prisma from "../../prisma";

export const getSalesStatsByDateService = async (
  startDate?: Date,
  endDate?: Date
) => {
  try {
    if (!startDate || !endDate) {
      const today = new Date();

      startDate = new Date(today.setHours(0, 0, 0, 0));
      endDate = new Date(today.setHours(23, 59, 59, 999));
    }

    const grouped = await prisma.lead.groupBy({
      by: ["claimedById"],
      where: {
        claimedAt: {
          gte: startDate,
          lte: endDate,
        },
        claimedById: {
          not: null,
        },
      },
      _count: {
        _all: true,
      },
    });

    const sales = await prisma.user.findMany({
      where: {
        role: "SALES",
      },
      select: {
        id: true,
        name: true,
      },
    });

    return sales.map((sales) => {
      const found = grouped.find(
        (g) => g.claimedById === sales.id
      );

      return {
        id: sales.id,
        name: sales.name,
        totalClaimed: found?._count._all || 0,
      };
    });
  } catch (error) {
    console.error("Sales stats groupBy error:", error);
    throw new AppError(
      "Failed to fetch sales statistics",
      500
    );
  }
};
