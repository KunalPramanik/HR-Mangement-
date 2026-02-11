const fs = require('fs');
const path = require('path');

function checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('useRouter') && !content.includes("'use client'") && !content.includes('"use client"')) {
        console.log(`Missing 'use client' in: ${filePath}`);
    }
}

function traverseDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverseDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            checkFile(fullPath);
        }
    }
}

traverseDir(path.join(process.cwd(), 'src/app'));
console.log('Done checking.');
