import fs from 'fs';
import path from 'path';

const searchDir = './src';

function scanClientComponents(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanClientComponents(fullPath);
    } else if (file.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.trim().startsWith('"use client"') || content.trim().startsWith("'use client'")) {
        console.log(`\nClient Component: ${fullPath}`);
        
        // Scan for common hydration warning triggers
        const windowCheck = content.includes('typeof window') || content.includes('window !==');
        const randomCheck = content.includes('Math.random()');
        const dateCheck = content.includes('new Date()') || content.includes('Date.now()') || content.includes('toLocaleDateString') || content.includes('toLocaleTimeString');
        const clientOnlyText = content.includes('useEffect') && content.includes('useState');
        
        if (windowCheck) console.log('  - Triggers: typeof window / window check');
        if (randomCheck) console.log('  - Triggers: Math.random()');
        if (dateCheck) console.log('  - Triggers: Date checks or formatting');
      }
    }
  });
}

scanClientComponents(searchDir);
