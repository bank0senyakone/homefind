import express from 'express';
import issueController from '../controllers/issue.controller.js';
import { authMiddleware, checkRole } from '../middleware/auth.middleware.js';
import upload from '../config/multer.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all issues (accessible by all authenticated users)
router.get('/', issueController.getIssues);

// Get single issue details
router.get('/:id', issueController.getIssue);

// Create new issue (accessible by all authenticated users)
router.post('/', issueController.createIssue);

// Following routes are restricted to admin, owner and staff
router.use(checkRole(['ADMIN', 'OWNER', 'STAFF']));

// Update issue status and resolution
router.put('/:id', issueController.updateIssue);

// Delete issue (if pending)
router.delete('/:id', issueController.deleteIssue);

// Upload issue images
router.post('/:id/images',
  upload.array('images', 5), // Maximum 5 images per issue
  issueController.uploadImages
);

export default router;