import { NextResponse } from 'next/server';
import sharp from 'sharp';
import models from '../../../../../models/index.js';

const { StoredImage } = models;

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log(`[Upload API] Compressing image and saving to database...`);

    // Compress using sharp (resize to max 1000px keeping aspect, encode in WebP)
    const compressedBuffer = await sharp(buffer)
      .resize({ width: 1000, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    // Save binary data to PostgreSQL
    const storedImage = await StoredImage.create({
      filename: `discover-upload-${Date.now()}.webp`,
      mimeType: 'image/webp',
      data: compressedBuffer
    });

    // Return the clean public URL
    return NextResponse.json({ url: `/api/images/${storedImage.id}` });
  } catch (error) {
    console.error('[Upload API] Error processing image upload:', error);
    return NextResponse.json({ error: error.message || 'Image processing failed' }, { status: 500 });
  }
}


