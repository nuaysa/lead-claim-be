import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserPayload } from "../custom";

export const verifyToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const token = req.header("Authorization")?.replace("Bearer ", "");
      console.log("Received Token:", token); // Debug: Menampilkan token yang diterima
  
      if (!token) {
        res.status(401).send({ message: "Unauthorized! Token not found." });
        return;
      }
  
      const verifiedUser = jwt.verify(token, process.env.JWT_KEY!) as UserPayload;
      console.log("Decoded Token:", verifiedUser);
  
      req.user = { id: verifiedUser.id, role: verifiedUser.role };
      console.log(req.user, "User in Request");
  
      next();
    } catch (err) {
      console.log(err);
  
      if (err instanceof jwt.JsonWebTokenError) {
        res.status(401).send({ message: "Invalid or malformed token." });
        return;
      }
      res.status(500).send({
        message:
          "Oops! There was an error verifying your token. Please check and try again.",
      });
    }

  };
  
  export const verifyAdmin = (allowedRoles: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const userRole = req.user?.role;
  
      if (!allowedRoles.includes(userRole ?? "")) {
        res
          .status(403)
          .json({
            message: `only ${allowedRoles} allowed to access this data`,
          });
      }
  
      next();
    };
  }