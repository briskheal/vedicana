"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectToSettings() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/settings');
  }, [router]);

  return (
    <div className="py-24 text-center text-slate-500 text-xs italic">
      Redirecting to Settings console...
    </div>
  );
}
