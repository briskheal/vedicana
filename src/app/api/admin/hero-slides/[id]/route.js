import { NextResponse } from 'next/server';
import models from '../../../../../models/index.js';

const { HeroSlide } = models;

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const slide = await HeroSlide.findByPk(id);

    if (!slide) {
      return NextResponse.json({ error: 'Hero slide not found' }, { status: 404 });
    }

    return NextResponse.json(slide);
  } catch (error) {
    console.error('[API Admin HeroSlide Item] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const { title, subtitle, badge, image, link, order_index, is_active } = await request.json();

    const slide = await HeroSlide.findByPk(id);
    if (!slide) {
      return NextResponse.json({ error: 'Hero slide not found' }, { status: 404 });
    }

    const updatedData = {};
    if (title !== undefined) updatedData.title = title || null;
    if (subtitle !== undefined) updatedData.subtitle = subtitle || null;
    if (badge !== undefined) updatedData.badge = badge || null;
    if (image !== undefined && image) updatedData.image = image;
    if (link !== undefined) updatedData.link = link || '/shop';
    if (order_index !== undefined) updatedData.order_index = parseInt(order_index);
    if (is_active !== undefined) updatedData.is_active = Boolean(is_active);

    await HeroSlide.update(updatedData, {
      where: { id }
    });

    const updatedSlide = await HeroSlide.findByPk(id);
    return NextResponse.json(updatedSlide);
  } catch (error) {
    console.error('[API Admin HeroSlide Item] PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const slide = await HeroSlide.findByPk(id);
    if (!slide) {
      return NextResponse.json({ error: 'Hero slide not found' }, { status: 404 });
    }

    await HeroSlide.destroy({ where: { id } });

    return NextResponse.json({ message: 'Hero slide deleted successfully' });
  } catch (error) {
    console.error('[API Admin HeroSlide Item] DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
