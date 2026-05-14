import React, { useEffect, useMemo, useState } from 'react';
import './QuickPostModal.css';

const SETTINGS_STORAGE_KEY = 'socialMediaGeneratorSettings';

const TEMPLATE_LIBRARY = {
  promotion: {
    label: 'Promotion',
    icon: 'fas fa-tag',
    color: '#7C3AED',
    description: 'Sales, launches, and offers',
    sample: 'Limited-time offer: unlock a faster way to create social content with a workflow built for consistency, speed, and measurable growth.'
  },
  announcement: {
    label: 'Announcement',
    icon: 'fas fa-bullhorn',
    color: '#2563EB',
    description: 'News and updates',
    sample: 'We just rolled out a sharper social workflow with faster approvals, stronger post ideas, and cleaner planning across every channel.'
  },
  engagement: {
    label: 'Engagement',
    icon: 'fas fa-heart',
    color: '#DC2626',
    description: 'Questions, prompts, and polls',
    sample: 'What is the one thing slowing down your social content engine right now: ideation, consistency, design, or approvals?'
  },
  educational: {
    label: 'Educational',
    icon: 'fas fa-graduation-cap',
    color: '#059669',
    description: 'Tips, how-tos, and explainers',
    sample: 'A strong post usually does three things fast: it hooks attention, gives one useful idea, and ends with a clear action worth taking.'
  }
};

const TEMPLATE_FEATURES = {
  promotion: ['Urgency framing', 'Benefit-first hook', 'Clear CTA', 'Offer positioning'],
  announcement: ['News angle', 'Feature reveal', 'Audience relevance', 'Launch-ready CTA'],
  engagement: ['Question prompt', 'Comment bait', 'Community tone', 'Low-friction interaction'],
  educational: ['Teach one thing', 'Authority positioning', 'Save/share potential', 'Value-first structure']
};

const HASHTAG_SUGGESTIONS = ['#SocialMedia', '#Marketing', '#ContentStrategy', '#Growth', '#DigitalBrand', '#CreatorTools', '#AudienceBuilding', '#Launch'];
const BEST_TIME_SLOTS = ['09:00', '12:00', '15:00', '18:00'];

