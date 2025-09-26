import express from "express";
import authController from '../controllers/auth.controller.js';
import { authMiddleware , checkRole } from '../middleware/auth.middleware.js';
import userController from '../controllers/user.controller.js';
import tenantController from '../controllers/tenant.controller.js';
import roomController from '../controllers/room.controller.js';
import checkInOutController from '../controllers/checkInOut.controller.js';
import dashboardController from '../controllers/dashboard.controller.js';
import issueController from '../controllers/issue.controller.js';
import paymentController from '../controllers/payment.controller.js';
import reportController from '../controllers/report.controller.js';

import upload from '../config/multer.js';


const router = express.Router();

// Auth routes
const auth_route = "/auth";
router.post(`${auth_route}/register`, authController.register);
router.post(`${auth_route}/login`, authController.login);
router.post(`${auth_route}/logout`, authController.logout);
router.get(`${auth_route}/profile`, authMiddleware,checkRole(['ADMIN']), authController.getProfile);


// User routes
const user = "/users";
// Routes restricted to admin only
// Get all users with filtering and pagination
router.get(`${user}/`,authMiddleware,checkRole(['ADMIN']), userController.getUsers);
// Create new user
router.post(`${user}/`,authMiddleware,checkRole(['ADMIN']),userController.createUser);
// Update user
router.put(`${user}/:id`,authMiddleware,checkRole(['ADMIN']),userController.updateUser);
// Delete user
router.delete(`${user}/:id`,authMiddleware,checkRole(['ADMIN']),userController.deleteUser);
// Change password - this one needs special handling since users can change their own password
router.put(`${user}/:id`,authMiddleware,checkRole(['ADMIN']), 
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


// // Tenant routes
 const tenant = "/tenants";
 // Get all tenants (accessible by all authenticated users)
 router.get(`${tenant}/`,authMiddleware, tenantController.getTenants);
 // Get single tenant details
 router.get(`${tenant}/:id`,authMiddleware, tenantController.getTenant);
 // Create new tenant
 router.post(`${tenant}/`,authMiddleware,checkRole(['ADMIN','OWNER','STAFF']) ,tenantController.createTenant);
 // Update tenant
 router.put(`${tenant}/:id`,authMiddleware,checkRole(['ADMIN','OWNER','STAFF']) , tenantController.updateTenant);
// Delete tenant (soft delete)
router.delete(`${tenant}/:id`,authMiddleware,checkRole(['ADMIN','OWNER','STAFF']) , tenantController.deleteTenant);
// Upload tenant documents
router.post(`${tenant}/:id/documents`,authMiddleware,checkRole(['ADMIN','OWNER','STAFF']),
  upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'documentImage', maxCount: 1 }
  ]),
  tenantController.uploadDocuments
);


// // Room routes
const room = "/rooms";
// Get all rooms (accessible by all authenticated users)
router.get(`${room}/`,authMiddleware,roomController.getRooms);
// Get single room details
router.get(`${room}/:id`,authMiddleware ,roomController.getRoom);
// Create new rooms
router.post(`${room}/`,authMiddleware,checkRole(['ADMIN', 'OWNER']) , roomController.createRooms);
// Update room
router.put(`${room}/:id`, authMiddleware,checkRole(['ADMIN', 'OWNER']) ,roomController.updateRoom);
// Delete room
router.delete(`${room}/:id`,authMiddleware,checkRole(['ADMIN', 'OWNER']) , roomController.deleteRoom);
// Upload room images
router.post(`${room}/:id`,authMiddleware,checkRole(['ADMIN', 'OWNER']) ,
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'additionalImages', maxCount: 4 }
  ]),
  roomController.uploadImages
);


