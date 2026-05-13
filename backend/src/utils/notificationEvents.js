import { EventEmitter } from 'events';

const notificationEvents = new EventEmitter();

notificationEvents.setMaxListeners(100);

export const emitNotificationCreated = (notification) => {
  if (!notification?.userId) {
    return;
  }

  notificationEvents.emit(`notification:${String(notification.userId)}`, notification);
};

export const subscribeToUserNotifications = (userId, listener) => {
  const eventName = `notification:${String(userId)}`;
  notificationEvents.on(eventName, listener);

  return () => {
    notificationEvents.off(eventName, listener);
  };
};

export default notificationEvents;
