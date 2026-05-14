import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BsBarChartLine,
  BsBookmarkStar,
  BsBullseye,
  BsCalendar2Week,
  BsCpu,
  BsCreditCard2Front,
  BsDiagram3,
  BsEnvelopeOpen,
  BsGoogle,
  BsGrid1X2,
  BsInstagram,
  BsLightbulb,
  BsLightningCharge,
  BsLinkedin,
  BsMegaphone,
  BsPaypal,
  BsPeople,
  BsShare
} from 'react-icons/bs';
import { guardToolAction, handleToolActionError } from '../../../utils/toolAccessGuard';
import './FunnelBuilder.css';

const FUNNEL_FEATURES = [
  {
    title: 'Stage-by-Stage Planning',
    description: 'Build campaigns across awareness, interest, decision, and action so every message supports the next step in the buyer journey.',
    icon: BsDiagram3,
    iconClass: 'is-flow'
  },
  {
    title: 'Goal-Based Recommendations',
    description: 'Match the funnel to your objective, whether you want lead generation, free-trial signups, webinar registrations, or direct sales.',
    icon: BsBullseye,
    iconClass: 'is-target'
  },
  {
    title: 'Template Shortcuts',
    description: 'Start from proven funnel models for e-commerce, SaaS, and education so you can move faster without building from scratch.',
    icon: BsGrid1X2,
    iconClass: 'is-template'
  },
  {
    title: 'Channel and Content Ideas',
    description: 'Each funnel stage includes practical suggestions for content, tools, and messaging that can support paid and organic campaigns.',
    icon: BsLightbulb,
    iconClass: 'is-ideas'
  }
];

const STAGE_ICONS = {
  awareness: BsMegaphone,
  interest: BsPeople,
  decision: BsBullseye,
  action: BsLightningCharge
};

const TEMPLATE_ICONS = {
  ecommerce: { icon: BsGrid1X2, className: 'is-commerce' },
  saas: { icon: BsCpu, className: 'is-saas' },
  course: { icon: BsBookmarkStar, className: 'is-course' }
};

const RECOMMENDED_TOOL_ICONS = {
  'Facebook Ads': BsMegaphone,
  'Google Ads': BsGoogle,
  LinkedIn: BsLinkedin,
  Instagram: BsInstagram,
  Mailchimp: BsEnvelopeOpen,
  HubSpot: BsDiagram3,
  ActiveCampaign: BsShare,
  ConvertKit: BsLightbulb,
  Calendly: BsCalendar2Week,
  Typeform: BsBullseye,
  Hotjar: BsBarChartLine,
  Intercom: BsPeople,
  Stripe: BsCreditCard2Front,
  PayPal: BsPaypal,
  Zapier: BsLightningCharge,
  Slack: BsShare
};