const QuickPostModal = ({ isOpen, onClose, connectedAccounts, onPostSuccess }) => {
  const [postData, setPostData] = useState({
    content: '',
    platforms: [],
    includeHashtags: true,
    includeEmojis: true,
    scheduleForLater: false,
    scheduledDate: '',
    scheduledTime: '12:00',
    mediaFiles: [],
    linkUrl: '',
    template: 'engagement'
  });
  const [savedDefaults, setSavedDefaults] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const availablePlatforms = connectedAccounts || [];
  const effectiveCharacterLimit = postData.platforms.includes('twitter') ? 280 : 2200;

  useEffect(() => {
    if (!isOpen) return;

    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    let defaults = null;

    if (saved) {
      try {
        defaults = JSON.parse(saved);
        setSavedDefaults(defaults);
      } catch (parseError) {
        defaults = null;
      }
    }

    setPostData((prev) => ({
      ...prev,
      includeHashtags: defaults?.content?.includeHashtags ?? true,
      includeEmojis: defaults?.content?.includeEmojis ?? true
    }));
    setError('');
    setSuccess('');
  }, [isOpen]);

  const selectedTemplate = useMemo(
    () => TEMPLATE_LIBRARY[postData.template] || TEMPLATE_LIBRARY.engagement,
    [postData.template]
  );

  if (!isOpen) return null;

  const handlePlatformToggle = (platformId) => {
    setPostData((prev) => {
      const exists = prev.platforms.includes(platformId);
      const platforms = exists
        ? prev.platforms.filter((id) => id !== platformId)
        : [...prev.platforms, platformId];

      return { ...prev, platforms };
    });
  };

  const handleContentChange = (event) => {
    const content = event.target.value;
    setPostData((prev) => ({ ...prev, content }));

    if (content.length > effectiveCharacterLimit) {
      setError(`Content exceeds ${effectiveCharacterLimit} characters for the selected platforms.`);
    } else {
      setError('');
    }
  };

  const handleTemplateApply = (templateKey) => {
    const template = TEMPLATE_LIBRARY[templateKey];
    setPostData((prev) => ({
      ...prev,
      template: templateKey,
      content: template.sample
    }));
    setError('');
  };

  const handleGenerateContent = () => {
    const prefix = postData.includeEmojis ? 'Ready to ship: ' : '';
    const suffix = postData.includeHashtags ? '\n\n#SocialMedia #ContentStrategy #Marketing' : '';
    const keywordLine = savedDefaults?.content?.defaultKeywords
      ? `\n\nFocus: ${savedDefaults.content.defaultKeywords}`
      : '';

    setPostData((prev) => ({
      ...prev,
      content: `${prefix}${selectedTemplate.sample}${keywordLine}${suffix}`.trim()
    }));
    setSuccess('Template-driven AI draft prepared.');
    setError('');
  };

  const handleMediaUpload = (event) => {
    const files = Array.from(event.target.files || []);
    setPostData((prev) => ({ ...prev, mediaFiles: files.slice(0, 4) }));
  };

  const addHashtag = (tag) => {
    setPostData((prev) => ({
      ...prev,
      content: `${prev.content}${prev.content ? ' ' : ''}${tag}`
    }));
  };

  const selectBestTime = (time) => {
    setPostData((prev) => ({
      ...prev,
      scheduleForLater: true,
      scheduledTime: time
    }));
  };

  const validate = () => {
    if (!postData.content.trim()) {
      setError('Please enter post content.');
      return false;
    }

    if (postData.platforms.length === 0) {
      setError('Please select at least one platform.');
      return false;
    }

    if (postData.content.length > effectiveCharacterLimit) {
      setError(`Content exceeds ${effectiveCharacterLimit} characters for the selected platforms.`);
      return false;
    }

    if (postData.scheduleForLater && (!postData.scheduledDate || !postData.scheduledTime)) {
      setError('Please select both a schedule date and time.');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsPosting(true);
    setError('');
    setSuccess('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const newPost = {
        id: Date.now(),
        content: postData.content,
        platforms: postData.platforms,
        mediaFiles: postData.mediaFiles.map((file) => file.name),
        template: postData.template,
        linkUrl: postData.linkUrl,
        createdAt: new Date().toISOString(),
        isScheduled: postData.scheduleForLater,
        scheduledFor: postData.scheduleForLater
          ? `${postData.scheduledDate}T${postData.scheduledTime}`
          : null
      };

      if (onPostSuccess) {
        onPostSuccess(newPost);
      }

      setSuccess(`Post ${postData.scheduleForLater ? 'scheduled' : 'published'} successfully.`);

      setTimeout(() => {
        setPostData({
          content: '',
          platforms: [],
          includeHashtags: savedDefaults?.content?.includeHashtags ?? true,
          includeEmojis: savedDefaults?.content?.includeEmojis ?? true,
          scheduleForLater: false,
          scheduledDate: '',
          scheduledTime: '12:00',
          mediaFiles: [],
          linkUrl: '',
          template: 'engagement'
        });
        setSuccess('');
        onClose();
      }, 1200);
    } catch (submitError) {
      setError('Failed to publish the post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  const getPlatformIcon = (platformId) => {
    const icons = {
      instagram: 'fab fa-instagram',
      twitter: 'fab fa-twitter',
      facebook: 'fab fa-facebook',
      linkedin: 'fab fa-linkedin',
      tiktok: 'fab fa-tiktok',
      youtube: 'fab fa-youtube',
      pinterest: 'fab fa-pinterest'
    };
    return icons[platformId] || 'fas fa-share-alt';
  };

  const getPlatformColor = (platformId) => {
    const colors = {
      instagram: '#E4405F',
      twitter: '#1DA1F2',
      facebook: '#1877F2',
      linkedin: '#0A66C2',
      tiktok: '#111827',
      youtube: '#FF0000',
      pinterest: '#E60023'
    };
    return colors[platformId] || '#6B7280';
  };

  const predictionScore = Math.min(
    94,
    55 +
      (postData.content.length > 100 ? 12 : 0) +
      (postData.mediaFiles.length > 0 ? 10 : 0) +
      (postData.platforms.length > 1 ? 8 : 0) +
      (postData.linkUrl ? 4 : 0)
  );

  const predictionLabel = predictionScore >= 85 ? 'High Potential' : predictionScore >= 70 ? 'Strong Potential' : 'Needs Refinement';

  return (
    <div className="modal-overlay quick-post-overlay" onClick={onClose}>
      <div className="modal-content quick-post-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">
              <i className="fas fa-bolt mr-2 text-yellow-500"></i>
              Quick Post
            </h3>
            <p className="modal-subtitle">Use templates, media, and smarter scheduling cues to publish faster.</p>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body quick-post-body">
          {error && (
            <div className="alert alert-error">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <i className="fas fa-check-circle"></i>
              <span>{success}</span>
            </div>
          )}

          <div className="platform-selection-section">
            <label className="section-label">Select Platforms ({postData.platforms.length} selected)</label>
            <div className="platforms-grid">
              {availablePlatforms.map((platform) => (
                <button
                  key={platform.id}
                  className={`platform-selector ${postData.platforms.includes(platform.id) ? 'selected' : ''}`}
                  onClick={() => handlePlatformToggle(platform.id)}
                  style={{
                    borderColor: postData.platforms.includes(platform.id) ? getPlatformColor(platform.id) : '#E5E7EB'
                  }}
                >
                  <i className={getPlatformIcon(platform.id)} style={{ color: getPlatformColor(platform.id) }}></i>
                  <span>{platform.name}</span>
                  {postData.platforms.includes(platform.id) && <i className="fas fa-check-circle check-icon"></i>}
                </button>
              ))}
            </div>
          </div>

          <div className="template-selection-section">
            <label className="section-label">Content Template</label>
            <div className="template-grid">
              {Object.entries(TEMPLATE_LIBRARY).map(([key, template]) => (
                <button
                  key={key}
                  className={`template-card ${postData.template === key ? 'selected' : ''}`}
                  onClick={() => handleTemplateApply(key)}
                >
                  <i className={template.icon} style={{ color: template.color }}></i>
                  <strong>{template.label}</strong>
                  <span>{template.description}</span>
                </button>
              ))}
            </div>
            <div className="template-feature-panel">
              <div className="template-feature-header">
                <strong>{selectedTemplate.label} template features</strong>
                <button className="btn btn-secondary btn-sm" onClick={() => handleTemplateApply(postData.template)}>
                  Use Template
                </button>
              </div>
              <div className="template-feature-list">
                {TEMPLATE_FEATURES[postData.template].map((feature) => (
                  <span key={feature} className="template-feature-pill">{feature}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="content-editor-section">
            <label className="section-label">
              Post Content <span className="char-count">({postData.content.length}/{effectiveCharacterLimit})</span>
            </label>
            <div className="content-editor">
              <textarea
                value={postData.content}
                onChange={handleContentChange}
                placeholder="What do you want to publish?"
                className="content-textarea"
                maxLength={effectiveCharacterLimit}
                rows={5}
              />
              <div className="editor-tools">
                <button className="editor-tool" onClick={() => setPostData((prev) => ({ ...prev, includeEmojis: !prev.includeEmojis }))}>
                  <i className="fas fa-smile"></i>
                  <span>Emojis {postData.includeEmojis ? 'On' : 'Off'}</span>
                </button>
                <button className="editor-tool" onClick={() => setPostData((prev) => ({ ...prev, includeHashtags: !prev.includeHashtags }))}>
                  <i className="fas fa-hashtag"></i>
                  <span>Hashtags {postData.includeHashtags ? 'On' : 'Off'}</span>
                </button>
                <button className="editor-tool editor-tool-primary" onClick={handleGenerateContent}>
                  <i className="fas fa-robot"></i>
                  <span>AI Generate</span>
                </button>
              </div>
            </div>
          </div>

          <div className="quick-post-grid">
            <div className="media-upload-section">
              <label className="section-label">Media Upload</label>
              <label className="media-upload-area">
                <input type="file" accept="image/*,video/*" hidden multiple onChange={handleMediaUpload} />
                <i className="fas fa-cloud-upload-alt"></i>
                <strong>{postData.mediaFiles.length ? `${postData.mediaFiles.length} file(s) selected` : 'Upload images or videos'}</strong>
                <span>Drag, drop, or click to browse</span>
              </label>
              {postData.mediaFiles.length > 0 && (
                <div className="selected-media-list">
                  {postData.mediaFiles.map((file) => (
                    <span key={file.name} className="selected-media-pill">{file.name}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="link-preview-section">
              <label className="section-label">Link Preview URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://example.com/landing-page"
                value={postData.linkUrl}
                onChange={(e) => setPostData((prev) => ({ ...prev, linkUrl: e.target.value }))}
              />
              <div className="hashtag-suggestions">
                {HASHTAG_SUGGESTIONS.map((tag) => (
                  <button key={tag} className="hashtag-chip" onClick={() => addHashtag(tag)}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="scheduling-section">
            <label className="section-label">Schedule Post</label>
            <label className="settings-inline-toggle quick-post-toggle">
              <input
                type="checkbox"
                checked={postData.scheduleForLater}
                onChange={(e) => setPostData((prev) => ({ ...prev, scheduleForLater: e.target.checked }))}
              />
              <span>Schedule for later</span>
            </label>
            <div className="time-chip-row quick-post-times">
              {BEST_TIME_SLOTS.map((time) => (
                <button
                  key={time}
                  className={`settings-chip ${postData.scheduledTime === time ? 'active' : ''}`}
                  onClick={() => selectBestTime(time)}
                >
                  {time}
                </button>
              ))}
            </div>
            {postData.scheduleForLater && (
              <div className="date-time-grid">
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    value={postData.scheduledDate}
                    onChange={(e) => setPostData((prev) => ({ ...prev, scheduledDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Time</label>
                  <input
                    type="time"
                    value={postData.scheduledTime}
                    onChange={(e) => setPostData((prev) => ({ ...prev, scheduledTime: e.target.value }))}
                    className="form-input"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="prediction-section">
            <div className="prediction-header">
              <strong>AI Performance Prediction</strong>
              <span>{predictionLabel}</span>
            </div>
            <div className="prediction-meter">
              <div className="prediction-fill" style={{ width: `${predictionScore}%` }}></div>
            </div>
            <p>
              This draft scores {predictionScore}% based on content depth, selected channels, media support, and scheduling readiness.
            </p>
          </div>

          {postData.content && (
            <div className="preview-section">
              <label className="section-label">Preview</label>
              <div className="post-preview">
                <div className="preview-header">
                  <div className="preview-avatar">
                    <i className="fas fa-user"></i>
                  </div>
                  <div className="preview-user-info">
                    <div className="preview-username">Your Account</div>
                    <div className="preview-timestamp">{postData.scheduleForLater ? 'Scheduled' : 'Ready now'}</div>
                  </div>
                </div>
                <div className="preview-content">{postData.content}</div>
                <div className="preview-platforms">
                  {postData.platforms.map((platformId) => (
                    <span key={platformId} className="preview-platform-badge">
                      <i className={getPlatformIcon(platformId)}></i>
                      {platformId.charAt(0).toUpperCase() + platformId.slice(1)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={isPosting}>
            Cancel
          </button>
          <button
            className={`btn ${postData.scheduleForLater ? 'btn-warning' : 'btn-primary'}`}
            onClick={handleSubmit}
            disabled={isPosting || !postData.content.trim() || postData.platforms.length === 0}
          >
            {isPosting ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Processing...
              </>
            ) : postData.scheduleForLater ? (
              <>
                <i className="fas fa-calendar-check mr-2"></i>
                Schedule Post
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane mr-2"></i>
                Publish Now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickPostModal;
