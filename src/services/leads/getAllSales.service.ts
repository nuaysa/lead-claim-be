import { AppError } from "../../utils/response";
import prisma from "../../prisma";

export const getSalesStatsByDateService = async (startDate?: Date, endDate?: Date) => {
  try {
    if (!startDate || !endDate) {
      const now = new Date();

      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    const totalLeads = await prisma.lead.count({
      where: {
        requestDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

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
      select: {
        id: true,
        name: true,
      },
    });

    return sales.map((sales) => {
      const found = grouped.find((g) => g.claimedById === sales.id);

      const totalClaimed = found?._count._all ?? 0;
      const percentage = totalLeads === 0 ? 0 : Math.round((totalClaimed / totalLeads) * 100);

      return {
        id: sales.id,
        name: sales.name,
        totalLeads,
        totalClaimed,
        percentage,
      };
    });
  } catch (error) {
    console.error("Sales stats groupBy error:", error);
    throw new AppError("Failed to fetch sales statistics", 500);
  }
};
