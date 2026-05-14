// frontend/src/components/Tools/SocialMedia/modals/ProfileModal.jsx
import React from 'react';
import './ProfileModal.css';

const ProfileModal = ({ isOpen, onClose, user, onUpdateProfile }) => {
  if (!isOpen) return null;

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleEdit = () => {
    // In a real implementation, you would open an edit form
    // For now, we'll just close the modal
    if (onUpdateProfile) {
      // You would typically open another modal or form for editing
      onUpdateProfile(user);
    }
  };

  return (
    <div className="modal-overlay profile-modal-overlay" onClick={onClose}>
      <div className="modal-content profile-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h3 className="modal-title">
              <i className="fas fa-user-circle mr-2 text-blue-500"></i>
              Profile
            </h3>
            <p className="modal-subtitle">View and manage your profile information</p>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body profile-modal-body">
          {/* Profile Picture Section */}
          <div className="profile-picture-section">
            <div className="profile-picture-container">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.userName}
                  className="profile-picture-large"
                />
              ) : (
                <div className="profile-picture-large-placeholder">
                  {getInitials(user?.userName)}
                </div>
              )}
            </div>
            <div className="profile-info-summary">
              <h2 className="profile-name-large">{user?.userName || 'User'}</h2>
              <p className="profile-email-large">{user?.userEmail || ''}</p>
              <p className="profile-company">{user?.company || 'No company set'}</p>
            </div>
          </div>

          {/* Profile Information */}
          <div className="profile-details-section">
            <h4 className="section-title">Personal Information</h4>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Full Name</span>
                <span className="detail-value">{user?.userName || 'Not set'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email Address</span>
                <span className="detail-value">{user?.userEmail || 'Not set'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Company</span>
                <span className="detail-value">{user?.company || 'Not set'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Member Since</span>
                <span className="detail-value">{formatDate(user?.createdAt || new Date().toISOString())}</span>
              </div>
            </div>
          </div>

          {/* Account Stats */}
          <div className="account-stats-section">
            <h4 className="section-title">Account Statistics</h4>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-chart-bar text-blue-500"></i>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{user?.totalPosts || 0}</div>
                  <div className="stat-label">Total Posts</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-heart text-red-500"></i>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{user?.engagementRate || 0}%</div>
                  <div className="stat-label">Engagement Rate</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-link text-green-500"></i>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{user?.connectedCount || 0}</div>
                  <div className="stat-label">Connected Accounts</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-calendar text-orange-500"></i>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{user?.scheduledCount || 0}</div>
                  <div className="stat-label">Scheduled Posts</div>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Info */}
          <div className="subscription-section">
            <h4 className="section-title">Current Plan</h4>
            <div className={`subscription-plan-card plan-${user?.plan || 'trial'}`}>
              <div className="plan-header">
                <div className="plan-title">
                  <i className="fas fa-crown text-yellow-500 mr-2"></i>
                  <span>{user?.plan ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1) : 'Trial'} Plan</span>
                </div>
                <span className={`plan-badge ${user?.plan || 'trial'}`}>
                  {user?.plan ? user.plan.toUpperCase() : 'TRIAL'}
                </span>
              </div>
              <div className="plan-details">
                {user?.plan === 'trial' ? (
                  <div className="plan-feature">
                    <i className="fas fa-clock text-amber-500 mr-2"></i>
                    <span>Limited to 3 posts per generation</span>
                  </div>
                ) : (
                  <div className="plan-feature">
                    <i className="fas fa-check-circle text-green-500 mr-2"></i>
                    <span>{user?.plan === 'basic' ? 'Up to 5 posts' : 'Unlimited posts'} per generation</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary" onClick={handleEdit}>
            <i className="fas fa-edit mr-2"></i>
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;