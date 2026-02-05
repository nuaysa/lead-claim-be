import prisma from "../../prisma";
import { Request, Response } from "express";

export const deleteUserService = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      res.status(401).send({ message: "Unauthorized request!" });
      return;
    }

    const user = await prisma.user.delete({
      where: { id: req.user.id },
    });

    if (!user) {
      res.status(404).send({ message: "User not found!" });
      return;
    }


    res.status(200).send({ message: "User has been deleted successfully!" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).send({ message: "An internal server error occurred!" });
  }
};