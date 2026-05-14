// frontend/src/contexts/NotificationContext.js
import React, { createContext, useState, useContext, useCallback } from 'react';

const NotificationContext = createContext(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('notificationSettings');
    return saved ? JSON.parse(saved) : {
      sound: true,
      desktop: true,
      email: false,
      push: true,
      vibration: true,
    };
  });

  // Remove notification
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  // Add notification
  const addNotification = useCallback((notification) => {
    const id = Date.now();
    const newNotification = {
      id,
      type: notification.type || 'info',
      title: notification.title || 'Notification',
      message: notification.message || '',
      timestamp: new Date().toISOString(),
      read: false,
      action: notification.action,
      duration: notification.duration || 5000,
      ...notification,
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep last 50
    setUnreadCount(prev => prev + 1);

    // Play sound if enabled
    if (settings.sound && notification.type !== 'silent') {
      playNotificationSound(notification.type);
    }

    // Show desktop notification if enabled and permitted
    if (settings.desktop && 'Notification' in window && Notification.permission === 'granted') {
      showDesktopNotification(newNotification);
    }

    // Auto-remove if duration is set
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, [settings, removeNotification]);

  // Success notification
  const success = useCallback((title, message, options = {}) => {
    return addNotification({
      type: 'success',
      title,
      message,
      ...options,
    });
  }, [addNotification]);

  // Error notification
  const error = useCallback((title, message, options = {}) => {
    return addNotification({
      type: 'error',
      title,
      message,
      ...options,
    });
  }, [addNotification]);

  // Warning notification
  const warning = useCallback((title, message, options = {}) => {
    return addNotification({
      type: 'warning',
      title,
      message,
      ...options,
    });
  }, [addNotification]);

  // Info notification
  const info = useCallback((title, message, options = {}) => {
    return addNotification({
      type: 'info',
      title,
      message,
      ...options,
    });
  }, [addNotification]);

  // Mark as read
  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('notificationSettings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      updateSettings({ desktop: permission === 'granted' });
      return permission;
    }
    return 'unsupported';
  }, [updateSettings]);

  // Play notification sound
  const playNotificationSound = (type) => {
    try {
      const audio = new Audio();
      
      const sounds = {
        success: '/sounds/success.mp3',
        error: '/sounds/error.mp3',
        warning: '/sounds/warning.mp3',
        info: '/sounds/info.mp3',
      };

      audio.src = sounds[type] || sounds.info;
      audio.volume = 0.3;
      audio.play().catch(console.error);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  // Show desktop notification
  const showDesktopNotification = (notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const options = {
        body: notification.message,        badge: '/badge.png',
        tag: notification.id,
        requireInteraction: notification.type === 'error',
      };

      const desktopNotif = new Notification(notification.title, options);

      desktopNotif.onclick = () => {
        window.focus();
        if (notification.action?.onClick) {
          notification.action.onClick();
        }
        desktopNotif.close();
      };

      setTimeout(() => desktopNotif.close(), 10000);
    }
  };

  // Get unread notifications
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(notif => !notif.read);
  }, [notifications]);

  // Get notifications by type
  const getNotificationsByType = useCallback((type) => {
    return notifications.filter(notif => notif.type === type);
  }, [notifications]);

  // Subscribe to API events (example)
  const subscribeToEvents = useCallback(() => {
    // This would connect to your WebSocket or SSE for real-time notifications
    // Example: socket.on('notification', addNotification);
  }, []);

  const value = {
    notifications,
    unreadCount,
    settings,
    addNotification,
    success,
    error,
    warning,
    info,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    updateSettings,
    requestPermission,
    getUnreadNotifications,
    getNotificationsByType,
    subscribeToEvents,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
