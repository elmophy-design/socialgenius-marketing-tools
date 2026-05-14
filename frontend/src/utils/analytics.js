/**
 * Client-side analytics utilities
 * Google Analytics, event tracking, user behavior monitoring
 */

import { ANALYTICS_EVENTS } from './constants';

/**
 * Analytics Manager Class
 */
class AnalyticsManager {
  constructor() {
    this.enabled = false;
    this.userId = null;
    this.sessionId = this.generateSessionId();
    this.events = [];
    this.maxEvents = 1000;
  }

  /**
   * Initialize analytics
   * @param {Object} config - Analytics configuration
   */
  initialize(config = {}) {
    const {
      googleAnalyticsId = process.env.REACT_APP_GA_ID,
      facebookPixelId = process.env.REACT_APP_FB_PIXEL_ID,
      enableInDevelopment = false
    } = config;

    // Don't enable in development unless specified
    if (process.env.NODE_ENV === 'development' && !enableInDevelopment) {
      console.log('Analytics disabled in development mode');
      return;
    }

    this.enabled = true;

    // Initialize Google Analytics
    if (googleAnalyticsId) {
      this.initializeGoogleAnalytics(googleAnalyticsId);
    }

    // Initialize Facebook Pixel
    if (facebookPixelId) {
      this.initializeFacebookPixel(facebookPixelId);
    }

    // Track initial page view
    this.trackPageView();

    console.log('Analytics initialized');
  }

