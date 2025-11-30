const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'frontend/pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));

console.log('🔧 Adding Zalo Chat to all pages...\n');

let updated = 0;
let skipped = 0;

files.forEach(file => {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if already has zalo-chat.js
    if (content.includes('zalo-chat.js')) {
        console.log(`⏭️  ${file} - Already has Zalo chat`);
        skipped++;
        return;
    }
    
    // Find </body> tag and add script before it
    if (content.includes('</body>')) {
        content = content.replace(
            '</body>',
            '    <script src="/js/zalo-chat.js"></script>\n</body>'
        );
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ ${file} - Added Zalo chat`);
        updated++;
    } else {
        console.log(`⚠️  ${file} - No </body> tag found`);
        skipped++;
    }
});

console.log(`\n📊 Summary:`);
console.log(`   Updated: ${updated} files`);
console.log(`   Skipped: ${skipped} files`);
console.log(`\n✨ Done! Refresh your browser to see the Zalo chat button.`);
