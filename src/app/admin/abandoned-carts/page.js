import React from 'react';
import AbandonedCart from '../../../models/AbandonedCart.js';
import { ShoppingCart, Clock, CheckCircle } from 'lucide-react';
import RecoverButton from './RecoverButton.js';

export const dynamic = 'force-dynamic';

export default async function AbandonedCartsPage() {
  const carts = await AbandonedCart.findAll({
    order: [['lastActive', 'DESC']]
  });

  const parsedCarts = carts.map(c => {
    const plain = c.get({ plain: true });
    if (typeof plain.cartData === 'string') {
      try { plain.cartData = JSON.parse(plain.cartData); } catch(e) {}
    }
    return plain;
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShoppingCart className="text-vedicana-gold" />
          Abandoned Checkouts
        </h1>
      </div>

      <div className="bg-[#1e293b] rounded-xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-700">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Cart Value</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Last Active</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {parsedCarts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    No abandoned carts found.
                  </td>
                </tr>
              ) : parsedCarts.map((cart) => {
                const cartArray = Array.isArray(cart.cartData) ? cart.cartData : [];
                const totalValue = cartArray.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
                const itemsCount = cartArray.reduce((sum, item) => sum + (item.quantity || 1), 0);

                return (
                  <tr key={cart.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-white">{cart.email}</div>
                      <div className="text-xs text-slate-500 mt-1">{itemsCount} items left behind</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-vedicana-gold">₹{totalValue.toLocaleString('en-IN')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-300 flex items-center gap-1">
                        <Clock size={14} className="text-slate-500" />
                        {new Date(cart.lastActive).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {cart.isRecovered ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle size={12} /> Recovered
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!cart.isRecovered && (
                        <RecoverButton cartId={cart.id} email={cart.email} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
