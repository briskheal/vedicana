import { NextResponse } from 'next/server';
import models from '../../../../models/index.js';

const { Mantra } = models;

export async function GET() {
  try {
    const mantras = await Mantra.findAll({
      attributes: ['id', 'title', 'filename', 'mimeType', 'createdAt'],
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
    const formData = await req.formData();
    const title = formData.get('title');
    const file = formData.get('file');

    if (!file || !title) {
      return NextResponse.json({ error: 'Title and file are required' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const mantra = await Mantra.create({
      title,
      filename: file.name,
      mimeType: file.type || 'audio/mpeg',
      data: buffer
    });

    return NextResponse.json({
      id: mantra.id,
      title: mantra.title,
      filename: mantra.filename,
      mimeType: mantra.mimeType
    });
  } catch (error) {
    console.error('Upload failed:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
