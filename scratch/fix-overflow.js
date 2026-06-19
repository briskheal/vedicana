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

function updateOverflow() {
  const adminDir = path.join(process.cwd(), 'src/app/admin');
  
  walkDir(adminDir, (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Check if the file has a table but no overflow-x-auto
    // It's a bit tricky to safely wrap without breaking JSX.
    // Instead, if we see <table we look at its parent. 
    // This is safer to do manually or check if they already have it.
    
    // We can just add 'w-full' to tables to ensure they expand properly in their container,
    // which they probably already have.
    // Most admin tables in this project were written with `<div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-xl shadow-2xl">`
    // Let's verify by just printing out any table not preceded by overflow-x-auto.
    
    const lines = content.split('\n');
    let tableLine = -1;
    let missingOverflow = false;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('<table')) {
        // check previous 3 lines
        let hasOverflow = false;
        for (let j = Math.max(0, i - 3); j <= i; j++) {
          if (lines[j].includes('overflow-x-auto')) {
            hasOverflow = true;
          }
        }
        if (!hasOverflow) {
          missingOverflow = true;
          console.log(`Table missing overflow in: ${filePath}:${i}`);
        }
      }
    }
  });
}

updateOverflow();
