import express from 'express';
import tenantController from '../controllers/tenant.controller.js';
import { authMiddleware, checkRole } from '../middleware/auth.middleware.js';
import upload from '../config/multer.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all tenants (accessible by all authenticated users)
router.get('/', tenantController.getTenants);

// Get single tenant details
router.get('/:id', tenantController.getTenant);

// Following routes are restricted to admin, owner and staff
router.use(checkRole(['ADMIN', 'OWNER', 'STAFF']));

// Create new tenant
router.post('/', tenantController.createTenant);

// Update tenant
router.put('/:id', tenantController.updateTenant);

// Delete tenant (soft delete)
router.delete('/:id', tenantController.deleteTenant);

// Upload tenant documents
router.post('/:id/documents',
  upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'documentImage', maxCount: 1 }
  ]),
  tenantController.uploadDocuments
);

export default router;