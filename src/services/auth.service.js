import prisma from "../prisma/prisma.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { EMessage } from "./message.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "your-refresh-secret-key";
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "your-32-byte-encryption-key-123"; // Must be 32 bytes
const IV_LENGTH = 16;

export default class AuthService {
  static async Encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      Buffer.from(ENCRYPTION_KEY),
      iv
    );
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
  }

  static async Decrypt(text) {
    const textParts = text.split(":");
    const iv = Buffer.from(textParts.shift(), "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(ENCRYPTION_KEY),
      iv
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  static async GenerateToken(payload) {
    const jti = uuidv4();
    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      jwtid: jti,
    });
    const refreshToken = jwt.sign({ jti }, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });
    return { accessToken, refreshToken };
  }

  static async VerifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return { valid: true, expired: false, decoded };
    } catch (error) {
      return {
        valid: false,
        expired: error.message === "jwt expired",
        decoded: null,
      };
    }
  }

  static async VerifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);
      return { valid: true, expired: false, decoded };
    } catch (error) {
      return {
        valid: false,
        expired: error.message === "jwt expired",
        decoded: null,
      };
    }
  }

  static async hashPassword(password) {
    return new Promise((resolve, reject) => {
      const salt = crypto.randomBytes(16).toString("hex");
      crypto.pbkdf2(password, salt, 100000, 64, "sha512", (err, derivedKey) => {
        if (err) reject(err);
        resolve(salt + ":" + derivedKey.toString("hex"));
      });
    });
  }

  static async verifyPassword(password, hashedPassword) {
    return new Promise((resolve, reject) => {
      const [salt, key] = hashedPassword.split(":");
      crypto.pbkdf2(password, salt, 100000, 64, "sha512", (err, derivedKey) => {
        if (err) reject(err);
        resolve(key === derivedKey.toString("hex"));
      });
    });
  }

  static async register(userData) {
    const { email, password, username, phoneNumber, role, profile } = userData;

    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error(EMessage.EmailInUse);
    }

    const existingUserByUsername = await prisma.users.findFirst({ where: { username } });
    if (existingUserByUsername) {
      throw new Error(EMessage.UsernameInUse);
    }

    const hashedPassword = await this.hashPassword(password);

    const user = await prisma.users.create({
      data: {
        email,
        password: hashedPassword,
        username,
        phoneNumber: phoneNumber.toString(),
        role,
        profile,
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async login({ email, password }) {
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error(EMessage.InvalidCredentials);
    }

    const passwordValid = await this.verifyPassword(password, user.password);

    if (!passwordValid) {
      throw new Error(EMessage.InvalidCredentials);
    }

    const payload = {
      userId: user.user_id,
      email: user.email,
      role: user.role,
    };

    const tokens = await this.GenerateToken(payload);

    const { password: _, ...userWithoutPassword } = user;
    return {
      ...tokens,
      user: userWithoutPassword,
    };
  }

  static async deleteUser(userId) {
    return prisma.$transaction(async (prisma) => {
      const user = await prisma.users.findUnique({ where: { user_id: userId } });
      if (!user) {
        throw new Error("User not found");
      }

      // Manually delete related records in the correct order
      const tenants = await prisma.tenant.findMany({ where: { user_id: userId } });
      for (const tenant of tenants) {
        await prisma.problem_notification.deleteMany({ where: { tenant_id: tenant.tenant_id } });
        await prisma.contract.deleteMany({ where: { tenant_id: tenant.tenant_id } });
      }
      await prisma.tenant.deleteMany({ where: { user_id: userId } });

      // Finally, delete the user
      const deletedUser = await prisma.users.delete({ where: { user_id: userId } });
      const { password: _, ...userWithoutPassword } = deletedUser;
      return userWithoutPassword;
    });
  }

  static async updateProfile(userId, profileData) {
    const { username, phoneNumber, profile } = profileData;
    const user = await prisma.users.update({
      where: { user_id: userId },
      data: {
        username,
        phoneNumber,
        profile,
      },
    });
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async forgotPassword(email) {
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      throw new Error("User not found");
    }
    const payload = { userId: user.user_id, email: user.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" }); // Short-lived token
    // In a real app, you would email this token to the user
    return { resetToken: token };
  }

  static async resetPassword(token, newPassword) {
    const { valid, expired, decoded } = await this.VerifyToken(token);
    if (!valid || expired) {
      throw new Error("Invalid or expired password reset token");
    }

    const hashedPassword = await this.hashPassword(newPassword);

    const user = await prisma.users.update({
      where: { user_id: decoded.userId },
      data: { password: hashedPassword },
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async loginWithUsername({ username, password }) {
    const user = await prisma.users.findFirst({
      where: { username },
    });

    if (!user) {
      throw new Error(EMessage.InvalidCredentials);
    }

    const passwordValid = await this.verifyPassword(password, user.password);

    if (!passwordValid) {
      throw new Error(EMessage.InvalidCredentials);
    }

    const payload = {
      userId: user.user_id,
      email: user.email,
      role: user.role,
    };

    const tokens = await this.GenerateToken(payload);

    const userObject = { ...user };
    const { password: _, ...userWithoutPassword } = userObject;
    return {
      ...tokens,
      user: userWithoutPassword,
    };
  }

  static async logout() {
    // Server-side logout logic would go here (e.g., token blacklisting)
    // Since we are not changing the DB, we'll just return a success message.
    return { message: "Logout successful" };
  }

  static async getAllUsers(filters = {}) {
    try {
      const { role, search, page = 1, limit = 10 } = filters;
      const skip = (page - 1) * limit;

      // Build where clause
      let where = {};
      
      if (role) {
        where.role = role;
      }

      if (search) {
        where.OR = [
          { username: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phoneNumber: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Get total count for pagination
      const total = await prisma.users.count({ where });

      // Get users with pagination
      const users = await prisma.users.findMany({
        where,
        select: {
          user_id: true,
          username: true,
          email: true,
          phoneNumber: true,
          role: true,
          profile: true,
          created_at: true,
          updated_at: true,
          // Exclude password
        },
        orderBy: {
          created_at: 'desc'
        },
        skip,
        take: limit
      });

      // Calculate pagination info
      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      return {
        users,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages,
          hasNext,
          hasPrev
        }
      };
    } catch (error) {
      throw new Error(`Error fetching users: ${error.message}`);
    }
  }
}