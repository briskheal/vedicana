import { NextResponse } from 'next/server';
import models from '../../../models/index.js';

const { Mantra } = models;

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const mantras = await Mantra.findAll({
      attributes: ['id', 'title', 'filename', 'mimeType'],
      order: [['createdAt', 'ASC']],
      raw: true
    });
    return NextResponse.json(mantras);
  } catch (error) {
    console.error('Failed to fetch public mantras:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
