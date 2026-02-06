import prisma from "../../prisma";

interface GetUserByIdParams {
  UserId: number;
}

export const getUserByIdService = async (params: GetUserByIdParams) => {
  try {
    const { UserId } = params;

    const User = await prisma.user.findUnique({
      where: {
        id: +UserId,
      },
      // select: {
      //   id: true,
      //   name: true,
      //   role: true,
      //   email: true,
      //   isTokenValid: true,
      // },
    });

    if (!User) {
      throw new Error("User not found");
    }

    const { password, ...safeUserData } = User;

    return {
      message: "Data User Berhasil Didapatkan",
      data: safeUserData,
    };
  } catch (err) {
    console.error("Error in getUserByIdService:", err);
    throw err;
  }
};
