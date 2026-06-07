import https from 'https';

function check() {
  const url = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit2';
  https.get(url, (res) => {
    console.log(`Google Library URL: ${url} -> Status: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log("Length:", data.length);
      console.log("Snippet:", data.substring(0, 500));
    });
  }).on('error', (e) => {
    console.error("Error fetching Google Library:", e);
  });
}

check();
