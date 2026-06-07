import sharp from 'sharp';

async function checkImage() {
  try {
    const res = await fetch('https://vedicana.com/wp-content/uploads/2024/08/slide-1.png');
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const metadata = await sharp(buffer).metadata();
    console.log('Image dimensions:', metadata.width, 'x', metadata.height);
  } catch (err) {
    console.error('Error fetching image metadata:', err);
  }
}

checkImage();
