import { NextResponse } from 'next/server';
import models from '../../../../../../models/index.js';
import { supabaseAdmin, STORAGE_BUCKET } from '../../../../../../lib/supabaseAdmin.js';

const { StoredImage } = models;

export const dynamic = 'force-dynamic';

export async function DELETE(req, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Check if this is a legacy DB image (numeric ID) or a Supabase Storage filename
    const isNumericId = /^\d+$/.test(id);

    if (isNumericId) {
      // Legacy: delete from PostgreSQL StoredImage table
      const deletedCount = await StoredImage.destroy({ where: { id } });
      if (deletedCount === 0) {
        return NextResponse.json({ error: 'Image not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, source: 'database' });
    } else {
      // New: delete from Supabase Storage using filename as the path
      const { error } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .remove([id]); // id is the filename/path in the bucket

      if (error) {
        console.error('[Admin Images DELETE] Supabase Storage delete error:', error);
        return NextResponse.json({ error: error.message || 'Failed to delete from storage' }, { status: 500 });
      }
      return NextResponse.json({ success: true, source: 'supabase' });
    }
  } catch (error) {
    console.error('[Admin Images DELETE API] Error deleting image:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}
