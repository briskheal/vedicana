import { NextResponse } from 'next/server';
import models from '../../../../models/index.js';

const { Blog, sequelize } = models;

export const dynamic = 'force-dynamic';

let synced = false;
async function ensureSynced() {
  if (!synced) {
    await Blog.sync({ alter: true });
    synced = true;
  }
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100);
}

export async function GET() {
  try {
    await ensureSynced();
    const blogs = await Blog.findAll({
      order: [['createdAt', 'DESC']],
    });
    return NextResponse.json(blogs, {
      headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' },
    });
  } catch (error) {
    console.error('[API Admin Blogs] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await ensureSynced();
    const body = await request.json();
    const {
      title, excerpt, content, cover_image, author, category,
      tags, status, scheduled_at, read_time, is_featured,
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Auto-generate slug from title
    let slug = generateSlug(title);

    // Ensure uniqueness
    const existing = await Blog.findOne({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const published_at = status === 'published' ? new Date() : null;

    const blog = await Blog.create({
      title,
      slug,
      excerpt: excerpt || null,
      content: content || null,
      cover_image: cover_image || null,
      author: author || 'VediCana Team',
      category: category || 'Wellness',
      tags: tags || [],
      status: status || 'draft',
      scheduled_at: scheduled_at || null,
      published_at,
      read_time: read_time || 5,
      is_featured: is_featured || false,
      views: 0,
    });

    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    console.error('[API Admin Blogs] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
