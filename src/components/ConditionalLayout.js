"use client";
import { usePathname } from 'next/navigation';

export default function ConditionalLayout({ header, footer, spinWheel, children }) {
  const pathname = usePathname() || '';
  const isAdmin = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  const isInvoice = pathname.includes('/invoice');
  const hideLayout = isAdmin || isInvoice;

  return (
    <>
      {!hideLayout && header}
      {children}
      {!hideLayout && spinWheel}
      {!hideLayout && footer}
    </>
  );
}
