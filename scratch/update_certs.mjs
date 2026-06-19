import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../src/lib/sequelize.js';
import Certification from '../src/models/Certification.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const brainDir = path.resolve('C:/Users/J S DASH/.gemini/antigravity/brain/39249ead-7316-4fbe-b96b-f310e201354a');
const destDir = path.resolve(__dirname, '../public/images/certifications');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Ensure the mapping connects the specific ID and title to the specific generated image
const map = [
  { id: 10, title: 'WHO GMP', filePrefix: 'cert_who_gmp_', slug: 'who-gmp' },
  { id: 11, title: 'Organic', filePrefix: 'cert_organic_', slug: 'organic' },
  { id: 12, title: 'Cruelty Free', filePrefix: 'cert_cruelty_free_', slug: 'cruelty-free' },
  { id: 13, title: 'Chemical Free', filePrefix: 'cert_chemical_free_', slug: 'chemical-free' },
  { id: 14, title: 'Sustainable', filePrefix: 'cert_sustainable_', slug: 'sustainable' },
  { id: 15, title: 'SSL Secure', filePrefix: 'cert_ssl_secure_', slug: 'ssl-secure' },
  { id: 16, title: 'Child Labor Free', filePrefix: 'cert_child_labor_free_', slug: 'child-labor-free' },
  { id: 17, title: 'COA Certified', filePrefix: 'cert_coa_certified_', slug: 'coa-certified' },
  { id: 18, title: '100% Natural', filePrefix: 'cert_100_natural_', slug: '100-natural' },
];

async function updateCerts() {
  try {
    const files = fs.readdirSync(brainDir);
    
    for (const item of map) {
      // Find the file that matches the prefix
      const sourceFile = files.find(f => f.startsWith(item.filePrefix) && f.endsWith('.png'));
      if (sourceFile) {
        const sourcePath = path.join(brainDir, sourceFile);
        const destPath = path.join(destDir, `${item.slug}.png`);
        
        fs.copyFileSync(sourcePath, destPath);
        console.log(`Copied ${sourceFile} to ${item.slug}.png`);
        
        const dbPath = `/images/certifications/${item.slug}.png`;
        
        // Check if certification with this ID exists, if so update it, else if title matches update it
        let cert = await Certification.findByPk(item.id);
        if (!cert) {
            cert = await Certification.findOne({ where: { title: item.title } });
        }
        
        if (cert) {
          cert.image = dbPath;
          await cert.save();
          console.log(`Updated DB for ${item.title} (ID: ${cert.id}) -> ${dbPath}`);
        } else {
          console.log(`Certification ${item.title} not found in DB!`);
        }
      } else {
        console.log(`Could not find generated image for ${item.title} (Prefix: ${item.filePrefix})`);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

updateCerts();
