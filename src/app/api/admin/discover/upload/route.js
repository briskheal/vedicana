import { NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log(`[Upload API] Compressing image and converting to Base64...`);

    // Compress using sharp (resize to max 1000px keeping aspect, encode in WebP)
    const compressedBuffer = await sharp(buffer)
      .resize({ width: 1000, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    // Convert to Base64 Data URI
    const base64String = compressedBuffer.toString('base64');
    const dataUri = `data:image/webp;base64,${base64String}`;

    return NextResponse.json({ url: dataUri });
  } catch (error) {
    console.error('[Upload API] Error processing image upload:', error);
    return NextResponse.json({ error: error.message || 'Image processing failed' }, { status: 500 });
  }
}

