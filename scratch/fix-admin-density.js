import fs from 'fs';
import path from 'path';

function updateAdminLayout() {
  const file = path.join(process.cwd(), 'src/app/admin/layout.js');
  if (!fs.existsSync(file)) return;
  
  let content = fs.readFileSync(file, 'utf8');
  
  // Tighten padding on nav items
  content = content.replace(/pl-9 pr-4 py-2\.5/g, 'pl-8 pr-3 py-1.5');
  
  // Decrease text size in nav slightly
  content = content.replace(/text-\[11px\]/g, 'text-[10px]');
  
  fs.writeFileSync(file, content);
  console.log("Updated Admin layout.js");
}

updateAdminLayout();
