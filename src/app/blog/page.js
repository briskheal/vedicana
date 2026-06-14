// Server Component — fetches data server-side
import { Suspense } from 'react';
import BlogClient from './BlogClient';
import Blog from '../../models/Blog.js';

export const revalidate = 3600; // Cache for 1 hour

async function getBlogs() {
  try {
    const blogs = await Blog.findAll({
      where: { status: 'published' },
      order: [['published_at', 'DESC']],
      raw: true
    });
    // Serialize
    return JSON.parse(JSON.stringify(blogs));
  } catch (err) {
    console.error("Blog fetch error:", err);
    return [];
  }
}

export default async function BlogPage() {
  const blogs = await getBlogs();
  return <BlogClient blogs={blogs} />;
}
