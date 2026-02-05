import prisma from "../../prisma";
import jwt from "jsonwebtoken";

export const getProfileByTokenService = async (authorizationHeader: string | undefined) => {
  try {
    if (!authorizationHeader) {
      throw new Error("No authorization header");
    }

    const token = authorizationHeader.startsWith("Bearer ") ? authorizationHeader.slice(7) : authorizationHeader;


    const decoded = jwt.verify(token, process.env.JWT_SECRET || "leadClaimProject220126") as {
      id: number;
      email: string;
      name: string;
      role: string;
      iat?: number;
      exp?: number;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id }, 
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (err: any) {
    console.error("Error in getProfileByTokenService:", {
      name: err.name,
      message: err.message,
      stack: err.stack,
    });

    throw err;
  }
};
