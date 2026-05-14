import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ComingSoonModal from '../Common/ComingSoonModal/ComingSoonModal';
import './ToolPageShell.css';

function FooterPaymentBadges() {
  return (
    <div className="tool-shell-footer-payments" aria-label="Accepted payments">
      <span className="tool-shell-payment-badge is-paystack">
        <span className="tool-shell-payment-badge-icon">
          <img src="/payment-logos/paystack.svg" alt="Paystack" />
        </span>
        <span className="tool-shell-payment-badge-copy">
          <strong>Paystack</strong>
          <small>Cards and bank transfer</small>
        </span>
      </span>
      <span className="tool-shell-payment-badge is-paypal">
        <span className="tool-shell-payment-badge-icon">
          <img src="/payment-logos/paypal.svg" alt="PayPal" />
        </span>
        <span className="tool-shell-payment-badge-copy">
          <strong>PayPal</strong>
          <small>Global checkout</small>
        </span>
      </span>
      <span className="tool-shell-payment-badge is-card">
        <span className="tool-shell-payment-badge-icon">
          <img src="/payment-logos/visa.svg" alt="Visa" />
        </span>
        <span className="tool-shell-payment-badge-copy">
          <strong>Visa</strong>
          <small>Secure card payments</small>
        </span>
      </span>
      <span className="tool-shell-payment-badge is-card">
        <span className="tool-shell-payment-badge-icon">
          <img src="/payment-logos/mastercard.svg" alt="Mastercard" />
        </span>
        <span className="tool-shell-payment-badge-copy">
          <strong>Mastercard</strong>
          <small>Accepted worldwide</small>
        </span>
      </span>
    </div>
  );
}

function ToolGlyph({ type }) {
  const sharedProps = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.8',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true'
  };

  switch (type) {
    case 'social':
      return (
        <svg {...sharedProps}>
          <rect x="5" y="4.5" width="14" height="15" rx="3" />
          <path d="M8 9.5h8M8 13h5M8 16.5h4" />
        </svg>
      );
    case 'headline':
      return (
        <svg {...sharedProps}>
          <path d="M5 7h14M5 12h14M5 17h9" />
          <circle cx="18" cy="17" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'seo':
      return (
        <svg {...sharedProps}>
          <circle cx="10.5" cy="10.5" r="5.5" />
          <path d="m15 15 4 4" />
        </svg>
      );
    case 'value':
      return (
        <svg {...sharedProps}>
          <path d="M12 19s-6-3.8-6-8.5A3.5 3.5 0 0 1 12 8a3.5 3.5 0 0 1 6 2.5C18 15.2 12 19 12 19Z" />
          <path d="M9.5 11.5h5" />
        </svg>
      );
    case 'ad':
      return (
        <svg {...sharedProps}>
          <path d="M5 15.5V8.5M10 15.5V5.5M15 15.5v-4M19 18.5H4" />
        </svg>
      );
    case 'email':
      return (
        <svg {...sharedProps}>
          <rect x="4" y="6.5" width="16" height="11" rx="2" />
          <path d="m5.5 8 6.5 5 6.5-5" />
        </svg>
      );
    case 'content':
      return (
        <svg {...sharedProps}>
          <path d="M7 5.5h10M7 10.5h10M7 15.5h6" />
          <path d="M5 5.5h.01M5 10.5h.01M5 15.5h.01" />
        </svg>
      );
    case 'funnel':
      return (
        <svg {...sharedProps}>
          <path d="M4.5 6h15l-5.5 6v4.5l-4 1.5V12L4.5 6Z" />
        </svg>
      );
    case 'voice':
      return (
        <svg {...sharedProps}>
          <rect x="9" y="4.5" width="6" height="10" rx="3" />
          <path d="M6.5 11.5a5.5 5.5 0 0 0 11 0M12 17v3.5M9 20.5h6" />
        </svg>
      );
    case 'hub':
      return (
        <svg {...sharedProps}>
          <rect x="4.5" y="4.5" width="6" height="6" rx="1.5" />
          <rect x="13.5" y="4.5" width="6" height="6" rx="1.5" />
          <rect x="4.5" y="13.5" width="6" height="6" rx="1.5" />
          <rect x="13.5" y="13.5" width="6" height="6" rx="1.5" />
        </svg>
      );
    default:
      return null;
  }
}