// Check In/Out routes
const checkinout = "/checkin-out";
router.get(`${checkinout}/`,authMiddleware,checkRole(['ADMIN','OWNER','STAFF']) , checkInOutController.getCheckInOuts);
// Process check-in
router.post(`${checkinout}/check-in`, authMiddleware,checkRole(['ADMIN','OWNER','STAFF']) ,checkInOutController.checkIn);
// Process check-out
router.post(`${checkinout}/check-out`, authMiddleware,checkRole(['ADMIN','OWNER','STAFF']) ,checkInOutController.checkOut);
// Update check-in/out status
router.put(`${checkinout}/:id/status`, authMiddleware,checkRole(['ADMIN','OWNER','STAFF']) ,checkInOutController.updateStatus);

//DashboardController 
const dashboard = "/dashboard"
// Get dashboard summary
router.get(`${dashboard}/summary`,authMiddleware,checkRole(['ADMIN','OWNER','STAFF']) , dashboardController.getSummary);
// Get occupancy statistics
router.get(`${dashboard}/occupancy`, authMiddleware,checkRole(['ADMIN','OWNER','STAFF']) ,dashboardController.getOccupancyStats);
// Get revenue statistics
router.get(`${dashboard}/revenue`, authMiddleware,checkRole(['ADMIN','OWNER','STAFF']) ,dashboardController.getRevenueStats);

 // Issue routes
const issue = "/issues";
router.get(`${issue}/`,authMiddleware, issueController.getIssues);
// Get single issue details
router.get(`${issue}/:id`,authMiddleware, issueController.getIssue);
// Create new issue (accessible by all authenticated users)
router.post(`${issue}/`,authMiddleware, issueController.createIssue);
// Update issue status and resolution
router.put(`${issue}/:id`,authMiddleware,checkRole(['ADMIN','OWNER','STAFF']) , issueController.updateIssue);
// Delete issue (if pending)
router.delete(`${issue}/:id`, authMiddleware,checkRole(['ADMIN','OWNER','STAFF']) ,issueController.deleteIssue);
// Upload issue images
router.post(`${issue}/:id/images`,authMiddleware,checkRole(['ADMIN','OWNER','STAFF']) ,
  upload.array('images', 5), // Maximum 5 images per issue
  issueController.uploadImages
);


// Payment routes
const payment = "/payments";
// Get all payments (accessible by authenticated users)
router.get(`${payment}/`,authMiddleware, paymentController.getPayments);
// Get single payment details
router.get(`${payment}/:id`,authMiddleware, paymentController.getPayment);
// Create new payment
router.post(`${payment}/`,authMiddleware,checkRole(['ADMIN','OWNER','STAFF']) , paymentController.createPayment);
// Update payment status
router.put(`${payment}/:id/status`,authMiddleware,checkRole(['ADMIN','OWNER','STAFF']) , paymentController.updatePaymentStatus);
// Bulk update overdue payments
router.post(`${payment}/overdue`,authMiddleware,checkRole(['ADMIN','OWNER','STAFF']) , paymentController.updateOverduePayments);
// Delete payment (if pending and no receipt)
router.delete(`${payment}/:id`,authMiddleware,checkRole(['ADMIN','OWNER','STAFF']) , paymentController.deletePayment);


// Report routes
const report = "/reports"
// Revenue report
router.get(`${report}/revenue`,authMiddleware,checkRole(['ADMIN','OWNER']), reportController.getRevenueReport);
// Occupancy report
router.get(`${report}//occupancy`,authMiddleware,checkRole(['ADMIN','OWNER']), reportController.getOccupancyReport);
// Tenant statistics report
router.get(`${report}//tenants`,authMiddleware,checkRole(['ADMIN','OWNER']), reportController.getTenantReport);
// Maintenance and issue report
router.get(`${report}//maintenance`, authMiddleware,checkRole(['ADMIN','OWNER']),reportController.getMaintenanceReport);
// Financial summary report
router.get(`${report}//financial-summary`,authMiddleware,checkRole(['ADMIN','OWNER']), reportController.getFinancialSummary);

export default router;