  /**
   * Initialize Google Analytics
   * @param {string} trackingId - GA tracking ID
   */
  initializeGoogleAnalytics(trackingId) {
    // Load GA script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
    document.head.appendChild(script);

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', trackingId, {
      send_page_view: false, // We'll handle page views manually
      anonymize_ip: true
    });

    this.gaInitialized = true;
  }

  /**
   * Initialize Facebook Pixel
   * @param {string} pixelId - Facebook Pixel ID
   */
  initializeFacebookPixel(pixelId) {
    // Load Facebook Pixel script
    !function(f,b,e,v,n,t,s) {
      if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)
    }(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    
    window.fbq('init', pixelId);
    
    this.fbPixelInitialized = true;
  }

  /**
   * Generate session ID
   * @returns {string} - Unique session ID
   */
  generateSessionId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set user ID
   * @param {string} userId - User ID
   */
  setUserId(userId) {
    this.userId = userId;

    if (this.gaInitialized && window.gtag) {
      window.gtag('config', process.env.REACT_APP_GA_ID, {
        user_id: userId
      });
    }
  }

  /**
   * Set user properties
   * @param {Object} properties - User properties
   */
  setUserProperties(properties) {
    if (this.gaInitialized && window.gtag) {
      window.gtag('set', 'user_properties', properties);
    }

    // Store locally for later events
    this.userProperties = properties;
  }

  /**
   * Track page view
   * @param {string} path - Page path
   * @param {string} title - Page title
   */
  trackPageView(path = window.location.pathname, title = document.title) {
    if (!this.enabled) return;

    const eventData = {
      page_path: path,
      page_title: title,
      page_location: window.location.href
    };

    // Google Analytics
    if (this.gaInitialized && window.gtag) {
      window.gtag('event', 'page_view', eventData);
    }

    // Facebook Pixel
    if (this.fbPixelInitialized && window.fbq) {
      window.fbq('track', 'PageView');
    }

    // Store event
    this.storeEvent(ANALYTICS_EVENTS.PAGE_VIEW, eventData);

    console.log('Page view tracked:', path);
  }

  /**
   * Track custom event
   * @param {string} eventName - Event name
   * @param {Object} eventData - Event data
   * @param {Object} options - Tracking options
   */
  trackEvent(eventName, eventData = {}, options = {}) {
    if (!this.enabled) return;

    const {
      category = 'engagement',
      label = '',
      value = null,
      nonInteraction = false
    } = options;

    const enrichedData = {
      ...eventData,
      event_category: category,
      event_label: label,
      value,
      non_interaction: nonInteraction,
      user_id: this.userId,
      session_id: this.sessionId,
      timestamp: new Date().toISOString()
    };

    // Google Analytics
    if (this.gaInitialized && window.gtag) {
      window.gtag('event', eventName, enrichedData);
    }

    // Facebook Pixel (for standard events)
    if (this.fbPixelInitialized && window.fbq) {
      const fbStandardEvents = [
        'Purchase', 'Lead', 'CompleteRegistration', 
        'AddPaymentInfo', 'AddToCart', 'InitiateCheckout',
        'Subscribe', 'StartTrial'
      ];

      if (fbStandardEvents.includes(eventName)) {
        window.fbq('track', eventName, eventData);
      } else {
        window.fbq('trackCustom', eventName, eventData);
      }
    }

    // Store event
    this.storeEvent(eventName, enrichedData);

    console.log('Event tracked:', eventName, enrichedData);
  }

  /**
   * Track user signup
   * @param {Object} userData - User data
   */
  trackSignup(userData = {}) {
    this.trackEvent(ANALYTICS_EVENTS.SIGNUP, {
      method: userData.method || 'email',
      user_id: userData.userId
    }, {
      category: 'user',
      label: 'signup'
    });
  }

  /**
   * Track user login
   * @param {Object} userData - User data
   */
  trackLogin(userData = {}) {
    this.trackEvent(ANALYTICS_EVENTS.LOGIN, {
      method: userData.method || 'email',
      user_id: userData.userId
    }, {
      category: 'user',
      label: 'login'
    });

    this.setUserId(userData.userId);
  }

  /**
   * Track user logout
   */
  trackLogout() {
    this.trackEvent(ANALYTICS_EVENTS.LOGOUT, {}, {
      category: 'user',
      label: 'logout'
    });

    this.userId = null;
  }

  /**
   * Track subscription start
   * @param {Object} subscriptionData - Subscription data
   */
  trackSubscriptionStart(subscriptionData) {
    this.trackEvent(ANALYTICS_EVENTS.SUBSCRIPTION_START, {
      plan: subscriptionData.plan,
      amount: subscriptionData.amount,
      interval: subscriptionData.interval,
      currency: subscriptionData.currency || 'NGN'
    }, {
      category: 'subscription',
      label: subscriptionData.plan,
      value: subscriptionData.amount
    });

    // Facebook Pixel - Subscribe event
    if (this.fbPixelInitialized && window.fbq) {
      window.fbq('track', 'Subscribe', {
        value: subscriptionData.amount,
        currency: subscriptionData.currency || 'NGN',
        predicted_ltv: subscriptionData.amount * 12
      });
    }
  }

  /**
   * Track subscription cancellation
   * @param {Object} subscriptionData - Subscription data
   */
  trackSubscriptionCancel(subscriptionData) {
    this.trackEvent(ANALYTICS_EVENTS.SUBSCRIPTION_CANCEL, {
      plan: subscriptionData.plan,
      reason: subscriptionData.reason
    }, {
      category: 'subscription',
      label: subscriptionData.plan
    });
  }

  /**
   * Track content generation
   * @param {Object} contentData - Content data
   */
  trackContentGenerated(contentData) {
    this.trackEvent(ANALYTICS_EVENTS.CONTENT_GENERATED, {
      tool: contentData.tool,
      content_type: contentData.contentType,
      platform: contentData.platform,
      quantity: contentData.quantity
    }, {
      category: 'content',
      label: contentData.tool
    });
  }

  /**
   * Track post creation
   * @param {Object} postData - Post data
   */
  trackPostCreated(postData) {
    this.trackEvent(ANALYTICS_EVENTS.POST_CREATED, {
      platforms: postData.platforms,
      content_type: postData.contentType,
      has_media: postData.hasMedia || false
    }, {
      category: 'content',
      label: 'post_created'
    });
  }

  /**
   * Track post scheduling
   * @param {Object} postData - Post data
   */
  trackPostScheduled(postData) {
    this.trackEvent(ANALYTICS_EVENTS.POST_SCHEDULED, {
      platforms: postData.platforms,
      scheduled_for: postData.scheduledFor
    }, {
      category: 'content',
      label: 'post_scheduled'
    });
  }

  /**
   * Track tool usage
   * @param {string} toolName - Tool name
   * @param {Object} toolData - Tool data
   */
  trackToolUsed(toolName, toolData = {}) {
    this.trackEvent(ANALYTICS_EVENTS.TOOL_USED, {
      tool: toolName,
      ...toolData
    }, {
      category: 'tools',
      label: toolName
    });
  }

  /**
   * Track payment initiation
   * @param {Object} paymentData - Payment data
   */
  trackPaymentInitiated(paymentData) {
    this.trackEvent(ANALYTICS_EVENTS.PAYMENT_INITIATED, {
      plan: paymentData.plan,
      amount: paymentData.amount,
      currency: paymentData.currency || 'NGN'
    }, {
      category: 'payment',
      label: paymentData.plan,
      value: paymentData.amount
    });

    // Facebook Pixel - InitiateCheckout
    if (this.fbPixelInitialized && window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        value: paymentData.amount,
        currency: paymentData.currency || 'NGN',
        content_name: paymentData.plan
      });
    }
  }

  /**
   * Track payment completion
   * @param {Object} paymentData - Payment data
   */
  trackPaymentCompleted(paymentData) {
    this.trackEvent(ANALYTICS_EVENTS.PAYMENT_COMPLETED, {
      plan: paymentData.plan,
      amount: paymentData.amount,
      currency: paymentData.currency || 'NGN',
      transaction_id: paymentData.transactionId,
      payment_method: paymentData.paymentMethod
    }, {
      category: 'payment',
      label: paymentData.plan,
      value: paymentData.amount
    });

    // Facebook Pixel - Purchase
    if (this.fbPixelInitialized && window.fbq) {
      window.fbq('track', 'Purchase', {
        value: paymentData.amount,
        currency: paymentData.currency || 'NGN',
        content_name: paymentData.plan,
        content_type: 'product'
      });
    }

    // Google Analytics - Purchase
    if (this.gaInitialized && window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: paymentData.transactionId,
        value: paymentData.amount,
        currency: paymentData.currency || 'NGN',
        items: [{
          item_id: paymentData.plan,
          item_name: paymentData.plan,
          price: paymentData.amount,
          quantity: 1
        }]
      });
    }
  }

  /**
   * Track button click
   * @param {string} buttonName - Button name
   * @param {Object} extraData - Extra data
   */
  trackButtonClick(buttonName, extraData = {}) {
    this.trackEvent('button_click', {
      button_name: buttonName,
      ...extraData
    }, {
      category: 'engagement',
      label: buttonName
    });
  }

  /**
   * Track link click
   * @param {string} url - Link URL
   * @param {string} text - Link text
   */
  trackLinkClick(url, text = '') {
    this.trackEvent('link_click', {
      url,
      text
    }, {
      category: 'engagement',
      label: 'link_click'
    });
  }

  /**
   * Track form submission
   * @param {string} formName - Form name
   * @param {Object} formData - Form data (sanitized)
   */
  trackFormSubmission(formName, formData = {}) {
    this.trackEvent('form_submit', {
      form_name: formName,
      ...formData
    }, {
      category: 'engagement',
      label: formName
    });
  }

  /**
   * Track search
   * @param {string} searchTerm - Search term
   * @param {number} resultsCount - Number of results
   */
  trackSearch(searchTerm, resultsCount = 0) {
    this.trackEvent('search', {
      search_term: searchTerm,
      results_count: resultsCount
    }, {
      category: 'engagement',
      label: 'search'
    });
  }

  /**
   * Track video play
   * @param {string} videoId - Video ID
   * @param {string} videoTitle - Video title
   */
  trackVideoPlay(videoId, videoTitle = '') {
    this.trackEvent('video_play', {
      video_id: videoId,
      video_title: videoTitle
    }, {
      category: 'engagement',
      label: 'video_play'
    });
  }

  /**
   * Track file download
   * @param {string} fileName - File name
   * @param {string} fileType - File type
   */
  trackFileDownload(fileName, fileType = '') {
    this.trackEvent('file_download', {
      file_name: fileName,
      file_type: fileType
    }, {
      category: 'engagement',
      label: 'file_download'
    });
  }

  /**
   * Track error
   * @param {string} errorMessage - Error message
   * @param {string} errorLocation - Where error occurred
   */
  trackError(errorMessage, errorLocation = '') {
    this.trackEvent('error', {
      error_message: errorMessage,
      error_location: errorLocation
    }, {
      category: 'errors',
      label: errorLocation,
      nonInteraction: true
    });
  }

  /**
   * Track time on page
   * @param {string} pageName - Page name
   * @param {number} timeInSeconds - Time spent in seconds
   */
  trackTimeOnPage(pageName, timeInSeconds) {
    this.trackEvent('time_on_page', {
      page_name: pageName,
      time_seconds: timeInSeconds
    }, {
      category: 'engagement',
      label: pageName,
      value: timeInSeconds
    });
  }

  /**
   * Track scroll depth
   * @param {number} percentage - Scroll percentage
   * @param {string} pageName - Page name
   */
  trackScrollDepth(percentage, pageName = window.location.pathname) {
    this.trackEvent('scroll', {
      page_name: pageName,
      scroll_depth: percentage
    }, {
      category: 'engagement',
      label: `${percentage}%`,
      nonInteraction: true
    });
  }

  /**
   * Store event locally
   * @param {string} eventName - Event name
   * @param {Object} eventData - Event data
   */
  storeEvent(eventName, eventData) {
    const event = {
      name: eventName,
      data: eventData,
      timestamp: new Date().toISOString()
    };

    this.events.push(event);

    // Keep only last N events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Store in localStorage for analytics persistence
    try {
      const storedEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      storedEvents.push(event);
      localStorage.setItem('analytics_events', JSON.stringify(storedEvents.slice(-this.maxEvents)));
    } catch (error) {
      console.error('Error storing analytics event:', error);
    }
  }

  /**
   * Get all events
   * @returns {Array} - Array of events
   */
  getEvents() {
    return this.events;
  }

  /**
   * Clear all events
   */
  clearEvents() {
    this.events = [];
    localStorage.removeItem('analytics_events');
  }

  /**
   * Get user session data
   * @returns {Object} - Session data
   */
  getSessionData() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      eventsCount: this.events.length,
      sessionStart: this.sessionStart,
      sessionDuration: Date.now() - (this.sessionStart || Date.now())
    };
  }

  /**
   * Export analytics data
   * @returns {Object} - Analytics data
   */
  exportData() {
    return {
      session: this.getSessionData(),
      events: this.events,
      userProperties: this.userProperties
    };
  }
}

