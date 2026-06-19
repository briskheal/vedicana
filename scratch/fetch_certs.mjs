import sequelize from '../src/lib/sequelize.js';
import Certification from '../src/models/Certification.js';

async function fetchCerts() {
  try {
    const certs = await Certification.findAll({ raw: true, attributes: ['id', 'title', 'image'] });
    console.log("Certifications:");
    for (const c of certs) {
      console.log(`- ID: ${c.id}, Title: ${c.title}, Image Length: ${c.image ? c.image.length : 0}`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

fetchCerts();
