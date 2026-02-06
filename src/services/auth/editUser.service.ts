import prisma from "../../prisma";
import bcrypt from "bcrypt";

interface EditUserServiceProps {
  id: number;
  nama?: string;
  role?: string;
  password?: string;
}

export const editUserService = async (data : EditUserServiceProps) => {
  try {
    const { id, nama,  password } = data;

    const updateData: any = {};
    if (nama !== undefined) updateData.nama = nama;
    if (password && password.trim() !== "") {
      const hashed = await bcrypt.hash(password, 10);
      updateData.password = hashed;
    }

    const User = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return {
      message: "User data",
      data: User,
    };
  } catch (err) {
    console.error("Error in editUserService:", err);
    throw err instanceof Error ? err : new Error("Gagal Mengedit User");
  }
};
