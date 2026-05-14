import React, { useEffect, useMemo, useState } from 'react';
import './SettingsModal.css';

const SETTINGS_STORAGE_KEY = 'socialMediaGeneratorSettings';

const buildDefaultSettings = (user) => ({
  account: {
    displayName: user?.userName || 'Marketing Pro',
    defaultAuthorName: user?.userName || 'Marketing Pro',
    company: user?.company || 'SocialGenius',
    bio: user?.bio || '',
    profilePicture: user?.avatar || '',
    securitySummary: {
      twoFactorEnabled: false,
      loginAlerts: true,
      connectedDeviceLabel: 'Chrome on Windows'
    }
  },
  content: {
    defaultNiche: 'technology',
    customNiche: '',
    defaultContentType: 'normal',
    defaultBrandVoice: 'professional',
    defaultTone: 'professional',
    defaultLanguage: 'english',
    defaultKeywords: '',
    includeHashtags: true,
    includeEmojis: true,
    callToAction: 'learn-more'
  },
  posting: {
    activeDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    bestTimes: ['09:00', '12:00', '18:00'],
    defaultScheduleMode: 'review-first',
    autoPublishConnectedOnly: true,
    queueReviewNotifications: true,
    allowWeekendPosting: false
  },
  billing: {
    currentPlan: user?.plan || 'trial',
    billingCycle: 'monthly',
    autoRenew: false,
    cardBrand: 'Visa',
    cardLast4: '4242',
    invoices: [
      { id: 'INV-2401', label: 'January 2026', amount: '$49.00', status: 'Paid' },
      { id: 'INV-2312', label: 'December 2025', amount: '$49.00', status: 'Paid' }
    ]
  },
  general: {
    theme: 'light',
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: 'MM/DD/YYYY',
    notifications: {
      email: true,
      push: true,
      weeklyReport: true,
      postPublished: true,
      loginNotifications: true
    }
  }
});

const PLAN_FEATURES = {
  trial: ['1 testing workflow', 'Core generator access', 'Manual publishing'],
  basic: ['3 connected accounts', 'Batch post generation', 'Standard support'],
  premium: ['Unlimited accounts', 'AI generation', 'Advanced scheduling'],
  pro: ['Team collaboration', 'White-label controls', 'Priority support']
};

const CONTENT_NICHES = [
  { value: 'technology', label: 'Technology & SaaS' },
  { value: 'fashion', label: 'Fashion & Beauty' },
  { value: 'marketing', label: 'Marketing & Agency' },
  { value: 'education', label: 'Education & Coaching' },
  { value: 'health', label: 'Health & Fitness' },
  { value: 'food', label: 'Food & Beverage' },
  { value: 'travel', label: 'Travel & Hospitality' },
  { value: 'finance', label: 'Finance & Crypto' },
  { value: 'custom', label: 'Custom Niche' }
];

const CONTENT_TYPES = [
  { value: 'normal', label: 'Normal Content' },
  { value: 'video', label: 'Video Content' },
  { value: 'carousel', label: 'Carousel Posts' },
  { value: 'stories', label: 'Stories' },
  { value: 'reels', label: 'Reels / Shorts' }
];

const VOICE_OPTIONS = ['professional', 'casual', 'authoritative', 'humorous'];
const TONE_OPTIONS = ['professional', 'casual', 'humorous', 'inspirational', 'urgent', 'educational'];
const POSTING_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const QUICK_TIMES = ['09:00', '12:00', '15:00', '18:00', '20:00'];

