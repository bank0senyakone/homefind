import express from 'express';
import roomController from '../controllers/room.controller.js';
import { authMiddleware, checkRole } from '../middleware/auth.middleware.js';
import upload from '../config/multer.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all rooms (accessible by all authenticated users)
router.get('/', roomController.getRooms);

// Get single room details
router.get('/:id', roomController.getRoom);

// Following routes are restricted to admin and owner
router.use(checkRole(['ADMIN', 'OWNER']));

// Create new rooms
router.post('/', roomController.createRooms);

// Update room
router.put('/:id', roomController.updateRoom);

// Delete room
router.delete('/:id', roomController.deleteRoom);

// Upload room images
router.post('/:id/images',
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'additionalImages', maxCount: 4 }
  ]),
  roomController.uploadImages
);

export default router;