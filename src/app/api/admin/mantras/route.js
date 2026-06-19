import { NextResponse } from 'next/server';
import models from '../../../../models/index.js';

const { Mantra } = models;

export async function GET() {
  try {
    const mantras = await Mantra.findAll({
      attributes: ['id', 'title', 'filename', 'createdAt'],
      order: [['createdAt', 'DESC']],
      raw: true
    });
    return NextResponse.json(mantras);
  } catch (error) {
    console.error('Failed to fetch mantras:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { title, filename } = body;

    if (!title || !filename) {
      return NextResponse.json({ error: 'Title and filename are required' }, { status: 400 });
    }

    // Clean up filename (e.g. remove leading slashes)
    const cleanFilename = filename.replace(/^\/+/, '');

    const mantra = await Mantra.create({
      title,
      filename: cleanFilename
    });

    return NextResponse.json({
      id: mantra.id,
      title: mantra.title,
      filename: mantra.filename
    });
  } catch (error) {
    console.error('Creation failed:', error);
    return NextResponse.json({ error: 'Creation failed' }, { status: 500 });
  }
}
