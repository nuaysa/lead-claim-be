import { AppError } from "../../utils/response";
import prisma from "../../prisma";

export const getSalesStatsByDateService = async (startDate?: Date, endDate?: Date, page = 1, limit = 5) => {
  try {
    if (!startDate || !endDate) {
      const now = new Date();

      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    const skip = (page - 1) * limit;

    const total = await prisma.lead.count({
      where: {
        status: "UNCLAIMED",
      },
    });

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
        email: true,
      },
      skip,
      take: limit,
    });

    return sales.map((sales) => {
      const found = grouped.find((g) => g.claimedById === sales.id);

      const totalClaimed = found?._count._all ?? 0;
      const percentage = totalLeads === 0 ? 0 : Math.round((totalClaimed / totalLeads) * 100);

      const totalPages = Math.ceil(total / limit);
      return {
        id: sales.id,
        name: sales.name,
        totalLeads,
        totalClaimed,
        percentage,
        email: sales.email,
        totalPages,
        page,
        limit,
        total
      };
    });
  } catch (error) {
    console.error("Sales stats groupBy error:", error);
    throw new AppError("Failed to fetch sales statistics", 500);
  }
};
