// src/components/Layout/Header.js

import React from "react";
import { Link, NavLink } from "react-router-dom";
import "./Header.css";

const Header = () => {
  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Brand / Logo */}
        <Link to="/" className="brand">
          <div className="logo-mark">SG</div>
          <div className="brand-text">
            <span className="brand-name">SocialGenius</span>
            <span className="brand-tagline">AI Marketing Toolkit</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="nav-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              "nav-link" + (isActive ? " nav-link-active" : "")
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/tools/content-ideas"
            className={({ isActive }) =>
              "nav-link" + (isActive ? " nav-link-active" : "")
            }
          >
            Content Ideas
          </NavLink>

          <NavLink
            to="/tools/funnel-builder"
            className={({ isActive }) =>
              "nav-link" + (isActive ? " nav-link-active" : "")
            }
          >
            Funnel Builder
          </NavLink>
          
          {/* CORRECTION: Path changed to match the full route in App.js */}
          <NavLink
            to="/tools/social-media-generator"
            className={({ isActive }) =>
              "nav-link" + (isActive ? " nav-link-active" : "")
            }
          >
            Social Media
          </NavLink>

          <NavLink
            to="/tools/seo-meta"
            className={({ isActive }) =>
              "nav-link" + (isActive ? " nav-link-active" : "")
            }
          >
            SEO Meta
          </NavLink>

          {/* ADDITION: Missing links added */}
          <NavLink
            to="/tools/headline-analyzer"
            className={({ isActive }) =>
              "nav-link" + (isActive ? " nav-link-active" : "")
            }
          >
            Headline Analyzer
          </NavLink>

          <NavLink
            to="/tools/email-tester"
            className={({ isActive }) =>
              "nav-link" + (isActive ? " nav-link-active" : "")
            }
          >
            Email Tester
          </NavLink>

        </nav>

        {/* Right side (profile / CTA) */}
        <div className="header-actions">
          <Link to="/tools/ad-copy" className="header-cta">
            {/* ... */}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;