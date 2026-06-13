import { NextResponse } from 'next/server';
import models from '../../../../../models/index.js';

const { Mantra } = models;

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const mantra = await Mantra.findByPk(id);

    if (!mantra || !mantra.data) {
      return NextResponse.json({ error: 'Audio not found' }, { status: 404 });
    }

    const headers = new Headers();
    headers.set('Content-Type', mantra.mimeType || 'audio/mpeg');
    headers.set('Content-Length', mantra.data.length.toString());
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    return new NextResponse(mantra.data, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('Audio stream failed:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
