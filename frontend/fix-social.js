const fs = require('fs');

const file = 'src/App.js';
let content = fs.readFileSync(file, 'utf8');

// Remove the corrupted orphaned closing tags and corrupted characters in social section
const socialSection = /<div className="social-icons">[\s\S]*?<\/div>\s*<\/div>/;
const match = content.match(socialSection);

if (match) {
  const cleanedSocial = match[0]
    .replace(/(<\/a>)\n\s*°[^\n]*\n\s*<\/a>/g, '$1')
    .replace(/\n\s*°[^\n]*/g, '');
  
  content = content.replace(socialSection, cleanedSocial);
}

fs.writeFileSync(file, content, 'utf8');
console.log('✅ Fixed social icons!');
