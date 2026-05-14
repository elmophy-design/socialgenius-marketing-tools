import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../css/Landing.css';

function LegalPageLayout({ title, subtitle, children }) {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <header className="landing-header">
        <nav className="landing-nav">
          <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <span className="logo-icon">
              <img
                src="/logo.svg"
                alt="Meritlives Logo"
                style={{ height: '2.2rem', width: '2.2rem', display: 'block' }}
              />
            </span>
            <span style={{ fontWeight: 700, fontSize: '1.7rem', letterSpacing: '0.5px' }}>
              Meritlives AI Tools
            </span>
          </div>

          <div className="nav-links">
            <Link to="/features">Features</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/contact">Contact</Link>
          </div>

          <div className="nav-actions">
            <button className="btn-fancy-auth" onClick={() => navigate('/login')} style={{ marginRight: '0.7em' }}>
              Login
            </button>
            <button className="btn-fancy-auth" onClick={() => navigate('/signup')}>
              Signup for Free
            </button>
          </div>
        </nav>
      </header>

      <main className="landing-main">
        <div className="legal-page-section">
          <h2>{title}</h2>
          <p className="legal-page-subtitle">{subtitle}</p>
          <div className="legal-page-content">{children}</div>
        </div>
        <div style={{ padding: '0 2rem' }}>
          <div className="legal-links-container" style={{ marginTop: '0', background: 'transparent', borderTop: '1px solid #e2e8f0', paddingTop: '40px' }}>
            <div className="legal-links-grid">
              {[
                { name: 'Privacy Policy', path: '/privacy', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg> },
                { name: 'Terms of Service', path: '/terms', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg> },
                { name: 'Refund Policy', path: '/refund-policy', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg> },
                { name: 'Security', path: '/security', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> },
                { name: 'Trust Center', path: '/trust', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg> }
              ].map((link) => (
                <div key={link.name} className="legal-link-item" onClick={() => navigate(link.path)} style={{ background: '#fff' }}>
                  <span className="legal-link-icon">{link.icon}</span>
                  <span className="legal-link-name">{link.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Meritlives AI Tools</h3>
            <p>Enterprise-grade marketing tools powered by AI.</p>
          </div>
          <div className="footer-section">
            <h4>Product</h4>
            <Link to="/features">Features</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/refund-policy">Refund Policy</Link>
            <Link to="/security">Security</Link>
            <Link to="/trust">Trust Center</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Meritlives AI Tools. All rights reserved.</p>
          <div className="footer-payment-strip" aria-label="Accepted payments">
            <span className="footer-payment-badge is-paystack">
              <span className="footer-payment-badge-icon"><img src="/payment-logos/paystack.svg" alt="Paystack" /></span>
              <span className="footer-payment-badge-copy">
                <strong>Paystack</strong>
                <small>Cards and bank transfer</small>
              </span>
            </span>
            <span className="footer-payment-badge is-paypal">
              <span className="footer-payment-badge-icon"><img src="/payment-logos/paypal.svg" alt="PayPal" /></span>
              <span className="footer-payment-badge-copy">
                <strong>PayPal</strong>
                <small>Global checkout</small>
              </span>
            </span>
            <span className="footer-payment-badge is-card">
              <span className="footer-payment-badge-icon"><img src="/payment-logos/visa.svg" alt="Visa" /></span>
              <span className="footer-payment-badge-copy">
                <strong>Visa</strong>
                <small>Secure card payments</small>
              </span>
            </span>
            <span className="footer-payment-badge is-card">
              <span className="footer-payment-badge-icon"><img src="/payment-logos/mastercard.svg" alt="Mastercard" /></span>
              <span className="footer-payment-badge-copy">
                <strong>Mastercard</strong>
                <small>Accepted worldwide</small>
              </span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      subtitle="How we collect, use, store, and protect your data across the Meritlives AI Tools platform."
    >
      <section>
        <h3>Information We Collect</h3>
        <p>We collect account details such as your name, email address, company information, subscription status, billing references, and the content you submit into our tools so we can provide the service.</p>
      </section>
      <section>
        <h3>How We Use Information</h3>
        <p>We use your data to operate the platform, authenticate your account, process subscriptions, personalize your dashboard, provide support, and improve product quality and reliability.</p>
      </section>
      <section>
        <h3>Payments and Billing</h3>
        <p>Payments are processed through third-party providers such as Paystack and PayPal. We do not store full card details in the application database.</p>
      </section>
      <section>
        <h3>Data Security</h3>
        <p>We use reasonable technical and organizational safeguards to protect user data, including access controls, secure API handling, and provider-managed payment workflows.</p>
      </section>
      <section>
        <h3>Your Rights</h3>
        <p>You may request updates to your profile information, request account support, and ask about deletion or export options where applicable under your operating jurisdiction.</p>
      </section>
    </LegalPageLayout>
  );
}

export function TermsPage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      subtitle="The rules, responsibilities, and acceptable use expectations for using Meritlives AI Tools."
    >
      <section>
        <h3>Use of Service</h3>
        <p>You may use the platform only for lawful business and content creation purposes. You are responsible for all activity under your account and for protecting your login credentials.</p>
      </section>
      <section>
        <h3>Subscriptions</h3>
        <p>Access to paid features depends on your active subscription plan. Trial access, feature availability, plan limits, and billing schedules may vary by plan.</p>
      </section>
      <section>
        <h3>Acceptable Content</h3>
        <p>You must not use the platform to create unlawful, harmful, deceptive, infringing, or abusive content. We may suspend access where misuse is identified.</p>
      </section>
      <section>
        <h3>Service Availability</h3>
        <p>We aim to keep the service available and reliable, but uptime is not guaranteed unless explicitly covered by a separate enterprise agreement.</p>
      </section>
      <section>
        <h3>Changes to Terms</h3>
        <p>We may update these terms as the product evolves. Continued use of the service after updates means you accept the revised terms.</p>
      </section>
    </LegalPageLayout>
  );
}

export function RefundPolicyPage() {
  return (
    <LegalPageLayout
      title="Refund and Billing Policy"
      subtitle="A clear overview of plan billing, payment expectations, and how refunds should be reviewed."
    >
      <section>
        <h3>Trial Access</h3>
        <p>The free trial gives temporary access to platform features without requiring a paid plan. After the trial expires, paid access is required for continued premium use.</p>
      </section>
      <section>
        <h3>Recurring Billing</h3>
        <p>Paid subscriptions renew according to the billing cycle shown at checkout unless cancelled before the renewal date.</p>
      </section>
      <section>
        <h3>Refund Requests</h3>
        <p>Refund requests should be reviewed based on your launch policy, subscription age, provider records, and whether service access has already been substantially used.</p>
      </section>
      <section>
        <h3>Failed Payments</h3>
        <p>If a renewal payment fails, access may be limited until billing is successfully resolved through the available payment provider.</p>
      </section>
      <section>
        <h3>Support</h3>
        <p>For billing questions, plan changes, or refund review requests, please contact support through the app contact page.</p>
      </section>
    </LegalPageLayout>
  );
}

export function SecurityPage() {
  return (
    <LegalPageLayout
      title="Security"
      subtitle="How Meritlives AI Tools protects accounts, billing workflows, and user-generated marketing content."
    >
      <section>
        <h3>Account Protection</h3>
        <p>Access is protected through authenticated sessions, token-based API requests, and role-aware route protection for dashboard, billing, and subscription features.</p>
      </section>
      <section>
        <h3>Payment Safety</h3>
        <p>Checkout is handled through payment providers such as Paystack and PayPal. Full card details are not stored in the application database, and provider webhooks are used to verify payment outcomes.</p>
      </section>
      <section>
        <h3>Data Handling</h3>
        <p>Tool prompts, generated content, profile data, and billing references are handled only for product operation, support, subscription access, and service improvement.</p>
      </section>
      <section>
        <h3>Operational Controls</h3>
        <p>The platform is designed around environment-based credentials, server-side payment verification, validation middleware, and monitored deployment practices.</p>
      </section>
      <section>
        <h3>Responsible Disclosure</h3>
        <p>If you believe you found a security issue, contact support with clear reproduction steps so the team can review and prioritize remediation.</p>
      </section>
    </LegalPageLayout>
  );
}

export function TrustCenterPage() {
  return (
    <LegalPageLayout
      title="Trust Center"
      subtitle="A transparent overview of the product standards, billing safeguards, and customer commitments behind the platform."
    >
      <section>
        <h3>Transparent Billing</h3>
        <p>Users should always see their plan, trial status, payment provider options, invoice history, and upgrade path before committing to a paid subscription.</p>
      </section>
      <section>
        <h3>Reliable AI Workflows</h3>
        <p>Each tool is built to guide users toward useful business output with clear forms, previews, best practices, and export-ready results.</p>
      </section>
      <section>
        <h3>Customer Control</h3>
        <p>Users can manage profile details, review billing state, change plans, contact support, and understand legal policies from public pages before and after signup.</p>
      </section>
      <section>
        <h3>Launch Readiness</h3>
        <p>The platform is being polished around production essentials: live gateway configuration, legal clarity, clean empty states, notification feedback, and consistent navigation.</p>
      </section>
      <section>
        <h3>Support Promise</h3>
        <p>Support requests should be handled through the contact page or support email with clear expectations around billing, account access, and product help.</p>
      </section>
    </LegalPageLayout>
  );
}

export function AboutPage() {
  return (
    <LegalPageLayout
      title="About Meritlives AI Tools"
      subtitle="A focused AI marketing workspace built to help teams create, test, and launch stronger content faster."
    >
      <section>
        <h3>What We Build</h3>
        <p>Meritlives AI Tools brings content generation, headline analysis, SEO metadata, email subject testing, ad copy, funnels, and social workflows into one organized platform.</p>
      </section>
      <section>
        <h3>Who It Helps</h3>
        <p>The platform is designed for founders, creators, marketers, agencies, and small teams that need professional marketing output without scattered tools and repeated manual work.</p>
      </section>
      <section>
        <h3>Product Standard</h3>
        <p>Every page is being shaped around clear navigation, trustworthy billing, useful empty states, visible support paths, and production-ready payment workflows.</p>
      </section>
      <section>
        <h3>Our Direction</h3>
        <p>The roadmap is focused on deeper workflow automation, stronger analytics, more templates, and better collaboration features across the complete marketing tool suite.</p>
      </section>
    </LegalPageLayout>
  );
}
