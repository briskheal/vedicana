import fs from 'fs';
import path from 'path';

const file = path.join(process.cwd(), 'src/app/layout.js');
let content = fs.readFileSync(file, 'utf8');

if (!content.includes("import PageTransition from '../components/PageTransition';")) {
  content = content.replace("import Link from 'next/link';", "import Link from 'next/link';\nimport PageTransition from '../components/PageTransition';");
}

if (!content.includes("<PageTransition>")) {
  content = content.replace(
    /<main id="main-content" className="flex-grow">\s*\{children\}\s*<\/main>/,
    '<main id="main-content" className="flex-grow flex flex-col">\n            <PageTransition>{children}</PageTransition>\n          </main>'
  );
}

fs.writeFileSync(file, content);
console.log("Successfully wrapped layout.js with PageTransition");
