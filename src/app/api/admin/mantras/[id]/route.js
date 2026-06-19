import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import models from '../../../../../models/index.js';

const { Mantra } = models;

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const deleted = await Mantra.destroy({ where: { id } });
    if (!deleted) {
      return NextResponse.json({ error: 'Mantra not found' }, { status: 404 });
    }
    
    // Invalidate the public mantras cache so the frontend updates instantly
    revalidatePath('/api/mantras');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
