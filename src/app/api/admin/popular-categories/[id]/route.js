import { NextResponse } from 'next/server';
import PopularCategory from '../../../../../models/PopularCategory.js';

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const item = await PopularCategory.findByPk(id);
    if (!item) {
      return NextResponse.json({ error: 'Popular category not found' }, { status: 404 });
    }

    await item.destroy();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API Popular Categories DELETE] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete popular category' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const { name, image, shape, description } = await req.json();

    const item = await PopularCategory.findByPk(id);
    if (!item) {
      return NextResponse.json({ error: 'Popular category not found' }, { status: 404 });
    }

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Auto-generate slug
    const slug = name.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-');

    const updateData = {
      name,
      slug,
      shape: shape || 'round',
      description: description || ''
    };

    if (image) {
      updateData.image = image;
    }

    await item.update(updateData);
    return NextResponse.json(item);
  } catch (error) {
    console.error('[API Popular Categories PUT] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update popular category' }, { status: 500 });
  }
}
