import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const pageSlug = formData.get('pageSlug') || 'discover';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save directory
    const targetDir = path.join(process.cwd(), 'public', 'uploads', 'discover');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Generate unique name
    const cleanSlug = pageSlug.replace(/[^a-z0-9_-]/gi, '-').toLowerCase();
    const fileName = `${cleanSlug}_${Date.now()}.webp`;
    const targetPath = path.join(targetDir, fileName);

    console.log(`[Upload API] Saving and compressing image to WebP: ${targetPath}`);

    // Compress using sharp (resize to max 1000px keeping aspect, encode in WebP)
    await sharp(buffer)
      .resize({ width: 1000, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(targetPath);

    const relativeUrl = `/uploads/discover/${fileName}`;
    return NextResponse.json({ url: relativeUrl });
  } catch (error) {
    console.error('[Upload API] Error processing image upload:', error);
    return NextResponse.json({ error: error.message || 'Image processing failed' }, { status: 500 });
  }
}
