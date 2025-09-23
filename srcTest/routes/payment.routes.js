import express from 'express';
import paymentController from '../controllers/payment.controller.js';
import { authMiddleware, checkRole } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all payments (accessible by authenticated users)
router.get('/', paymentController.getPayments);

// Get single payment details
router.get('/:id', paymentController.getPayment);

// Following routes are restricted to admin, owner and staff
router.use(checkRole(['ADMIN', 'OWNER', 'STAFF']));

// Create new payment
router.post('/', paymentController.createPayment);

// Update payment status
router.put('/:id/status', paymentController.updatePaymentStatus);

// Bulk update overdue payments
router.post('/update-overdue', paymentController.updateOverduePayments);

// Delete payment (if pending and no receipt)
router.delete('/:id', paymentController.deletePayment);

export default router;