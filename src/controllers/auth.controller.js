import AuthService from "../services/auth.service.js";
import { EMessage, SMessage } from "../services/message.js";
import { SendCreate, SendError, SendSuccess } from "../services/response.js";
import { ValidateData } from "../services/validate.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default class AuthController {
  static async register(req, res) {
    try {
            const { email, password, username, phoneNumber, role = 'user', profile } = req.body;
      const validate = await ValidateData({
        email,
        password,
        username,
        phoneNumber,
      });
      if (validate.length > 0) {
        return SendError(res, 400, EMessage.BadRequest, validate.join(", "));
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return SendError(res, 400, EMessage.BadRequest, "Invalid email format");
      }

      if (password.length < 8) {
        return SendError(
          res,
          400,
          EMessage.BadRequest,
          "Password must be at least 8 characters long"
        );
      }

            const user = await AuthService.register({ email, password, username, phoneNumber, role, profile });
      return SendCreate(res, SMessage.Register, user);
    } catch (error) {
      console.log(error);
      if (error.message === EMessage.EmailInUse) {
        return SendError(res, 409, EMessage.EmailInUse);
      }
      if(error.message === EMessage.UsernameInUse){return SendError(res, 409, EMessage.UsernameInUse)};
      return SendError(res, 500, EMessage.ServerInternal, error);
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const validate = await ValidateData({ email, password });
      if (validate.length > 0) {
        return SendError(res, 400, EMessage.BadRequest, validate.join(", "));
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return SendError(res, 400, EMessage.BadRequest, "Invalid email format");
      }

      const result = await AuthService.login(req.body);

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return SendSuccess(res, SMessage.Login, {
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error) {
      console.log(error);
      if (error.message === EMessage.InvalidCredentials) {
        return SendError(res, 401, EMessage.InvalidCredentials);
      }
      return SendError(res, 500, EMessage.ServerInternal, error);
    }
  }

  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.cookies;
      if (!refreshToken) {
        return SendError(res, 401, "Refresh token not found");
      }

      const {
        valid,
        expired,
        decoded,
      } = await AuthService.VerifyRefreshToken(refreshToken);

      if (!valid || expired) {
        return SendError(res, 401, "Invalid or expired refresh token");
      }

      const user = await prisma.users.findUnique({
        where: { user_id: decoded.userId },
      });
      if (!user) {
        return SendError(res, 404, "User not found");
      }

      const payload = {
        userId: user.user_id,
        email: user.email,
        role: user.role,
      };

      const tokens = await AuthService.GenerateToken(payload);

      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return SendSuccess(res, "Token refreshed successfully", {
        accessToken: tokens.accessToken,
      });
    } catch (error) {
      console.log(error);
      return SendError(res, 500, EMessage.ServerInternal, error);
    }
  }

  static async deleteUser(req, res) {
    try {
      const userId = parseInt(req.params.id, 10);
      // Add authorization check here to ensure only admins or the user themselves can delete
      const deletedUser = await AuthService.deleteUser(userId);
      return SendSuccess(res, SMessage.Delete, deletedUser);
    } catch (error) {
      console.log(error);
      return SendError(res, 500, EMessage.ServerInternal, error);
    }
  }

  static async updateProfile(req, res) {
    try {
      const userId = req.user.userId; // Assuming userId is from authenticated token
      const updatedUser = await AuthService.updateProfile(userId, req.body);
      return SendSuccess(res, SMessage.Update, updatedUser);
    } catch (error) {
      console.log(error);
      return SendError(res, 500, EMessage.ServerInternal, error);
    }
  }

  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const result = await AuthService.forgotPassword(email);
      // In a real app, you would email the token
      return SendSuccess(res, "Password reset token generated", result);
    } catch (error) {
      console.log(error);
      return SendError(res, 500, EMessage.ServerInternal, error);
    }
  }

  static async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;
      const user = await AuthService.resetPassword(token, newPassword);
      return SendSuccess(res, "Password has been reset successfully", user);
    } catch (error) {
      console.log(error);
      return SendError(res, 500, EMessage.ServerInternal, error);
    }
  }

  static async loginWithUsername(req, res) {
    try {
      const { username, password } = req.body;
      const result = await AuthService.loginWithUsername({ username, password });

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return SendSuccess(res, SMessage.Login, {
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error) {
      console.log(error);
      if (error.message === EMessage.InvalidCredentials) {
        return SendError(res, 401, EMessage.InvalidCredentials);
      }
      return SendError(res, 500, EMessage.ServerInternal, error);
    }
  }

  static async logout(req, res) {
    try {
      await AuthService.logout();
      res.cookie("refreshToken", "", {
        httpOnly: true,
        expires: new Date(0),
      });
      return SendSuccess(res, "Logged out successfully");
    } catch (error) {
      console.log(error);
      return SendError(res, 500, EMessage.ServerInternal, error);
    }
  }

  static async getAllUsers(req, res) {
    try {
      const { role, search, page, limit } = req.query;

      // Validate pagination parameters
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;

      if (pageNum < 1) {
        return SendError(res, 400, EMessage.BadRequest, "Page must be greater than 0");
      }

      if (limitNum < 1 || limitNum > 100) {
        return SendError(res, 400, EMessage.BadRequest, "Limit must be between 1 and 100");
      }

      // Validate role if provided
      if (role && !['admin', 'user'].includes(role)) {
        return SendError(res, 400, EMessage.BadRequest, "Invalid role specified");
      }

      const result = await AuthService.getAllUsers({
        role,
        search,
        page: pageNum,
        limit: limitNum
      });

      return SendSuccess(res, "Users retrieved successfully", result);
    } catch (error) {
      console.log(error);
      return SendError(res, 500, EMessage.ServerInternal, error);
    }
  }
}

