import React, { useEffect, useMemo, useState } from 'react';
import RealUserHeader from '../component/UserHeader';
import RealStatCard from '../component/StatCard';
import RealConnectionCard from '../component/ConnectionCard';
import RealGeneratedPostCard from '../component/GeneratedPostCard';
import RealContentTypeOption from '../component/ContentTypeOption';
import RealInterestCheckbox from '../component/InterestCheckbox';
import RealCustomPostCard from '../component/CustomPostCard';
import RealActivityFeed from '../component/ActivityFeed';

const QUICK_POST_EVENT = 'social-media:open-quick-post';

const contentTypeIcons = {
  normal: '🖼️',
  video: '🎬',
  carousel: '🧩',
  stories: '📲',
  reels: '🎥'
};

const statIcon = (iconClass) => {
  if (!iconClass) return '📊';

  const lookup = {
    'fa-link': '🔗',
    'fa-chart-bar': '📈',
    'fa-heart': '❤️',
    'fa-calendar': '🗓️'
  };

  return lookup[iconClass] || '📊';
};

const mapBorderColor = (borderColor) => {
  const palette = {
    'blue-500': '#3B82F6',
    'green-500': '#10B981',
    'purple-500': '#8B5CF6',
    'orange-500': '#F59E0B',
    'red-500': '#EF4444'
  };

  return palette[borderColor] || '#3B82F6';
};

const formatTrend = (trend) => {
  if (trend === undefined || trend === null || trend === '') return undefined;
  if (typeof trend === 'number') {
    const sign = trend > 0 ? '+' : '';
    return `${sign}${trend}%`;
  }
  return trend;
};

export const UserHeader = ({
  user,
  onProfileClick,
  onSubscriptionClick,
  onSettingsClick
}) => (
  <RealUserHeader
    user={user}
    onOpenProfile={onProfileClick}
    onOpenSubscription={onSubscriptionClick}
    onOpenSettings={onSettingsClick}
  />
);

export const StatCard = ({
  title,
  label,
  value,
  icon,
  borderColor,
  trend,
  onClick
}) => (
  <RealStatCard
    label={label || title}
    value={value}
    icon={statIcon(icon)}
    color={mapBorderColor(borderColor)}
    change={formatTrend(trend)}
    trend={
      typeof trend === 'number'
        ? trend > 0
          ? 'up'
          : trend < 0
            ? 'down'
            : 'neutral'
        : 'neutral'
    }
    onClick={onClick}
  />
);

export const ConnectionCard = ({
  platform,
  isConnected,
  onToggle,
  onReconnect
}) => (
  <RealConnectionCard
    platform={typeof platform === 'string' ? platform : platform?.id}
    isConnected={isConnected}
    accountName={platform?.accountName || platform?.name}
    accountHandle={platform?.accountHandle || platform?.handle}
    followers={platform?.followersCount || 0}
    lastSync={platform?.lastSync || platform?.updatedAt}
    onConnect={onToggle}
    onDisconnect={onToggle}
    onManage={onReconnect || onToggle}
    isPublishReady={platform?.isPublishReady}
    statusMessage={platform?.statusMessage}
  />
);