const TOOL_ITEMS = [
  {
    key: 'social-media',
    label: 'AI Social Media Generator',
    title: 'Social Media Generator',
    shortLabel: 'Social Studio',
    cardDescription: 'Create engaging social media posts and captions for every campaign.',
    accent: 'teal',
    route: '/tools/social-media',
    mark: 'SM',
    icon: 'social'
  },
  {
    key: 'headline-analyzer',
    label: 'Headline Analyzer',
    title: 'Headline Analyzer',
    shortLabel: 'Headline Score',
    cardDescription: 'Analyze headlines and improve clarity, emotion, and click appeal.',
    accent: 'coral',
    route: '/tools/headline-analyzer',
    mark: 'HA',
    icon: 'headline'
  },
  {
    key: 'seo-meta',
    label: 'SEO Meta Generator',
    title: 'SEO Meta Generator',
    shortLabel: 'SEO Ready',
    cardDescription: 'Optimize page titles and descriptions for stronger search visibility.',
    accent: 'emerald',
    route: '/tools/seo-meta',
    mark: 'SEO',
    icon: 'seo'
  },
  {
    key: 'value-proposition',
    label: 'Value Proposition',
    title: 'Value Proposition Generator',
    shortLabel: 'Positioning Lab',
    cardDescription: 'Build sharper positioning and persuasive messaging that converts.',
    accent: 'gold',
    route: '/tools/value-proposition',
    mark: 'VP',
    icon: 'value'
  },
  {
    key: 'ad-copy',
    label: 'Ad Copy Generator',
    title: 'AI Ad Copy Generator',
    shortLabel: 'Campaign Copy',
    cardDescription: 'Generate engaging, high-converting advertisements automatically.',
    accent: 'rose',
    route: '/tools/ad-copy',
    mark: 'AD',
    icon: 'ad'
  },
  {
    key: 'email-tester',
    label: 'Email Subject Line Tester',
    title: 'Email Subject Line Tester',
    shortLabel: 'Inbox Impact',
    cardDescription: 'Analyze and score subject lines for better open-rate performance.',
    accent: 'violet',
    route: '/tools/email-tester',
    mark: 'EM',
    icon: 'email'
  },
  {
    key: 'content-idea',
    label: 'Content Idea Generator',
    title: 'Content Idea Generator',
    shortLabel: 'Idea Engine',
    cardDescription: 'Generate fresh article, blog, and campaign ideas in minutes.',
    accent: 'sky',
    route: '/tools/content-idea',
    mark: 'CI',
    icon: 'content'
  },
  {
    key: 'funnel-builder',
    label: 'Funnel Builder',
    title: 'Funnel Builder',
    shortLabel: 'Growth Flow',
    cardDescription: 'Map smarter funnel stages and campaign paths across the buyer journey.',
    accent: 'indigo',
    route: '/tools/funnel-builder',
    mark: 'FB',
    icon: 'funnel'
  },
  {
    key: 'voice-studio',
    label: 'Voice to Speech Studio',
    title: 'Voice to Speech Studio',
    shortLabel: 'Audio Lab',
    cardDescription: 'Generate polished voice-driven audio workflows and studio-quality narration tools.',
    accent: 'navy',
    route: null,
    mark: 'VS',
    icon: 'voice',
    comingSoon: true
  },
  {
    key: 'skill-hub',
    label: 'Skill Hub',
    title: 'Skill Hub',
    shortLabel: 'Workflow Hub',
    cardDescription: 'Organize reusable prompt skills, tool workflows, and team-ready playbooks in one place.',
    accent: 'slate',
    route: null,
    mark: 'SH',
    icon: 'hub',
    comingSoon: true
  }
];

const DEFAULT_TOOL = TOOL_ITEMS[0];

