import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../App';
import { useNotification } from '../../../contexts/NotificationContext';
import { toolsApi } from '../../../api/toolsApi';
import { userApi } from '../../../api/userApi';
import { openPaymentGateway } from '../../../utils/paymentGateway';
import { guardToolAction, handleToolActionError } from '../../../utils/toolAccessGuard';
import './SocialMediaGenerator.css';

// Import components
import {
  ConnectionCard,
  GeneratedPostCard,
  ContentTypeOption,
  InterestCheckbox,
  CustomPostCard,
  ActivityFeed
} from './components';

// Import modals
import {
  ProfileModal,
  SubscriptionModal,
  SettingsModal,
  QuickPostModal,
  PremiumWallModal,
  ScheduleModal,
  AnalyticsModal
} from './modals';

// Constants
const MAX_POSTS_PREMIUM = 20;
const MAX_POSTS_BASIC = 5;
const MAX_POSTS_TRIAL = 3;
const SOCIAL_MEDIA_TEST_ACCESS = true;
const SOCIAL_MEDIA_SETTINGS_STORAGE_KEY = 'socialMediaGeneratorSettings';
const SOCIAL_MEDIA_ACTIVITY_KEY = 'social-media-activity';
const SOCIAL_MEDIA_OPEN_QUICK_POST_EVENT = 'social-media:open-quick-post';

const PLATFORMS = [
  { 
    id: 'instagram',
    name: 'Instagram', 
    icon: 'instagram', 
    color: '#E4405F', 
    bg: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400',
    followers: '5.2K',
    apiName: 'instagram',
    isPublishReady: true
  },
  { 
    id: 'tiktok',
    name: 'TikTok', 
    icon: 'tiktok', 
    color: '#000000', 
    bg: 'bg-gradient-to-br from-gray-900 via-gray-800 to-pink-500',
    followers: '3.1K',
    apiName: 'tiktok',
    isPublishReady: true
  },
  { 
    id: 'twitter',
    name: 'Twitter/X', 
    icon: 'twitter', 
    color: '#1DA1F2', 
    bg: 'bg-gradient-to-br from-blue-400 to-blue-500',
    followers: '8.4K',
    apiName: 'twitter',
    isPublishReady: true
  },
  { 
    id: 'linkedin',
    name: 'LinkedIn', 
    icon: 'linkedin', 
    color: '#0A66C2', 
    bg: 'bg-gradient-to-br from-blue-600 to-blue-700',
    followers: '2.7K',
    apiName: 'linkedin',
    isPublishReady: true
  },
  { 
    id: 'facebook',
    name: 'Facebook', 
    icon: 'facebook', 
    color: '#1877F2', 
    bg: 'bg-gradient-to-br from-blue-800 to-blue-900',
    followers: '6.9K',
    apiName: 'facebook',
    isPublishReady: true
  },
  { 
    id: 'youtube',
    name: 'YouTube', 
    icon: 'youtube', 
    color: '#FF0000', 
    bg: 'bg-gradient-to-br from-red-600 to-red-700',
    followers: '1.5K',
    apiName: 'youtube',
    isPublishReady: false,
    statusMessage: 'Live Connection Only'
  },
  { 
    id: 'pinterest',
    name: 'Pinterest', 
    icon: 'pinterest', 
    color: '#E60023', 
    bg: 'bg-gradient-to-br from-red-500 to-pink-600',
    followers: '2.3K',
    apiName: 'pinterest',
    isPublishReady: true
  }
];

const CONTENT_TYPES = [
  { 
    id: 'normal', 
    icon: 'image', 
    title: 'Normal Content', 
    description: 'Regular posts with images',
    supports: ['instagram', 'facebook', 'twitter', 'linkedin', 'pinterest']
  },
  { 
    id: 'video', 
    icon: 'video', 
    title: 'Video Content', 
    description: 'Short videos & reels',
    supports: ['instagram', 'tiktok', 'facebook', 'youtube']
  },
  { 
    id: 'carousel', 
    icon: 'layers', 
    title: 'Carousel Posts', 
    description: 'Multi-image slides',
    supports: ['instagram', 'facebook']
  },
  { 
    id: 'stories', 
    icon: 'camera', 
    title: 'Stories', 
    description: '24-hour content',
    supports: ['instagram', 'facebook']
  },
  { 
    id: 'reels', 
    icon: 'video', 
    title: 'Reels/Shorts', 
    description: 'Short-form videos',
    supports: ['instagram', 'youtube', 'tiktok']
  }
];

const INTERESTS = [
  'technology', 'marketing', 'business', 'lifestyle', 
  'education', 'entertainment', 'health', 'fitness',
  'travel', 'food', 'fashion', 'finance', 'sports',
  'gaming', 'art', 'music', 'photography'
];

const NICHE_OPTIONS = [
  { value: 'technology', label: 'Technology & SaaS' },
  { value: 'fashion', label: 'Fashion & Beauty' },
  { value: 'marketing', label: 'Marketing & Agency' },
  { value: 'education', label: 'Education & Coaching' },
  { value: 'health', label: 'Health & Fitness' },
  { value: 'food', label: 'Food & Beverage' },
  { value: 'travel', label: 'Travel & Hospitality' },
  { value: 'finance', label: 'Finance & Crypto' },
  { value: 'ecommerce', label: 'E-commerce & Retail' },
  { value: 'custom', label: 'Custom Niche' }
];

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual/Friendly' },
  { value: 'humorous', label: 'Humorous' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'educational', label: 'Educational' }
];

const createProviderLookup = (providers = []) =>
  providers.reduce((lookup, provider) => {
    lookup[provider.platform] = provider;
    return lookup;
  }, {});

const mergePlatformWithProviderState = (platform, providerInfo = {}, connection = null, fallbackUserName = '') => {
  const fallbackHandle = `@${String(fallbackUserName || 'socialgenius').toLowerCase().replace(/\s+/g, '')}`;
  const providerLive = Boolean(providerInfo.live);
  const supportsConnection = providerInfo.supportsConnection ?? providerLive;

  return {
    ...platform,
    providerLive,
    supportsConnection,
    supportsPublishing: providerInfo.supportsPublishing ?? false,
    supportsScheduling: providerInfo.supportsScheduling ?? false,
    providerStatus: providerInfo.status || (providerLive ? 'live' : 'credentials-missing'),
    providerNotes: Array.isArray(providerInfo.notes) ? providerInfo.notes : [],
    isPublishReady: providerInfo.isPublishReady ?? platform.isPublishReady ?? false,
    statusMessage:
      providerInfo.statusMessage ||
      platform.statusMessage ||
      (providerLive ? 'Connection ready' : 'Live connection is not configured yet.'),
    isConnected: Boolean(connection),
    isActive: connection?.status === 'active' || connection?.isActive || false,
    accountId: connection?.accountId || null,
    username: connection?.username || fallbackHandle,
    followers: connection?.followers || platform.followers,
    lastSynced: connection?.lastSynced || null,
    provider: connection?.provider || providerInfo.provider || null,
    accountName: connection?.accountName || platform.name,
    profilePicture: connection?.profilePicture || ''
  };
};

const HEADER_NAV_ITEMS = [
  { label: 'Overview', target: 'smg-overview' },
  { label: 'Accounts', target: 'features' },
  { label: 'Generator', target: 'how-it-works' },
  { label: 'Posts', target: 'smg-generated-posts' },
  { label: 'Tools', action: 'open-tools' }
];

