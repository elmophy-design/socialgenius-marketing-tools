// frontend/src/components/Tools/SocialMedia/modals/ScheduleModal.jsx
import React, { useEffect, useState } from 'react';
import './ScheduleModal.css';

const buildInitialScheduleData = (post) => ({
    date: '',
    time: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    platforms: post ? [post.platform] : [],
    repeat: 'none',
    repeatInterval: 1,
    customMessage: '',
    optimizeTime: true
  });

const ScheduleModal = ({ isOpen, onClose, post, connectedAccounts, onScheduleSuccess }) => {
  const [scheduleData, setScheduleData] = useState(buildInitialScheduleData(post));
  const [validationError, setValidationError] = useState('');

  const [isScheduling, setIsScheduling] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setScheduleData(buildInitialScheduleData(post));
      setValidationError('');
      setIsScheduling(false);
    }
  }, [isOpen, post]);

  if (!isOpen) return null;

  // Get min date (today) and max date (90 days from now)
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];
  const maxDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // AI suggestions for optimal posting times
  const aiSuggestions = {
    bestTimes: ['09:00', '12:00', '15:00', '18:00', '21:00'],
    bestDays: ['Tuesday', 'Thursday', 'Saturday'],
    expectedEngagement: 'High',
    platformRecommendations: {
      instagram: '14:00-16:00',
      twitter: '08:00-10:00',
      facebook: '13:00-15:00',
      linkedin: '09:00-11:00'
    }
  };

  const repeatOptions = [
    { value: 'none', label: 'Do not repeat', icon: 'fas fa-times' },
    { value: 'daily', label: 'Daily', icon: 'fas fa-calendar-day' },
    { value: 'weekly', label: 'Weekly', icon: 'fas fa-calendar-week' },
    { value: 'monthly', label: 'Monthly', icon: 'fas fa-calendar-alt' },
    { value: 'custom', label: 'Custom Interval', icon: 'fas fa-cog' }
  ];

  const handleQuickSchedule = (hours) => {
    const scheduledTime = new Date(Date.now() + hours * 60 * 60 * 1000);
    setScheduleData(prev => ({
      ...prev,
      date: scheduledTime.toISOString().split('T')[0],
      time: scheduledTime.toTimeString().slice(0, 5)
    }));
  };

  const handlePlatformToggle = (platformId) => {
    setScheduleData(prev => {
      const newPlatforms = prev.platforms.includes(platformId)
        ? prev.platforms.filter(id => id !== platformId)
        : [...prev.platforms, platformId];
      
      return { ...prev, platforms: newPlatforms };
    });
  };

  const handleSchedule = async () => {
    // Validation
    if (!scheduleData.date || !scheduleData.time) {
      setValidationError('Please select both a date and a time.');
      return;
    }

    if (scheduleData.platforms.length === 0) {
      setValidationError('Please select at least one connected platform.');
      return;
    }

    // Check if scheduled time is in the future
    const scheduledDateTime = new Date(`${scheduleData.date}T${scheduleData.time}`);
    if (scheduledDateTime < new Date()) {
      setValidationError('Please select a future date and time.');
      return;
    }

    setIsScheduling(true);
    setValidationError('');

    try {
      // Create schedule object
      const schedule = {
        post: post || { id: Date.now() },
        scheduledAt: scheduledDateTime.toISOString(),
        platforms: scheduleData.platforms,
        timezone: scheduleData.timezone,
        repeat: scheduleData.repeat,
        repeatInterval: scheduleData.repeatInterval,
        customMessage: scheduleData.customMessage,
        optimizeTime: scheduleData.optimizeTime
      };

      // Call success callback
      if (onScheduleSuccess) {
        await onScheduleSuccess(schedule);
      }
    } catch (error) {
      console.error('Scheduling failed:', error);
      setValidationError(error.message || 'Failed to schedule post. Please try again.');
    } finally {
      setIsScheduling(false);
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

  const availablePlatforms = connectedAccounts || [];

  return (
    <div className="modal-overlay schedule-modal-overlay" onClick={onClose}>
      <div className="modal-content schedule-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h3 className="modal-title">
              <i className="fas fa-calendar-plus mr-2 text-blue-500"></i>
              Schedule Post
            </h3>
            <p className="modal-subtitle">
              Choose when to publish your content
            </p>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body schedule-modal-body">
          {validationError && (
            <div className="schedule-summary" style={{ marginBottom: '1rem', borderColor: '#fecaca', background: '#fff1f2', color: '#b91c1c' }}>
              <i className="fas fa-exclamation-circle text-red-500 mr-2"></i>
              <span>{validationError}</span>
            </div>
          )}

          {/* Post Preview (if provided) */}
          {post && (
            <div className="post-preview-section">
              <h4 className="section-label">Post Preview</h4>
              <div className="post-preview-card">
                <div className="preview-header">
                  <i className={getPlatformIcon(post.platform)}></i>
                  <span className="platform-name">{post.platform}</span>
                </div>
                <div className="preview-content">
                  {post.copy?.substring(0, 200)}
                  {post.copy?.length > 200 && '...'}
                </div>
                {post.hashtags && post.hashtags.length > 0 && (
                  <div className="preview-hashtags">
                    {post.hashtags.slice(0, 3).map(tag => `#${tag}`).join(' ')}
                    {post.hashtags.length > 3 && ' ...'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Suggestions */}
          <div className="ai-suggestions-section">
            <h4 className="section-label">
              <i className="fas fa-brain mr-2 text-purple-500"></i>
              AI Recommendations
            </h4>
            <div className="ai-suggestions-grid">
              <div className="ai-suggestion">
                <i className="fas fa-clock text-blue-500"></i>
                <div>
                  <div className="suggestion-label">Best Times Today</div>
                  <div className="suggestion-value">
                    {aiSuggestions.bestTimes.slice(0, 3).join(', ')}
                  </div>
                </div>
              </div>
              <div className="ai-suggestion">
                <i className="fas fa-calendar-alt text-green-500"></i>
                <div>
                  <div className="suggestion-label">Best Days</div>
                  <div className="suggestion-value">
                    {aiSuggestions.bestDays.join(', ')}
                  </div>
                </div>
              </div>
            </div>
            <label className="optimize-checkbox">
              <input
                type="checkbox"
                checked={scheduleData.optimizeTime}
                onChange={(e) => setScheduleData(prev => ({ ...prev, optimizeTime: e.target.checked }))}
              />
              <span>Use AI to optimize posting time</span>
            </label>
          </div>

          {/* Quick Schedule Buttons */}
          <div className="quick-schedule-section">
            <h4 className="section-label">Quick Schedule</h4>
            <div className="quick-schedule-grid">
              <button
                type="button"
                className="quick-schedule-btn"
                onClick={() => handleQuickSchedule(1)}
              >
                <i className="fas fa-clock"></i>
                <span>In 1 hour</span>
              </button>
              <button
                type="button"
                className="quick-schedule-btn"
                onClick={() => handleQuickSchedule(3)}
              >
                <i className="fas fa-clock"></i>
                <span>In 3 hours</span>
              </button>
              <button
                type="button"
                className="quick-schedule-btn"
                onClick={() => handleQuickSchedule(24)}
              >
                <i className="fas fa-calendar-day"></i>
                <span>Tomorrow</span>
              </button>
              <button
                type="button"
                className="quick-schedule-btn"
                onClick={() => handleQuickSchedule(168)}
              >
                <i className="fas fa-calendar-week"></i>
                <span>Next week</span>
              </button>
            </div>
          </div>

          {/* Custom Date & Time */}
          <div className="custom-schedule-section">
            <h4 className="section-label">Custom Date & Time</h4>
            <div className="date-time-grid">
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  value={scheduleData.date}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, date: e.target.value }))}
                  min={minDate}
                  max={maxDate}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Time</label>
                <input
                  type="time"
                  value={scheduleData.time}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, time: e.target.value }))}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Timezone */}
          <div className="timezone-section">
            <h4 className="section-label">Timezone</h4>
            <select
              value={scheduleData.timezone}
              onChange={(e) => setScheduleData(prev => ({ ...prev, timezone: e.target.value }))}
              className="form-select"
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Europe/Paris">Paris (CET)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
              <option value="Australia/Sydney">Sydney (AEST)</option>
            </select>
          </div>

          {/* Platform Selection */}
          <div className="platform-selection-section">
            <h4 className="section-label">Select Platforms ({scheduleData.platforms.length} selected)</h4>
            <div className="platforms-grid">
              {availablePlatforms.map(platform => (
                <button
                  key={platform.id}
                  className={`platform-selector ${scheduleData.platforms.includes(platform.id) ? 'selected' : ''}`}
                  onClick={() => handlePlatformToggle(platform.id)}
                >
                  <i className={getPlatformIcon(platform.id)}></i>
                  <span>{platform.name}</span>
                  {scheduleData.platforms.includes(platform.id) && (
                    <i className="fas fa-check-circle check-icon"></i>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Repeat Options */}
          <div className="repeat-section">
            <h4 className="section-label">Repeat</h4>
            <div className="repeat-options-grid">
              {repeatOptions.map(option => (
                <label key={option.value} className="repeat-option">
                  <input
                    type="radio"
                    name="repeat"
                    value={option.value}
                    checked={scheduleData.repeat === option.value}
                    onChange={(e) => setScheduleData(prev => ({ ...prev, repeat: e.target.value }))}
                    className="hidden"
                  />
                  <div className={`repeat-option-card ${scheduleData.repeat === option.value ? 'active' : ''}`}>
                    <i className={`${option.icon} option-icon`}></i>
                    <span>{option.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Message */}
          <div className="custom-message-section">
            <h4 className="section-label">
              Custom Message (Optional)
              <span className="text-sm text-gray-500 ml-2">Modify for this schedule only</span>
            </h4>
            <textarea
              value={scheduleData.customMessage}
              onChange={(e) => setScheduleData(prev => ({ ...prev, customMessage: e.target.value }))}
              placeholder="Leave empty to use original content..."
              className="form-textarea"
              rows={3}
            />
          </div>

          {/* Schedule Summary */}
          {scheduleData.date && scheduleData.time && (
            <div className="schedule-summary">
              <i className="fas fa-info-circle text-blue-500 mr-2"></i>
              <span>
                Will be published on{' '}
                <strong>
                  {new Date(`${scheduleData.date}T${scheduleData.time}`).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </strong>
                {' at '}
                <strong>
                  {new Date(`${scheduleData.date}T${scheduleData.time}`).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </strong>
                {scheduleData.repeat !== 'none' && (
                  <>
                    {' and repeated '}
                    <strong>
                      {scheduleData.repeat === 'daily' ? 'daily' : 
                       scheduleData.repeat === 'weekly' ? 'weekly' : 
                       scheduleData.repeat === 'monthly' ? 'monthly' : 
                       'on a custom schedule'}
                    </strong>
                  </>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={isScheduling}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSchedule}
            className="btn btn-primary"
            disabled={isScheduling || !scheduleData.date || !scheduleData.time || scheduleData.platforms.length === 0}
          >
            {isScheduling ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Scheduling...
              </>
            ) : (
              <>
                <i className="fas fa-calendar-check mr-2"></i>
                Schedule Post
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleModal;