const SECTION_LINKS = [
  {
    label: 'Features',
    selectors: ['#features', '#features-section', '[data-section="features"]'],
    headingMatches: ['features', 'powerful features']
  },
  {
    label: 'How It Works',
    selectors: ['#how-it-works', '#how-it-works-section', '[data-section="how-it-works"]'],
    headingMatches: ['how it works']
  },
  {
    label: 'Best Practices',
    selectors: ['#best-practices', '#best-practices-section', '[data-section="best-practices"]'],
    headingMatches: ['best practices']
  }
];

function readStoredJson(key) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    return null;
  }
}

function getTrialDaysRemaining(subscription) {
  if (!subscription || subscription.plan !== 'trial') {
    return null;
  }

  const explicitTrialDate = subscription.trialEndDate || subscription.trialEndsAt;
  let endDate = explicitTrialDate ? new Date(explicitTrialDate) : null;

  if (!endDate || Number.isNaN(endDate.getTime())) {
    const storedUser = readStoredJson('user');
    const createdAt = storedUser?.createdAt ? new Date(storedUser.createdAt) : null;

    if (createdAt && !Number.isNaN(createdAt.getTime())) {
      endDate = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
  }

  if (!endDate || Number.isNaN(endDate.getTime())) {
    return null;
  }

  const diffTime = endDate.getTime() - Date.now();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

function getPlanBadge(subscription, trialDaysRemaining) {
  const plan = subscription?.plan || 'trial';

  if (plan === 'trial') {
    return {
      label: 'Trial',
      detail: `${trialDaysRemaining ?? 0} day${trialDaysRemaining === 1 ? '' : 's'} left`,
      className: 'is-trial'
    };
  }

  return {
    label: `${plan.charAt(0).toUpperCase()}${plan.slice(1)} Plan`,
    detail: subscription?.status === 'active' ? 'Active' : 'Subscription',
    className: 'is-paid'
  };
}

function ToolPageShell({ toolKey, children }) {
  const location = useLocation();
  const activeTool = TOOL_ITEMS.find((tool) => tool.key === toolKey) || DEFAULT_TOOL;
  const isSocialMediaShell = toolKey === 'social-media';
  const subscription = readStoredJson('subscription');
  const trialDaysRemaining = getTrialDaysRemaining(subscription);
  const badge = getPlanBadge(subscription, trialDaysRemaining);
  const [previewTool, setPreviewTool] = useState(null);
  const liveFooterTools = useMemo(() => TOOL_ITEMS.filter((tool) => tool.route).slice(0, 4), []);

  const scrollToMainTool = useCallback(() => {
    const mainTool = document.getElementById('tool-workspace');

    if (mainTool) {
      mainTool.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  useEffect(() => {
    if (location.hash === '#tool-workspace') {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(scrollToMainTool);
      });
    }
  }, [location.hash, location.pathname, scrollToMainTool]);

  const scrollToSection = useCallback((sectionConfig) => {
    const root = document.querySelector('.tool-shell-content');

    if (!root) {
      return;
    }

    const directMatch = sectionConfig.selectors
      .map((selector) => root.querySelector(selector))
      .find(Boolean);

    if (directMatch) {
      directMatch.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    const headingMatch = Array.from(root.querySelectorAll('h2, h3')).find((node) => {
      const text = (node.textContent || '').trim().toLowerCase();
      return sectionConfig.headingMatches.some((match) => text.includes(match));
    });

    if (headingMatch) {
      headingMatch.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <div className={`tool-shell-page tool-shell-${activeTool.accent}`}>
      {!isSocialMediaShell && (
        <header className="tool-shell-header">
          <div className="tool-shell-topbar">
            <div className="tool-shell-brand-lockup">
              <Link to={activeTool.route} className="tool-shell-brand" aria-label={activeTool.title}>
                <span className="tool-shell-brand-mark">
                  <ToolGlyph type={activeTool.icon} />
                </span>
                <span className="tool-shell-brand-title">{activeTool.title}</span>
              </Link>
              <div className={`tool-shell-status-badge ${badge.className}`}>
                <span className="tool-shell-status-label">{badge.label}</span>
                <span className="tool-shell-status-detail">{badge.detail}</span>
              </div>
            </div>

            <div className="tool-shell-topbar-actions">
              <Link to="/dashboard" className="tool-shell-dashboard-link">
                Back to Dashboard
              </Link>

              <nav className="tool-shell-anchor-nav" aria-label="Tool sections">
                {SECTION_LINKS.map((section) => (
                  <button
                    key={section.label}
                    type="button"
                    className="tool-shell-anchor-link"
                    onClick={() => scrollToSection(section)}
                  >
                    {section.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="tool-shell-directory">
            <div className="tool-shell-directory-heading">
              <span className="tool-shell-directory-kicker">{activeTool.shortLabel}</span>
              <h1>More Content Tools</h1>
              <p>Enhance your content creation workflow with polished AI tools built for faster execution.</p>
            </div>

            <div className="tool-shell-directory-grid">
              {TOOL_ITEMS.map((tool) => {
                const isActive = location.pathname === tool.route;
                const cardBadge = tool.comingSoon
                  ? { label: 'Coming Soon', detail: 'In design', className: 'is-coming-soon' }
                  : badge;
                const cardClassName = `tool-shell-tool-card${isActive ? ' is-active' : ''}${tool.comingSoon ? ' is-coming-soon-card' : ''}`;
                const cardContent = (
                  <>
                    <div className="tool-shell-tool-card-top">
                      <span className={`tool-shell-tool-icon tool-shell-tool-icon-${tool.accent}`}>
                        <ToolGlyph type={tool.icon} />
                      </span>
                      <span className={`tool-shell-tool-badge ${cardBadge.className}`}>
                        {cardBadge.label}: {cardBadge.detail}
                      </span>
                    </div>

                    <h2>{tool.label}</h2>
                    <p>{tool.cardDescription}</p>
                  </>
                );

                if (tool.route) {
                  return (
                    <Link
                      key={tool.key}
                      to={`${tool.route}#tool-workspace`}
                      className={cardClassName}
                      onClick={(event) => {
                        if (isActive) {
                          event.preventDefault();
                          scrollToMainTool();
                        }
                      }}
                    >
                      {cardContent}
                    </Link>
                  );
                }

                return (
                  <div
                    key={tool.key}
                    className={cardClassName}
                    onClick={() => setPreviewTool(tool)}
                  >
                    {cardContent}
                  </div>
                );
              })}
            </div>
          </div>
        </header>
      )}

      <div id="tool-workspace" className="tool-shell-content">
        {children}
      </div>

      <footer className="tool-shell-footer">
        <div className="tool-shell-footer-surface">
          <div className="tool-shell-footer-grid">
            <div className="tool-shell-footer-brand">
              <span className="tool-shell-footer-mark">
                <img src="/logo.svg" alt="SocialGenius logo" className="tool-shell-footer-logo" />
              </span>
              <div>
                <h2>SocialGenius Tools</h2>
                <p>Organized, consistent AI workflows for content, campaigns, and conversion-focused marketing.</p>
              </div>
            </div>

            <div className="tool-shell-footer-column">
              <h3>Navigate</h3>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/features">Features</Link>
              <Link to="/subscription">Subscription</Link>
            </div>

            <div className="tool-shell-footer-column">
              <h3>Tool Suite</h3>
              {liveFooterTools.map((tool) => (
                <Link key={tool.key} to={tool.route}>
                  {tool.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="tool-shell-footer-bottom">
            <span className="tool-shell-footer-caption">Built for cleaner workflows, stronger output, and a more professional tool experience.</span>
            <FooterPaymentBadges />
            <span className="tool-shell-footer-copy">&copy; 2026 SocialGenius</span>
          </div>
        </div>
      </footer>

      <ComingSoonModal
        isOpen={Boolean(previewTool)}
        tool={previewTool}
        onClose={() => setPreviewTool(null)}
      />
    </div>
  );
}

export default ToolPageShell;
