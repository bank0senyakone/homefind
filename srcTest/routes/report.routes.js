import express from 'express';
import reportController from '../controllers/report.controller.js';
import { authMiddleware, checkRole } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication and admin/owner role
router.use(authMiddleware, checkRole(['ADMIN', 'OWNER']));

// Revenue report
router.get('/revenue', reportController.getRevenueReport);

// Occupancy report
router.get('/occupancy', reportController.getOccupancyReport);

// Tenant statistics report
router.get('/tenants', reportController.getTenantReport);

// Maintenance and issue report
router.get('/maintenance', reportController.getMaintenanceReport);

// Financial summary report
router.get('/financial-summary', reportController.getFinancialSummary);

export default router;