'use client';

import React from 'react';
import { Printer } from 'lucide-react';

export default function PrintInvoiceButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 bg-vedicana-green hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wide transition-all shadow-md hover:-translate-y-0.5 cursor-pointer"
    >
      <Printer size={16} /> Download Tax Invoice (PDF)
    </button>
  );
}
