import { NextResponse } from 'next/server';
import models from '../../../../models/index.js';

const { DiscoverPage } = models;

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pages = await DiscoverPage.findAll({
      order: [['id', 'ASC']]
    });
    return NextResponse.json(pages, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate'
      }
    });
  } catch (error) {
    console.error('[API Admin Discover] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { title, slug, content } = await request.json();

    if (!title || !slug || !content) {
      return NextResponse.json({ error: 'Missing required fields: title, slug, content' }, { status: 400 });
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-');

    const existingPage = await DiscoverPage.findOne({ where: { slug: cleanSlug } });
    if (existingPage) {
      return NextResponse.json({ error: `A page with slug "${cleanSlug}" already exists.` }, { status: 400 });
    }

    const newPage = await DiscoverPage.create({
      title,
      slug: cleanSlug,
      content,
      is_active: true
    });

    return NextResponse.json(newPage, { status: 211 });
  } catch (error) {
    console.error('[API Admin Discover] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
