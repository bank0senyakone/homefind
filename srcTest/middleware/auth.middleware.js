import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token, access denied'
      });
    }
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }
    // Add user info to request
    req.user = {
      id: user.id,
      username: user.username,
      role: user.role
    };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Token is invalid or expired'
    });
  }
};
// Role-based access control middleware
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: insufficient permissions'
      });
    }
    next();
  };
};
export { authMiddleware, checkRole };