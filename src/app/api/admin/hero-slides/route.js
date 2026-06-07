import { NextResponse } from 'next/server';
import models from '../../../../models/index.js';

const { HeroSlide } = models;

export async function GET() {
  try {
    const slides = await HeroSlide.findAll({
      order: [
        ['order_index', 'ASC'],
        ['id', 'ASC']
      ]
    });
    return NextResponse.json(slides);
  } catch (error) {
    console.error('[API Admin HeroSlides] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { title, subtitle, badge, image, link, order_index, is_active } = await request.json();

    if (!image) {
      return NextResponse.json({ error: 'Image content is required' }, { status: 400 });
    }

    const newSlide = await HeroSlide.create({
      title: title || null,
      subtitle: subtitle || null,
      badge: badge || null,
      image,
      link: link || '/shop',
      order_index: order_index !== undefined ? parseInt(order_index) : 0,
      is_active: is_active !== undefined ? Boolean(is_active) : true
    });

    return NextResponse.json(newSlide, { status: 201 });
  } catch (error) {
    console.error('[API Admin HeroSlides] POST Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
