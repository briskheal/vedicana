import { NextResponse } from 'next/server';
import models from '../../../../models/index.js';

const { Blog } = models;

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { slug } = await params;

    const blog = await Blog.findOne({
      where: { slug, status: 'published' },
    });

    if (!blog) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    // Increment views
    await blog.increment('views');
    await blog.reload();

    return NextResponse.json(blog, {
      headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' },
    });
  } catch (error) {
    console.error('[API Public Blogs Slug] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
