import { NextResponse } from 'next/server';
import { Op } from 'sequelize';
import models from '../../../models/index.js';

const { Blog } = models;

export const revalidate = 3600;

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
      headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=300' },
    });
  } catch (error) {
    console.error('[API Public Blogs] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
