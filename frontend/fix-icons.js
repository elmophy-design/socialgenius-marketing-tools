const fs = require('fs');

const file = 'src/App.js';
let content = fs.readFileSync(file, 'utf8');

// Replace corrupted feature icons - using non-regex method
let lines = content.split('\n');
let result = [];
let inFeatureSection = false;
let featureIndex = 0;

for (let line of lines) {
  if (line.includes('feature-card')) {
    inFeatureSection = true;
    result.push(line);
  } else if (inFeatureSection && line.includes('feature-icon') && line.includes('</div>')) {
    // Replace corrupted emoji with proper icon
    const features = [
      { color: '#3b82f6', icon: 'AiOutlineRobot', title: 'AI-Powered' },
      { color: '#8b5cf6', icon: 'MdAnalytics', title: 'Advanced Analytics' },
      { color: '#ec4899', icon: 'MdShare', title: 'Multi-Platform' },
      { color: '#f59e0b', icon: 'MdShieldAlert', title: 'Enterprise' }
    ];
    
    let replaced = false;
    for (let feat of features) {
      if (line.includes('feature-icon')) {
        result.push(`                  <div className="feature-icon" style={{color: "${feat.color}"}}>{React.createElement(${feat.icon}, {size: 40})}</div>`);
        inFeatureSection = false;
        replaced = true;
        break;
      }
    }
    if (!replaced) result.push(line);
  } else if (line.includes('method-icon') && !line.includes('style={{')) {
    // Replace method icons
    if (line.includes('Visit Our Office')) {
      result.push(`                  <div className="method-icon" style={{color: "#0284c7"}}>{React.createElement(MdLocationOn, {size: 32})}</div>`);
    } else if (line.includes('Live Chat')) {
      result.push(`                  <div className="method-icon" style={{color: "#a855f7"}}>{React.createElement(MdMessage, {size: 32})}</div>`);
    } else if (line.includes('Email') || line.includes('support@')) {
      result.push(`                  <div className="method-icon" style={{color: "#e11d48"}}>{React.createElement(MdEmail, {size: 32})}</div>`);
    } else if (line.includes('Call') || line.includes('888')) {
      result.push(`                  <div className="method-icon" style={{color: "#059669"}}>{React.createElement(MdPhone, {size: 32})}</div>`);
    } else {
      result.push(line);
    }
  } else if (line.includes('social-icon') && !line.includes('style={{')) {
    // Replace social icons
    if (line.includes('twitter')) {
      result.push(`                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon" style={{color: "#1DA1F2"}} title="Twitter">{React.createElement(RiTwitterFill, {size: 24})}</a>`);
    } else if (line.includes('linkedin')) {
      result.push(`                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon" style={{color: "#0A66C2"}} title="LinkedIn">{React.createElement(RiLinkedinFill, {size: 24})}</a>`);
    } else if (line.includes('facebook')) {
      result.push(`                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon" style={{color: "#1877F2"}} title="Facebook">{React.createElement(RiFacebookFill, {size: 24})}</a>`);
    } else if (line.includes('instagram')) {
      result.push(`                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon" style={{color: "#E4405F"}} title="Instagram">{React.createElement(RiInstagramFill, {size: 24})}</a>`);
    } else {
      result.push(line);
    }
  } else {
    result.push(line);
  }
}

fs.writeFileSync(file, result.join('\n'), 'utf8');
console.log('✅ All icons updated successfully with colors and react-icons!');
