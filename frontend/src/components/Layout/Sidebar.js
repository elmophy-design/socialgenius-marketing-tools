// src/components/Layout/Sidebar.js

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
    // CORRECTION: All paths now include the required '/tools/' prefix
    { to: "/tools/ad-copy", icon: "🎪", label: "Ad Copy" },
    { to: "/tools/email-tester", icon: "✉️", label: "Email Tester" },
    { to: "/tools/funnel-builder", icon: "🔄", label: "Funnel Builder" },
    { to: "/tools/seo-meta", icon: "🔍", label: "SEO Meta" },
    { to: "/tools/headline-analyzer", icon: "🚀", label: "Headline Analyzer" },
    // CORRECTION: Path changed to '/tools/content-ideas' (plural)
    { to: "/tools/content-ideas", icon: "💡", label: "Content Ideas" },
    // ADDITION: Social Media Tool added with correct path
    { to: "/tools/social-media-generator", icon: "💬", label: "Social Media" }, 
];

function Sidebar() {
    const location = useLocation();

    return (
        <header>
            <div className="container">
                <div className="header-content">
                    <div className="logo">
                        <span className="logo-icon">🧠</span>
                        <span>SocialGenius</span>
                    </div>
                    <nav>
                        <ul>
                            {navItems.map(item => (
                                <li key={item.to}>
                                    <Link 
                                        to={item.to} 
                                        className={location.pathname.startsWith(item.to) ? 'active' : ''}
                                    >
                                        <span style={{ marginRight: '8px' }}>{item.icon}</span>
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </div>
        </header>
    );
}

export default Sidebar;