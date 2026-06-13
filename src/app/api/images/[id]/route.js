import { NextResponse } from 'next/server';
import models from '../../../../models/index.js';

const { StoredImage } = models;

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const storedImage = await StoredImage.findByPk(id);

    if (!storedImage || !storedImage.data) {
      return new NextResponse(null, { status: 404, statusText: 'Not Found' });
    }

    return new NextResponse(storedImage.data, {
      status: 200,
      headers: {
        'Content-Type': storedImage.mimeType || 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error(`[API Image Serving] Error fetching image ${params?.id}:`, error);
    return new NextResponse(null, { status: 500, statusText: 'Internal Server Error' });
  }
}
