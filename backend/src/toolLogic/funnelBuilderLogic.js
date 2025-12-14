// Marketing Funnel Builder Logic

// ============================================
// CONFIGURATION DATA
// ============================================

const funnelTemplates = {
  ecommerce: {
    name: "E-commerce Sales Funnel",
    stages: {
      awareness: [
        {
          type: "Social Media",
          title: "Problem-Awareness Posts",
          description: "Content highlighting pain points your product solves"
        },
        {
          type: "Content",
          title: "Educational Blog Posts",
          description: "How-to guides and problem-solving articles"
        },
        {
          type: "Ads",
          title: "Interest-Based Targeting",
          description: "Facebook/Instagram ads targeting user interests"
        }
      ],
      interest: [
        {
          type: "Lead Magnet",
          title: "Discount Code or Free Shipping",
          description: "Offer first-time purchase incentives"
        },
        {
          type: "Email",
          title: "Welcome Sequence",
          description: "Introduce your brand and products"
        },
        {
          type: "Retargeting",
          title: "Product Showcase Ads",
          description: "Show products to website visitors"
        }
      ],
      decision: [
        {
          type: "Social Proof",
          title: "Customer Reviews & Testimonials",
          description: "Showcase happy customer experiences"
        },
        {
          type: "Urgency",
          title: "Limited Time Offers",
          description: "Create scarcity to drive purchases"
        },
        {
          type: "Comparison",
          title: "Product Benefits Highlight",
          description: "Show why your product is the best choice"
        }
      ],
      action: [
        {
          type: "Checkout",
          title: "Streamlined Purchase Process",
          description: "One-click upsells and cross-sells"
        },
        {
          type: "Confirmation",
          title: "Order Confirmation & Tracking",
          description: "Keep customers informed post-purchase"
        },
        {
          type: "Retention",
          title: "Loyalty Program Invitation",
          description: "Encourage repeat purchases"
        }
      ]
    }
  },
  saas: {
    name: "SaaS Conversion Funnel",
    stages: {
      awareness: [
        {
          type: "Content",
          title: "Problem-Solving Blog Content",
          description: "Address specific pain points your SaaS solves"
        },
        {
          type: "SEO",
          title: "Keyword-Optimized Landing Pages",
          description: "Target relevant search queries"
        },
        {
          type: "Webinars",
          title: "Educational Webinars",
          description: "Teach solutions to common problems"
        }
      ],
      interest: [
        {
          type: "Trial",
          title: "Free Trial Offer",
          description: "Let users experience your product"
        },
        {
          type: "Demo",
          title: "Product Demo Videos",
          description: "Showcase key features and benefits"
        },
        {
          type: "Case Studies",
          title: "Success Stories",
          description: "Show how others achieved results"
        }
      ],
      decision: [
        {
          type: "Pricing",
          title: "Clear Pricing Page",
          description: "Transparent pricing with value highlights"
        },
        {
          type: "Comparison",
          title: "Feature Comparison",
          description: "Show advantages over competitors"
        },
        {
          type: "Social Proof",
          title: "Customer Testimonials",
          description: "Build trust with real user stories"
        }
      ],
      action: [
        {
          type: "Onboarding",
          title: "Welcome Sequence",
          description: "Guide users through setup process"
        },
        {
          type: "Support",
          title: "Dedicated Support",
          description: "Ensure successful implementation"
        },
        {
          type: "Upsell",
          title: "Premium Features Highlight",
          description: "Show value of upgraded plans"
        }
      ]
    }
  },
  service: {
    name: "Service Business Funnel",
    stages: {
      awareness: [
        {
          type: "Networking",
          title: "LinkedIn Outreach",
          description: "Connect with potential clients"
        },
        {
          type: "Content",
          title: "Expert Articles",
          description: "Share industry insights and expertise"
        },
        {
          type: "Referrals",
          title: "Client Referral Program",
          description: "Leverage existing relationships"
        }
      ],
      interest: [
        {
          type: "Consultation",
          title: "Free Discovery Call",
          description: "Offer value before asking for commitment"
        },
        {
          type: "Portfolio",
          title: "Case Study Showcase",
          description: "Demonstrate past success stories"
        },
        {
          type: "Lead Magnet",
          title: "Free Audit/Assessment",
          description: "Provide immediate value"
        }
      ],
      decision: [
        {
          type: "Proposal",
          title: "Detailed Service Proposal",
          description: "Clear scope, deliverables, and pricing"
        },
        {
          type: "Testimonials",
          title: "Client Success Stories",
          description: "Build credibility and trust"
        },
        {
          type: "Guarantee",
          title: "Risk Reversal Offer",
          description: "Reduce perceived risk for clients"
        }
      ],
      action: [
        {
          type: "Contract",
          title: "Clear Service Agreement",
          description: "Professional onboarding process"
        },
        {
          type: "Payment",
          title: "Flexible Payment Options",
          description: "Make it easy to get started"
        },
        {
          type: "Delivery",
          title: "Project Kickoff Process",
          description: "Set expectations and timeline"
        }
      ]
    }
  },
  agency: {
    name: "Agency Lead Generation Funnel",
    stages: {
      awareness: [
        {
          type: "Content",
          title: "Industry Insights Blog",
          description: "Establish thought leadership"
        },
        {
          type: "Ads",
          title: "LinkedIn Sponsored Content",
          description: "Target decision-makers"
        },
        {
          type: "Speaking",
          title: "Industry Events & Webinars",
          description: "Build authority and visibility"
        }
      ],
      interest: [
        {
          type: "Lead Magnet",
          title: "Free Marketing Audit",
          description: "Identify opportunities for prospects"
        },
        {
          type: "Case Studies",
          title: "Client Results Showcase",
          description: "Demonstrate proven track record"
        },
        {
          type: "Consultation",
          title: "Strategy Session",
          description: "Personalized recommendations"
        }
      ],
      decision: [
        {
          type: "Proposal",
          title: "Custom Service Package",
          description: "Tailored to client needs"
        },
        {
          type: "ROI Calculator",
          title: "Value Demonstration",
          description: "Show potential return on investment"
        },
        {
          type: "References",
          title: "Client References",
          description: "Direct conversations with satisfied clients"
        }
      ],
      action: [
        {
          type: "Contract",
          title: "Service Agreement",
          description: "Clear terms and deliverables"
        },
        {
          type: "Onboarding",
          title: "Client Kickoff Process",
          description: "Smooth transition to working relationship"
        },
        {
          type: "Team Intro",
          title: "Meet Your Team",
          description: "Build personal connections"
        }
      ]
    }
  },
  coach: {
    name: "Coaching/Consulting Funnel",
    stages: {
      awareness: [
        {
          type: "Content",
          title: "Value-Packed Blog Posts",
          description: "Share expertise and insights"
        },
        {
          type: "Social Media",
          title: "Regular Tips & Advice",
          description: "Build following and engagement"
        },
        {
          type: "Guest Appearances",
          title: "Podcasts & Interviews",
          description: "Reach new audiences"
        }
      ],
      interest: [
        {
          type: "Lead Magnet",
          title: "Free Guide or Workbook",
          description: "Provide actionable value"
        },
        {
          type: "Webinar",
          title: "Free Training Workshop",
          description: "Teach and demonstrate expertise"
        },
        {
          type: "Email Series",
          title: "Educational Nurture Sequence",
          description: "Build trust and rapport"
        }
      ],
      decision: [
        {
          type: "Testimonials",
          title: "Client Transformation Stories",
          description: "Show real results"
        },
        {
          type: "Discovery Call",
          title: "Free Strategy Session",
          description: "Personalized consultation"
        },
        {
          type: "Comparison",
          title: "Program Breakdown",
          description: "Clear value proposition"
        }
      ],
      action: [
        {
          type: "Enrollment",
          title: "Simple Signup Process",
          description: "Easy payment and onboarding"
        },
        {
          type: "Welcome",
          title: "Program Welcome Sequence",
          description: "Set expectations and excitement"
        },
        {
          type: "Community",
          title: "Group/Community Access",
          description: "Connect with other clients"
        }
      ]
    }
  },
  creator: {
    name: "Content Creator Monetization Funnel",
    stages: {
      awareness: [
        {
          type: "Content",
          title: "Regular Content Publishing",
          description: "Build audience on main platform"
        },
        {
          type: "Cross-Platform",
          title: "Multi-Channel Presence",
          description: "Expand reach across platforms"
        },
        {
          type: "Collaborations",
          title: "Creator Partnerships",
          description: "Cross-promote to new audiences"
        }
      ],
      interest: [
        {
          type: "Email List",
          title: "Newsletter Signup",
          description: "Build owned audience"
        },
        {
          type: "Free Content",
          title: "Premium Free Content",
          description: "Showcase best work"
        },
        {
          type: "Behind the Scenes",
          title: "Exclusive Content Previews",
          description: "Build anticipation"
        }
      ],
      decision: [
        {
          type: "Offer Preview",
          title: "Product/Service Showcase",
          description: "Demonstrate value clearly"
        },
        {
          type: "Limited Availability",
          title: "Scarcity Messaging",
          description: "Create urgency"
        },
        {
          type: "Social Proof",
          title: "Customer Results",
          description: "Share success stories"
        }
      ],
      action: [
        {
          type: "Purchase",
          title: "Seamless Checkout",
          description: "Easy buying process"
        },
        {
          type: "Delivery",
          title: "Instant Access",
          description: "Immediate product delivery"
        },
        {
          type: "Community",
          title: "Member Community",
          description: "Ongoing engagement"
        }
      ]
    }
  }
};

