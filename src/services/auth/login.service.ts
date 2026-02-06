import { Request, Response } from "express";
import prisma from "../../prisma";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";

export const loginService = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.body || !req.body.data || !req.body.password) {
      res.status(400).json({ message: "Email dan Password wajib diisi" });
      return;
    }

    const { data, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: data }, { name: data }],
      },
    });
    if (!user) {
      throw new Error("User not found or invalid password!");
    }

    const isValidPass = await bcrypt.compare(password, user.password);
    if (!isValidPass) {
      throw new Error("User not found or invalid password!");
    }

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tokenVersion: user.tokenVersion,
    };

    const token = sign(payload, process.env.JWT_KEY!, { expiresIn: "1d" });

    res.status(200).json({
      message: "Login Success!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({
      message: err.message || "Something went wrong",
    });
  }
};
