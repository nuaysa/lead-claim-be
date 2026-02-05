import { NextFunction, Request, Response } from "express";
import { registerService } from "../services/auth/register.service";
import { loginService } from "../services/auth/login.service";
import { getProfileByTokenService } from "../services/auth/getProfile.service";
import { resetPasswordUserService } from "../services/auth/resetPassword.service";

export class AuthController {
  async registerController(req: Request, res: Response, next: NextFunction) {
    try {
      return registerService(req, res, next);
    } catch (error) {
      next(error);
    }
  }

  async loginController(req: Request, res: Response, next: NextFunction) {
    try {
      return loginService(req, res);
    } catch (error) {
      next(error);
    }
  }
  
   async getProfileController(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        return res.status(401).json({
          success: false,
          message: "No token provided",
        });
      }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

     const user = await getProfileByTokenService(token);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Profile retrieved successfully",
        data: user,
      });
      
    } catch (err: any) {
      if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid token",
        });
      }
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expired",
        });
      }
      
      res.status(500).json({
        success: false,
        message: err.message || "Server error",
      });
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await resetPasswordUserService(req, res);
    } catch (error) {
      next(error);
    }
  }
}
