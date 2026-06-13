import { NextResponse } from 'next/server';
import models from '../../../../../../models/index.js';

const { StoredImage } = models;

export async function DELETE(req, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const deletedCount = await StoredImage.destroy({
      where: { id }
    });

    if (deletedCount === 0) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Admin Images DELETE API] Error deleting image:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}
