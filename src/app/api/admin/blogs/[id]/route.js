import { NextResponse } from 'next/server';
import models from '../../../../../models/index.js';

const { Blog } = models;

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const blog = await Blog.findByPk(parseInt(id));
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }
    return NextResponse.json(blog, {
      headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' },
    });
  } catch (error) {
    console.error('[API Admin Blogs ID] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const blog = await Blog.findByPk(parseInt(id));
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // If status is being set to published and not yet published, set published_at
    let published_at = blog.published_at;
    if (body.status === 'published' && blog.status !== 'published' && !published_at) {
      published_at = new Date();
    }

    // If slug provided and changed, check uniqueness
    if (body.slug && body.slug !== blog.slug) {
      const existing = await Blog.findOne({ where: { slug: body.slug } });
      if (existing && existing.id !== blog.id) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
      }
    }

    await blog.update({
      title: body.title ?? blog.title,
      slug: body.slug ?? blog.slug,
      excerpt: body.excerpt !== undefined ? body.excerpt : blog.excerpt,
      content: body.content !== undefined ? body.content : blog.content,
      cover_image: body.cover_image !== undefined ? body.cover_image : blog.cover_image,
      author: body.author ?? blog.author,
      category: body.category ?? blog.category,
      tags: body.tags ?? blog.tags,
      status: body.status ?? blog.status,
      scheduled_at: body.scheduled_at !== undefined ? body.scheduled_at : blog.scheduled_at,
      published_at,
      read_time: body.read_time ?? blog.read_time,
      is_featured: body.is_featured !== undefined ? body.is_featured : blog.is_featured,
    });

    const updated = await Blog.findByPk(parseInt(id));
    return NextResponse.json(updated, {
      headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' },
    });
  } catch (error) {
    console.error('[API Admin Blogs ID] PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const blog = await Blog.findByPk(parseInt(id));
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }
    await blog.destroy();
    return NextResponse.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('[API Admin Blogs ID] DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
