import { NextResponse } from 'next/server';
import models from '../../../../../models/index.js';

const { DiscoverPage } = models;

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { slug } = resolvedParams;
    const page = await DiscoverPage.findOne({ where: { slug } });

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json(page, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate'
      }
    });
  } catch (error) {
    console.error('[API Admin Discover Item] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const { slug } = resolvedParams;
    const { title, content, is_active } = await request.json();

    const page = await DiscoverPage.findOne({ where: { slug } });
    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    await DiscoverPage.update({
      title: title ?? page.title,
      content: content ?? page.content,
      is_active: is_active ?? page.is_active
    }, {
      where: { slug }
    });

    const updatedPage = await DiscoverPage.findOne({ where: { slug } });
    return NextResponse.json(updatedPage, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate'
      }
    });
  } catch (error) {
    console.error('[API Admin Discover Item] PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const { slug } = resolvedParams;

    const page = await DiscoverPage.findOne({ where: { slug } });
    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    await DiscoverPage.destroy({ where: { slug } });
    return NextResponse.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error('[API Admin Discover Item] DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
