// Server Component — fetches data server-side for instant load (no spinner)
import { Suspense } from 'react';
import BlogClient from './BlogClient';

export const dynamic = 'force-dynamic';

async function getBlogs() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vedicana.com';
    const res = await fetch(`${baseUrl}/api/blogs`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const blogs = await getBlogs();
  return <BlogClient blogs={blogs} />;
}
