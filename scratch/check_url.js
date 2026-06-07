import https from 'https';

function check(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      console.log(`URL: ${url} -> Status: ${res.statusCode}`);
      resolve(res.statusCode);
    }).on('error', (e) => {
      console.error(`Error checking ${url}:`, e);
      resolve(500);
    });
  });
}

async function run() {
  await check('https://cdn.gtranslate.net/widgets/latest/dropdown.js');
  await check('https://cdn.gtranslate.net/widgets/latest/float.js');
  await check('https://cdn.gtranslate.net/widgets/latest/globe.js');
  await check('https://cdn.gtranslate.net/widgets/latest/popup.js');
  process.exit(0);
}

run();
