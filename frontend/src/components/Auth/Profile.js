import React, { useContext, useState, useMemo, useRef } from 'react';
import { AuthContext, SubscriptionContext } from '../../App';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../../api';
import { useNotification } from '../../contexts/NotificationContext';
import { 
  BsShare, 
  BsLightbulb, 
  BsTypeH1, 
  BsSearch, 
  BsEnvelopeOpen, 
  BsMegaphone, 
  BsDiagram3, 
  BsBullseye,
  BsArrowRightShort
} from 'react-icons/bs';
import '../../css/Profile.css';

const TOOL_ICONS = {
  'social-media': <BsShare />,
  'content-idea': <BsLightbulb />,
  'headline-analyzer': <BsTypeH1 />,
  'seo-meta': <BsSearch />,
  'email-tester': <BsEnvelopeOpen />,
  'ad-copy': <BsMegaphone />,
  'funnel-builder': <BsDiagram3 />,
  'value-proposition': <BsBullseye />
};

const BUSINESS_TYPES = [
  { value: 'creator', label: 'Creator / Influencer' },
  { value: 'ecommerce', label: 'E-commerce Brand' },
  { value: 'saas', label: 'SaaS / Tech Product' },
  { value: 'agency', label: 'Agency / Marketing Team' },
  { value: 'consulting', label: 'Consultant / Coach' },
  { value: 'local-business', label: 'Local Business' }
];

const GOAL_OPTIONS = [
  { value: 'brand-awareness', label: 'Grow brand awareness' },
  { value: 'lead-generation', label: 'Generate more leads' },
  { value: 'sales', label: 'Increase sales / conversions' },
  { value: 'traffic', label: 'Drive website traffic' },
  { value: 'retention', label: 'Improve retention / nurture' },
  { value: 'launches', label: 'Run launches and campaigns' }
];

const PLATFORM_OPTIONS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'X / Twitter' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'youtube', label: 'YouTube' }
];

const EXPERIENCE_OPTIONS = [
  { value: 'beginner', label: 'Just getting started' },
  { value: 'growing', label: 'Growing and testing channels' },
  { value: 'advanced', label: 'Running active campaigns already' }
];

const INTEREST_OPTIONS = [
  { value: 'social-media', label: 'Social media posts', detail: 'Captions, post ideas, and publishing support' },
  { value: 'content-marketing', label: 'Content marketing', detail: 'Campaign themes, hooks, and content planning' },
  { value: 'email-marketing', label: 'Email campaigns', detail: 'Subjects, nurture flows, and launch emails' },
  { value: 'paid-ads', label: 'Paid ads', detail: 'Ad angles, copy testing, and promotions' },
  { value: 'seo', label: 'SEO visibility', detail: 'Search traffic, meta content, and discoverability' },
  { value: 'positioning', label: 'Brand positioning', detail: 'Offers, messaging, and value proposition clarity' }
];

const ACTIVITY_OPTIONS = [
  { value: 'campaign-ideas', label: 'Campaign ideas' },
  { value: 'content-calendar', label: 'Planning content calendars' },
  { value: 'publish', label: 'Publishing on social' },
  { value: 'community', label: 'Growing community engagement' },
  { value: 'newsletter', label: 'Sending newsletters' },
  { value: 'funnels', label: 'Building funnels' }
];

