"use client";
import React from 'react';
import { usePathname } from 'next/navigation';

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin') || pathname?.startsWith('/api/admin');

  if (isAdmin) return null;
  return <>{children}</>;
}