export const GeneratedPostCard = ({
  post,
  onCopy,
  onSchedule,
  onSave
}) => {
  const normalizedPost = {
    ...post,
    content: post?.content || post?.copy || '',
    hashtags: (post?.hashtags || []).map((tag) =>
      typeof tag === 'string' ? tag.replace(/^#/, '') : tag
    ),
    media: post?.media || (post?.imageUrl ? [{ type: 'image', url: post.imageUrl }] : [])
  };

  const platforms = useMemo(() => {
    if (Array.isArray(post?.platforms) && post.platforms.length > 0) {
      return post.platforms;
    }

    if (typeof post?.platform === 'string') {
      return [post.platform.toLowerCase().replace('/x', '').replace('x', 'twitter')];
    }

    return [];
  }, [post]);

  return (
    <RealGeneratedPostCard
      post={normalizedPost}
      platforms={platforms}
      onCopy={() => onCopy?.(post)}
      onSchedule={() => onSchedule?.(post)}
      onEdit={() => onSave?.(post)}
      onDelete={undefined}
    />
  );
};

export const ContentTypeOption = ({
  type,
  isSelected,
  isDisabled,
  onChange
}) => (
  <RealContentTypeOption
    type={typeof type === 'string' ? type : type?.id}
    icon={typeof type === 'object' ? contentTypeIcons[type?.id] : contentTypeIcons[type]}
    label={typeof type === 'object' ? type?.title : type}
    description={typeof type === 'object' ? type?.description : undefined}
    isSelected={isSelected}
    disabled={isDisabled}
    onClick={() => onChange?.()}
  />
);

export const InterestCheckbox = ({
  interest,
  isChecked,
  onChange
}) => (
  <RealInterestCheckbox
    interest={interest}
    label={interest?.charAt(0).toUpperCase() + interest?.slice(1)}
    isSelected={isChecked}
    onClick={() => onChange?.()}
  />
);

export const CustomPostCard = ({ connectedAccounts = [], isPremium, onPostSuccess }) => {
  const connectedCount = connectedAccounts.length;
  
  const [draft, setDraft] = useState({
    content:
      connectedCount > 0
        ? `Create and refine a custom post for ${connectedCount} connected platform${connectedCount > 1 ? 's' : ''}.`
        : 'Connect a platform to start creating polished custom posts and instant drafts.',
    hashtags: connectedAccounts.slice(0, 3).map((account) => account.id),
    media: []
  });

  return (
    <div>
      <RealCustomPostCard
        post={draft}
        onUpdate={setDraft}
        onDelete={() => setDraft({ content: '', hashtags: [], media: [] })}
        onPublish={() => window.dispatchEvent(new CustomEvent(QUICK_POST_EVENT))}
      />
      <div className="smg-custom-post-launcher">
        <p className="smg-custom-post-note">
          {isPremium
            ? 'Launch the Quick Post studio to add media, pick templates, and schedule polished posts.'
            : 'Quick Post testing is enabled so you can validate the full workflow before restoring premium gating.'}
        </p>
        <button
          type="button"
          className="action-btn primary"
          onClick={() => window.dispatchEvent(new CustomEvent(QUICK_POST_EVENT))}
        >
          <i className="fas fa-pen-nib"></i> Open Quick Post Studio
        </button>
      </div>
    </div>
  );
};

export const ActivityFeed = ({ toolName }) => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const savedSettings = localStorage.getItem('socialMediaGeneratorSettings');
    const generatorHints = localStorage.getItem(`${toolName || 'social-media'}-activity`);

    const nextActivities = [];

    if (savedSettings) {
      nextActivities.push({
        id: 'settings-updated',
        type: 'settings_updated',
        action: 'Updated generator settings',
        target: 'Preferences saved locally',
        timestamp: new Date().toISOString(),
        status: 'success'
      });
    }

    if (generatorHints) {
      nextActivities.push({
        id: 'activity-cache',
        type: 'post_created',
        action: 'Generated content recently',
        target: 'Recovered from local activity cache',
        timestamp: new Date().toISOString(),
        status: 'success'
      });
    }

    nextActivities.push(
      {
        id: 'quick-post-ready',
        type: 'post_created',
        action: 'Quick Post studio is ready',
        target: 'Templates, media, and predictions enabled',
        timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        status: 'success'
      },
      {
        id: 'generator-ready',
        type: 'post_scheduled',
        action: 'Generator workspace prepared',
        target: 'Premium test access enabled',
        timestamp: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
        status: 'pending'
      }
    );

    setActivities(nextActivities);
  }, [toolName]);

  return <RealActivityFeed activities={activities} maxItems={6} />;
};
