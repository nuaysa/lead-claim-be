import prisma from "../../prisma";
import { AppError } from "../../utils/response";
export const getUnclaimedLeadsService = async (
  limit = 20,
  cursor?: string
) => {
  try {
    const leads = await prisma.lead.findMany({
      where: {
        status: "UNCLAIMED",
      },
      orderBy: {
        requestDate: "desc",
      },
      take: limit + 1, // detect next page
      ...(cursor && {
        cursor: { id: parseInt(cursor, 10) },
        skip: 1,
      }),
    });

    const hasNextPage = leads.length > limit;
    const data = hasNextPage ? leads.slice(0, limit) : leads;

    return {
      message: "Unclaimed leads fetched successfully",
      data,
      nextCursor: hasNextPage ? data[data.length - 1].id : null,
    };
  } catch (error) {
    console.error("Get unclaimed leads error:", error);
    throw new AppError("Failed to fetch unclaimed leads", 500);
  }
};
