// frontend/src/services/notificationService.js
class NotificationService {
  // Types of notifications
  static NotificationType = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
    UPGRADE: 'upgrade',
    LIMIT_REACHED: 'limit_reached',
    TRIAL_EXPIRING: 'trial_expiring',
    NEW_FEATURE: 'new_feature'
  };

  // Priority levels
  static Priority = {
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low'
  };

  // Store notifications in localStorage for persistence
  static storageKey = 'meritlives_notifications';

  // Show toast notification
  static showToast(message, type = this.NotificationType.INFO, duration = 5000) {
    // Check if there's a toast library available (like react-toastify)
    if (window.toast) {
      const options = {
        type: type === 'error' ? 'error' : 
               type === 'success' ? 'success' :
               type === 'warning' ? 'warning' : 'info',
        autoClose: duration,
        position: 'top-right'
      };
      window.toast(message, options);
      return;
    }

    // Fallback to console if no toast library
    console.log(`[${type.toUpperCase()}] ${message}`);
  }

  // Add notification to storage
  static addNotification(notification) {
    try {
      const notifications = this.getStoredNotifications();
      const newNotification = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false,
        ...notification
      };

      notifications.unshift(newNotification);
      localStorage.setItem(this.storageKey, JSON.stringify(notifications));

      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent('notificationAdded', {
        detail: newNotification
      }));

      return newNotification;
    } catch (error) {
      console.error('Add notification error:', error);
      return null;
    }
  }

  // Get all notifications
  static getNotifications(filter = {}) {
    try {
      const notifications = this.getStoredNotifications();
      
      // Apply filters
      let filtered = notifications;
      
      if (filter.unreadOnly) {
        filtered = filtered.filter(n => !n.read);
      }
      
      if (filter.type) {
        filtered = filtered.filter(n => n.type === filter.type);
      }
      
      if (filter.priority) {
        filtered = filtered.filter(n => n.priority === filter.priority);
      }
      
      return filtered;
    } catch (error) {
      console.error('Get notifications error:', error);
      return [];
    }
  }

  // Mark notification as read
  static markAsRead(notificationId) {
    try {
      const notifications = this.getStoredNotifications();
      const index = notifications.findIndex(n => n.id === notificationId);
      
      if (index !== -1) {
        notifications[index].read = true;
        localStorage.setItem(this.storageKey, JSON.stringify(notifications));
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('notificationRead', {
          detail: notificationId
        }));
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Mark as read error:', error);
      return false;
    }
  }

  // Mark all as read
  static markAllAsRead() {
    try {
      const notifications = this.getStoredNotifications();
      const unreadCount = this.getUnreadCount();
      
      if (unreadCount === 0) return 0;
      
      notifications.forEach(n => { n.read = true; });
      localStorage.setItem(this.storageKey, JSON.stringify(notifications));
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('allNotificationsRead'));
      
      return unreadCount;
    } catch (error) {
      console.error('Mark all as read error:', error);
      return 0;
    }
  }

  // Delete notification
  static deleteNotification(notificationId) {
    try {
      const notifications = this.getStoredNotifications();
      const filtered = notifications.filter(n => n.id !== notificationId);
      
      if (filtered.length < notifications.length) {
        localStorage.setItem(this.storageKey, JSON.stringify(filtered));
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('notificationDeleted', {
          detail: notificationId
        }));
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Delete notification error:', error);
      return false;
    }
  }

  // Clear all notifications
  static clearAll() {
    try {
      localStorage.removeItem(this.storageKey);
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('notificationsCleared'));
      
      return true;
    } catch (error) {
      console.error('Clear all notifications error:', error);
      return false;
    }
  }

  // Get unread count
  static getUnreadCount() {
    try {
      const notifications = this.getStoredNotifications();
      return notifications.filter(n => !n.read).length;
    } catch (error) {
      console.error('Get unread count error:', error);
      return 0;
    }
  }

  // Notification templates
  static templates = {
    trialExpiring: (daysLeft) => ({
      title: 'Trial Expiring Soon',
      message: `Your free trial ends in ${daysLeft} days. Upgrade now to continue using all features.`,
      type: this.NotificationType.TRIAL_EXPIRING,
      priority: daysLeft <= 3 ? this.Priority.HIGH : this.Priority.MEDIUM,
      action: { label: 'Upgrade Now', url: '/upgrade' }
    }),

    limitReached: (limitType, planName) => ({
      title: 'Usage Limit Reached',
      message: `You've reached your ${limitType} limit for your ${planName} plan.`,
      type: this.NotificationType.LIMIT_REACHED,
      priority: this.Priority.HIGH,
      action: { label: 'Upgrade Plan', url: '/upgrade' }
    }),

    upgradeSuccess: (newPlan) => ({
      title: 'Upgrade Successful!',
      message: `You've been upgraded to the ${newPlan} plan. Enjoy all new features!`,
      type: this.NotificationType.SUCCESS,
      priority: this.Priority.MEDIUM
    }),

    newFeature: (featureName) => ({
      title: 'New Feature Available',
      message: `Check out our new ${featureName} feature!`,
      type: this.NotificationType.NEW_FEATURE,
      priority: this.Priority.LOW,
      action: { label: 'Learn More', url: '/features' }
    }),

    contentGenerated: (toolName) => ({
      title: 'Content Ready',
      message: `Your ${toolName} content has been generated successfully.`,
      type: this.NotificationType.SUCCESS,
      priority: this.Priority.LOW
    }),

    errorGenerating: (toolName) => ({
      title: 'Generation Failed',
      message: `Failed to generate ${toolName} content. Please try again.`,
      type: this.NotificationType.ERROR,
      priority: this.Priority.MEDIUM
    })
  };

  // Send browser notification (requires permission)
  static async sendBrowserNotification(title, options = {}) {
    // Check if browser supports notifications
    if (!('Notification' in window)) {
      console.log('This browser does not support desktop notification');
      return false;
    }

    // Check if permission is granted
    if (Notification.permission === 'granted') {
      new Notification(title, options);
      return true;
    }

    // Request permission if not denied
    if (Notification.permission !== 'denied') {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification(title, options);
          return true;
        }
      } catch (error) {
        console.error('Request notification permission error:', error);
      }
    }

    return false;
  }

  // Initialize notification service
  static initialize() {
    // Check for permission on load
    if ('Notification' in window && Notification.permission === 'default') {
      // Optionally request permission on initialization
      // Notification.requestPermission();
    }

    // Set up periodic checks (e.g., for trial expiry)
    this.startPeriodicChecks();
  }

  // Start periodic notification checks
  static startPeriodicChecks() {
    // Check every hour
    setInterval(() => {
      this.checkTrialStatus();
      this.checkUsageLimits();
    }, 60 * 60 * 1000);
  }

  // Check trial status and send notifications
  static async checkTrialStatus() {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const subscription = JSON.parse(localStorage.getItem('subscription') || '{}');

      if (subscription?.plan === 'trial' && subscription?.trialEndsAt) {
        const trialEnd = new Date(subscription.trialEndsAt);
        const now = new Date();
        const daysLeft = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));

        if (daysLeft <= 7 && daysLeft > 0) {
          // Check if we already notified for this day
          const lastNotification = this.getNotifications().find(
            n => n.type === this.NotificationType.TRIAL_EXPIRING && 
            n.data?.daysLeft === daysLeft
          );

          if (!lastNotification) {
            const notification = this.templates.trialExpiring(daysLeft);
            notification.data = { daysLeft };
            this.addNotification(notification);

            // Send browser notification for critical reminders
            if (daysLeft <= 3) {
              this.sendBrowserNotification(notification.title, {
                body: notification.message,
                icon: '/logo.png'
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Check trial status error:', error);
    }
  }

  // Check usage limits
  static async checkUsageLimits() {
    // This would typically call an API to check current usage
    // For now, we'll check localStorage
    const usage = JSON.parse(localStorage.getItem('usage') || '{}');
    const subscription = JSON.parse(localStorage.getItem('subscription') || '{}');

    // Check social media limit
    if (subscription?.plan === 'basic' && usage.socialMediaPosts >= 50) {
      const notification = this.templates.limitReached('social media posts', 'Basic');
      this.addNotification(notification);
    }

    // Check daily requests
    if (subscription?.plan === 'basic' && usage.dailyRequests >= 100) {
      const notification = this.templates.limitReached('daily requests', 'Basic');
      this.addNotification(notification);
    }
  }

  // Subscribe to notification events
  static subscribe(event, callback) {
    window.addEventListener(event, callback);
  }

  // Unsubscribe from notification events
  static unsubscribe(event, callback) {
    window.removeEventListener(event, callback);
  }

  // Helper method to get stored notifications
  static getStoredNotifications() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Get stored notifications error:', error);
      return [];
    }
  }

  // Export notifications (for backup)
  static exportNotifications() {
    try {
      const notifications = this.getStoredNotifications();
      const dataStr = JSON.stringify(notifications, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      return {
        data: dataBlob,
        filename: `notifications-${new Date().toISOString().split('T')[0]}.json`,
        count: notifications.length
      };
    } catch (error) {
      console.error('Export notifications error:', error);
      return null;
    }
  }

  // Import notifications
  static importNotifications(jsonData) {
    try {
      const notifications = JSON.parse(jsonData);
      
      if (Array.isArray(notifications)) {
        const currentNotifications = this.getStoredNotifications();
        const merged = [...currentNotifications, ...notifications];
        
        // Remove duplicates by id
        const unique = Array.from(
          new Map(merged.map(n => [n.id, n])).values()
        );
        
        localStorage.setItem(this.storageKey, JSON.stringify(unique));
        return { success: true, imported: notifications.length, total: unique.length };
      } else {
        throw new Error('Invalid notifications format');
      }
    } catch (error) {
      console.error('Import notifications error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Initialize on module load
if (typeof window !== 'undefined') {
  NotificationService.initialize();
}

export default NotificationService;