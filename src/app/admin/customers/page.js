import React from 'react';
import { Users, Mail, Phone, MapPin, Shield, Calendar, ShoppingBag } from 'lucide-react';
import models from '../../../models/index.js';

const { User, Order } = models;

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
  let users = [];
  let errorMsg = '';

  try {
    const dbUsers = await User.findAll({
      include: [{ model: Order, as: 'Orders', attributes: ['id'] }],
      order: [['createdAt', 'DESC']]
    });
    users = dbUsers.map(u => u.get({ plain: true }));
  } catch (err) {
    console.error('Failed to load customers in admin:', err);
    errorMsg = 'Failed to load customers from database. Verify PostgreSQL connection.';
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      
      {/* Top Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1e293b] p-6 rounded-xl border border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-serif text-white font-bold mb-1 flex items-center gap-2">
            <Users className="text-vedicana-gold" size={24} /> Registered Customers & Users
          </h1>
          <p className="text-slate-400 text-sm">View complete profiles, contact details, registration logs, and purchasing activity.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/60 py-1.5 px-4 rounded-full border border-slate-800 text-xs">
          <span className="w-2 h-2 rounded-full bg-vedicana-green animate-pulse"></span>
          <span className="text-slate-300 font-medium">{users.length} Total Users</span>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm">
          {errorMsg}
        </div>
      )}

      {/* Main Customers List */}
      <div className="bg-[#1e293b] border border-slate-800 rounded-xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-[#1e293b]">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            User Accounts Database
          </h3>
        </div>

        {users.length === 0 ? (
          <div className="py-24 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <Users size={36} className="text-slate-600" />
            <p className="text-base font-serif text-slate-400">No users found</p>
            <p className="text-xs text-slate-500">Wait for users to register on your store.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-slate-900/40">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Address</th>
                  <th className="px-6 py-4 text-center">Orders</th>
                  <th className="px-6 py-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((user) => {
                  const avatarInitials = user.name
                    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                    : 'U';
                  
                  return (
                    <tr key={user.id} className="hover:bg-slate-900/20 transition-colors">
                      {/* User Info & Avatar */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-vedicana-green/10 text-vedicana-green font-bold rounded-full flex items-center justify-center border border-vedicana-green/20">
                            {avatarInitials}
                          </div>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-2">
                              {user.name}
                              {user.role === 'admin' && (
                                <span className="bg-vedicana-gold/15 text-vedicana-gold border border-vedicana-gold/20 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-0.5">
                                  <Shield size={8} /> Admin
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">ID: #{user.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-sm text-slate-300">
                          <Mail size={14} className="text-slate-500" />
                          <span className="truncate max-w-xs">{user.email}</span>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Phone size={14} className="text-slate-500" />
                          {user.phone ? (
                            <span className="text-slate-300">{user.phone}</span>
                          ) : (
                            <span className="text-slate-500 italic text-xs">Not Provided</span>
                          )}
                        </div>
                      </td>

                      {/* Address */}
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-1.5 text-sm max-w-xs">
                          <MapPin size={14} className="text-slate-500 mt-0.5 flex-shrink-0" />
                          {user.address ? (
                            <span className="text-slate-300 line-clamp-2 text-xs leading-relaxed">{user.address}</span>
                          ) : (
                            <span className="text-slate-500 italic text-xs">Not Provided</span>
                          )}
                        </div>
                      </td>

                      {/* Orders Count */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="inline-flex items-center gap-1 bg-slate-900/60 px-2.5 py-1 rounded-full border border-slate-800 text-xs text-slate-300 font-semibold">
                          <ShoppingBag size={12} className="text-vedicana-green" />
                          {user.Orders ? user.Orders.length : 0}
                        </div>
                      </td>

                      {/* Created At */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-sm text-slate-400">
                          <Calendar size={14} className="text-slate-600" />
                          <span>
                            {new Date(user.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