const toolRecommendations = {
  awareness: [
    { name: "Facebook Ads", icon: "📱", purpose: "Targeted audience reach" },
    { name: "Google Ads", icon: "🔍", purpose: "Search intent targeting" },
    { name: "LinkedIn", icon: "💼", purpose: "B2B audience engagement" },
    { name: "Instagram", icon: "📸", purpose: "Visual content marketing" }
  ],
  interest: [
    { name: "Mailchimp", icon: "✉️", purpose: "Email marketing automation" },
    { name: "HubSpot", icon: "🔄", purpose: "CRM and lead nurturing" },
    { name: "ActiveCampaign", icon: "🎯", purpose: "Advanced automation" },
    { name: "ConvertKit", icon: "📊", purpose: "Creator-focused email" }
  ],
  decision: [
    { name: "Calendly", icon: "📅", purpose: "Meeting scheduling" },
    { name: "Typeform", icon: "📝", purpose: "Lead qualification forms" },
    { name: "Hotjar", icon: "🔥", purpose: "Website behavior analytics" },
    { name: "Intercom", icon: "💬", purpose: "Live chat and support" }
  ],
  action: [
    { name: "Stripe", icon: "💳", purpose: "Payment processing" },
    { name: "PayPal", icon: "💰", purpose: "Alternative payments" },
    { name: "Zapier", icon: "⚡", purpose: "Workflow automation" },
    { name: "Slack", icon: "💻", purpose: "Team communication" }
  ]
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate funnel metrics based on business type and budget
 */
function calculateFunnelMetrics(businessType, budget, goal) {
  const baseMetrics = {
    ecommerce: { audience: 10000, conversion: 3.5, cpl: 8, roi: 320 },
    saas: { audience: 5000, conversion: 7.2, cpl: 22, roi: 450 },
    service: { audience: 2000, conversion: 12.5, cpl: 45, roi: 280 },
    agency: { audience: 1500, conversion: 15.8, cpl: 65, roi: 380 },
    coach: { audience: 3000, conversion: 8.5, cpl: 35, roi: 420 },
    creator: { audience: 8000, conversion: 2.8, cpl: 12, roi: 190 }
  };

  const base = baseMetrics[businessType] || baseMetrics.service;
  
  // Adjust based on budget
  const budgetNum = parseInt(budget);
  const budgetMultiplier = budgetNum / 1000;
  const audience = Math.round(base.audience * budgetMultiplier);
  const conversion = base.conversion;
  const cpl = Math.round(base.cpl / budgetMultiplier * 100) / 100;
  const roi = Math.round(base.roi * (1 + (budgetMultiplier * 0.1)));

  return {
    totalAudience: audience.toLocaleString(),
    conversionRate: conversion.toFixed(1) + '%',
    costPerLead: '$' + cpl.toFixed(2),
    roi: roi + '%'
  };
}

/**
 * Get funnel type display name
 */
function getFunnelTypeName(goal) {
  const names = {
    'lead-generation': 'Lead Generation',
    'product-sales': 'Product Sales',
    'course-enrollment': 'Course Enrollment',
    'app-signups': 'App Sign-ups',
    'book-calls': 'Discovery Calls'
  };
  return names[goal] || goal;
}

/**
 * Get template based on business type
 */
function getTemplate(businessType) {
  return funnelTemplates[businessType] || funnelTemplates.service;
}

// ============================================
// MAIN ENTRY FUNCTION
// ============================================

/**
 * Main function to generate marketing funnel
 * @param {object} data - Data object from the React frontend request
 * @returns {object} - Funnel generation results
 */
function generateFunnelLogic(data) {
  const {
    businessName,
    businessType,
    targetAudience,
    primaryOffer,
    funnelGoal,
    budget
  } = data;

  // Validation
  if (!businessName || businessName.trim() === '') {
    throw new Error('Business name is required');
  }
  if (!targetAudience || targetAudience.trim() === '') {
    throw new Error('Target audience is required');
  }
  if (!primaryOffer || primaryOffer.trim() === '') {
    throw new Error('Primary offer is required');
  }

  // Get template based on business type
  const template = getTemplate(businessType);
  
  // Calculate metrics
  const metrics = calculateFunnelMetrics(businessType, budget, funnelGoal);
  
  // Get funnel type name
  const typeName = getFunnelTypeName(funnelGoal);

  // Build funnel object
  const funnel = {
    name: `${businessName} ${template.name}`,
    type: typeName,
    audience: targetAudience,
    offer: primaryOffer,
    businessType: businessType,
    goal: funnelGoal,
    budget: budget,
    stages: template.stages,
    metrics: metrics,
    tools: toolRecommendations,
    recommendations: generateRecommendations(businessType, funnelGoal),
    nextSteps: generateNextSteps(businessType, funnelGoal)
  };

  return funnel;
}

/**
 * Generate personalized recommendations
 */
function generateRecommendations(businessType, goal) {
  const recommendations = {
    ecommerce: [
      "Focus on building trust through social proof and reviews",
      "Implement abandoned cart recovery sequences",
      "Use retargeting ads to bring back website visitors",
      "Create urgency with limited-time offers"
    ],
    saas: [
      "Offer a free trial to reduce barriers to entry",
      "Create detailed onboarding sequences",
      "Use case studies to demonstrate value",
      "Implement a product-led growth strategy"
    ],
    service: [
      "Build authority through thought leadership content",
      "Offer free consultations or audits",
      "Leverage client testimonials and referrals",
      "Create clear service packages and pricing"
    ],
    agency: [
      "Showcase your portfolio and case studies",
      "Offer free audits or strategy sessions",
      "Build partnerships for referrals",
      "Focus on long-term client relationships"
    ],
    coach: [
      "Create a signature framework or methodology",
      "Use webinars to demonstrate expertise",
      "Build a community around your teachings",
      "Offer different service tiers"
    ],
    creator: [
      "Focus on consistent content quality",
      "Build an email list for owned audience",
      "Diversify revenue streams",
      "Engage deeply with your community"
    ]
  };

  return recommendations[businessType] || recommendations.service;
}

/**
 * Generate next steps based on funnel
 */
function generateNextSteps(businessType, goal) {
  return [
    "Set up tracking for each funnel stage",
    "Create content for the awareness stage",
    "Implement lead capture mechanisms",
    "Set up email automation sequences",
    "Test and optimize conversion rates",
    "Scale successful campaigns"
  ];
}

// ES Module Export
export { generateFunnelLogic };