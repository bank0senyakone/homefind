import express from 'express';
import dashboardController from '../controllers/dashboard.controller.js';
import { authMiddleware, checkRole } from '../middleware/auth.middleware.js';

const router = express.Router();

// All dashboard routes are protected and accessible only by admin, owner, and staff
router.use(authMiddleware, checkRole(['ADMIN', 'OWNER', 'STAFF']));

// Get dashboard summary
router.get('/summary', dashboardController.getSummary);

// Get occupancy statistics
router.get('/occupancy', dashboardController.getOccupancyStats);

// Get revenue statistics
router.get('/revenue', dashboardController.getRevenueStats);

export default router;