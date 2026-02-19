import { Request, Response } from "express";
import prisma from "../../prisma";
import { verify, sign } from "jsonwebtoken";

export const refreshTokenService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(401).json({ message: "Refresh token is required" });
      return;
    }

    const decoded: any = verify(refreshToken, process.env.JWT_REFRESH_KEY!);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user || user.tokenVersion !== decoded.tokenVersion) {
      res.status(403).json({ message: "Invalid refresh token or user revoked" });
      return;
    }

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tokenVersion: user.tokenVersion,
    };

    const newAccessToken = sign(payload, process.env.JWT_KEY!, { expiresIn: "15m" });

    res.status(200).json({
      accessToken: newAccessToken,
    });
  } catch (err) {
    console.error("Refresh token error:", err);
    res.status(403).json({ message: "Refresh token expired or invalid" });
  }
};