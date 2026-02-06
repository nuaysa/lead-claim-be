import { NextFunction, Request, Response } from "express";
import { registerService } from "../services/auth/register.service";
import { loginService } from "../services/auth/login.service";
import { getProfileByTokenService } from "../services/auth/getProfile.service";
import { resetPasswordUserService } from "../services/auth/resetPassword.service";
import { deleteUserService } from "../services/auth/deleteUser.service";
import { editUserService } from "../services/auth/editUser.service";
import { errorResponse } from "@/utils/response";

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

  async getProfileController(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await getProfileByTokenService(req, res, next);

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

  async resetPasswordController(req: Request, res: Response, next: NextFunction) {
    try {
      await resetPasswordUserService(req, res);
    } catch (error) {
      next(error);
    }
  }
  async deleteUserController(req: Request, res: Response, next: NextFunction) {
    try {
      await deleteUserService(req, res, next);
    } catch (error) {
      next(error);
    }
  }
  async editUserController(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, role, password, email } = req.body;

      const User = await editUserService({
        id: +id,
        name,
        role: role,
        email,
        password: password,
      });

      res.status(200).send(User);
    } catch (err: any) {
      return errorResponse(res, {
        error: "Application Error",
        message: err.message,
        status: 400,
      });
    }
  }

}
