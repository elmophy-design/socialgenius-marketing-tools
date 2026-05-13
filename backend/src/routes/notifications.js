import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotifications,
  getNotificationSettings,
  updateNotificationSettings,
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', authenticateToken, asyncHandler(listNotifications));
router.patch('/read-all', authenticateToken, asyncHandler(markAllNotificationsRead));
router.patch('/:id/read', authenticateToken, asyncHandler(markNotificationRead));
router.delete('/', authenticateToken, asyncHandler(clearNotifications));
router.get('/settings', authenticateToken, asyncHandler(getNotificationSettings));
router.put('/settings', authenticateToken, asyncHandler(updateNotificationSettings));

export default router;
