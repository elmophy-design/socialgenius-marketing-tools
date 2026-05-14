const fs = require('fs');

const file = 'src/App.js';
let content = fs.readFileSync(file, 'utf8');

// Remove leftover corrupted characters
// Match patterns like: </a>\n<whitespace>CORRUPTED\n</a>
content = content.replace(/<\/a>\s*[\u00C0-\u00FF]{3,20}\s*<\/a>/g, '</a>');

// Also remove any standalone corrupted emoji-like patterns inside tags/divs
content = content.replace(/<\/a>\s*[\u00C0-\u00FF]+\s*/g, '</a>\n                  ');

// Remove duplicate closing tags
content = content.replace(/(<\/a>)\s*$/gm, '$1');

// Clean up excess newlines
content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

fs.writeFileSync(file, content, 'utf8');
console.log('✅ Cleaned up corrupted icon remnants!');
