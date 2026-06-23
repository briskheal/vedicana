"use client";
import React, { useState } from 'react';
import { Mail, Check, Loader } from 'lucide-react';

export default function RecoverButton({ cartId, email }) {
  const [status, setStatus] = useState('idle');

  const handleRecover = async () => {
    setStatus('loading');
    try {
      const res = await fetch('/api/admin/abandoned-carts/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId, email })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
      } else {
        alert(data.error || 'Failed to send recovery email');
        setStatus('idle');
      }
    } catch (err) {
      alert('Error sending recovery email');
      setStatus('idle');
    }
  };

  if (status === 'success') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-md text-xs font-semibold">
        <Check size={14} /> Sent
      </span>
    );
  }

  return (
    <button
      onClick={handleRecover}
      disabled={status === 'loading'}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-vedicana-green hover:bg-emerald-600 disabled:opacity-50 text-white rounded-md text-xs font-semibold transition-colors cursor-pointer"
    >
      {status === 'loading' ? <Loader size={14} className="animate-spin" /> : <Mail size={14} />}
      Send Reminder
    </button>
  );
}
