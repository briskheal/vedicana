import { NextResponse } from 'next/server';
import models from '../../../../../models/index.js';

const { StoredImage } = models;

export async function GET() {
  try {
    const images = await StoredImage.findAll({
      attributes: ['id', 'filename', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    return NextResponse.json({ images });
  } catch (error) {
    console.error('[Admin Images List API] Error fetching images:', error);
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}