// Create singleton instance
export const analytics = new AnalyticsManager();

/**
 * Initialize analytics on app load
 */
export const initializeAnalytics = (config) => {
  analytics.initialize(config);
};

/**
 * Track page view helper
 */
export const trackPageView = (path, title) => {
  analytics.trackPageView(path, title);
};

/**
 * Track event helper
 */
export const trackEvent = (eventName, eventData, options) => {
  analytics.trackEvent(eventName, eventData, options);
};

/**
 * Set user ID helper
 */
export const setUserId = (userId) => {
  analytics.setUserId(userId);
};

/**
 * Set user properties helper
 */
export const setUserProperties = (properties) => {
  analytics.setUserProperties(properties);
};

/**
 * Higher-order component for tracking page views
 */
export const withPageTracking = (Component, pageName) => {
  return (props) => {
    React.useEffect(() => {
      analytics.trackPageView(window.location.pathname, pageName);
    }, []);

    return <Component {...props} />;
  };
};

/**
 * React hook for tracking events
 */
export const useAnalytics = () => {
  return {
    trackEvent: (eventName, eventData, options) => 
      analytics.trackEvent(eventName, eventData, options),
    trackPageView: (path, title) => 
      analytics.trackPageView(path, title),
    setUserId: (userId) => 
      analytics.setUserId(userId),
    setUserProperties: (properties) => 
      analytics.setUserProperties(properties)
  };
};

/**
 * Scroll depth tracker
 */
export class ScrollDepthTracker {
  constructor() {
    this.milestones = [25, 50, 75, 100];
    this.tracked = new Set();
    this.init();
  }

  init() {
    window.addEventListener('scroll', this.handleScroll.bind(this));
  }

  handleScroll() {
    const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;

    this.milestones.forEach(milestone => {
      if (scrollPercent >= milestone && !this.tracked.has(milestone)) {
        analytics.trackScrollDepth(milestone);
        this.tracked.add(milestone);
      }
    });
  }

  reset() {
    this.tracked.clear();
  }
}

/**
 * Time on page tracker
 */
export class TimeOnPageTracker {
  constructor() {
    this.startTime = Date.now();
    this.pageName = window.location.pathname;
  }

  track() {
    const timeSpent = Math.floor((Date.now() - this.startTime) / 1000);
    analytics.trackTimeOnPage(this.pageName, timeSpent);
  }

  init() {
    // Track when user leaves page
    window.addEventListener('beforeunload', this.track.bind(this));
    
    // Track every 30 seconds
    this.interval = setInterval(this.track.bind(this), 30000);
  }

  destroy() {
    clearInterval(this.interval);
    this.track();
  }
}

export default analytics;
