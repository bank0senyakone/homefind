import express from 'express';
import checkInOutController from '../controllers/checkInOut.controller.js';
import { authMiddleware, checkRole } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication and admin/owner/staff role
router.use(authMiddleware, checkRole(['ADMIN', 'OWNER', 'STAFF']));

// Get all check-in/out records
router.get('/', checkInOutController.getCheckInOuts);

// Process check-in
router.post('/check-in', checkInOutController.checkIn);

// Process check-out
router.post('/check-out', checkInOutController.checkOut);

// Update check-in/out status
router.put('/:id/status', checkInOutController.updateStatus);

export default router;