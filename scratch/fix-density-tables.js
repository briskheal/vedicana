import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else if (f === 'page.js') {
      callback(dirPath);
    }
  });
}

function updateAdminDensity() {
  const adminDir = path.join(process.cwd(), 'src/app/admin');
  
  walkDir(adminDir, (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Table paddings
    content = content.replace(/px-6 py-4/g, 'px-4 py-2');
    content = content.replace(/px-6 py-3/g, 'px-4 py-2');
    
    // Page/container paddings (e.g. p-6 or p-8 -> p-4)
    // Only target those in standard wrappers, but we'll leave them alone if it's too risky.
    // Let's just tighten tables right now.
    
    // Thumbnail sizes in tables
    content = content.replace(/w-12 h-12/g, 'w-8 h-8');
    content = content.replace(/w-10 h-10/g, 'w-8 h-8');

    // Button sizes inside tables
    content = content.replace(/px-3 py-1\.5 text-sm/g, 'px-2 py-1 text-xs');
    
    // Header font sizes inside tables
    content = content.replace(/text-sm text-slate-400 uppercase tracking-wider/g, 'text-[10px] text-slate-400 uppercase tracking-wider');

    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated density in ${filePath}`);
    }
  });
}

updateAdminDensity();
