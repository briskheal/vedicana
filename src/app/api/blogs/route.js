import { NextResponse } from 'next/server';
import { Op } from 'sequelize';
import models from '../../../models/index.js';

const { Blog } = models;

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const now = new Date();
    const blogs = await Blog.findAll({
      where: {
        status: 'published',
      },
      order: [['published_at', 'DESC']],
    });
    return NextResponse.json(blogs, {
      headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' },
    });
  } catch (error) {
    console.error('[API Public Blogs] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
