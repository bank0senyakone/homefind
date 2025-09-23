import express from 'express';
import userController from '../controllers/user.controller.js';
import { authMiddleware, checkRole } from '../middleware/auth.middleware.js';
import upload from '../config/multer.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Routes restricted to admin only
router.use(checkRole(['ADMIN']));

// Get all users with filtering and pagination
router.get('/', userController.getUsers);

// Create new user
router.post('/', userController.createUser);

// Update user
router.put('/:id', userController.updateUser);

// Delete user
router.delete('/:id', userController.deleteUser);

// Change password - this one needs special handling since users can change their own password
router.put('/:id/change-password', 
  (req, res, next) => {
    // Allow users to change their own password
    if (req.params.id === req.user.id) {
      return next();
    }
    // For other users' passwords, require admin role
    return checkRole(['ADMIN'])(req, res, next);
  },
  userController.changePassword
);

export default router;