import { NextResponse } from 'next/server';
import PopularCategory from '../../../../models/PopularCategory.js';

export async function GET() {
  try {
    const items = await PopularCategory.findAll({
      order: [['createdAt', 'ASC']]
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error('[API Popular Categories] Fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch popular categories' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { name, image, shape, description } = await req.json();
    if (!name || !image) {
      return NextResponse.json({ error: 'Name and Image are required' }, { status: 400 });
    }

    // Auto-generate slug
    const slug = name.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-');

    const item = await PopularCategory.create({
      name,
      slug,
      image,
      shape: shape || 'round',
      description: description || ''
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error('[API Popular Categories] Create error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create popular category' }, { status: 500 });
  }
}