const HeaderIcon = ({ name, className = '' }) => {
  const commonProps = {
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    className: `smg-inline-icon ${className}`.trim(),
    'aria-hidden': 'true'
  };

  switch (name) {
    case 'bell':
      return (
        <svg {...commonProps}>
          <path d="M12 4.75a4 4 0 0 0-4 4v2.28c0 .67-.2 1.33-.56 1.89L6.2 14.8c-.43.67.05 1.56.84 1.56h9.92c.79 0 1.27-.89.84-1.56l-1.24-1.88a3.43 3.43 0 0 1-.56-1.89V8.75a4 4 0 0 0-4-4Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9.75 18.25a2.25 2.25 0 0 0 4.5 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'chevron-down':
      return (
        <svg {...commonProps}>
          <path d="m7 10 5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'user':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.8" />
          <path d="M6.5 19c.95-2.67 3.07-4 5.5-4s4.55 1.33 5.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'settings':
      return (
        <svg {...commonProps}>
          <path d="M12 8.8A3.2 3.2 0 1 0 12 15.2 3.2 3.2 0 0 0 12 8.8Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M19 12a7.1 7.1 0 0 0-.07-.98l1.69-1.32-1.6-2.77-2.04.55a7.6 7.6 0 0 0-1.7-.99L15 4h-3l-.28 2.49c-.6.2-1.17.52-1.7.99l-2.04-.55-1.6 2.77 1.69 1.32a7.1 7.1 0 0 0 0 1.96L6.38 14.3l1.6 2.77 2.04-.55c.53.47 1.1.8 1.7.99L12 20h3l.28-2.49c.6-.2 1.17-.52 1.7-.99l2.04.55 1.6-2.77-1.69-1.32c.05-.32.07-.65.07-.98Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'crown':
      return (
        <svg {...commonProps}>
          <path d="m4 17 1.45-8.75L10 12l2-4 2 4 4.55-3.75L20 17H4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M4.5 19h15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'logout':
      return (
        <svg {...commonProps}>
          <path d="M14 8.5 18 12l-4 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M18 12H9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M10 5H7.5A2.5 2.5 0 0 0 5 7.5v9A2.5 2.5 0 0 0 7.5 19H10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'link':
      return (
        <svg {...commonProps}>
          <path d="M10 13.5 8.5 15a3 3 0 1 1-4.24-4.24l2.3-2.3A3 3 0 0 1 10.8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="m14 10.5 1.5-1.5a3 3 0 1 1 4.24 4.24l-2.3 2.3A3 3 0 0 1 13.2 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="m9 15 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'chart':
      return (
        <svg {...commonProps}>
          <path d="M5 19V6.5M10 19v-5M15 19V9M20 19H4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'heart':
      return (
        <svg {...commonProps}>
          <path d="M12 19s-6.25-3.6-8.25-7.15C2.1 8.88 4.08 5.5 7.53 5.5c1.8 0 3.02 1 3.72 2.07C11.95 6.5 13.17 5.5 14.97 5.5c3.45 0 5.43 3.38 3.78 6.35C18.25 15.4 12 19 12 19Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'calendar':
      return (
        <svg {...commonProps}>
          <path d="M7 4.75v2.5M17 4.75v2.5M4.75 9.25h14.5M6.5 6.5h11A1.75 1.75 0 0 1 19.25 8.25v9A1.75 1.75 0 0 1 17.5 19h-11a1.75 1.75 0 0 1-1.75-1.75v-9A1.75 1.75 0 0 1 6.5 6.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'spark':
      return (
        <svg {...commonProps}>
          <path d="M12 3.5 13.8 8.2 18.5 10 13.8 11.8 12 16.5 10.2 11.8 5.5 10 10.2 8.2 12 3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M18.5 3.5 19.2 5.3 21 6 19.2 6.7 18.5 8.5 17.8 6.7 16 6 17.8 5.3 18.5 3.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      );
    case 'check':
      return (
        <svg {...commonProps}>
          <path d="m5.5 12.5 4 4 9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'tools':
      return (
        <svg {...commonProps}>
          <path d="M14.5 5.5a3.1 3.1 0 0 0 4 4l-7.6 7.6a2 2 0 1 1-2.82-2.82l7.6-7.6a3.1 3.1 0 0 0-1.2-1.2Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="m6 6 2.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'lightbulb':
      return (
        <svg {...commonProps}>
          <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7zM9 21h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );
    case 'hashtag':
      return (
        <svg {...commonProps}>
          <path d="M4 9h16M4 15h16M10 3v18M14 3v18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'clock':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'video':
      return (
        <svg {...commonProps}>
          <path d="m23 7-7 5 7 5V7zM1 5h14v14H1z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'comments':
      return (
        <svg {...commonProps}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'globe':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
          <path d="M3.6 9h16.8M3.6 15h16.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M11.5 3a17 17 0 0 0 0 18M12.5 3a17 17 0 0 1 0 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'layers':
      return (
        <svg {...commonProps}>
          <path d="M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'bullseye':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="12" r="1" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case 'shield':
      return (
        <svg {...commonProps}>
          <path d="M12 2 3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'send':
      return (
        <svg {...commonProps}>
          <path d="m22 2-7 20-4-9-9-4 20-7zM22 2 11 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'sync':
      return (
        <svg {...commonProps}>
          <path d="M23 4v6h-6M1 20v-6h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'trash':
      return (
        <svg {...commonProps}>
          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'alert':
      return (
        <svg {...commonProps}>
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'close':
      return (
        <svg {...commonProps}>
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'robot':
      return (
        <svg {...commonProps}>
          <path d="M12 8V4m0 0H8m4 0h4M7 13v-3a5 5 0 0 1 10 0v3m-10 0h10m-10 0v3a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3v-3m-10 0h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="9" cy="16" r="1" fill="currentColor" />
          <circle cx="15" cy="16" r="1" fill="currentColor" />
        </svg>
      );
    case 'bolt':
      return (
        <svg {...commonProps}>
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'copy':
      return (
        <svg {...commonProps}>
          <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'plus':
      return (
        <svg {...commonProps}>
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'image':
      return (
        <svg {...commonProps}>
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
          <path d="m21 15-5-5L5 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'camera':
      return (
        <svg {...commonProps}>
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3l2-3h8l2 3h3a2 2 0 0 1 2 2v12z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case 'infinity':
      return (
        <svg {...commonProps}>
          <path d="M18.17 7.66c-2.03 0-3.66 1.63-5.41 3.39-1.75 1.76-3.38 3.39-5.41 3.39-2.03 0-3.66-1.63-3.66-3.66s1.63-3.66 3.66-3.66c2.03 0 3.66 1.63 5.41 3.39 1.75 1.76 3.38 3.39 5.41 3.39 2.03 0 3.66-1.63 3.66-3.66s-1.63-3.66-3.66-3.66z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'share':
      return (
        <svg {...commonProps}>
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'instagram':
      return (
        <svg {...commonProps}>
          <rect x="4.5" y="4.5" width="15" height="15" rx="4" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="12" r="3.4" stroke="currentColor" strokeWidth="2" />
          <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg {...commonProps}>
          <path d="M14 5c.7 1.6 2.1 2.7 4 3v2.6c-1.4-.1-2.7-.6-3.8-1.4v5.1a5.2 5.2 0 1 1-4.2-5.1v2.7a2.5 2.5 0 1 0 1.5 2.3V5H14Z" fill="currentColor" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      );
    case 'twitter':
      return (
        <svg {...commonProps}>
          <path d="M19 7.2c-.5.2-1.1.4-1.7.5.6-.4 1.1-.9 1.3-1.6-.6.3-1.3.6-2 .8A2.9 2.9 0 0 0 14.5 6c-1.8 0-3.1 1.7-2.7 3.4-2.5-.1-4.7-1.3-6.2-3.1-.8 1.4-.4 3.1 1 4-.5 0-1-.1-1.4-.4 0 1.5 1 2.8 2.5 3.1-.5.1-.9.2-1.4 0 .4 1.3 1.6 2.2 3 2.3A5.9 5.9 0 0 1 5 16.8 8.4 8.4 0 0 0 9.6 18c5.5 0 8.7-4.8 8.5-9 .6-.4 1.1-1 1.5-1.7Z" fill="currentColor" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg {...commonProps}>
          <rect x="4" y="4" width="16" height="16" rx="3.5" stroke="currentColor" strokeWidth="2" />
          <path d="M8.2 10.1V16M8.2 8.1h0M11.8 16v-3.2c0-1.4.8-2.3 2.1-2.3 1.2 0 1.9.8 1.9 2.3V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'facebook':
      return (
        <svg {...commonProps}>
          <path d="M14 8.5h2V5.4c-.4-.1-1.2-.2-2.2-.2-2.2 0-3.7 1.3-3.7 3.9v2.2H8v3.3h2.1v5.9h3.5v-5.9h2.4l.4-3.3H13.6V9.5c0-.7.2-1 1-1Z" fill="currentColor" />
        </svg>
      );
    case 'youtube':
      return (
        <svg {...commonProps}>
          <path d="M20.4 8.3a2.6 2.6 0 0 0-1.8-1.8C17 6 12 6 12 6s-5 0-6.6.5A2.6 2.6 0 0 0 3.6 8.3C3 9.9 3 12 3 12s0 2.1.6 3.7a2.6 2.6 0 0 0 1.8 1.8C7 18 12 18 12 18s5 0 6.6-.5a2.6 2.6 0 0 0 1.8-1.8C21 14.1 21 12 21 12s0-2.1-.6-3.7Z" fill="currentColor" />
          <path d="M10.3 14.8 15 12l-4.7-2.8v5.6Z" fill="#ffffff" />
        </svg>
      );
    case 'pinterest':
      return (
        <svg {...commonProps}>
          <path d="M12 2a10 10 0 0 0-3.5 19.4c0-2.6.5-5 1-7.2-.5-.9-.6-2.1-.6-3.2 0-3 1.8-5.3 4-5.3 1 0 2 .4 2.6 1 .7.6 1 1.5 1 2.5 0 2.5-1.6 4.7-4 4.7-.8 0-1.5-.4-1.8-1l-.5 2c-.2.8-.7 2-1 3.2.8.5 1.8.8 3 .8 5.4 0 9.4-4.9 9.4-10.4 0-4.6-3.3-7.8-8-7.8a8.3 8.3 0 0 0-8.5 8.3c0 1.7.6 3.2 1.6 4.4l.2.3-.2.8a3 3 0 0 1-1 .5c-1.5 0-2.8-2-2.8-4.7C2 6 6.5 2 12 2Z" fill="currentColor" />
        </svg>
      );
    case 'spinner':
      return (
        <svg {...commonProps} className={`${commonProps.className || ''} fa-spin`}>
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'sliders':
      return (
        <svg {...commonProps}>
          <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M2 14h4M10 8h4M18 12h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
};

const getNotificationTone = (item = {}) => {
  if (item.type === 'success' || item.category === 'publishing') return 'green';
  if (item.type === 'billing') return 'purple';
  if (item.type === 'warning' || item.type === 'error') return 'orange';
  return 'blue';
};

const getNotificationIconName = (item = {}) => {
  if (item.type === 'success' || item.category === 'publishing') return 'check';
  if (item.type === 'billing') return 'crown';
  if (item.category === 'social') return 'link';
  if (item.category === 'analytics') return 'chart';
  return 'bell';
};

const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'Now';
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes <= 0) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
};

const formatScheduledTime = (timestamp) => {
  if (!timestamp) return 'Not scheduled';
  return new Date(timestamp).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const getScheduledStatusMeta = (status = 'pending') => {
  switch (status) {
    case 'published':
      return { label: 'Published', tone: 'success' };
    case 'processing':
      return { label: 'Publishing', tone: 'info' };
    case 'failed':
      return { label: 'Failed', tone: 'danger' };
    case 'deleted':
      return { label: 'Removed', tone: 'muted' };
    default:
      return { label: 'Queued', tone: 'warning' };
  }
};

// Helper functions
const getMaxPostsByPlan = (plan) => {
  switch (plan) {
    case 'premium':
    case 'pro':
      return MAX_POSTS_PREMIUM;
    case 'basic':
      return MAX_POSTS_BASIC;
    default:
      return MAX_POSTS_TRIAL;
  }
};

// helper for platform badge classes removed (unused)

// Main Component
const SocialMediaGenerator = () => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const logout = authContext?.logout;
  const isAuthenticated = Boolean(authContext?.user);
  const notify = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);
  const notificationMenuRef = useRef(null);
  
  // User state
  const [userData, setUserData] = useState({
    userName: user?.name || 'Marketing Pro',
    userEmail: user?.email || 'user@socialgenius.com',
    plan: user?.subscription?.plan || 'trial',
    avatar: user?.avatar || null,
    company: user?.company || 'SocialGenius',
    connectedCount: 0,
    postsCount: 0,
    engagementRate: 0,
    scheduledCount: 0,
    totalPosts: 0,
    followersGrowth: 0
  });

  // Form state
  const [formData, setFormData] = useState({
    niche: 'technology',
    customNiche: '',
    contentType: 'normal',
    brandVoice: 'professional',
    tone: 'professional',
    targetAudience: '25-34',
    interests: ['technology', 'marketing', 'business'],
    postQuantity: 3,
    autoPost: false,
    includeHashtags: true,
    includeEmojis: true,
    callToAction: 'learn-more',
    keywords: '',
    language: 'english'
  });

  // Component state
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [generatedPosts, setGeneratedPosts] = useState([]);
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [scheduledPostsLoading, setScheduledPostsLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalPosts: 0,
    engagementRate: 0,
    followersGrowth: 0,
    topPlatform: null
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [socialProviders, setSocialProviders] = useState({});

  // Modal states
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState({});

  // Derived values
  const isPremium = ['premium', 'pro'].includes(userData.plan);
  const isBasic = userData.plan === 'basic';
  const hasPremiumAccess = isPremium || SOCIAL_MEDIA_TEST_ACCESS;
  const maxPosts = hasPremiumAccess ? MAX_POSTS_PREMIUM : getMaxPostsByPlan(userData.plan);
  const connectedCount = connectedAccounts.filter(acc => acc.isConnected).length;

  // Initialize (effect moved below after helper declarations)

  const initializeUserData = async () => {
    try {
      // Load user data from backend
      const response = await toolsApi.getUserToolUsage();
      if (response.success) {
        const usageData = response.data.socialMedia || {};
        setUserData(prev => ({
          ...prev,
          postsCount: usageData.postsCount || 0,
          engagementRate: usageData.engagementRate || 0,
          scheduledCount: usageData.scheduledCount || 0,
          totalPosts: usageData.totalPosts || 0,
          followersGrowth: usageData.followersGrowth || 0
        }));
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const loadUserConnections = useCallback(async () => {
    try {
      const [connectionsResult, providersResult] = await Promise.allSettled([
        toolsApi.getSocialConnections(),
        toolsApi.getSocialProviders()
      ]);

      const connected =
        connectionsResult.status === 'fulfilled' && connectionsResult.value.success
          ? (connectionsResult.value.data.connections || [])
          : [];

      const providerMap =
        providersResult.status === 'fulfilled' && providersResult.value.success
          ? createProviderLookup(providersResult.value.data || [])
          : {};

      setSocialProviders(providerMap);

      const mappedConnections = PLATFORMS.map((platform) => {
        const connection = connected.find((conn) => conn.platform === platform.apiName);
        return mergePlatformWithProviderState(
          platform,
          providerMap[platform.apiName] || providerMap[platform.id] || {},
          connection,
          userData.userName
        );
      });

      setConnectedAccounts(mappedConnections);
      setUserData(prev => ({
        ...prev,
        connectedCount: mappedConnections.filter(acc => acc.isConnected).length
      }));
    } catch (error) {
      console.error('Failed to load connections:', error);
      const defaultConnections = PLATFORMS.map((platform) =>
        mergePlatformWithProviderState(platform, socialProviders[platform.apiName] || socialProviders[platform.id] || {}, null, userData.userName)
      );
      setConnectedAccounts(defaultConnections);
      setUserData(prev => ({
        ...prev,
        connectedCount: 0
      }));
    }
  }, [socialProviders, userData.userName]);

  const loadGeneratedPosts = async () => {
    try {
      const response = await toolsApi.getGeneratedPosts('social-media');
      if (response.success && response.data.length > 0) {
        setGeneratedPosts(response.data);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await toolsApi.getToolAnalytics('social-media', 'month');
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadScheduledPosts = useCallback(async (showLoader = false) => {
    if (showLoader) {
      setScheduledPostsLoading(true);
    }

    try {
      const response = await toolsApi.getScheduledPosts();
      if (response.success) {
        const posts = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        setScheduledPosts(posts);
      }
    } catch (error) {
      console.error('Failed to load scheduled posts:', error);
    } finally {
      if (showLoader) {
        setScheduledPostsLoading(false);
      }
    }
  }, []);

  const buildFallbackNotifications = useCallback(() => {
    const latestActivity = (() => {
      try {
        const saved = localStorage.getItem(SOCIAL_MEDIA_ACTIVITY_KEY);
        return saved ? JSON.parse(saved) : null;
      } catch (error) {
        return null;
      }
    })();

    const fallbackItems = [
      {
        id: 'fallback-connections',
        title: connectedCount > 0 ? 'Accounts connected' : 'Connect your accounts',
        message:
          connectedCount > 0
            ? `${connectedCount} social account${connectedCount > 1 ? 's are' : ' is'} ready for publishing.`
            : 'Link at least one social channel to begin publishing.',
        time: 'Now',
        tone: 'blue',
        unread: connectedCount === 0,
        icon: 'link'
      },
      {
        id: 'fallback-generator',
        title: generatedPosts.length > 0 ? 'Content generated' : 'Generator ready',
        message:
          generatedPosts.length > 0
            ? `${generatedPosts.length} draft post${generatedPosts.length > 1 ? 's are' : ' is'} ready for review.`
            : 'Your AI generator is ready for live content creation.',
        time: generatedPosts.length > 0 ? 'Just now' : 'Ready',
        tone: 'green',
        unread: generatedPosts.length > 0,
        icon: 'spark'
      },
      {
        id: 'fallback-schedule',
        title: userData.scheduledCount > 0 ? 'Posts scheduled' : 'Scheduling available',
        message:
          userData.scheduledCount > 0
            ? `${userData.scheduledCount} scheduled post${userData.scheduledCount > 1 ? 's are' : ' is'} queued for publishing.`
            : 'Schedule approved content when your drafts are ready.',
        time: userData.scheduledCount > 0 ? 'Today' : 'Anytime',
        tone: 'purple',
        unread: false,
        icon: 'calendar'
      }
    ];

    if (latestActivity?.type === 'post_created') {
      fallbackItems.unshift({
        id: 'fallback-activity',
        title: 'Latest generator activity',
        message: `${latestActivity.count || 0} new draft post${latestActivity.count > 1 ? 's were' : ' was'} created recently.`,
        time: 'Recent',
        tone: 'orange',
        unread: true,
        icon: 'check'
      });
    }

    return fallbackItems.slice(0, 4);
  }, [connectedCount, generatedPosts.length, userData.scheduledCount]);

  const loadNotifications = useCallback(async (showLoader = false) => {
    if (!isAuthenticated) return;

    if (showLoader) {
      setNotificationsLoading(true);
    }

    try {
      const response = await userApi.getNotifications();
      if (response.success && response.data.length > 0) {
        const mappedNotifications = response.data.slice(0, 6).map((item) => ({
          id: item._id || item.id,
          title: item.title,
          message: item.message,
          time: formatRelativeTime(item.createdAt),
          tone: getNotificationTone(item),
          unread: !item.read,
          icon: getNotificationIconName(item),
          actionUrl: item.action?.url || '',
        }));
        setNotifications(mappedNotifications);
      } else {
        setNotifications(buildFallbackNotifications());
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setNotifications(buildFallbackNotifications());
    } finally {
      if (showLoader) {
        setNotificationsLoading(false);
      }
    }
  }, [buildFallbackNotifications, isAuthenticated]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const connectedProvider = params.get('connected');
    const authError = params.get('error');

    if (connectedProvider) {
      notify.success('Account connected', `${connectedProvider.toUpperCase()} account connection completed successfully.`);
      loadUserConnections();
      loadNotifications();
      navigate(location.pathname, { replace: true });
      return;
    }

    if (authError) {
      notify.error('Connection failed', 'We could not complete the social account connection. Please confirm your app credentials and try again.');
      navigate(location.pathname, { replace: true });
    }
  }, [loadNotifications, loadUserConnections, location.pathname, location.search, navigate, notify]);

  // Initialize - run after helper functions are defined
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/tools/social-media' } });
      return;
    }

    initializeUserData();
    loadUserConnections();
    loadGeneratedPosts();
    loadScheduledPosts(true);
    loadStats();
    loadNotifications();
  }, [isAuthenticated, navigate, loadNotifications, loadScheduledPosts, loadUserConnections]);

  useEffect(() => {
    const openQuickPostFromEvent = () => openModal('quickPost');
    window.addEventListener(SOCIAL_MEDIA_OPEN_QUICK_POST_EVENT, openQuickPostFromEvent);

    return () => {
      window.removeEventListener(SOCIAL_MEDIA_OPEN_QUICK_POST_EVENT, openQuickPostFromEvent);
    };
  }, []);

  useEffect(() => {
    if (!userMenuOpen && !notificationMenuOpen) return undefined;

    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target)) {
        setNotificationMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notificationMenuOpen, userMenuOpen]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    const intervalId = setInterval(() => {
      loadNotifications();
    }, 45000);

    return () => clearInterval(intervalId);
  }, [isAuthenticated, loadNotifications]);

  useEffect(() => {
    const saved = localStorage.getItem(SOCIAL_MEDIA_SETTINGS_STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      const content = parsed?.content || {};
      const account = parsed?.account || {};

      setFormData((prev) => ({
        ...prev,
        niche: content.defaultNiche || prev.niche,
        customNiche: content.customNiche || prev.customNiche,
        contentType: content.defaultContentType || prev.contentType,
        brandVoice: content.defaultBrandVoice || prev.brandVoice,
        tone: content.defaultTone || prev.tone,
        includeHashtags: typeof content.includeHashtags === 'boolean' ? content.includeHashtags : prev.includeHashtags,
        includeEmojis: typeof content.includeEmojis === 'boolean' ? content.includeEmojis : prev.includeEmojis,
        callToAction: content.callToAction || prev.callToAction,
        keywords: content.defaultKeywords || prev.keywords,
        language: content.defaultLanguage || prev.language
      }));

      setUserData((prev) => ({
        ...prev,
        userName: account.displayName || prev.userName,
        company: account.company || prev.company,
        avatar: account.profilePicture || prev.avatar
      }));
    } catch (error) {
      console.error('Failed to parse social media settings:', error);
    }
  }, []);

  // Handlers
  const handleFormChange = useCallback((field, value) => {
    setFormData(prev => {
      if (field === 'niche' && value !== 'custom') {
        return { ...prev, niche: value, customNiche: '' };
      }
      if (field === 'postQuantity') {
        const max = hasPremiumAccess ? MAX_POSTS_PREMIUM : getMaxPostsByPlan(userData.plan);
        const quantity = Math.min(Math.max(1, parseInt(value) || 1), max);
        return { ...prev, [field]: quantity };
      }
      return { ...prev, [field]: value };
    });
  }, [hasPremiumAccess, userData.plan]);

  const handleInterestToggle = useCallback((interest) => {
    setFormData(prev => {
      const currentInterests = [...prev.interests];
      const index = currentInterests.indexOf(interest);
      
      if (index > -1) {
        currentInterests.splice(index, 1);
      } else {
        currentInterests.push(interest);
      }
      
      return { ...prev, interests: currentInterests };
    });
  }, []);

  const handleContentTypeChange = useCallback((contentType) => {
    // Check if selected platforms support this content type
    const selectedPlatforms = connectedAccounts.filter(acc => acc.isConnected).map(acc => acc.id);
    const supportsAll = CONTENT_TYPES.find(ct => ct.id === contentType)?.supports || [];
    
    const unsupportedPlatforms = selectedPlatforms.filter(
      platform => !supportsAll.includes(platform)
    );
    
    if (unsupportedPlatforms.length > 0) {
      setError(`Some connected platforms (${unsupportedPlatforms.join(', ')}) don't support ${contentType}.`);
      setTimeout(() => setError(null), 5000);
      return;
    }
    
    setFormData(prev => ({ ...prev, contentType }));
  }, [connectedAccounts]);

  const handleToggleAccount = useCallback(async (platformId) => {
    if (!hasPremiumAccess && !['facebook', 'twitter'].includes(platformId)) {
      openModal('premiumWall', { 
        message: `Connect to ${PLATFORMS.find(p => p.id === platformId)?.name} requires Premium plan.` 
      });
      return;
    }

    try {
      const platform = connectedAccounts.find(acc => acc.id === platformId);
      const newStatus = !platform?.isConnected;
      
      if (newStatus) {
        if (!platform?.supportsConnection || !platform?.providerLive) {
          setError(platform?.statusMessage || `${platform?.name || platformId} live OAuth connection is not configured yet.`);
          return;
        }

        if (['facebook', 'instagram', 'linkedin', 'twitter', 'tiktok', 'pinterest', 'youtube'].includes(platformId)) {
          const response = await toolsApi.startSocialOAuth(platformId);
          const redirectUrl = response?.data?.redirectUrl || response?.data;

          if (redirectUrl) {
            window.location.href = redirectUrl;
            return;
          }
        }

        setError(platform?.statusMessage || `${platform?.name || platformId} live OAuth connection is not configured yet.`);
        return;
      } else {
        if (platform?.accountId) {
          await toolsApi.disconnectSocialAccount(platform.apiName, platform.accountId);
          notify.info('Account disconnected', `${platform.name} was disconnected successfully.`);
        }

        setConnectedAccounts(prev =>
          prev.map(acc =>
            acc.id === platformId
              ? { ...acc, isConnected: false, isActive: false, accountId: null }
              : acc
          )
        );
        loadNotifications();
      }
      
      setUserData(prev => ({
        ...prev,
        connectedCount: newStatus ? prev.connectedCount + 1 : prev.connectedCount - 1
      }));
    } catch (error) {
      console.error('Failed to toggle account:', error);
      setError(error.message || 'Failed to update connection. Please try again.');
    }
  }, [connectedAccounts, hasPremiumAccess, loadNotifications, notify]);

  const handleGenerateContent = async () => {
    if (!guardToolAction({
      navigate,
      requiredPlan: 'trial',
      source: 'social-media-generate',
      actionLabel: 'generate social media content',
      toolName: 'Social Media Generator',
    })) {
      return;
    }

    // Validation
    if (!formData.niche && !formData.customNiche) {
      setError('Please select or enter a niche/industry');
      return;
    }

    if (formData.interests.length === 0) {
      setError('Please select at least one interest for your target audience');
      return;
    }

    const selectedPlatforms = connectedAccounts.filter(acc => acc.isConnected);
    if (selectedPlatforms.length === 0) {
      setError('Please connect at least one social media account');
      return;
    }

    if (!hasPremiumAccess && formData.postQuantity > MAX_POSTS_TRIAL) {
      openModal('premiumWall', { 
        message: `Generate ${formData.postQuantity} posts requires Premium plan. Trial limit: ${MAX_POSTS_TRIAL} posts.` 
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        niche: formData.niche === 'custom' ? formData.customNiche : formData.niche,
        contentType: formData.contentType,
        tone: formData.tone,
        brandVoice: formData.brandVoice,
        targetAudience: formData.targetAudience,
        interests: formData.interests,
        postQuantity: formData.postQuantity,
        platforms: selectedPlatforms.map(p => p.apiName),
        includeHashtags: formData.includeHashtags,
        includeEmojis: formData.includeEmojis,
        callToAction: formData.callToAction,
        keywords: formData.keywords ? formData.keywords.split(',').map(k => k.trim()) : [],
        language: formData.language,
        userId: user?._id,
        autoPost: hasPremiumAccess && formData.autoPost
      };

      const response = await toolsApi.generateSocialMedia(payload);
      
      if (response.success) {
        const generatedPosts = response.data.posts.map((post, index) => ({
          id: `${Date.now()}-${index}`,
          platform: post.platform,
          contentType: formData.contentType,
          copy: post.content,
          hashtags: post.hashtags || [],
          imageUrl: post.imageUrl || `https://placehold.co/600x400/667eea/ffffff?text=AI+Generated+${formData.contentType}`,
          generatedAt: new Date().toISOString(),
          isPremium: hasPremiumAccess,
          metadata: {
            tone: formData.tone,
            engagementScore: post.engagementScore || 0,
            characterCount: post.characterCount || 0,
            readingLevel: post.readingLevel || 'intermediate'
          }
        }));

        setGeneratedPosts(generatedPosts);
        localStorage.setItem(
          SOCIAL_MEDIA_ACTIVITY_KEY,
          JSON.stringify({
            type: 'post_created',
            count: generatedPosts.length,
            timestamp: new Date().toISOString()
          })
        );
        
        // Update stats
        setUserData(prev => ({
          ...prev,
          postsCount: prev.postsCount + generatedPosts.length
        }));

        // Save to history if user is logged in
        if (user) {
          await toolsApi.saveSocialPosts({
            userId: user._id,
            posts: generatedPosts,
            settings: formData,
            generatedAt: new Date().toISOString()
          });
        }

        // Auto-post if enabled and premium
        if (hasPremiumAccess && formData.autoPost) {
          await handleAutoPost(generatedPosts);
        }

        loadNotifications();
      } else {
        throw new Error(response.error || 'Failed to generate content');
      }
    } catch (error) {
      console.error('Generation error:', error);
      if (handleToolActionError(error, navigate)) {
        return;
      }
      setError(error.message || 'Failed to generate content. Please try again.');
      
      // Fallback to mock data in development
      if (process.env.NODE_ENV === 'development') {
        const mockPosts = generateMockPosts(formData.postQuantity, hasPremiumAccess, formData.contentType, selectedPlatforms);
        setGeneratedPosts(mockPosts);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoPost = useCallback(async (posts) => {
    try {
      for (const post of posts) {
        if (post.platform === 'tiktok') {
          throw new Error('TikTok account connection is live, but direct text-based auto-posting is not enabled in this workflow yet.');
        }

        const linkedAccount = connectedAccounts.find(
          (account) => account.isConnected && account.apiName === post.platform && account.accountId
        );

        if (!linkedAccount?.accountId) {
          throw new Error(`No connected ${post.platform} account is available for auto-posting.`);
        }

        await toolsApi.schedulePost({
          platform: post.platform,
          accountId: linkedAccount.accountId,
          content: post.copy,
          hashtags: post.hashtags,
          imageUrl: post.imageUrl,
          contentType: post.contentType,
          scheduledAt: new Date(Date.now() + 300000).toISOString(), // 5 minutes from now
          userId: user?._id
        });
      }
      
      setUserData(prev => ({
        ...prev,
        scheduledCount: prev.scheduledCount + posts.length
      }));
      await loadScheduledPosts();
      
      // Show success message
      setError(null);
      notify.success('Posts scheduled', `${posts.length} social media post(s) were scheduled successfully.`);
      loadNotifications();
    } catch (error) {
      console.error('Auto-post error:', error);
      setError(error.message || 'Failed to schedule posts. Please try manually.');
    }
  }, [connectedAccounts, loadNotifications, loadScheduledPosts, notify, user?._id]);

  const handleCopyPost = async (post) => {
    try {
      const textToCopy = `${post.copy}\n\n${post.hashtags.join(' ')}`;
      await navigator.clipboard.writeText(textToCopy);
      
      // Show success feedback
      setError(null);
      notify.success('Copied', 'The post content was copied to your clipboard.');
    } catch (err) {
      console.error('Copy failed:', err);
      setError('Failed to copy to clipboard. Please try again.');
    }
  };

  const handleSchedulePost = (post) => {
    if (!guardToolAction({
      navigate,
      requiredPlan: 'trial',
      source: 'social-media-schedule',
      actionLabel: 'schedule social media posts',
      toolName: 'Social Media Generator',
    })) {
      return;
    }

    openModal('schedule', { post });
  };

  const handleScheduleSuccess = async (schedule) => {
    const content = schedule.customMessage?.trim() || schedule.post?.copy?.trim();

    if (!content) {
      throw new Error('Add a custom message or choose a generated post before scheduling.');
    }

    const selectedAccounts = schedule.platforms.map((platformId) => {
      const account = connectedAccounts.find(
        (item) => item.id === platformId && item.isConnected && item.accountId
      );

      if (!account) {
        throw new Error(`${PLATFORMS.find((item) => item.id === platformId)?.name || platformId} is not connected.`);
      }

      if (platformId === 'tiktok') {
        throw new Error('TikTok scheduling is connected for account access, but direct text-based publishing is not enabled in this workflow yet.');
      }

      return account;
    });

    const requestPayloads = selectedAccounts.map((account) => ({
      platform: account.apiName,
      accountId: account.accountId,
      content,
      hashtags: schedule.post?.hashtags || [],
      imageUrl: schedule.post?.imageUrl || '',
      contentType: schedule.post?.contentType || formData.contentType,
      scheduledAt: schedule.scheduledAt,
      userId: user?._id,
    }));

    await Promise.all(requestPayloads.map((payload) => toolsApi.schedulePost(payload)));

    setUserData((prev) => ({
      ...prev,
      scheduledCount: prev.scheduledCount + requestPayloads.length,
    }));

    await loadScheduledPosts();
    loadNotifications();
    notify.success('Post scheduled', `${requestPayloads.length} scheduled item${requestPayloads.length > 1 ? 's were' : ' was'} added to your publishing queue.`);
    closeModal();
  };

  const handleRetryScheduledPost = async (jobId) => {
    try {
      const response = await toolsApi.retryScheduledPost(jobId);
      const retriedPost = response.data?.data || response.data;
      if (retriedPost?.status === 'published') {
        notify.success('Retry succeeded', 'The scheduled post has been published successfully.');
      } else {
        notify.warning('Retry attempted', 'The post was retried, but it still needs attention.');
      }
      await loadScheduledPosts();
      loadNotifications();
    } catch (error) {
      console.error('Retry scheduled post error:', error);
      notify.error('Retry failed', error.message || 'We could not retry this scheduled post right now.');
    }
  };

  const handleDeleteScheduledPost = async (jobId) => {
    try {
      await toolsApi.deleteScheduledPost(jobId);
      setScheduledPosts((prev) => prev.filter((item) => item.jobId !== jobId));
      setUserData((prev) => ({
        ...prev,
        scheduledCount: Math.max(0, (prev.scheduledCount || 1) - 1),
      }));
      notify.info('Scheduled post removed', 'The selected queued item has been removed from your publishing queue.');
    } catch (error) {
      console.error('Delete scheduled post error:', error);
      notify.error('Remove failed', error.message || 'We could not remove this scheduled post.');
    }
  };

  const openModal = (modalName, data = {}) => {
    setActiveModal(modalName);
    setModalData(data);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalData({});
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const displayAvatar = user?.profilePicture || user?.avatar || userData.avatar;
  const firstName = (user?.name || userData.userName || 'Profile').split(' ')[0];
  const currentPlan = hasPremiumAccess ? 'PREMIUM' : (userData.plan || 'TRIAL').toUpperCase();
  const unreadNotifications = notifications.filter((item) => item.unread).length;

  const handleMarkAllNotificationsRead = async () => {
    try {
      const response = await userApi.markAllNotificationsRead();
      if (response.success) {
        setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })));
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleNotificationClick = async (item) => {
    if (item.unread && item.id && !String(item.id).startsWith('fallback-')) {
      try {
        await userApi.markNotificationRead(item.id);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    setNotifications((prev) =>
      prev.map((entry) => (entry.id === item.id ? { ...entry, unread: false } : entry))
    );

    if (item.actionUrl) {
      navigate(item.actionUrl);
      setNotificationMenuOpen(false);
    }
  };

  const handleSavePost = async (post) => {
    if (!guardToolAction({
      navigate,
      requiredPlan: 'trial',
      source: 'social-media-save',
      actionLabel: 'save social media posts',
      toolName: 'Social Media Generator',
    })) {
      return;
    }

    try {
      await toolsApi.saveSocialPosts({
        userId: user?._id,
        posts: [post],
        savedAt: new Date().toISOString()
      });
      notify.success('Post saved', 'The post was saved successfully.');
    } catch (error) {
      console.error('Save error:', error);
      if (handleToolActionError(error, navigate)) {
        return;
      }
      setError('Failed to save post. Please try again.');
    }
  };

  // Mock data generator (fallback)
  const generateMockPosts = (count, premium, contentType, platforms) => {
    const posts = [];
    const copyOptions = [
      "🚀 Achieve peak performance with our new Enterprise Analytics Suite! See real-time data flow and make decisions faster than ever.",
      "💡 How We Boosted Client ROI by 350% in 90 Days. It starts with structured data—find out how on our latest blog.",
      "✨ Stop guessing, start growing! Our AI takes the guesswork out of content creation.",
      "📈 The secret to viral content? Authenticity + Consistency + AI-powered insights.",
      "🔥 Just launched: Our new AI content suite that generates 100x more engaging posts."
    ];
    
    const hashtagsByPlatform = {
      instagram: ['#Instagram', '#Content', '#SocialMedia', '#Marketing', '#Digital'],
      twitter: ['#Twitter', '#SocialMedia', '#Marketing', '#Tech', '#Business'],
      linkedin: ['#LinkedIn', '#Professional', '#Business', '#Networking', '#Career'],
      facebook: ['#Facebook', '#Social', '#Community', '#Engagement', '#Content'],
      tiktok: ['#TikTok', '#Viral', '#Trending', '#Content', '#FYP']
    };

    for (let i = 0; i < count; i++) {
      const platform = platforms[i % platforms.length] || PLATFORMS[0];
      const hashtags = hashtagsByPlatform[platform.id] || ['#SocialMedia', '#AI', '#Content'];
      
      posts.push({
        id: `${Date.now()}-${i}`,
        platform: platform.name,
        contentType: contentType,
        copy: copyOptions[i % copyOptions.length],
        hashtags: [...hashtags, `#${formData.niche || 'Tech'}`],
        imageUrl: `https://placehold.co/600x400/667eea/ffffff?text=${contentType}+${i+1}`,
        isPremium: premium,
        generatedAt: new Date().toISOString()
      });
    }
    
    return posts;
  };

  // Render
  if (!isAuthenticated) {
    return (
      <div className="auth-required">
        <h2>Authentication Required</h2>
        <p>Please login to access the Social Media Generator</p>
        <button onClick={() => navigate('/login')}>Login</button>
      </div>
    );
  }

  return (
    <div className="social-media-generator">
      <section id="smg-overview" className="smg-dashboard-header">
        <div className="smg-dashboard-topbar">
          <button type="button" className="smg-brand-lockup" onClick={() => navigate('/dashboard')}>
            <span className="smg-brand-icon is-logo">
              <img src="/logo.svg" alt="SocialGenius logo" className="smg-brand-logo" />
            </span>
            <span className="smg-brand-copy">
              <strong>SocialGenius</strong>
              <small>AI-Powered Social Media Automation</small>
            </span>
          </button>

          <nav className="smg-dashboard-nav" aria-label="Social Media Generator sections">
            {HEADER_NAV_ITEMS.map((item) => (
              <button
                key={item.target || item.action}
                type="button"
                className="smg-dashboard-nav-link"
                onClick={() => {
                  if (item.action === 'open-tools') {
                    navigate('/tools');
                    return;
                  }
                  scrollToSection(item.target);
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="smg-dashboard-actions">
            <div className="smg-notification-wrap" ref={notificationMenuRef}>
              <button
                type="button"
                className="smg-header-icon-btn"
                aria-label="Notifications"
                aria-expanded={notificationMenuOpen}
                onClick={() => {
                  const nextState = !notificationMenuOpen;
                  setNotificationMenuOpen(nextState);
                  if (nextState) {
                    loadNotifications(true);
                  }
                }}
              >
                <HeaderIcon name="bell" />
                {unreadNotifications > 0 && (
                  <span className="smg-notification-badge">{unreadNotifications}</span>
                )}
              </button>

              <div className={`smg-notification-dropdown ${notificationMenuOpen ? 'open' : ''}`}>
                <div className="smg-notification-dropdown-header" aria-busy={notificationsLoading}>
                  <h3>Notifications</h3>
                  <button
                    type="button"
                    className="smg-mark-all-btn"
                    onClick={handleMarkAllNotificationsRead}
                  >
                    Mark all as read
                  </button>
                </div>

                <div className="smg-notification-list">
                  {notifications.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`smg-notification-item ${item.unread ? 'unread' : ''}`}
                      onClick={() => handleNotificationClick(item)}
                    >
                      <span className={`smg-notification-icon tone-${item.tone}`} aria-hidden="true">
                        {item.tone === 'green' ? '✓' : item.tone === 'purple' ? '✦' : item.tone === 'orange' ? '⚡' : '🔔'}
                      </span>
                      <div className="smg-notification-copy">
                        <strong>{item.title}</strong>
                        <p>{item.message}</p>
                        <span>{item.time}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="smg-notification-dropdown-footer">
                  <button
                    type="button"
                    className="smg-notification-footer-btn"
                    onClick={() => {
                      openModal('settings');
                      setNotificationMenuOpen(false);
                    }}
                  >
                    Notification settings
                  </button>
                </div>
              </div>
            </div>

            <div ref={userMenuRef}>
            <button
              type="button"
              className={`smg-profile-pill ${userMenuOpen ? 'is-open' : ''}`}
              onClick={() => setUserMenuOpen((prev) => !prev)}
              aria-expanded={userMenuOpen}
              aria-haspopup="menu"
            >
              <span className="smg-profile-pill-avatar">
                {displayAvatar ? (
                  <img src={displayAvatar} alt="Profile" className="smg-profile-pill-avatar-img" />
                ) : (
                  firstName.charAt(0).toUpperCase()
                )}
              </span>
              <span className="smg-profile-pill-label">Profile</span>
              <HeaderIcon name="chevron-down" className="smg-profile-pill-caret" />
            </button>

            <div className={`smg-user-dropdown ${userMenuOpen ? 'open' : ''}`} role="menu">
              <div className="smg-user-dropdown-header">
                <div className="smg-dropdown-avatar">
                  {displayAvatar ? (
                    <img src={displayAvatar} alt="Profile" className="smg-dropdown-avatar-img" />
                  ) : (
                    firstName.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="smg-dropdown-profile-info">
                  <div className="smg-dropdown-profile-name">{user?.name || userData.userName}</div>
                  <div className="smg-dropdown-profile-email">{user?.email || userData.userEmail}</div>
                  <span className="smg-plan-pill">{currentPlan}</span>
                </div>
              </div>

              <button
                type="button"
                className="smg-dropdown-item"
                onClick={() => {
                  openModal('profile');
                  setUserMenuOpen(false);
                }}
              >
                <span className="smg-dropdown-item-icon" aria-hidden="true"><HeaderIcon name="user" /></span>
                <span>View Profile</span>
              </button>

              <button
                type="button"
                className="smg-dropdown-item"
                onClick={() => {
                  openModal('settings');
                  setUserMenuOpen(false);
                }}
              >
                <span className="smg-dropdown-item-icon" aria-hidden="true"><HeaderIcon name="settings" /></span>
                <span>Quick Settings</span>
              </button>

              <button
                type="button"
                className="smg-dropdown-item"
                onClick={() => {
                  openModal('subscription');
                  setUserMenuOpen(false);
                }}
              >
                <span className="smg-dropdown-item-icon" aria-hidden="true"><HeaderIcon name="crown" /></span>
                <span>Subscription Plans</span>
              </button>

              <div className="smg-dropdown-divider"></div>

              <button
                type="button"
                className="smg-dropdown-item logout"
                onClick={() => {
                  logout?.();
                  setUserMenuOpen(false);
                  navigate('/login');
                }}
              >
                <span className="smg-dropdown-item-icon" aria-hidden="true"><HeaderIcon name="logout" /></span>
                <span>Logout</span>
              </button>
            </div>
            </div>
          </div>
        </div>

        <div className="smg-trial-banner">
          <div className="smg-trial-banner-copy">
            <div className="smg-trial-banner-title">
              <HeaderIcon name="crown" />
              <span>{hasPremiumAccess ? 'Premium Test Access Active' : 'Trial Mode Active'}</span>
            </div>
            <p>
              {hasPremiumAccess
                ? 'You can test premium social creation, scheduling, and posting flows before restoring live plan limits.'
                : 'Upgrade to Premium for unlimited AI generations and auto-posting.'}
            </p>
          </div>
          <button
            type="button"
            className="smg-trial-banner-btn"
            onClick={() =>
              hasPremiumAccess
                ? openModal('subscription')
                : openPaymentGateway({ planId: 'premium', planLabel: 'Premium', userEmail: user?.email || '' })
            }
          >
            {hasPremiumAccess ? 'Manage Access' : 'Upgrade Now'}
          </button>
        </div>
      </section>

      {/* Error Display */}
      {error && (
        <div className="error-banner">
          <HeaderIcon name="alert" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="error-close">
            <HeaderIcon name="close" />
          </button>
        </div>
      )}

      <main className="main-container">
        <section className="smg-stats-strip">
          <article className="smg-stat-surface is-blue">
            <div>
              <p className="smg-stat-label">Connected Accounts</p>
              <h3 className="smg-stat-value">{connectedCount}</h3>
            </div>
            <span className="smg-stat-icon" aria-hidden="true"><HeaderIcon name="link" /></span>
          </article>
          <article className="smg-stat-surface is-green">
            <div>
              <p className="smg-stat-label">Posts This Month</p>
              <h3 className="smg-stat-value">{userData.totalPosts || userData.postsCount}</h3>
            </div>
            <span className="smg-stat-icon" aria-hidden="true"><HeaderIcon name="chart" /></span>
          </article>
          <article className="smg-stat-surface is-purple">
            <div>
              <p className="smg-stat-label">Engagement Rate</p>
              <h3 className="smg-stat-value">{`${stats.engagementRate || userData.engagementRate}%`}</h3>
            </div>
            <span className="smg-stat-icon" aria-hidden="true"><HeaderIcon name="heart" /></span>
          </article>
          <article className="smg-stat-surface is-orange">
            <div>
              <p className="smg-stat-label">Scheduled Posts</p>
              <h3 className="smg-stat-value">{userData.scheduledCount}</h3>
            </div>
            <span className="smg-stat-icon" aria-hidden="true"><HeaderIcon name="calendar" /></span>
          </article>
        </section>

        <div className="content-grid">
          {/* Left Column */}
          <div className="left-column">
            {/* Social Connections */}
            <section id="features" data-section="features" className="section-card">
              <div className="section-header">
                <h2 className="section-title">Connected Social Accounts</h2>
                <div className="section-subtitle">
                  {connectedCount} of {PLATFORMS.length} connected
                  {!hasPremiumAccess && ' (Upgrade for more)'}
                </div>
              </div>
              
              <div className="connections-grid">
                {connectedAccounts.map((account) => (
                  <ConnectionCard
                    key={account.id}
                    platform={account}
                    isConnected={account.isConnected}
                    isPremium={hasPremiumAccess}
                    isBasic={isBasic}
                    onToggle={() => handleToggleAccount(account.id)}
                    onReconnect={() => handleToggleAccount(account.id)}
                  />
                ))}
              </div>

              {!hasPremiumAccess && (
                <div className="upgrade-banner">
                  <div className="upgrade-content">
                    <HeaderIcon name="crown" className="upgrade-icon" />
                    <div>
                      <p className="upgrade-title">Upgrade to Premium</p>
                      <p className="upgrade-text">
                        Connect all {PLATFORMS.length} platforms and unlock unlimited posts
                      </p>
                    </div>
                    <button
                      onClick={() => openPaymentGateway({ planId: 'premium', planLabel: 'Premium', userEmail: user?.email || '' })}
                      className="upgrade-btn"
                    >
                      Upgrade Now
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Content Generator Form */}
            <section id="how-it-works" data-section="how-it-works" className="section-card">
              <div className="section-header">
                <h2 className="section-title">AI Content Generator</h2>
                <div className="plan-badge">
                  {userData.plan.toUpperCase()} PLAN
                  {hasPremiumAccess ? ' - Premium test access enabled' : ` - ${maxPosts} POSTS MAX`}
                </div>
              </div>

              <div className="form-container">
                {/* Niche Selection */}
                <div className="form-group">
                  <label className="form-label">Niche / Industry *</label>
                  <div className="form-row">
                    <select
                      value={formData.niche}
                      onChange={(e) => handleFormChange('niche', e.target.value)}
                      className="form-select"
                    >
                      {NICHE_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    
                    {formData.niche === 'custom' && (
                      <input
                        type="text"
                        value={formData.customNiche}
                        onChange={(e) => handleFormChange('customNiche', e.target.value)}
                        placeholder="Describe your niche..."
                        className="form-input"
                        required
                      />
                    )}
                  </div>
                </div>

                {/* Content Type Selection */}
                <div className="form-group">
                  <label className="form-label">Content Type</label>
                  <div className="content-type-grid">
                    {CONTENT_TYPES.map((contentType) => (
                      <ContentTypeOption
                        key={contentType.id}
                        type={contentType}
                        isSelected={formData.contentType === contentType.id}
                        isDisabled={!connectedAccounts.some(acc => 
                          acc.isConnected && contentType.supports.includes(acc.id)
                        )}
                        onChange={() => handleContentTypeChange(contentType.id)}
                      />
                    ))}
                  </div>
                  <div className="form-hint">
                    Supported platforms: {CONTENT_TYPES.find(ct => ct.id === formData.contentType)?.supports.join(', ')}
                  </div>
                </div>

                {/* Tone & Voice */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Brand Voice</label>
                    <select
                      value={formData.brandVoice}
                      onChange={(e) => handleFormChange('brandVoice', e.target.value)}
                      className="form-select"
                    >
                      {TONE_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Tone</label>
                    <select
                      value={formData.tone}
                      onChange={(e) => handleFormChange('tone', e.target.value)}
                      className="form-select"
                    >
                      {TONE_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Target Audience */}
                <div className="form-group">
                  <label className="form-label">
                    Target Audience Interests ({formData.interests.length} selected)
                  </label>
                  <div className="interests-grid">
                    {INTERESTS.map((interest) => (
                      <InterestCheckbox
                        key={interest}
                        interest={interest}
                        isChecked={formData.interests.includes(interest)}
                        onChange={() => handleInterestToggle(interest)}
                      />
                    ))}
                  </div>
                </div>

                {/* Post Quantity */}
                <div className="form-group">
                  <label className="form-label">
                    Number of Posts: <span className="quantity-value">{formData.postQuantity}</span>
                    <span className="quantity-max"> / {maxPosts} max</span>
                  </label>
                  <div className="quantity-control">
                    <input
                      type="range"
                      min="1"
                      max={maxPosts}
                      value={formData.postQuantity}
                      onChange={(e) => handleFormChange('postQuantity', e.target.value)}
                      className="quantity-slider"
                    />
                    <div className="quantity-labels">
                      <span>1</span>
                      <span>{Math.floor(maxPosts / 2)}</span>
                      <span>{maxPosts}</span>
                    </div>
                  </div>
                </div>

                {/* Additional Options */}
                <div className="form-options">
                  <label className="option-toggle">
                    <input
                      type="checkbox"
                      checked={formData.includeHashtags}
                      onChange={(e) => handleFormChange('includeHashtags', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="option-label">Include Hashtags</span>
                  </label>
                  
                  <label className="option-toggle">
                    <input
                      type="checkbox"
                      checked={formData.includeEmojis}
                      onChange={(e) => handleFormChange('includeEmojis', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="option-label">Include Emojis</span>
                  </label>
                  
                  <label className="option-toggle">
                    <input
                      type="checkbox"
                      checked={formData.autoPost}
                      onChange={(e) => handleFormChange('autoPost', e.target.checked)}
                      disabled={!hasPremiumAccess}
                    />
                    <span className="toggle-slider"></span>
                    <span className="option-label">
                      Auto-Post {!hasPremiumAccess && '(Premium)'}
                    </span>
                  </label>
                </div>

                {/* Keywords */}
                <div className="form-group">
                  <label className="form-label">Keywords (optional)</label>
                  <input
                    type="text"
                    value={formData.keywords}
                    onChange={(e) => handleFormChange('keywords', e.target.value)}
                    placeholder="e.g., AI, marketing, social media, content creation"
                    className="form-input"
                  />
                  <div className="form-hint">Separate with commas</div>
                </div>

                {/* Generate Button */}
                <div className="form-actions">
                  <button
                    onClick={handleGenerateContent}
                    disabled={isLoading || connectedCount === 0}
                    className={`generate-btn ${isLoading ? 'loading' : ''}`}
                  >
                    {isLoading ? (
                      <>
                        <HeaderIcon name="spinner" />
                        Generating with AI...
                      </>
                    ) : (
                      <>
                        <HeaderIcon name="robot" />
                        Generate Content & Images
                      </>
                    )}
                  </button>
                  
                  <div className="generate-info">
                    {hasPremiumAccess ? (
                      <span className="text-green-600">
                        <HeaderIcon name="infinity" /> Unlimited generation
                      </span>
                    ) : (
                      <span className="text-amber-600">
                        <HeaderIcon name="clock" /> {maxPosts - formData.postQuantity} posts remaining
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Generated Content */}
              {generatedPosts.length > 0 && (
                <section id="smg-generated-posts" className="section-card">
                <div className="section-header">
                  <h2 className="section-title">
                    Generated Content ({generatedPosts.length} posts)
                  </h2>
                  <div className="content-type-indicator">
                    <HeaderIcon name={CONTENT_TYPES.find(ct => ct.id === formData.contentType)?.icon} />
                    {formData.contentType.charAt(0).toUpperCase() + formData.contentType.slice(1)}
                  </div>
                </div>
                
                <div className="posts-grid">
                  {generatedPosts.map((post) => (
                    <GeneratedPostCard 
                      key={post.id} 
                      post={post}
                      onCopy={() => handleCopyPost(post)}
                      onSchedule={() => handleSchedulePost(post)}
                      onSave={() => handleSavePost(post)}
                      isPremium={hasPremiumAccess}
                    />
                  ))}
                </div>
                
                <div className="posts-actions">
                  <button
                    onClick={() => {
                      const allText = generatedPosts.map(p => 
                        `${p.copy}\n\nHashtags: ${p.hashtags.join(' ')}\n\n`
                      ).join('---\n\n');
                      navigator.clipboard.writeText(allText);
                      notify.success('Copied all posts', 'All generated posts were copied to your clipboard.');
                    }}
                    className="action-btn secondary"
                  >
                    <HeaderIcon name="copy" /> Copy All
                  </button>
                  <button
                    onClick={() => setGeneratedPosts([])}
                    className="action-btn secondary"
                  >
                    <HeaderIcon name="trash" /> Clear All
                  </button>
                </div>
              </section>
            )}
          </div>

          {/* Right Column */}
          <div className="right-column">
            {/* Quick Actions */}
              <section id="smg-activity" className="section-card">
              <h2 className="section-title">Quick Actions</h2>
              <div className="quick-actions-grid">
                <button
                  onClick={() => openModal('quickPost')}
                  className="quick-action-btn primary"
                >
                  <HeaderIcon name="bolt" />
                  <span>Quick Post</span>
                </button>
                <button
                  onClick={() => openModal('analytics')}
                  className="quick-action-btn success"
                >
                  <HeaderIcon name="chart" />
                  <span>Analytics</span>
                </button>
                <button
                  onClick={() => openModal('schedule')}
                  className="quick-action-btn warning"
                >
                  <HeaderIcon name="plus" />
                  <span>Schedule</span>
                </button>
                <button
                  onClick={() => navigate('/tools/content-idea')}
                  className="quick-action-btn info"
                >
                  <HeaderIcon name="lightbulb" />
                  <span>Get Ideas</span>
                </button>
              </div>
            </section>

            {/* Custom Post Creator */}
            <section className="section-card">
              <h2 className="section-title">Create Custom Post</h2>
              <CustomPostCard 
                connectedAccounts={connectedAccounts.filter(acc => acc.isConnected)}
                onPostSuccess={() => {
                  setUserData(prev => ({ ...prev, postsCount: prev.postsCount + 1 }));
                  loadGeneratedPosts();
                }}
                isPremium={hasPremiumAccess}
              />
            </section>

            {/* Recent Activity */}
            <section className="section-card">
              <h2 className="section-title">Recent Activity</h2>
              <ActivityFeed 
                userId={user?._id}
                toolName="social-media"
              />
            </section>

            <section className="section-card">
              <div className="schedule-queue-header">
                <div>
                  <h2 className="section-title">Publishing Queue</h2>
                  <p className="schedule-queue-subtitle">Track queued, failed, and published scheduled posts in one place.</p>
                </div>
                <button
                  type="button"
                  className="schedule-queue-refresh"
                  onClick={() => loadScheduledPosts(true)}
                  disabled={scheduledPostsLoading}
                >
                  <HeaderIcon name="sync" className={scheduledPostsLoading ? 'fa-spin' : ''} />
                  Refresh
                </button>
              </div>

              {scheduledPosts.length === 0 ? (
                <div className="schedule-empty-state">
                  <HeaderIcon name="calendar" />
                  <h3>No scheduled posts yet</h3>
                  <p>Your queue will appear here once you schedule drafts for live publishing.</p>
                </div>
              ) : (
                <div className="schedule-queue-list">
                  {scheduledPosts
                    .slice()
                    .sort((a, b) => new Date(b.createdAt || b.scheduledAt) - new Date(a.createdAt || a.scheduledAt))
                    .map((item) => {
                      const statusMeta = getScheduledStatusMeta(item.status);
                      const platform = PLATFORMS.find((entry) => entry.apiName === item.platform || entry.id === item.platform);
                      return (
                        <article key={item.jobId} className="schedule-queue-item">
                          <div className="schedule-queue-top">
                            <div className="schedule-queue-platform">
                              <div className="schedule-queue-icon">
                                <HeaderIcon name={platform?.id || 'share'} />
                              </div>
                              <div>
                                <h3>{platform?.name || item.platform}</h3>
                                <p>{formatScheduledTime(item.scheduledAt)}</p>
                              </div>
                            </div>
                            <span className={`schedule-status-pill ${statusMeta.tone}`}>{statusMeta.label}</span>
                          </div>

                          <p className="schedule-queue-content">{item.content}</p>

                          <div className="schedule-queue-meta">
                            <span><strong>Attempts:</strong> {item.attempts || 0}</span>
                            <span><strong>Type:</strong> {item.contentType || 'social-post'}</span>
                          </div>

                          {item.errorMessage ? (
                            <div className="schedule-queue-error">
                              <HeaderIcon name="spark" />
                              <span>{item.errorMessage}</span>
                            </div>
                          ) : null}

                          <div className="schedule-queue-actions">
                            {item.status === 'failed' ? (
                              <button
                                type="button"
                                className="schedule-queue-btn primary"
                                onClick={() => handleRetryScheduledPost(item.jobId)}
                              >
                                <HeaderIcon name="sync" />
                                Retry
                              </button>
                            ) : null}

                            {['pending', 'failed'].includes(item.status) ? (
                              <button
                                type="button"
                                className="schedule-queue-btn secondary"
                                onClick={() => handleDeleteScheduledPost(item.jobId)}
                              >
                                <HeaderIcon name="trash" />
                                Remove
                              </button>
                            ) : null}
                          </div>
                        </article>
                      );
                    })}
                </div>
              )}
            </section>

            {/* Tips & Best Practices */}
            <section id="best-practices" data-section="best-practices" className="section-card tips-section">
              <h2 className="section-title">
                <HeaderIcon name="lightbulb" className="section-title-icon" /> Strategic Best Practices
              </h2>
              <ul className="tips-list">
                <li>
                  <HeaderIcon name="hashtag" className="tip-icon" />
                  <strong>Strategic Hashtags:</strong> Use 3-5 niche-specific tags to balance reach and engagement.
                </li>
                <li>
                  <HeaderIcon name="clock" className="tip-icon" />
                  <strong>Optimal Timing:</strong> Post mid-morning (9 AM - 12 PM) for peak cross-platform traction.
                </li>
                <li>
                  <HeaderIcon name="video" className="tip-icon" />
                  <strong>Visual Storytelling:</strong> Motion graphics command 3x higher retention than static imagery.
                </li>
                <li>
                  <HeaderIcon name="comments" className="tip-icon" />
                  <strong>Audience Engagement:</strong> Incorporate open-ended questions to drive meaningful community growth.
                </li>
                <li>
                  <HeaderIcon name="chart" className="tip-icon" />
                  <strong>Data-Driven Strategy:</strong> Review analytics weekly to refine your core content pillars.
                </li>
                <li>
                  <HeaderIcon name="shield" className="tip-icon" />
                  <strong>Brand Consistency:</strong> Maintain a unified voice across platforms to build long-term trust.
                </li>
              </ul>
            </section>

            <section className="tool-resource-section">
              <h2>Advanced Features</h2>
              <div className="tool-resource-grid">
                <div className="tool-resource-card">
                  <div className="tool-resource-icon"><HeaderIcon name="globe" /></div>
                  <h3>Multi-Platform Orchestration</h3>
                  <p>Coordinate high-impact content across Instagram, Facebook, LinkedIn, X, TikTok, YouTube, and Pinterest from a single, unified interface.</p>
                </div>
                <div className="tool-resource-card">
                  <div className="tool-resource-icon"><HeaderIcon name="layers" /></div>
                  <h3>Context-Aware Optimization</h3>
                  <p>Leverage AI to generate platform-specific formats—including Reels, Shorts, and Carousel slides—tailored to audience expectations.</p>
                </div>
                <div className="tool-resource-card">
                  <div className="tool-resource-icon"><HeaderIcon name="calendar" /></div>
                  <h3>Automated Publishing</h3>
                  <p>Transition from ideation to execution instantly. Queue approved drafts for automated publishing across your global social networks.</p>
                </div>
                <div className="tool-resource-card">
                  <div className="tool-resource-icon"><HeaderIcon name="chart" /></div>
                  <h3>Strategic Analytics</h3>
                  <p>Incorporate engagement insights directly into your workflow, ensuring every post is optimized for reach, comments, and conversion.</p>
                </div>
              </div>
            </section>

            <section className="tool-resource-section">
              <h2>Execution Workflow</h2>
              <div className="tool-resource-grid">
                <div className="tool-resource-card">
                  <div className="tool-resource-icon"><HeaderIcon name="bullseye" /></div>
                  <h3>Define Strategy</h3>
                  <p>Configure your target platforms, niche, and content goals to provide the AI with deep context for high-relevance output.</p>
                </div>
                <div className="tool-resource-card">
                  <div className="tool-resource-icon"><HeaderIcon name="spark" /></div>
                  <h3>Generate Content</h3>
                  <p>The AI creates a diverse batch of post options with tailored copy and strategic hashtags, giving you multiple angles to choose from.</p>
                </div>
                <div className="tool-resource-card">
                  <div className="tool-resource-icon"><HeaderIcon name="sliders" /></div>
                  <h3>Review & Refine</h3>
                  <p>Polished drafts are presented for final review. Select the strongest hooks and adjust the voice to perfectly match your brand identity.</p>
                </div>
                <div className="tool-resource-card">
                  <div className="tool-resource-icon"><HeaderIcon name="send" /></div>
                  <h3>Deploy & Publish</h3>
                  <p>Once finalized, deploy your content directly or schedule it for future publishing to maintain a consistent digital presence.</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Modals */}
      <ProfileModal
        isOpen={activeModal === 'profile'}
        onClose={closeModal}
        user={userData}
        onUpdateProfile={(updated) => {
          setUserData(prev => ({ ...prev, ...updated }));
          closeModal();
        }}
      />

      <SubscriptionModal
        isOpen={activeModal === 'subscription'}
        onClose={closeModal}
        currentPlan={userData.plan}
        onUpgrade={(newPlan) => {
          closeModal();
          openPaymentGateway({
            planId: newPlan,
            planLabel: newPlan.charAt(0).toUpperCase() + newPlan.slice(1),
            userEmail: user?.email || '',
          });
        }}
      />

      <SettingsModal
        isOpen={activeModal === 'settings'}
        onClose={closeModal}
        user={userData}
        onSaveSettings={(settings) => {
          const content = settings?.content || {};
          const account = settings?.account || {};

          setFormData((prev) => ({
            ...prev,
            niche: content.defaultNiche || prev.niche,
            customNiche: content.customNiche || prev.customNiche,
            contentType: content.defaultContentType || prev.contentType,
            brandVoice: content.defaultBrandVoice || prev.brandVoice,
            tone: content.defaultTone || prev.tone,
            includeHashtags: typeof content.includeHashtags === 'boolean' ? content.includeHashtags : prev.includeHashtags,
            includeEmojis: typeof content.includeEmojis === 'boolean' ? content.includeEmojis : prev.includeEmojis,
            callToAction: content.callToAction || prev.callToAction,
            keywords: content.defaultKeywords || prev.keywords,
            language: content.defaultLanguage || prev.language
          }));

          setUserData((prev) => ({
            ...prev,
            userName: account.displayName || prev.userName,
            company: account.company || prev.company,
            avatar: account.profilePicture || prev.avatar
          }));

          notify.success('Settings saved', 'Your social media generator defaults were updated.');
          closeModal();
        }}
      />

      <QuickPostModal
        isOpen={activeModal === 'quickPost'}
        onClose={closeModal}
        connectedAccounts={connectedAccounts.filter(acc => acc.isConnected)}
        onPostSuccess={(post) => {
          setUserData(prev => ({
            ...prev,
            postsCount: prev.postsCount + 1,
            totalPosts: (prev.totalPosts || prev.postsCount || 0) + 1,
            scheduledCount: post?.isScheduled ? prev.scheduledCount + 1 : prev.scheduledCount
          }));
          if (post) {
            setGeneratedPosts((prev) => [
              {
                id: post.id,
                platform: post.platforms?.[0] || 'Multi-platform',
                contentType: post.template || 'quick-post',
                copy: post.content,
                hashtags: [],
                imageUrl: '',
                generatedAt: post.createdAt,
                isPremium: hasPremiumAccess
              },
              ...prev
            ]);
          }
          closeModal();
        }}
      />

      <PremiumWallModal
        isOpen={activeModal === 'premiumWall'}
        onClose={closeModal}
        message={modalData.message}
        onUpgrade={() => {
          closeModal();
          openPaymentGateway({ planId: 'premium', planLabel: 'Premium', userEmail: user?.email || '' });
        }}
      />

      <ScheduleModal
        isOpen={activeModal === 'schedule'}
        onClose={closeModal}
        post={modalData.post}
        connectedAccounts={connectedAccounts.filter(acc => acc.isConnected)}
        onScheduleSuccess={handleScheduleSuccess}
      />

      <AnalyticsModal
        isOpen={activeModal === 'analytics'}
        onClose={closeModal}
        userId={user?._id}
        toolName="social-media"
      />
    </div>
  );
};

export default SocialMediaGenerator;
