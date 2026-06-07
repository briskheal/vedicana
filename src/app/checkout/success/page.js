"use client";
import { useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight, Package } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
      <div className="max-w-xl w-full bg-white p-10 rounded-2xl shadow-sm text-center border border-gray-100">
        
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
          <CheckCircle size={40} />
        </div>
        
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">Order Received!</h1>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Thank you for your purchase. Your order has been securely placed and is now being processed by our Ayurvedic experts.
        </p>

        {orderId && (
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-6 mb-8 flex items-center justify-center gap-4 text-left">
            <Package size={28} className="text-vedicana-green" />
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-widest font-bold">Order Number</p>
              <p className="text-2xl font-mono text-gray-900 font-bold">#{orderId}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/profile" className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            View My Orders
          </Link>
          <Link href="/shop" className="flex-1 bg-vedicana-green text-white py-3 px-6 rounded-lg font-medium hover:bg-vedicana-dark-green transition-colors flex items-center justify-center gap-2 shadow-sm">
            Continue Shopping <ArrowRight size={18} />
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
        <div className="max-w-xl w-full bg-white p-10 rounded-2xl shadow-sm text-center border border-gray-100 flex items-center justify-center">
          <div className="text-gray-500">Loading order status...</div>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
