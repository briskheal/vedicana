"use client";
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, 
  Image as ImageIcon, Sparkles, MessageSquare, Layers, Navigation, 
  Award, CalendarCheck, Menu, X, AlertTriangle, FileText, Briefcase, Inbox, Music
} from 'lucide-react';
import "../globals.css";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar drawer on route navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Products & Images', icon: Package },
    { href: '/admin/categories', label: 'Categories', icon: Layers },
    { href: '/admin/popular-categories', label: 'Popular Categories', icon: Layers },
    { href: '/admin/banners', label: 'Hero Banners', icon: ImageIcon },
    { href: '/admin/certifications', label: 'Quality Stamps', icon: Award },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart, badge: true },
    { href: '/admin/inventory', label: 'Expired / Damaged', icon: AlertTriangle },
    { href: '/admin/discover', label: 'Discover Pages', icon: Sparkles },
    { href: '/admin/blogs', label: 'Blog Posts', icon: FileText },
    { href: '/admin/inbox', label: 'Unified Inbox', icon: Inbox },
    { href: '/admin/mantras', label: 'Mantras Library', icon: Music },
    { href: '/admin/careers', label: 'Career CVs', icon: Briefcase },
    { href: '/admin/reviews', label: 'Product Reviews', icon: MessageSquare },
    { href: '/admin/appointments', label: 'Wellness Bookings', icon: CalendarCheck },
    { href: '/admin/footer', label: 'Footer Navigation', icon: Navigation },
    { href: '/admin/customers', label: 'Customers', icon: Users },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        window.location.href = '/login';
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 flex">
      
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-[#1e293b] border-r border-slate-800 flex flex-col hidden md:flex flex-shrink-0">
        <div className="h-20 flex items-center justify-center border-b border-slate-800">
          <h1 className="text-2xl font-serif text-vedicana-gold font-bold tracking-wider">
            VediCana<span className="text-white text-xs ml-1 bg-vedicana-green px-2 py-0.5 rounded">OS</span>
          </h1>
        </div>
        <nav className="flex-1 py-6 px-4 relative overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
          {/* Vertical Ribbon line track */}
          <div className="absolute left-[27px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-vedicana-green/30 via-slate-800 to-slate-800/30 pointer-events-none z-0"></div>
          
          <div className="space-y-1 relative z-10">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <a 
                  key={item.href}
                  href={item.href} 
                  className={`flex items-center gap-3 pl-8 pr-3 py-1.5 rounded-lg transition-all relative group ${
                    isActive 
                      ? 'text-white font-bold bg-slate-800/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] border border-slate-700/20' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/20'
                  }`}
                >
                  {/* Ribbon Dot indicator */}
                  <div className={`absolute left-[9px] w-2.5 h-2.5 rounded-full border-2 transition-all duration-300 z-20 ${
                    isActive 
                      ? 'border-vedicana-green bg-vedicana-green shadow-[0_0_10px_#006d39] scale-110' 
                      : 'border-slate-700 bg-[#1e293b] group-hover:border-slate-500 group-hover:scale-105'
                  }`} />
                  
                  <Icon size={16} className={`transition-colors ${isActive ? 'text-vedicana-green' : 'text-slate-450 group-hover:text-slate-200'}`} />
                  <span className="text-[10px] uppercase tracking-wider font-semibold">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-vedicana-gold text-slate-900 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">New</span>
                  )}
                </a>
              );
            })}
          </div>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors cursor-pointer text-xs uppercase font-semibold tracking-wider"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer (Hamburger Menu Vertical Scroll Ribbon) */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        ></div>
      )}
      
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1b2537]/95 backdrop-blur-md border-r border-slate-800 flex flex-col transition-transform duration-300 ease-out md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-850">
          <h1 className="text-2xl font-serif text-vedicana-gold font-bold tracking-wider">
            VediCana<span className="text-white text-xs ml-1 bg-vedicana-green px-2 py-0.5 rounded">OS</span>
          </h1>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 py-6 px-4 relative overflow-y-auto scrollbar-thin scrollbar-thumb-slate-850">
          {/* Vertical Ribbon line track */}
          <div className="absolute left-[27px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-vedicana-green/30 via-slate-800 to-slate-800/30 pointer-events-none z-0"></div>
          
          <div className="space-y-1 relative z-10">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <a 
                  key={item.href}
                  href={item.href} 
                  className={`flex items-center gap-3 pl-8 pr-3 py-1.5 rounded-lg transition-all relative group ${
                    isActive 
                      ? 'text-white font-bold bg-slate-800/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] border border-slate-700/20' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/20'
                  }`}
                >
                  {/* Ribbon Dot indicator */}
                  <div className={`absolute left-[9px] w-2.5 h-2.5 rounded-full border-2 transition-all duration-300 z-20 ${
                    isActive 
                      ? 'border-vedicana-green bg-vedicana-green shadow-[0_0_10px_#006d39] scale-110' 
                      : 'border-slate-700 bg-[#1b2537] group-hover:border-slate-500 group-hover:scale-105'
                  }`} />
                  
                  <Icon size={16} className={`transition-colors ${isActive ? 'text-vedicana-green' : 'text-slate-450 group-hover:text-slate-200'}`} />
                  <span className="text-[10px] uppercase tracking-wider font-semibold">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-vedicana-gold text-slate-900 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">New</span>
                  )}
                </a>
              );
            })}
          </div>
        </nav>
        <div className="p-4 border-t border-slate-850">
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors cursor-pointer text-[10px] uppercase font-semibold tracking-wider"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-[#1e293b] border-b border-slate-800 flex items-center justify-between px-6 md:px-8 z-10">
          <div className="flex items-center gap-3">
            {/* Hamburger mobile menu button */}
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-400 hover:text-white md:hidden cursor-pointer rounded-lg hover:bg-slate-800"
              aria-label="Open Navigation"
            >
              <Menu size={22} />
            </button>
            <h2 className="text-base md:text-lg font-semibold text-white">Command Center</h2>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2 bg-slate-900/60 rounded-full py-1 px-3 border border-slate-800 text-[10px] md:text-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-vedicana-green animate-pulse"></div>
              <span className="font-medium text-slate-400">OS Online</span>
            </div>
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-tr from-vedicana-gold to-vedicana-green flex items-center justify-center text-white text-xs font-bold shadow-lg">
              VA
            </div>
          </div>
        </header>

        {/* Scrollable Content Pane */}
        <div className="flex-1 overflow-auto p-4 md:p-8 relative">
          <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-vedicana-green/3 to-transparent pointer-events-none"></div>
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
