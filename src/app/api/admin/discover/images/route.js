import { NextResponse } from 'next/server';
import models from '../../../../../models/index.js';
import { supabaseAdmin, STORAGE_BUCKET } from '../../../../../lib/supabaseAdmin.js';

const { StoredImage } = models;

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch legacy images from PostgreSQL (existing ones)
    const dbImages = await StoredImage.findAll({
      attributes: ['id', 'filename', 'createdAt'],
      order: [['createdAt', 'DESC']],
    }).catch(() => []);

    const legacyImages = dbImages.map(img => ({
      id: String(img.id),
      filename: img.filename,
      url: `/api/images/${img.id}`,
      source: 'database',
      createdAt: img.createdAt,
    }));

    // Fetch new images from Supabase Storage
    const { data: storageFiles, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .list('', { limit: 200, sortBy: { column: 'created_at', order: 'desc' } });

    const storageImages = (!error && storageFiles)
      ? storageFiles
          .filter(f => f.name && !f.name.startsWith('.')) // filter out hidden/placeholder files
          .map(f => {
            const { data: urlData } = supabaseAdmin.storage
              .from(STORAGE_BUCKET)
              .getPublicUrl(f.name);
            return {
              id: f.name, // filename is the identifier for Supabase Storage files
              filename: f.name,
              url: urlData.publicUrl,
              source: 'supabase',
              createdAt: f.created_at,
            };
          })
      : [];

    // Merge: Supabase images first (newest), then legacy DB images
    const images = [...storageImages, ...legacyImages];

    return NextResponse.json({ images });
  } catch (error) {
    console.error('[Admin Images List API] Error fetching images:', error);
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}
