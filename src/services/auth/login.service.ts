import { Request, Response } from "express";
import prisma from "../../prisma";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";

export const loginService = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Request Body:", req.body);

    // Validasi input
    if (!req.body || !req.body.data || !req.body.password) {
      res.status(400).json({ message: "Email dan Password wajib diisi" });
      return;
    }

    const { data, password } = req.body;

    // Cari user berdasarkan email / username
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: data }, { name: data }],
      },
    });

    // Jika user tidak ditemukan
    if (!user) {
      throw new Error("Akun Tidak Ditemukan!");
    }

    // Validasi password
    const isValidPass = await bcrypt.compare(password, user.password);
    if (!isValidPass) {
      throw new Error("Password Salah!");
    }

    // Jika akun belum diverifikasi
    if (!user.isVerified) {
      throw new Error("Akun Belum Terverifikasi! Pastikan Anda Sudah Melakukan Verifikasi Akun");
    }

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tokenVersion: user.tokenVersion, // <--- INI WAJIB ADA
    };

    const token = sign(payload, process.env.JWT_KEY!, { expiresIn: "1d" });

    res.status(200).json({
      message: "Login Berhasil",
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
