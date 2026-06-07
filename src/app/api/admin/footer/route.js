import { NextResponse } from 'next/server';
import models from '../../../../models/index.js';

const { FooterLink } = models;

export async function GET() {
  try {
    const links = await FooterLink.findAll({
      order: [['section', 'ASC'], ['order_index', 'ASC'], ['createdAt', 'ASC']]
    });
    return NextResponse.json(links);
  } catch (error) {
    console.error('[API Admin Footer] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { title, url, section, order_index } = await request.json();

    if (!title || !url) {
      return NextResponse.json({ error: 'Missing required fields: title and url' }, { status: 400 });
    }

    const cleanSection = section === 'quick_links' ? 'quick_links' : 'policies';

    const newLink = await FooterLink.create({
      title,
      url,
      section: cleanSection,
      order_index: order_index !== undefined ? parseInt(order_index, 10) : 0
    });

    return NextResponse.json(newLink, { status: 201 });
  } catch (error) {
    console.error('[API Admin Footer] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
