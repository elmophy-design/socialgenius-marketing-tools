import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { sendMailWithTemplate } from '../controllers/emailController.js';
import { emitNotificationCreated } from './notificationEvents.js';

const canSendEmailNotification = (user) => {
  return Boolean(
    user?.email &&
    user?.settings?.notifications?.email
  );
};

export const createUserNotification = async (userId, notification, options = {}) => {
  if (!userId || !notification?.title || !notification?.message) {
    return null;
  }

  if (options.dedupeWindowMinutes) {
    const since = new Date(Date.now() - (Number(options.dedupeWindowMinutes) * 60 * 1000));
    const existing = await Notification.findOne({
      userId,
      category: notification.category || 'general',
      title: notification.title,
      message: notification.message,
      createdAt: { $gte: since },
    }).lean();

    if (existing) {
      return existing;
    }
  }

  const created = await Notification.create({
    userId,
    type: notification.type || 'info',
    category: notification.category || 'general',
    title: notification.title,
    message: notification.message,
    action: notification.action || null,
    data: notification.data || null,
  });

  emitNotificationCreated(created.toObject());

  if (options.sendEmail) {
    const user = await User.findById(userId).select('email name settings.notifications');

    if (canSendEmailNotification(user)) {
      try {
        await sendMailWithTemplate({
          to: user.email,
          subject: notification.emailSubject || notification.title,
          headline: notification.title,
          recipientName: user.name || 'there',
          intro: notification.message,
          body: notification.emailBody || notification.message,
          ctaLabel: notification.action?.label,
          ctaUrl: notification.action?.url,
        });
      } catch (error) {
        console.error('Notification email send failed:', error.message);
      }
    }
  }

  return created;
};
