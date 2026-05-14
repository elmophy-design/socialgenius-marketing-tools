import React, { useState } from 'react';
import './CustomPostCard.css';

const CustomPostCard = ({ 
  post,
  onUpdate,
  onDelete,
  onPublish
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post?.content || '');
  const [editedHashtags, setEditedHashtags] = useState(post?.hashtags?.join(' #') || '');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(post?.media?.[0]?.url || null);
  const [mediaType, setMediaType] = useState(post?.media?.[0]?.type || 'image');

  // Sync state with props when they change
  React.useEffect(() => {
    setEditedContent(post?.content || '');
    setEditedHashtags(post?.hashtags?.join(' #') || '');
    setMediaPreview(post?.media?.[0]?.url || null);
    setMediaType(post?.media?.[0]?.type || 'image');
  }, [post]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      const url = URL.createObjectURL(file);
      setMediaPreview(url);
      setMediaType(file.type.startsWith('video/') ? 'video' : 'image');
    }
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType('image');
  };

  const handleSave = () => {
    onUpdate?.({
      ...post,
      content: editedContent,
      hashtags: editedHashtags.split('#').filter(tag => tag.trim()).map(tag => tag.trim()),
      media: mediaPreview ? [{ type: mediaType, url: mediaPreview }] : []
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedContent(post?.content || '');
    setEditedHashtags(post?.hashtags?.join(' #') || '');
    setIsEditing(false);
  };

  return (
    <div className="custom-post-card">
      {/* Header */}
      <div className="custom-post-header">
        <div className="custom-post-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Custom Post</span>
        </div>
        
        <div className="custom-post-actions">
          {!isEditing ? (
            <>
              <button 
                className="icon-btn"
                onClick={() => setIsEditing(true)}
                aria-label="Edit post"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button 
                className="icon-btn danger"
                onClick={() => onDelete?.(post)}
                aria-label="Delete post"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="3 6 5 6 21 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </>
          ) : (
            <>
              <button 
                className="icon-btn"
                onClick={handleCancel}
                aria-label="Cancel editing"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button 
                className="icon-btn success"
                onClick={handleSave}
                aria-label="Save changes"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="custom-post-content">
        {isEditing ? (
          <>
            <div className="edit-field">
              <label className="edit-label">Post Content</label>
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="edit-textarea"
                placeholder="Write your post content here..."
                rows={6}
              />
              <div className="char-counter">
                {editedContent.length} characters
              </div>
            </div>

            <div className="edit-field">
              <label className="edit-label">Hashtags</label>
              <input
                type="text"
                value={editedHashtags}
                onChange={(e) => setEditedHashtags(e.target.value)}
                className="edit-input"
                placeholder="#marketing #socialmedia #content"
              />
            </div>

            <div className="edit-field">
              <label className="edit-label">Media (Image/Video)</label>
              <div className="media-upload-container">
                {mediaPreview ? (
                  <div className="media-preview-frame">
                    {mediaType === 'video' ? (
                      <video src={mediaPreview} controls className="preview-media" />
                    ) : (
                      <img src={mediaPreview} alt="Preview" className="preview-media" />
                    )}
                    <button className="remove-media-btn" onClick={handleRemoveMedia}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" strokeLinecap="round" />
                        <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="media-upload-placeholder">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className="hidden-file-input"
                    />
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="2" />
                      <polyline points="21 15 16 10 5 21" strokeWidth="2" />
                    </svg>
                    <span>Upload Image or Video</span>
                  </label>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {mediaPreview && (
              <div className="post-media-display">
                {mediaType === 'video' ? (
                  <video src={mediaPreview} controls className="display-media" />
                ) : (
                  <img src={mediaPreview} alt="Post media" className="display-media" />
                )}
              </div>
            )}
            <p className="post-content-text">{post?.content}</p>
            {post?.hashtags && post.hashtags.length > 0 && (
              <div className="post-hashtags-display">
                {post.hashtags.map((tag, index) => (
                  <span key={index} className="hashtag-chip">#{tag}</span>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Actions */}
      {!isEditing && (
        <div className="custom-post-footer">
          <button 
            className="publish-btn"
            onClick={() => onPublish?.(post)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="22" y1="2" x2="11" y2="13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Publish Now
          </button>
          <button className="schedule-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Schedule
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomPostCard;