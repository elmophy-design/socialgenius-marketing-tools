import React from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import Alert from './Alert';
import './Alert.css';

export default function ToastViewport() {
  const { notifications, removeNotification } = useNotification();
  const visibleNotifications = notifications.slice(0, 4);

  if (!visibleNotifications.length) {
    return null;
  }

  return (
    <div className="toast-viewport" aria-live="polite" aria-atomic="true">
      {visibleNotifications.map((notification) => (
        <div key={notification.id} className="toast toast-top-right">
          <Alert
            type={notification.type}
            title={notification.title}
            message={notification.message}
            onClose={() => removeNotification(notification.id)}
            dismissible
          />
        </div>
      ))}
    </div>
  );
}
