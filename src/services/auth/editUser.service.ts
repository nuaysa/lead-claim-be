import prisma from "../../prisma";
import bcrypt from "bcrypt";

interface EditUserServiceProps {
  id: number;
  name?: string;
  role?: string;
  email?: string;
  password?: string;
}

export const editUserService = async (data: EditUserServiceProps) => {
  try {
    const { id, name, role, email, password } = data;

    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (email !== undefined) updateData.email = email;

    if (password && password.trim() !== "") {
      const hashed = await bcrypt.hash(password, 10);
      updateData.password = hashed;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return {
      message: "User has been edited successfully!",
      data: user,
    };
  } catch (err) {
    console.error("Error in editUserService:", err);
    throw new Error("Gagal Mengedit User");
  }
};
