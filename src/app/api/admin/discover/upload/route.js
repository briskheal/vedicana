import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { supabaseAdmin, STORAGE_BUCKET } from '../../../../../lib/supabaseAdmin.js';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log(`[Upload API] Compressing image and uploading to Supabase Storage...`);

    // Compress using sharp (resize to max 1200px, encode as WebP @ 82% quality)
    const compressedBuffer = await sharp(buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    // Generate a unique filename
    const filename = `discover-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(filename, compressedBuffer, {
        contentType: 'image/webp',
        cacheControl: '31536000', // 1 year cache on Supabase CDN
        upsert: false,
      });

    if (error) {
      console.error('[Upload API] Supabase Storage upload error:', error);
      return NextResponse.json({ error: error.message || 'Storage upload failed' }, { status: 500 });
    }

    // Get the permanent public CDN URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(data.path);

    const publicUrl = publicUrlData.publicUrl;

    console.log(`[Upload API] Image uploaded to Supabase CDN: ${publicUrl}`);

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error('[Upload API] Error processing image upload:', error);
    return NextResponse.json({ error: error.message || 'Image processing failed' }, { status: 500 });
  }
}
