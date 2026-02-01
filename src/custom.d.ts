import { Role } from "@prisma/generated/client";
import "express";

export type UserPayload = {
  id: number;
  role: Role;
};

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload; 
      role?: Role;
    }
  }
};