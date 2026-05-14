// src/components/Layout/Dashboard.js
import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../App";
import "./dashboard.css";

const RECOMMENDATION_EMOJIS = {
  'social-media': "📱",
  'content-idea': "💡",
  'headline-analyzer': "📊",
  'seo-meta': "🔍",
  'email-tester': "✉️",
  'ad-copy': "🎪",
  'funnel-builder': "🔄",
  'value-proposition': "🎯"
};

/**
 * Tool configuration (from your old HTML)
 * - For tools that already exist in React → give a path (Link will work)
 * - For "coming soon" tools → path: null (card disabled)
 */
const TOOL_DATA = [
  {
    id: "value-prop",
    title: "Value Proposition Generator",
    icon: "🎯",
    description:
      "Create compelling value propositions that clearly communicate your unique business value to customers.",
    categories: ["content", "ai"],
    status: "Available",
    rating: "4.8/5",
    usageLabel: "1,247 generated",
    path: null, // not yet a React tool
  },
  {
    id: "social-media",
    title: "Social Media Generator",
    icon: "📱",
    description:
      "AI-powered social media posts with platform optimization, hashtags, and engagement analysis.",
    categories: ["content", "ai"],
    status: "Available",
    rating: "4.9/5",
    usageLabel: "893 generated",
    path: "/tools/social-media",
  },
  {
    id: "headline-analyzer",
    title: "Headline Analyzer",
    icon: "📊",
    description:
      "Analyze and optimize headlines for maximum impact, engagement, and SEO performance.",
    categories: ["analysis", "ai"],
    status: "Coming Soon",
    rating: "-/-",
    usageLabel: "Coming Soon",
    path: "/tools/headline-analyzer", // you already have this tool in React
  },
  {
    id: "seo-meta",
    title: "SEO Meta Generator",
    icon: "🔍",
    description:
      "Generate optimized meta descriptions and titles that improve click-through rates and SEO.",
    categories: ["content", "analysis"],
    status: "Available",
    rating: "-/-",
    usageLabel: "Coming Soon",
    path: "/tools/seo-meta",
  },
  {
    id: "email-tester",
    title: "Email Subject Line Tester",
    icon: "✉️",
    description:
      "Test and optimize email subject lines for better open rates and engagement.",
    categories: ["analysis"],
    status: "Available",
    rating: "-/-",
    usageLabel: "Coming Soon",
    path: "/tools/email-tester",
  },
  {
    id: "content-ideas",
    title: "Content Idea Generator",
    icon: "💡",
    description:
      "Generate endless content ideas and create comprehensive content calendars.",
    categories: ["content", "planning", "ai"],
    status: "Available",
    rating: "-/-",
    usageLabel: "Coming Soon",
    path: "/tools/content-ideas",
  },
  {
    id: "ad-copy",
    title: "Ad Copy Generator",
    icon: "🎪",
    description:
      "Create high-converting ad copy for Google, Facebook, LinkedIn, and other platforms.",
    categories: ["content", "ai"],
    status: "Available",
    rating: "-/-",
    usageLabel: "Coming Soon",
    path: "/tools/ad-copy",
  },
  {
    id: "funnel-builder",
    title: "Marketing Funnel Builder",
    icon: "🔄",
    description:
      "Build complete marketing funnels with content suggestions for each customer journey stage.",
    categories: ["planning"],
    status: "Available",
    rating: "-/-",
    usageLabel: "Coming Soon",
    path: "/tools/funnel-builder",
  },
];

const STATS = [
  { label: "Marketing Tools", value: "8" },
  { label: "Active Users", value: "2.4k+" },
  { label: "Content Generated", value: "15.7k" },
  { label: "Satisfaction Rate", value: "98%" },
];

const CATEGORIES = [
  { id: "all", label: "All Tools" },
  { id: "ai", label: "AI Powered" },
  { id: "content", label: "Content Creation" },
  { id: "analysis", label: "Analysis Tools" },
  { id: "planning", label: "Planning Tools" },
];

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredTools = TOOL_DATA.filter((tool) =>
    activeCategory === "all"
      ? true
      : tool.categories.includes(activeCategory)
  );

  const recommendations = user?.metadata?.toolRecommendations || [];

  return (
    <div className="container">
      {/* Hero */}
      <section className="hero">
        <h1>Digital Marketing Tools Suite</h1>
        <p>
          AI-powered tools to supercharge your marketing efforts. Free forever
          for individuals and small businesses.
        </p>
      </section>

      {/* Dashboard Stats */}
      <section id="stats" className="dashboard-stats">
        {STATS.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-number">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Quick Start */}
      <section id="quick-start">
        <h2
          style={{
            textAlign: "center",
            marginBottom: "1.5rem",
            color: "#004aad",
          }}
        >
          Quick Start
        </h2>
        <div className="quick-actions">
          {/* Value Prop – no path yet, stays as non-React link or disabled */}
          <div className="quick-action">
            <div className="quick-action-icon">🎯</div>
            <div>Value Proposition</div>
          </div>

          {/* Social Media */}
          <Link to="/tools/social-media" className="quick-action">
            <div className="quick-action-icon">📱</div>
            <div>Social Media</div>
          </Link>

          {/* Headline Analyzer */}
          <Link to="/tools/headline-analyzer" className="quick-action">
            <div className="quick-action-icon">📊</div>
            <div>Headline Analyzer</div>
          </Link>

          {/* Email Tester */}
          <Link to="/tools/email-tester" className="quick-action">
            <div className="quick-action-icon">✉️</div>
            <div>Email Tester</div>
          </Link>
        </div>
      </section>

      {/* Recommended for You */}
      {recommendations.length > 0 && (
        <section id="recommendations" className="dashboard-recommendations">
          <div className="recommendation-header">
            <h2>Recommended for Your Business</h2>
            <span className="ai-badge">AI SUGGESTED</span>
          </div>
          <div className="recommendation-grid">
            {recommendations.map((tool) => (
              <Link key={tool.key} to={tool.route} className="recommendation-card">
                <div className="recommendation-icon">
                  {RECOMMENDATION_EMOJIS[tool.key] || "💡"}
                </div>
                <div className="recommendation-content">
                  <h3>{tool.name}</h3>
                  <p>{tool.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Tool Categories */}
      <div className="tool-categories">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={
              "category-btn" +
              (activeCategory === cat.id ? " active" : "")
            }
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Tools Grid */}
      <section id="tools" className="tools-section">
        <div className="tools-grid">
          {filteredTools.map((tool) => {
            const CardWrapper = tool.path ? Link : "div";

            return (
              <CardWrapper
                key={tool.id}
                to={tool.path || undefined}
                className={
                  "tool-card" +
                  (tool.status === "Coming Soon" ? " auth-required" : "")
                }
                data-categories={tool.categories.join(" ")}
              >
                <div className="tool-icon">{tool.icon}</div>
                <h3>{tool.title}</h3>
                <p>{tool.description}</p>

                {/* Features are simplified here; your CSS already handles layout */}
                <div className="tool-metrics">
                  <span className="metric">
                    📊 {tool.usageLabel}
                  </span>
                </div>

                <div className="tool-stats">
                  <div className="usage-count">
                    <span>📊</span>
                    <span>{tool.usageLabel}</span>
                  </div>
                  <div className="rating">
                    <span>⭐</span>
                    <span>{tool.rating}</span>
                  </div>
                </div>

                <span
                  className={
                    "tool-badge" +
                    (tool.status === "Coming Soon"
                      ? " coming-soon"
                      : "")
                  }
                >
                  {tool.status}
                </span>
              </CardWrapper>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;