import prisma from "../../prisma";
import { Request, Response } from "express";

export const deleteUserService = async (req: Request, res: Response) => {
  try {
     const { userId } = req.params;

    if (!userId) {
      res.status(401).send({ message: "Select user to delete" });
      return;
    }

    const user = await prisma.user.findFirst({
      where: { id: +userId },
    });

    if (!user) {
      res.status(404).send({ message: "User not found!" });
      return;
    }

    await prisma.user.delete({
      where: { id: user.id },
    });

    res.status(200).send({ message: "User has been deleted successfully!" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).send({ message: "An internal server error occurred!" });
  }
};