function BrandVoiceManager({ user, onUpdate }) {
  const notify = useNotification();
  const [isSaving, setIsSaving] = useState(false);
  const [voiceData, setVoiceData] = useState({
    voiceName: user?.brandVoice?.voiceName || 'Default Brand Voice',
    tone: user?.brandVoice?.tone || 'Professional, helpful, and innovative',
    targetAudience: user?.brandVoice?.targetAudience || '',
    brandMission: user?.brandVoice?.brandMission || '',
    brandValues: (user?.brandVoice?.brandValues || []).join(', '),
    dos: (user?.brandVoice?.dos || []).join(', '),
    donts: (user?.brandVoice?.donts || []).join(', ')
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVoiceData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        ...voiceData,
        brandValues: voiceData.brandValues.split(',').map(v => v.trim()).filter(v => v),
        dos: voiceData.dos.split(',').map(v => v.trim()).filter(v => v),
        donts: voiceData.donts.split(',').map(v => v.trim()).filter(v => v)
      };

      const result = await userApi.updateBrandVoice(payload);
      if (result.success) {
        notify.success('Brand voice updated successfully!');
        onUpdate(result.data);
      } else {
        notify.error('Failed to update brand voice.');
      }
    } catch (error) {
      notify.error('Error saving brand voice.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="brand-voice-manager">
      <div className="profile-section">
        <div className="section-header">
          <h2>Brand Voice & Identity</h2>
          <p className="section-subtitle">Define how AI should represent your brand across all tools.</p>
        </div>

        <div className="brand-voice-form">
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Profile Name</label>
              <input 
                type="text" 
                name="voiceName" 
                value={voiceData.voiceName} 
                onChange={handleInputChange} 
                placeholder="e.g., Main Brand, Premium Line, Casual Sub-brand"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Tone of Voice</label>
              <textarea 
                name="tone" 
                value={voiceData.tone} 
                onChange={handleInputChange} 
                placeholder="e.g., Professional yet witty, expert and authoritative, friendly and supportive"
                className="form-control"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Target Audience</label>
              <textarea 
                name="targetAudience" 
                value={voiceData.targetAudience} 
                onChange={handleInputChange} 
                placeholder="e.g., Tech-savvy entrepreneurs aged 25-40, small business owners in retail"
                className="form-control"
                rows="3"
              />
            </div>

            <div className="form-group full-width">
              <label>Brand Mission</label>
              <textarea 
                name="brandMission" 
                value={voiceData.brandMission} 
                onChange={handleInputChange} 
                placeholder="What is the ultimate goal of your brand?"
                className="form-control"
                rows="2"
              />
            </div>

            <div className="form-group">
              <label>Brand Values (comma separated)</label>
              <input 
                type="text" 
                name="brandValues" 
                value={voiceData.brandValues} 
                onChange={handleInputChange} 
                placeholder="Innovation, Transparency, Speed"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>The "Do's" (comma separated)</label>
              <input 
                type="text" 
                name="dos" 
                value={voiceData.dos} 
                onChange={handleInputChange} 
                placeholder="Use active voice, include emojis, use data"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>The "Don'ts" (comma separated)</label>
              <input 
                type="text" 
                name="donts" 
                value={voiceData.donts} 
                onChange={handleInputChange} 
                placeholder="Avoid jargon, don't mention competitors, no slang"
                className="form-control"
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              onClick={handleSave} 
              className="btn-edit" 
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Brand Identity'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="profile-section">
        <div className="section-header">
          <h2>Knowledge Base</h2>
          <span className="badge-premium">PREMIUM</span>
        </div>
        <div className="knowledge-base-placeholder">
          <div className="placeholder-content">
            <p>Upload documents or paste custom knowledge to give the AI a deeper understanding of your products.</p>
            <button className="btn-upgrade" onClick={() => window.location.href='/pricing'}>Unlock Knowledge Base</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const authContext = useContext(AuthContext);
  const subscriptionContext = useContext(SubscriptionContext);
  const navigate = useNavigate();
  const notify = useNotification();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    businessType: '',
    primaryGoal: '',
    favoritePlatform: '',
    experienceLevel: '',
    interests: [],
    activityPreferences: []
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [displayedUser, setDisplayedUser] = useState(null);
  const [showLoginActivityModal, setShowLoginActivityModal] = useState(false);
  const [loginActivities] = useState([]);
  const fileInputRef = useRef(null);

  // Safely extract values with defaults
  const user = displayedUser || authContext?.user;
  const logout = authContext?.logout;
  const subscription = subscriptionContext || {};

  const onboardingProfile = useMemo(() => {
    if (user?.metadata?.onboardingProfile) {
      return user.metadata.onboardingProfile;
    }
    // Fallback if not nested in metadata (depends on how API returns it)
    return {
      businessType: user?.businessType || '',
      primaryGoal: user?.primaryGoal || '',
      favoritePlatform: user?.favoritePlatform || '',
      experienceLevel: user?.experienceLevel || '',
      interests: user?.interests || [],
      activityPreferences: user?.activityPreferences || []
    };
  }, [user]);

  // Initialize form data when entering edit mode
  const openEditForm = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      company: user?.company || '',
      businessType: onboardingProfile.businessType || '',
      primaryGoal: onboardingProfile.primaryGoal || '',
      favoritePlatform: onboardingProfile.favoritePlatform || '',
      experienceLevel: onboardingProfile.experienceLevel || '',
      interests: onboardingProfile.interests || [],
      activityPreferences: onboardingProfile.activityPreferences || []
    });
    setIsEditing(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleMultiSelect = (field, value) => {
    setFormData(prev => {
      const currentValues = prev[field] || [];
      const nextValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [field]: nextValues };
    });
  };

  // Handle save
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Call API to update profile on backend
      const updateResult = await userApi.updateProfile({
        name: formData.name,
        company: formData.company,
        businessType: formData.businessType,
        primaryGoal: formData.primaryGoal,
        favoritePlatform: formData.favoritePlatform,
        experienceLevel: formData.experienceLevel,
        interests: formData.interests,
        activityPreferences: formData.activityPreferences
      });
      
      if (updateResult.success) {
        // Update displayed user with the response data
        const updatedUserData = updateResult.data;
        setDisplayedUser({
          ...user,
          ...updatedUserData
        });
        
        // Update context user as well if updateUser method exists
        if (authContext?.updateUser) {
          authContext.updateUser(updatedUserData);
        }
        
        setIsEditing(false);
        notify.success('Profile updated successfully.');
        
        // If tools were recommended, show an additional notification
        if (updatedUserData?.metadata?.toolRecommendations?.length > 0) {
          setTimeout(() => {
            notify.info(
              'Tool Suggestions Updated',
              `We've updated your tool recommendations based on your new profile settings.`
            );
          }, 1000);
        }
      } else {
        notify.error('Failed to update profile: ' + (updateResult.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      notify.error('Error updating profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel edit
  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: '',
      email: '',
      company: ''
    });
  };

  // Calculate trial days remaining
  const trialDaysRemaining = useMemo(() => {
    try {
      const trialDate = subscription?.trialEndDate || subscription?.trialEndsAt;
      if (!trialDate) return 7;
      const trialEnd = new Date(trialDate);
      const now = new Date();
      const diffTime = trialEnd - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(diffDays, 0);
    } catch (error) {
      console.error('Error calculating trial days:', error);
      return 7;
    }
  }, [subscription?.trialEndDate, subscription?.trialEndsAt]);

  const trialEndLabel = useMemo(() => {
    const trialDate = subscription?.trialEndDate || subscription?.trialEndsAt;
    if (!trialDate) return 'Not available yet';

    const parsedDate = new Date(trialDate);
    return Number.isNaN(parsedDate.getTime()) ? 'Not available yet' : parsedDate.toLocaleDateString();
  }, [subscription?.trialEndDate, subscription?.trialEndsAt]);

  const handleLogout = () => {
    try {
      if (logout) {
        logout();
      }
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
  };

  const handleAvatarSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      setIsUploadingAvatar(true);
      const result = await userApi.uploadAvatar(file);

      if (!result.success) {
        throw new Error(result.error || 'Failed to upload profile picture');
      }

      const updatedUserData = {
        profilePicture: result.data.profilePicture,
        avatar: result.data.profilePicture,
      };

      setDisplayedUser((prev) => ({ ...(prev || user), ...updatedUserData }));

      if (authContext?.updateUser) {
        authContext.updateUser(updatedUserData);
      }
      notify.success('Profile picture updated successfully.');
    } catch (error) {
      console.error('Avatar upload error:', error);
      notify.error(error.message || 'Profile picture upload failed.');
    } finally {
      setIsUploadingAvatar(false);
      event.target.value = '';
    }
  };

  // Handle missing context
  if (!user) {
    return (
      <div className="profile-container">
        <div style={{ padding: '2rem', textAlign: 'center', marginTop: '2rem' }}>
          <p style={{ color: '#f56565', marginBottom: '1rem', fontSize: '1.1rem' }}>
            Unable to load profile. Please refresh the page or log in again.
          </p>
          <button 
            onClick={() => navigate('/login')} 
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Header */}
      <div className="profile-header">
        <div className="profile-header-content">
          <h1>{activeTab === 'profile' ? 'User Profile' : 'Brand Identity'}</h1>
          <p>{activeTab === 'profile' ? 'Manage your account and subscription' : 'Define your brand voice and knowledge base'}</p>
        </div>
        <button onClick={() => navigate('/dashboard')} className="btn-back">
          Back to Dashboard
        </button>
      </div>

      <div className="profile-content">
        {/* Navigation Tabs */}
        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 My Profile
          </button>
          <button 
            className={`tab-btn ${activeTab === 'brand' ? 'active' : ''}`}
            onClick={() => setActiveTab('brand')}
          >
            ✨ Brand Voice
          </button>
        </div>

        {activeTab === 'profile' ? (
          <>
            {/* User Information Section */}
            <div className="profile-section">
          <div className="section-header">
            <h2>Personal Information</h2>
            <button onClick={isEditing ? handleCancel : openEditForm} className="btn-edit">
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {!isEditing ? (
            <div className="profile-info-grid">
            <div className="info-card">
              <label>Full Name</label>
              <div className="info-display">
                <div className="profile-avatar-stack">
                  <div className="avatar-large">
                    {user?.profilePicture ? (
                      <img src={user.profilePicture} alt={`${user?.name || 'User'} profile`} className="avatar-image" />
                    ) : (
                      user?.name?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="avatar-file-input"
                    onChange={handleAvatarSelect}
                  />
                  <button
                    type="button"
                    className="avatar-upload-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                  >
                    {isUploadingAvatar ? 'Uploading...' : 'Change Photo'}
                  </button>
                </div>
                <p className="info-value">{user?.name || 'Not provided'}</p>
              </div>
            </div>

            <div className="info-card">
              <label>Email Address</label>
              <p className="info-value">{user?.email || 'Not provided'}</p>
            </div>

            <div className="info-card">
              <label>Company</label>
              <p className="info-value">{user?.company || 'Not provided'}</p>
            </div>

            <div className="info-card">
              <label>Business Type</label>
              <p className="info-value">
                {BUSINESS_TYPES.find(t => t.value === onboardingProfile.businessType)?.label || onboardingProfile.businessType || 'Not provided'}
              </p>
            </div>

            <div className="info-card">
              <label>Primary Goal</label>
              <p className="info-value">
                {GOAL_OPTIONS.find(g => g.value === onboardingProfile.primaryGoal)?.label || onboardingProfile.primaryGoal || 'Not provided'}
              </p>
            </div>

            <div className="info-card">
              <label>Main Platform</label>
              <p className="info-value">
                {PLATFORM_OPTIONS.find(p => p.value === onboardingProfile.favoritePlatform)?.label || onboardingProfile.favoritePlatform || 'Not provided'}
              </p>
            </div>

            <div className="info-card">
              <label>Experience Level</label>
              <p className="info-value">
                {EXPERIENCE_OPTIONS.find(e => e.value === onboardingProfile.experienceLevel)?.label || onboardingProfile.experienceLevel || 'Not provided'}
              </p>
            </div>

            <div className="info-card" style={{ gridColumn: '1 / -1' }}>
              <label>Interests</label>
              <div className="choice-chip-row" style={{ marginTop: '0.5rem' }}>
                {onboardingProfile.interests?.length > 0 ? (
                  onboardingProfile.interests.map(interest => (
                    <span key={interest} className="choice-chip selected">
                      {INTEREST_OPTIONS.find(i => i.value === interest)?.label || interest}
                    </span>
                  ))
                ) : (
                  <p className="info-value">None selected</p>
                )}
              </div>
            </div>

            <div className="info-card" style={{ gridColumn: '1 / -1' }}>
              <label>Activity Preferences</label>
              <div className="choice-chip-row" style={{ marginTop: '0.5rem' }}>
                {onboardingProfile.activityPreferences?.length > 0 ? (
                  onboardingProfile.activityPreferences.map(activity => (
                    <span key={activity} className="choice-chip selected">
                      {ACTIVITY_OPTIONS.find(a => a.value === activity)?.label || activity}
                    </span>
                  ))
                ) : (
                  <p className="info-value">None selected</p>
                )}
              </div>
            </div>

            <div className="info-card">
              <label>Account Status</label>
              <p className="info-value status-active">
                Active
              </p>
            </div>
          </div>
          ) : (
            <div className="edit-form-container">
              <div className="edit-form">
                <h3>Edit Profile Information</h3>
                
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className="form-input"
                    disabled
                  />
                  <small style={{ color: '#999', marginTop: '0.25rem', display: 'block' }}>
                    Email cannot be changed directly. Contact support to update.
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="company">Company</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Enter your company name"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="businessType">Primary Business Type</label>
                  <select
                    id="businessType"
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="">Select your business type</option>
                    {BUSINESS_TYPES.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="primaryGoal">Primary Goal</label>
                  <select
                    id="primaryGoal"
                    name="primaryGoal"
                    value={formData.primaryGoal}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="">Select your main goal</option>
                    {GOAL_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="favoritePlatform">Main Platform</label>
                  <select
                    id="favoritePlatform"
                    name="favoritePlatform"
                    value={formData.favoritePlatform}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="">Choose your main platform</option>
                    {PLATFORM_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Experience Level</label>
                  <div className="choice-chip-row" style={{ marginTop: '0.5rem' }}>
                    {EXPERIENCE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`choice-chip ${formData.experienceLevel === option.value ? 'selected' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, experienceLevel: option.value }))}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Interests</label>
                  <div className="choice-chip-row" style={{ marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    {INTEREST_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`choice-chip ${formData.interests?.includes(option.value) ? 'selected' : ''}`}
                        onClick={() => toggleMultiSelect('interests', option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Activity Preferences</label>
                  <div className="choice-chip-row" style={{ marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    {ACTIVITY_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`choice-chip ${formData.activityPreferences?.includes(option.value) ? 'selected' : ''}`}
                        onClick={() => toggleMultiSelect('activityPreferences', option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="btn-save"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    onClick={handleCancel} 
                    className="btn-cancel"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recommended Tools Section */}
        {!isEditing && user?.metadata?.toolRecommendations?.length > 0 && (
          <div className="profile-section recommendations-section">
            <div className="section-header">
              <div className="header-with-badge">
                <h2>Recommended For You</h2>
                <span className="ai-badge">AI Suggested</span>
              </div>
              <p className="section-subtitle">Based on your business profile and goals</p>
            </div>
            
            <div className="recommendations-grid">
              {user.metadata.toolRecommendations.map((tool) => (
                <div key={tool.key} className="tool-recommendation-card" onClick={() => navigate(tool.route)}>
                  <div className="tool-card-icon">
                    {TOOL_ICONS[tool.key] || <BsLightbulb />}
                  </div>
                  <div className="tool-card-content">
                    <h3>{tool.name}</h3>
                    <p>{tool.description}</p>
                    <div className="tool-card-action">
                      <span>Try this tool</span>
                      <BsArrowRightShort />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subscription Section */}
        <div className="profile-section">
          <div className="section-header">
            <h2>Subscription Details</h2>
          </div>

          <div className="subscription-cards">
            {/* Plan Card */}
            <div className="subscription-card">
              <div className="card-header">
                <h3>Current Plan</h3>
              </div>
              <div className="card-content">
                {subscription?.plan === 'trial' ? (
                  <>
                    <div className="plan-badge-large trial">
                      On 7-Day Free Trial
                    </div>
                    <div className="plan-details">
                      <p><strong>Status:</strong> <span className="status-trial">Trialing</span></p>
                      <p><strong>Days Remaining:</strong> <span className="days-remaining">{trialDaysRemaining}</span></p>
                      <p><strong>Trial Ends:</strong> {trialEndLabel}</p>
                    </div>
                    <button
                      onClick={() => navigate('/upgrade', { state: { requestedPlan: 'premium', source: 'profile' } })}
                      className="btn-upgrade"
                    >
                      Upgrade to Premium
                    </button>
                  </>
                ) : (
                  <>
                    <div className={`plan-badge-large ${subscription?.plan || 'free'}`}>
                      {subscription?.plan?.toUpperCase() || 'FREE'}
                    </div>
                    <div className="plan-details">
                      <p><strong>Status:</strong> <span className="status-active">Active</span></p>
                      <p><strong>Plan Type:</strong> {subscription?.plan?.toUpperCase() || 'Free'}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Usage Card */}
            <div className="subscription-card">
              <div className="card-header">
                <h3>Features & Limits</h3>
              </div>
              <div className="card-content">
                <div className="feature-item">
                  <span>AI-Powered Tools</span>
                </div>
                <div className="feature-item">
                  <span>Multi-Platform Support</span>
                </div>
                <div className="feature-item">
                  <span>Content Generation</span>
                </div>
                <div className="feature-item">
                  <span>Analytics Dashboard</span>
                </div>
                {subscription?.plan !== 'free' && (
                  <>
                    <div className="feature-item">
                      <span>Priority Support</span>
                    </div>
                    <div className="feature-item">
                      <span>Advanced Features</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Billing Card */}
            <div className="subscription-card">
              <div className="card-header">
                <h3>Billing</h3>
              </div>
              <div className="card-content">
                <div className="billing-info">
                  <p><strong>Billing Cycle:</strong> Monthly</p>
                  <p><strong>Current Amount:</strong> {subscription?.plan === 'trial' ? 'Free' : '$9.99/month'}</p>
                  <p><strong>Payment Method:</strong> {subscription?.plan === 'trial' ? 'N/A' : 'Card ending in ****'}</p>
                </div>
                {subscription?.plan !== 'trial' && (
                  <button className="btn-update-billing">Update Billing Info</button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Actions Section */}
        <div className="profile-section">
          <div className="section-header">
            <h2>Account Actions</h2>
          </div>

          <div className="account-actions">
            <button className="action-btn primary" onClick={() => navigate('/usage')}>
              View Usage Stats
            </button>
            <button className="action-btn primary" onClick={() => navigate('/billing')}>
              Billing & Payments
            </button>
            <button className="action-btn danger" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </>
    ) : (
      <BrandVoiceManager user={user} onUpdate={(updatedBrandVoice) => setDisplayedUser(prev => ({ ...prev, brandVoice: updatedBrandVoice }))} />
    )}
      </div>

      {/* Login Activity Modal */}
      {showLoginActivityModal && (
        <div className="settings-modal-overlay" onClick={() => setShowLoginActivityModal(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="settings-modal-header">
              <div>
                <div className="settings-modal-title">Login Activity</div>
                <div className="settings-modal-subtitle">Recent login sessions and devices.</div>
              </div>
              <button className="popover-close" onClick={() => setShowLoginActivityModal(false)}>&times;</button>
            </div>
            <div className="settings-modal-body">
              {loginActivities.length > 0 ? (
                <div className="login-activity-list">
                  {loginActivities.map((activity, index) => (
                    <div key={index} className="login-activity-item">
                      <p><strong>Time:</strong> {new Date(activity.timestamp).toLocaleString()}</p>
                      <p><strong>IP Address:</strong> {activity.ipAddress}</p>
                      <p><strong>Device:</strong> {activity.device}</p>
                      <p><strong>Location:</strong> {activity.location}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No recent login activities found.</p>
              )}
            </div>
            <div className="settings-modal-footer">
              <button type="button" className="settings-cancel-btn" onClick={() => setShowLoginActivityModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
