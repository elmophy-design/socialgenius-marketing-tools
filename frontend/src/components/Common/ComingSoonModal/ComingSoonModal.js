import React, { useEffect, useState } from 'react';
import './ComingSoonModal.css';

function ComingSoonModal({ isOpen, onClose, tool }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setSubmitted(false);
    }
  }, [isOpen]);

  if (!isOpen || !tool) {
    return null;
  }

  const handleNotifySubmit = (event) => {
    event.preventDefault();

    if (!email.trim()) {
      return;
    }

    setSubmitted(true);
  };

  return (
    <div className="coming-soon-modal-overlay" onClick={onClose}>
      <div className="coming-soon-modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="coming-soon-close" onClick={onClose} aria-label="Close preview">
          &times;
        </button>

        <span className="coming-soon-kicker">Coming Soon</span>
        <h2>{tool.name || tool.label}</h2>
        <p>{tool.description || tool.cardDescription}</p>

        <div className="coming-soon-points">
          <div className="coming-soon-point">Planned as a polished addition to the SocialGenius tool suite.</div>
          <div className="coming-soon-point">Designed to match the same workflow, access badges, and visual quality.</div>
          <div className="coming-soon-point">Preview card is live now so users can discover what is next.</div>
        </div>

        <form className="coming-soon-form" onSubmit={handleNotifySubmit}>
          <label htmlFor="coming-soon-email">Notify me when this tool is ready</label>
          <div className="coming-soon-form-row">
            <input
              id="coming-soon-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
            <button type="submit" className="coming-soon-btn primary">
              Notify Me
            </button>
          </div>
          {submitted && (
            <div className="coming-soon-success">
              Thanks. We will use this email for launch updates when the tool is ready.
            </div>
          )}
        </form>

        <div className="coming-soon-actions">
          <button type="button" className="coming-soon-btn secondary" onClick={onClose}>
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}

export default ComingSoonModal;