const SettingsModal = ({ isOpen, onClose, user, onSaveSettings }) => {
  const [activeTab, setActiveTab] = useState('account');
  const [settings, setSettings] = useState(buildDefaultSettings(user));
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const planLabel = useMemo(() => {
    const currentPlan = settings.billing.currentPlan || 'trial';
    return currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1);
  }, [settings.billing.currentPlan]);

  useEffect(() => {
    if (!isOpen) return;

    const defaults = buildDefaultSettings(user);
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({
          ...defaults,
          ...parsed,
          account: { ...defaults.account, ...(parsed.account || {}) },
          content: { ...defaults.content, ...(parsed.content || {}) },
          posting: { ...defaults.posting, ...(parsed.posting || {}) },
          billing: { ...defaults.billing, ...(parsed.billing || {}) },
          general: {
            ...defaults.general,
            ...(parsed.general || {}),
            notifications: {
              ...defaults.general.notifications,
              ...(parsed.general?.notifications || {})
            }
          }
        });
      } catch (error) {
        setSettings(defaults);
      }
    } else {
      setSettings(defaults);
    }

    setStatus({ type: '', message: '' });
    setActiveTab('account');
  }, [isOpen, user]);

  if (!isOpen) return null;

  const updateSection = (section, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const updateNestedSetting = (section, parentKey, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [parentKey]: {
          ...prev[section][parentKey],
          [key]: value
        }
      }
    }));
  };

  const togglePostingDay = (day) => {
    const activeDays = settings.posting.activeDays.includes(day)
      ? settings.posting.activeDays.filter((item) => item !== day)
      : [...settings.posting.activeDays, day];

    updateSection('posting', 'activeDays', activeDays);
  };

  const toggleSuggestedTime = (time) => {
    const currentTimes = settings.posting.bestTimes;
    const bestTimes = currentTimes.includes(time)
      ? currentTimes.filter((item) => item !== time)
      : [...currentTimes, time].slice(0, 4);

    updateSection('posting', 'bestTimes', bestTimes);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      updateSection('account', 'profilePicture', reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setStatus({ type: '', message: '' });

    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));

      if (onSaveSettings) {
        await onSaveSettings(settings);
      }

      setStatus({ type: 'success', message: 'Settings saved successfully.' });
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to save settings. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'account', icon: 'fas fa-user-circle', label: 'Account & Profile' },
    { id: 'content', icon: 'fas fa-pen-nib', label: 'Content Generation' },
    { id: 'posting', icon: 'fas fa-calendar-alt', label: 'Posting & Scheduling' },
    { id: 'billing', icon: 'fas fa-credit-card', label: 'Billing & Subscription' },
    { id: 'general', icon: 'fas fa-cog', label: 'General Settings' }
  ];

  return (
    <div className="modal-overlay settings-modal-overlay" onClick={onClose}>
      <div className="modal-content settings-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">
              <i className="fas fa-cog mr-2 text-gray-600"></i>
              Settings
            </h3>
            <p className="modal-subtitle">Configure your social media workflow like the full platform version.</p>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="settings-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <i className={tab.icon}></i>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="modal-body settings-modal-body">
          {status.message && (
            <div className={`settings-inline-alert ${status.type}`}>
              <i className={`fas ${status.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
              <span>{status.message}</span>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="settings-section">
              <div className="section-header">
                <h4 className="section-title">
                  <i className="fas fa-user-circle text-blue-500"></i>
                  Account & Profile Management
                </h4>
                <p className="section-description">Set the identity and security defaults used across your social content workflow.</p>
              </div>

              <div className="settings-group">
                <h5 className="group-title">Profile Identity</h5>
                <div className="settings-form-grid">
                  <div className="settings-field">
                    <label className="settings-field-label">Display Name</label>
                    <input
                      className="setting-input"
                      value={settings.account.displayName}
                      onChange={(e) => updateSection('account', 'displayName', e.target.value)}
                    />
                  </div>
                  <div className="settings-field">
                    <label className="settings-field-label">Default Author Name</label>
                    <input
                      className="setting-input"
                      value={settings.account.defaultAuthorName}
                      onChange={(e) => updateSection('account', 'defaultAuthorName', e.target.value)}
                    />
                  </div>
                  <div className="settings-field">
                    <label className="settings-field-label">Company</label>
                    <input
                      className="setting-input"
                      value={settings.account.company}
                      onChange={(e) => updateSection('account', 'company', e.target.value)}
                    />
                  </div>
                  <div className="settings-field">
                    <label className="settings-field-label">Profile Picture</label>
                    <div className="settings-upload-row">
                      <div className="settings-avatar-preview">
                        {settings.account.profilePicture ? (
                          <img src={settings.account.profilePicture} alt="Profile preview" />
                        ) : (
                          <span>{(settings.account.displayName || 'U').charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <label className="btn btn-secondary settings-upload-btn">
                        <i className="fas fa-upload mr-2"></i>
                        Upload
                        <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
                      </label>
                    </div>
                  </div>
                </div>
                <div className="settings-field">
                  <label className="settings-field-label">Bio / Brand Snapshot</label>
                  <textarea
                    className="setting-textarea"
                    rows={3}
                    value={settings.account.bio}
                    onChange={(e) => updateSection('account', 'bio', e.target.value)}
                    placeholder="Describe your brand, expertise, or positioning."
                  />
                </div>
              </div>

              <div className="settings-group">
                <h5 className="group-title">Account Security</h5>
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-label">Two-Factor Authentication</div>
                    <div className="setting-description">Add an extra layer of account protection.</div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.account.securitySummary.twoFactorEnabled}
                      onChange={(e) => updateNestedSetting('account', 'securitySummary', 'twoFactorEnabled', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-label">Login Alerts</div>
                    <div className="setting-description">Get notified when a new device accesses your workspace.</div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.account.securitySummary.loginAlerts}
                      onChange={(e) => updateNestedSetting('account', 'securitySummary', 'loginAlerts', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="settings-device-card">
                  <div>
                    <strong>Primary Device</strong>
                    <p>{settings.account.securitySummary.connectedDeviceLabel}</p>
                  </div>
                  <button className="btn btn-secondary">Review Sessions</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="settings-section">
              <div className="section-header">
                <h4 className="section-title">
                  <i className="fas fa-pen-nib text-purple-500"></i>
                  Content Generation Preferences
                </h4>
                <p className="section-description">Set the default content voice, niche, and output behavior for the generator.</p>
              </div>

              <div className="settings-group">
                <h5 className="group-title">Brand Voice & Tone</h5>
                <div className="settings-chip-grid">
                  {VOICE_OPTIONS.map((voice) => (
                    <button
                      key={voice}
                      className={`settings-chip ${settings.content.defaultBrandVoice === voice ? 'active' : ''}`}
                      onClick={() => updateSection('content', 'defaultBrandVoice', voice)}
                    >
                      {voice}
                    </button>
                  ))}
                </div>
                <div className="settings-form-grid mt-16">
                  <div className="settings-field">
                    <label className="settings-field-label">Default Tone</label>
                    <select
                      className="setting-select"
                      value={settings.content.defaultTone}
                      onChange={(e) => updateSection('content', 'defaultTone', e.target.value)}
                    >
                      {TONE_OPTIONS.map((tone) => (
                        <option key={tone} value={tone}>{tone}</option>
                      ))}
                    </select>
                  </div>
                  <div className="settings-field">
                    <label className="settings-field-label">Default Content Type</label>
                    <select
                      className="setting-select"
                      value={settings.content.defaultContentType}
                      onChange={(e) => updateSection('content', 'defaultContentType', e.target.value)}
                    >
                      {CONTENT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="settings-group">
                <h5 className="group-title">Audience & Output Defaults</h5>
                <div className="settings-form-grid">
                  <div className="settings-field">
                    <label className="settings-field-label">Primary Niche</label>
                    <select
                      className="setting-select"
                      value={settings.content.defaultNiche}
                      onChange={(e) => updateSection('content', 'defaultNiche', e.target.value)}
                    >
                      {CONTENT_NICHES.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="settings-field">
                    <label className="settings-field-label">Default Language</label>
                    <select
                      className="setting-select"
                      value={settings.content.defaultLanguage}
                      onChange={(e) => updateSection('content', 'defaultLanguage', e.target.value)}
                    >
                      <option value="english">English</option>
                      <option value="french">French</option>
                      <option value="spanish">Spanish</option>
                      <option value="portuguese">Portuguese</option>
                    </select>
                  </div>
                </div>
                {settings.content.defaultNiche === 'custom' && (
                  <div className="settings-field">
                    <label className="settings-field-label">Custom Niche</label>
                    <input
                      className="setting-input"
                      value={settings.content.customNiche}
                      onChange={(e) => updateSection('content', 'customNiche', e.target.value)}
                    />
                  </div>
                )}
                <div className="settings-field">
                  <label className="settings-field-label">Default Keyword Bank</label>
                  <textarea
                    className="setting-textarea"
                    rows={3}
                    value={settings.content.defaultKeywords}
                    onChange={(e) => updateSection('content', 'defaultKeywords', e.target.value)}
                    placeholder="AI, growth marketing, launch strategy, content engine"
                  />
                </div>
                <div className="settings-inline-toggles">
                  <label className="settings-inline-toggle">
                    <input
                      type="checkbox"
                      checked={settings.content.includeHashtags}
                      onChange={(e) => updateSection('content', 'includeHashtags', e.target.checked)}
                    />
                    <span>Include hashtags by default</span>
                  </label>
                  <label className="settings-inline-toggle">
                    <input
                      type="checkbox"
                      checked={settings.content.includeEmojis}
                      onChange={(e) => updateSection('content', 'includeEmojis', e.target.checked)}
                    />
                    <span>Include emojis by default</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'posting' && (
            <div className="settings-section">
              <div className="section-header">
                <h4 className="section-title">
                  <i className="fas fa-calendar-alt text-green-500"></i>
                  Posting & Scheduling Configuration
                </h4>
                <p className="section-description">Mirror the shared tool structure with reusable publishing windows and review rules.</p>
              </div>

              <div className="settings-group">
                <h5 className="group-title">Default Posting Schedule</h5>
                <div className="day-pill-row">
                  {POSTING_DAYS.map((day) => (
                    <button
                      key={day}
                      className={`day-pill ${settings.posting.activeDays.includes(day) ? 'active' : ''}`}
                      onClick={() => togglePostingDay(day)}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                <div className="time-chip-row">
                  {QUICK_TIMES.map((time) => (
                    <button
                      key={time}
                      className={`settings-chip ${settings.posting.bestTimes.includes(time) ? 'active' : ''}`}
                      onClick={() => toggleSuggestedTime(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div className="settings-group">
                <h5 className="group-title">Publishing Controls</h5>
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-label">Default Scheduling Mode</div>
                    <div className="setting-description">Choose how new posts move from draft to publish.</div>
                  </div>
                  <select
                    className="setting-select"
                    value={settings.posting.defaultScheduleMode}
                    onChange={(e) => updateSection('posting', 'defaultScheduleMode', e.target.value)}
                  >
                    <option value="review-first">Review before scheduling</option>
                    <option value="schedule-first">Schedule immediately</option>
                    <option value="publish-fast">Publish immediately</option>
                  </select>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-label">Queue Review Notifications</div>
                    <div className="setting-description">Notify you when scheduled content needs approval.</div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.posting.queueReviewNotifications}
                      onChange={(e) => updateSection('posting', 'queueReviewNotifications', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-label">Publish Only to Connected Accounts</div>
                    <div className="setting-description">Prevent drafts from targeting unsupported or disconnected channels.</div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.posting.autoPublishConnectedOnly}
                      onChange={(e) => updateSection('posting', 'autoPublishConnectedOnly', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-label">Allow Weekend Posting</div>
                    <div className="setting-description">Use weekend posting windows for campaigns that need continuous coverage.</div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.posting.allowWeekendPosting}
                      onChange={(e) => updateSection('posting', 'allowWeekendPosting', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="settings-section">
              <div className="section-header">
                <h4 className="section-title">
                  <i className="fas fa-credit-card text-orange-500"></i>
                  Billing & Subscription
                </h4>
                <p className="section-description">Keep the subscription area aligned with the shared tool's account-management structure.</p>
              </div>

              <div className="settings-group">
                <h5 className="group-title">Current Plan</h5>
                <div className="plan-summary-card">
                  <div>
                    <div className="plan-summary-label">{planLabel} Plan</div>
                    <div className="plan-summary-copy">Optimized for generating, reviewing, and scheduling social content efficiently.</div>
                  </div>
                  <div className="plan-summary-price">
                    {settings.billing.currentPlan === 'trial' ? 'Free' : settings.billing.billingCycle === 'yearly' ? '$490/yr' : '$49/mo'}
                  </div>
                </div>
                <div className="plan-feature-list">
                  {(PLAN_FEATURES[settings.billing.currentPlan] || PLAN_FEATURES.trial).map((feature) => (
                    <div key={feature} className="plan-feature-item">
                      <i className="fas fa-check-circle"></i>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="settings-group">
                <h5 className="group-title">Billing Preferences</h5>
                <div className="settings-form-grid">
                  <div className="settings-field">
                    <label className="settings-field-label">Billing Cycle</label>
                    <select
                      className="setting-select"
                      value={settings.billing.billingCycle}
                      onChange={(e) => updateSection('billing', 'billingCycle', e.target.value)}
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  <div className="settings-field">
                    <label className="settings-field-label">Payment Method</label>
                    <div className="settings-payment-pill">{settings.billing.cardBrand} ending in {settings.billing.cardLast4}</div>
                  </div>
                </div>
                <label className="settings-inline-toggle">
                  <input
                    type="checkbox"
                    checked={settings.billing.autoRenew}
                    onChange={(e) => updateSection('billing', 'autoRenew', e.target.checked)}
                  />
                  <span>Auto-renew subscription</span>
                </label>
              </div>

              <div className="settings-group">
                <h5 className="group-title">Billing History & Invoices</h5>
                <div className="invoice-list">
                  {settings.billing.invoices.map((invoice) => (
                    <div key={invoice.id} className="invoice-row">
                      <div>
                        <strong>{invoice.label}</strong>
                        <p>{invoice.id}</p>
                      </div>
                      <div className="invoice-meta">
                        <span>{invoice.amount}</span>
                        <span className="invoice-status">{invoice.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="settings-section">
              <div className="section-header">
                <h4 className="section-title">
                  <i className="fas fa-cog text-slate-500"></i>
                  General Settings
                </h4>
                <p className="section-description">Control experience-level defaults, notifications, and localization.</p>
              </div>

              <div className="settings-group">
                <h5 className="group-title">Notifications</h5>
                {[
                  ['email', 'Email Notifications', 'Receive important workflow updates in your inbox.'],
                  ['push', 'Push Notifications', 'Show browser-level reminders for publishing tasks.'],
                  ['weeklyReport', 'Weekly Reports', 'Get a weekly summary of generated and scheduled content.'],
                  ['postPublished', 'Post Published', 'Notify when a post is successfully published.'],
                  ['loginNotifications', 'Login Notifications', 'Alert on suspicious or new login activity.']
                ].map(([key, label, description]) => (
                  <div key={key} className="setting-item">
                    <div className="setting-info">
                      <div className="setting-label">{label}</div>
                      <div className="setting-description">{description}</div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.general.notifications[key]}
                        onChange={(e) => updateNestedSetting('general', 'notifications', key, e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                ))}
              </div>

              <div className="settings-group">
                <h5 className="group-title">Experience Preferences</h5>
                <div className="settings-form-grid">
                  <div className="settings-field">
                    <label className="settings-field-label">Theme</label>
                    <select
                      className="setting-select"
                      value={settings.general.theme}
                      onChange={(e) => updateSection('general', 'theme', e.target.value)}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                  <div className="settings-field">
                    <label className="settings-field-label">Language</label>
                    <select
                      className="setting-select"
                      value={settings.general.language}
                      onChange={(e) => updateSection('general', 'language', e.target.value)}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                  <div className="settings-field">
                    <label className="settings-field-label">Timezone</label>
                    <input
                      className="setting-input"
                      value={settings.general.timezone}
                      onChange={(e) => updateSection('general', 'timezone', e.target.value)}
                    />
                  </div>
                  <div className="settings-field">
                    <label className="settings-field-label">Date Format</label>
                    <select
                      className="setting-select"
                      value={settings.general.dateFormat}
                      onChange={(e) => updateSection('general', 'dateFormat', e.target.value)}
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save mr-2"></i>
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