const FunnelBuilder = () => {
  const navigate = useNavigate();
  const AwarenessIcon = STAGE_ICONS.awareness;
  const InterestIcon = STAGE_ICONS.interest;
  const DecisionIcon = STAGE_ICONS.decision;
  const ActionIcon = STAGE_ICONS.action;
  const EcommerceTemplateIcon = TEMPLATE_ICONS.ecommerce.icon;
  const SaaSTemplateIcon = TEMPLATE_ICONS.saas.icon;
  const CourseTemplateIcon = TEMPLATE_ICONS.course.icon;

  // Form state
  const [formData, setFormData] = useState({
    businessName: 'Growth Marketing Co',
    businessType: 'ecommerce',
    targetAudience: 'Small business owners looking to grow online',
    primaryOffer: 'Marketing strategy consultation',
    funnelGoal: 'lead-generation',
    budget: '1000'
  });

  // Results state
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [toolsList, setToolsList] = useState([]);

  // Funnel templates
  const funnelTemplates = {
    ecommerce: {
      name: "E-commerce Sales Funnel",
      stages: {
        awareness: {
          content: [
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
          ]
        },
        interest: {
          content: [
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
          ]
        },
        decision: {
          content: [
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
          ]
        },
        action: {
          content: [
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
      }
    },
    saas: {
      name: "SaaS Conversion Funnel",
      stages: {
        awareness: {
          content: [
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
          ]
        },
        interest: {
          content: [
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
          ]
        },
        decision: {
          content: [
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
          ]
        },
        action: {
          content: [
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
      }
    },
    service: {
      name: "Service Business Funnel",
      stages: {
        awareness: {
          content: [
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
          ]
        },
        interest: {
          content: [
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
          ]
        },
        decision: {
          content: [
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
          ]
        },
        action: {
          content: [
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
      }
    }
  };

  // Tool recommendations
  const toolRecommendations = {
    awareness: [
      { name: "Facebook Ads", icon: "FB", purpose: "Targeted audience reach" },
      { name: "Google Ads", icon: "GA", purpose: "Search intent targeting" },
      { name: "LinkedIn", icon: "LI", purpose: "B2B audience engagement" },
      { name: "Instagram", icon: "IG", purpose: "Visual content marketing" }
    ],
    interest: [
      { name: "Mailchimp", icon: "MC", purpose: "Email marketing automation" },
      { name: "HubSpot", icon: "HS", purpose: "CRM and lead nurturing" },
      { name: "ActiveCampaign", icon: "AC", purpose: "Advanced automation" },
      { name: "ConvertKit", icon: "CK", purpose: "Creator-focused email" }
    ],
    decision: [
      { name: "Calendly", icon: "CA", purpose: "Meeting scheduling" },
      { name: "Typeform", icon: "TF", purpose: "Lead qualification forms" },
      { name: "Hotjar", icon: "HJ", purpose: "Website behavior analytics" },
      { name: "Intercom", icon: "IC", purpose: "Live chat and support" }
    ],
    action: [
      { name: "Stripe", icon: "ST", purpose: "Payment processing" },
      { name: "PayPal", icon: "PP", purpose: "Alternative payments" },
      { name: "Zapier", icon: "ZA", purpose: "Workflow automation" },
      { name: "Slack", icon: "SL", purpose: "Team communication" }
    ]
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Calculate funnel metrics
  const calculateFunnelMetrics = (businessType, budget) => {
    const baseMetrics = {
      ecommerce: { audience: 10000, conversion: 3.5, cpl: 8, roi: 320 },
      saas: { audience: 5000, conversion: 7.2, cpl: 22, roi: 450 },
      service: { audience: 2000, conversion: 12.5, cpl: 45, roi: 280 },
      agency: { audience: 1500, conversion: 15.8, cpl: 65, roi: 380 },
      coach: { audience: 3000, conversion: 8.5, cpl: 35, roi: 420 },
      creator: { audience: 8000, conversion: 2.8, cpl: 12, roi: 190 }
    };

    const base = baseMetrics[businessType] || baseMetrics.service;
    const budgetMultiplier = parseInt(budget) / 1000;
    
    const audience = Math.round(base.audience * budgetMultiplier);
    const conversion = base.conversion;
    const cpl = Math.round(base.cpl / budgetMultiplier);
    const roi = Math.round(base.roi * (1 + (budgetMultiplier * 0.1)));

    return {
      totalAudience: audience.toLocaleString(),
      conversionRate: conversion + '%',
      costPerLead: '$' + cpl.toFixed(2),
      roi: roi + '%'
    };
  };

  // Get funnel type display name
  const getFunnelTypeName = (goal) => {
    const names = {
      'lead-generation': 'Lead Generation',
      'product-sales': 'Product Sales',
      'course-enrollment': 'Course Enrollment',
      'app-signups': 'App Sign-ups',
      'book-calls': 'Discovery Calls'
    };
    return names[goal] || goal;
  };

  // Update tools display
  const updateTools = (tools) => {
    const allTools = [
      ...tools.awareness,
      ...tools.interest,
      ...tools.decision,
      ...tools.action
    ];

    const uniqueTools = allTools.filter((tool, index, self) =>
      index === self.findIndex(t => t.name === tool.name)
    );

    return uniqueTools.slice(0, 8);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!guardToolAction({
      navigate,
      requiredPlan: 'basic',
      source: 'funnel-builder-generate',
      actionLabel: 'build marketing funnels',
      toolName: 'Marketing Funnel Builder',
    })) {
      return;
    }
    
    if (!formData.businessName || !formData.targetAudience || !formData.primaryOffer) {
      alert('Please fill in all required fields: Business Name, Target Audience, and Primary Offer');
      return;
    }

    setLoading(true);

    try {
      // Use API if available, otherwise use local data
      const response = await axios.post('http://localhost:4000/api/tools/funnel-builder/generate', {
        businessName: formData.businessName,
        funnelType: formData.businessType
      });

      if (response.data.success) {
        const apiResult = response.data.data;
        
        const metrics = calculateFunnelMetrics(formData.businessType, formData.budget);
        const template = funnelTemplates[formData.businessType] || funnelTemplates.service;
        
        setResult({
          name: `${formData.businessName} ${template.name}`,
          type: getFunnelTypeName(formData.funnelGoal),
          audience: formData.targetAudience,
          stages: apiResult.stages || template.stages,
          metrics: apiResult.metrics || metrics,
          tools: updateTools(toolRecommendations)
        });
        
        setShowResults(true);
        setToolsList(updateTools(toolRecommendations));
      }
    } catch (error) {
      console.error('API Error:', error);
      if (handleToolActionError(error, navigate)) {
        return;
      }
      // Fallback to local data
      const metrics = calculateFunnelMetrics(formData.businessType, formData.budget);
      const template = funnelTemplates[formData.businessType] || funnelTemplates.service;
      
      setResult({
        name: `${formData.businessName} ${template.name}`,
        type: getFunnelTypeName(formData.funnelGoal),
        audience: formData.targetAudience,
        stages: template.stages,
        metrics: metrics,
        tools: updateTools(toolRecommendations)
      });
      
      setShowResults(true);
      setToolsList(updateTools(toolRecommendations));
    } finally {
      setLoading(false);
    }
  };

  // Apply template (renamed from useTemplate to avoid React hook naming)
  const applyTemplate = (templateType) => {
    const templateMap = {
      'ecommerce': 'ecommerce',
      'saas': 'saas',
      'course': 'service'
    };

    const businessType = templateMap[templateType] || 'service';
    
    const templateData = {
      ecommerce: {
        targetAudience: 'Online shoppers interested in [your product category]',
        primaryOffer: 'Your main product or collection',
        funnelGoal: 'product-sales'
      },
      saas: {
        targetAudience: 'Business professionals needing [your solution]',
        primaryOffer: 'Software subscription or service',
        funnelGoal: 'app-signups'
      },
      course: {
        targetAudience: 'Students and professionals wanting to learn [your topic]',
        primaryOffer: 'Online course or coaching program',
        funnelGoal: 'course-enrollment'
      }
    };

    setFormData(prev => ({
      ...prev,
      businessType: businessType,
      targetAudience: templateData[templateType]?.targetAudience || prev.targetAudience,
      primaryOffer: templateData[templateType]?.primaryOffer || prev.primaryOffer,
      funnelGoal: templateData[templateType]?.funnelGoal || prev.funnelGoal
    }));

    alert(`Template applied! Fill in your specific details and click "Build My Funnel"`);
  };

  // Export funnel
  const exportFunnel = () => {
    if (!result) return;

    if (!guardToolAction({
      navigate,
      requiredPlan: 'basic',
      source: 'funnel-builder-export',
      actionLabel: 'export funnel plans',
      toolName: 'Marketing Funnel Builder',
    })) {
      return;
    }
    
    const funnelText = `
Marketing Funnel Plan
=====================

Funnel: ${result.name}
Type: ${result.type}
Target Audience: ${result.audience}

Performance Metrics:
- Total Audience: ${result.metrics.totalAudience}
- Conversion Rate: ${result.metrics.conversionRate}
- Cost Per Lead: ${result.metrics.costPerLead}
- Projected ROI: ${result.metrics.roi}

Stage-by-Stage Plan:
1. AWARENESS: Attract potential customers
2. INTEREST: Build relationships and trust
3. DECISION: Convert leads to customers
4. ACTION: Deliver value and retain customers

Next Steps:
1. Implement the content suggestions for each stage
2. Set up tracking for key metrics
3. Test and optimize continuously
4. Scale successful strategies
    `.trim();

    navigator.clipboard.writeText(funnelText).then(() => {
      alert('Funnel plan copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
      alert('Failed to copy to clipboard');
    });
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      businessName: '',
      businessType: 'ecommerce',
      targetAudience: '',
      primaryOffer: '',
      funnelGoal: 'lead-generation',
      budget: '1000'
    });
    setResult(null);
    setShowResults(false);
    setToolsList([]);
  };

  // Scroll to results
  useEffect(() => {
    if (showResults) {
      setTimeout(() => {
        const resultsElement = document.getElementById('funnel-results');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [showResults]);

  return (
    <div className="funnel-builder">
      <header className="tool-header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <span className="logo-icon">
                <BsDiagram3 size={22} />
              </span>
              <span>Funnel Builder</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container">
        <section className="hero">
          <h1>Marketing Funnel Builder</h1>
          <p>Build complete marketing funnels with content suggestions for each customer journey stage</p>
        </section>

        <div className="main-content">
          <section id="how-it-works" data-section="how-it-works" className="input-section">
            <h2>Build Your Funnel</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="businessName">Business Name</label>
                <input
                  type="text"
                  id="businessName"
                  className="form-input"
                  placeholder="Enter your business name"
                  value={formData.businessName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="businessType">Business Type</label>
                <select
                  id="businessType"
                  className="form-select"
                  value={formData.businessType}
                  onChange={handleInputChange}
                >
                  <option value="ecommerce">E-commerce Store</option>
                  <option value="saas">SaaS Company</option>
                  <option value="service">Service Business</option>
                  <option value="agency">Marketing Agency</option>
                  <option value="coach">Coach/Consultant</option>
                  <option value="creator">Content Creator</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="targetAudience">Target Audience</label>
                <input
                  type="text"
                  id="targetAudience"
                  className="form-input"
                  placeholder="Describe your ideal customers"
                  value={formData.targetAudience}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="primaryOffer">Primary Offer</label>
                <input
                  type="text"
                  id="primaryOffer"
                  className="form-input"
                  placeholder="Your main product or service"
                  value={formData.primaryOffer}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="funnelGoal">Funnel Goal</label>
                <select
                  id="funnelGoal"
                  className="form-select"
                  value={formData.funnelGoal}
                  onChange={handleInputChange}
                >
                  <option value="lead-generation">Lead Generation</option>
                  <option value="product-sales">Product Sales</option>
                  <option value="course-enrollment">Course Enrollment</option>
                  <option value="app-signups">App Sign-ups</option>
                  <option value="book-calls">Book Discovery Calls</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="budget">Monthly Ad Budget</label>
                <select
                  id="budget"
                  className="form-select"
                  value={formData.budget}
                  onChange={handleInputChange}
                >
                  <option value="500">$500</option>
                  <option value="1000">$1,000</option>
                  <option value="2500">$2,500</option>
                  <option value="5000">$5,000</option>
                  <option value="10000">$10,000+</option>
                </select>
              </div>

              <button className="build-btn" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Building Funnel...
                  </>
                ) : (
                  'Build My Funnel'
                )}
              </button>
            </form>

            <div className="quick-tips">
              <h3>Funnel Building Tips</h3>
              <ul>
                <li>Start with your customer's problem, not your solution</li>
                <li>Each stage should have a clear objective</li>
                <li>Test and optimize each step continuously</li>
                <li>Focus on building relationships, not just making sales</li>
              </ul>
            </div>
          </section>

          <section className="results-section" id="funnel-results">
            <h2>Your Marketing Funnel</h2>
            
            {!showResults ? (
              <div className="results-placeholder">
                <div className="placeholder-icon">
                  <BsDiagram3 size={38} />
                </div>
                <h3>Your funnel will appear here</h3>
                <p>Fill out the form and click "Build My Funnel" to create your customized marketing funnel</p>
              </div>
            ) : (
              <div className="results-content">
                <div className="funnel-header">
                  <div className="funnel-title">{result?.name}</div>
                  <div className="funnel-meta">
                    <span className="funnel-type">{result?.type}</span>
                    <span className="funnel-audience">{result?.audience}</span>
                  </div>
                </div>

                <div className="funnel-visualization">
                  {/* Awareness Stage */}
                  <div className="funnel-stage awareness">
                    <div className="stage-header">
                      <div className="stage-icon">
                        <AwarenessIcon size={20} />
                      </div>
                      <h3>Awareness</h3>
                      <div className="stage-percentage">100%</div>
                    </div>
                    <div className="stage-content">
                      <h4>Top of Funnel (TOFU)</h4>
                      <p>Attract strangers and make them aware of their problem</p>
                      <div className="content-suggestions">
                        {result?.stages?.awareness?.content?.map((item, index) => (
                          <div key={index} className="content-card">
                            <div className="content-type">{item.type}</div>
                            <div className="content-title">{item.title}</div>
                            <div className="content-description">{item.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Interest Stage */}
                  <div className="funnel-stage interest">
                    <div className="stage-header">
                      <div className="stage-icon">
                        <InterestIcon size={20} />
                      </div>
                      <h3>Interest</h3>
                      <div className="stage-percentage">25%</div>
                    </div>
                    <div className="stage-content">
                      <h4>Middle of Funnel (MOFU)</h4>
                      <p>Nurture leads and build trust</p>
                      <div className="content-suggestions">
                        {result?.stages?.interest?.content?.map((item, index) => (
                          <div key={index} className="content-card">
                            <div className="content-type">{item.type}</div>
                            <div className="content-title">{item.title}</div>
                            <div className="content-description">{item.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Decision Stage */}
                  <div className="funnel-stage decision">
                    <div className="stage-header">
                      <div className="stage-icon">
                        <DecisionIcon size={20} />
                      </div>
                      <h3>Decision</h3>
                      <div className="stage-percentage">10%</div>
                    </div>
                    <div className="stage-content">
                      <h4>Bottom of Funnel (BOFU)</h4>
                      <p>Convert leads into customers</p>
                      <div className="content-suggestions">
                        {result?.stages?.decision?.content?.map((item, index) => (
                          <div key={index} className="content-card">
                            <div className="content-type">{item.type}</div>
                            <div className="content-title">{item.title}</div>
                            <div className="content-description">{item.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Stage */}
                  <div className="funnel-stage action">
                    <div className="stage-header">
                      <div className="stage-icon">
                        <ActionIcon size={20} />
                      </div>
                      <h3>Action</h3>
                      <div className="stage-percentage">3%</div>
                    </div>
                    <div className="stage-content">
                      <h4>Conversion</h4>
                      <p>Complete the desired action</p>
                      <div className="content-suggestions">
                        {result?.stages?.action?.content?.map((item, index) => (
                          <div key={index} className="content-card">
                            <div className="content-type">{item.type}</div>
                            <div className="content-title">{item.title}</div>
                            <div className="content-description">{item.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="funnel-metrics">
                  <h3>Funnel Performance Metrics</h3>
                  <div className="metrics-grid">
                    <div className="metric-card">
                      <div className="metric-value">{result?.metrics?.totalAudience}</div>
                      <div className="metric-label">Total Audience</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-value">{result?.metrics?.conversionRate}</div>
                      <div className="metric-label">Conversion Rate</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-value">{result?.metrics?.costPerLead}</div>
                      <div className="metric-label">Cost Per Lead</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-value">{result?.metrics?.roi}</div>
                      <div className="metric-label">Projected ROI</div>
                    </div>
                  </div>
                </div>

                {/* Tools Section */}
                <div className="tools-section">
                  <h3>Recommended Tools & Platforms</h3>
                  <div className="tools-grid">
                    {toolsList.map((tool, index) => {
                      const ToolIcon = RECOMMENDED_TOOL_ICONS[tool.name] || BsDiagram3;
                      return (
                      <div key={index} className="tool-card">
                        <div className="tool-icon">
                          <span className="tool-icon-badge">
                            <ToolIcon size={20} />
                          </span>
                        </div>
                        <div className="tool-name">{tool.name}</div>
                        <div className="tool-purpose">{tool.purpose}</div>
                      </div>
                    );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="actions-section">
                  <button className="action-btn" onClick={exportFunnel}>
                    <BsGrid1X2 size={16} /> Export Funnel Plan
                  </button>
                  <button className="action-btn secondary" onClick={handleReset}>
                    <BsLightbulb size={16} /> Build New Funnel
                  </button>
                </div>
              </div>
            )}

            {loading && (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <p>Building your customized marketing funnel...</p>
              </div>
            )}
          </section>
        </div>

        <section id="features" data-section="features" className="tool-resource-section">
          <h2>Features</h2>
          <div className="tool-resource-grid">
            {FUNNEL_FEATURES.map((feature) => {
              const FeatureIcon = feature.icon;
              return (
                <div key={feature.title} className="tool-resource-card funnel-feature-card">
                  <div className={`funnel-feature-icon ${feature.iconClass}`}>
                    <span className="funnel-feature-icon-badge">
                      <FeatureIcon size={28} />
                    </span>
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Templates Section */}
        <section id="templates" className="templates-section">
          <h2>Funnel Templates</h2>
          <div className="templates-grid">
            <div className="template-card">
              <div className={`template-icon ${TEMPLATE_ICONS.ecommerce.className}`}>
                <span className="template-icon-badge">
                  <EcommerceTemplateIcon size={28} />
                </span>
              </div>
              <h3>E-commerce Funnel</h3>
              <p>Perfect for product-based businesses</p>
              <ul>
                <li>Social Media Ads to Landing Page to Purchase</li>
                <li>Abandoned Cart Sequences</li>
                <li>Upsell and cross-sell strategies</li>
              </ul>
              <button className="template-btn" onClick={() => applyTemplate('ecommerce')}>
                Use This Template
              </button>
            </div>
            
            <div className="template-card">
              <div className={`template-icon ${TEMPLATE_ICONS.saas.className}`}>
                <span className="template-icon-badge">
                  <SaaSTemplateIcon size={28} />
                </span>
              </div>
              <h3>SaaS Funnel</h3>
              <p>Ideal for software companies</p>
              <ul>
                <li>Content Marketing to Free Trial to Paid Plan</li>
                <li>Onboarding Sequences</li>
                <li>Customer Retention</li>
              </ul>
              <button className="template-btn" onClick={() => applyTemplate('saas')}>
                Use This Template
              </button>
            </div>

            <div className="template-card">
              <div className={`template-icon ${TEMPLATE_ICONS.course.className}`}>
                <span className="template-icon-badge">
                  <CourseTemplateIcon size={28} />
                </span>
              </div>
              <h3>Course Funnel</h3>
              <p>For educators and coaches</p>
              <ul>
                <li>Webinar to Lead Magnet to Course Sale</li>
                <li>Email Nurturing</li>
                <li>Student Onboarding</li>
              </ul>
              <button className="template-btn" onClick={() => applyTemplate('course')}>
                Use This Template
              </button>
            </div>
          </div>
        </section>

        <section id="how-it-works" data-section="how-it-works" className="tool-resource-section">
          <h2>How It Works</h2>
          <div className="tool-resource-grid">
            <div className="tool-resource-card">
              <h3>Map the Offer First</h3>
              <p>Define your audience, offer, and objective so the funnel recommendations are tied to a real buyer journey instead of a generic template.</p>
            </div>
            <div className="tool-resource-card">
              <h3>Build by Funnel Stage</h3>
              <p>The tool organizes ideas across awareness, interest, decision, and action so you can see where messaging needs support.</p>
            </div>
            <div className="tool-resource-card">
              <h3>Review Channel Fit</h3>
              <p>Use the suggested channels, metrics, and tools to decide where paid, organic, email, and landing-page tactics fit best.</p>
            </div>
            <div className="tool-resource-card">
              <h3>Apply a Template Faster</h3>
              <p>Templates give you a starting structure, then you can refine each stage to match your business model, budget, and traffic source.</p>
            </div>
          </div>
        </section>

        <section id="best-practices" data-section="best-practices" className="tool-resource-section">
          <h2>Best Practices</h2>
          <div className="tool-resource-grid">
            <div className="tool-resource-card">
              <h3>Keep One Primary Goal</h3>
              <p>Each funnel should be built around a single conversion target so your messaging and offers do not compete with each other.</p>
            </div>
            <div className="tool-resource-card">
              <h3>Align the Message</h3>
              <p>Make sure the promise in your ads matches what visitors see on the landing page and again in the conversion step.</p>
            </div>
            <div className="tool-resource-card">
              <h3>Track Stage Drop-Offs</h3>
              <p>Measure where prospects leave the journey so you know whether the issue is traffic quality, offer clarity, or friction.</p>
            </div>
            <div className="tool-resource-card">
              <h3>Improve One Stage at a Time</h3>
              <p>Optimize bottlenecks individually instead of rewriting the whole funnel at once. It is easier to measure progress that way.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FunnelBuilder;
