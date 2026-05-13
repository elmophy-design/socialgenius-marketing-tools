import Notification from '../models/Notification.js';
import User from '../models/User.js';

const resolveUserId = (req) => req.user?.id || req.user?._id;

export const listNotifications = async (req, res) => {
  const userId = resolveUserId(req);

  const notifications = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  const unreadCount = await Notification.countDocuments({
    userId,
    read: false,
  });

  return res.json({
    success: true,
    data: notifications,
    unreadCount,
  });
};

export const markNotificationRead = async (req, res) => {
  const userId = resolveUserId(req);
  const { id } = req.params;

  const notification = await Notification.findOneAndUpdate(
    { _id: id, userId },
    { $set: { read: true, readAt: new Date() } },
    { new: true }
  ).lean();

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found',
    });
  }

  return res.json({
    success: true,
    data: notification,
  });
};

export const markAllNotificationsRead = async (req, res) => {
  const userId = resolveUserId(req);

  const result = await Notification.updateMany(
    { userId, read: false },
    { $set: { read: true, readAt: new Date() } }
  );

  return res.json({
    success: true,
    updated: result.modifiedCount || 0,
  });
};

export const clearNotifications = async (req, res) => {
  const userId = resolveUserId(req);

  await Notification.deleteMany({ userId });

  return res.json({
    success: true,
    message: 'Notifications cleared',
  });
};

export const getNotificationSettings = async (req, res) => {
  const userId = resolveUserId(req);

  const user = await User.findById(userId).select('settings.notifications').lean();

  return res.json({
    success: true,
    data: user?.settings?.notifications || {
      email: true,
      push: true,
      marketing: true,
    },
  });
};

export const updateNotificationSettings = async (req, res) => {
  const userId = resolveUserId(req);
  const updates = req.body || {};

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  user.settings = user.settings || {};
  user.settings.notifications = {
    ...(user.settings.notifications || {}),
    ...updates,
  };

  await user.save();

  return res.json({
    success: true,
    data: user.settings.notifications,
  });
};
