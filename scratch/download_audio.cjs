const https = require('https');
const fs = require('fs');

const url = 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Om.ogg';
const dest = 'public/audio/om_mantra.ogg';

const options = {
  headers: {
    'User-Agent': 'VedicanaApp/1.0 (contact@vedicana.com) Node.js/18'
  }
};

const file = fs.createWriteStream(dest);
https.get(url, options, function(response) {
  if (response.statusCode === 200) {
    response.pipe(file);
    file.on('finish', function() {
      file.close();
      console.log('Download complete');
    });
  } else {
    console.error('Download failed with status: ' + response.statusCode);
  }
}).on('error', function(err) {
  fs.unlink(dest, () => {});
  console.error('Error: ', err.message);
});
