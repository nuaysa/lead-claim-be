
import { NextFunction, Request, Response } from "express";
import prisma from "../../prisma";
import jwt from "jsonwebtoken";

export const getProfileByTokenService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

    if (!authHeader) {
      throw new Error("No authorization header");
    }

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
