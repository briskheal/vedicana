import { Activity, TrendingUp, Package, Database, HardDrive, RefreshCw } from 'lucide-react';
import Product from '../../models/Product.js';
import Order from '../../models/Order.js';
import { sequelize } from '../../models/index.js';
import { Op } from 'sequelize';
import SalesChart from './SalesChart.js';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  let totalRevenue = 0;
  let activeOrders = 0;
  let productCatalog = 0;
  let dbSizeStr = '0.00 MB';
  let dbPercentage = '0%';
  let chartData = [];

  try {
    // 1. Live Sum of Total Revenue (excluding cancelled or failed transactions)
    const revenueSum = await Order.sum('totalAmount', {
      where: {
        status: { [Op.ne]: 'cancelled' },
        paymentStatus: { [Op.ne]: 'failed' }
      }
    });
    totalRevenue = Number(revenueSum || 0);

    // 2. Count of active orders currently undergoing fulfillment
    activeOrders = await Order.count({
      where: {
        status: ['pending', 'processing', 'shipped']
      }
    });

    // 3. Count of total products in the catalog database
    productCatalog = await Product.count();

    // 4. Actual Postgres Database Size footprint query
    const [sizeResult] = await sequelize.query("SELECT pg_database_size(current_database()) as size");
    if (sizeResult && sizeResult[0]) {
      const bytes = Number(sizeResult[0].size);
      if (bytes >= 1024 * 1024 * 1024) {
        dbSizeStr = `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
      } else {
        dbSizeStr = `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
      }

      // Calculate usage percentage against Supabase Free Tier limit (500MB)
      const limitBytes = 500 * 1024 * 1024;
      const percent = Math.min(100, Math.round((bytes / limitBytes) * 100));
      dbPercentage = `${percent}%`;
    }

    // 5. Build 30-day chart data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29); // 30 days including today
    thirtyDaysAgo.setHours(0, 0, 0, 0);
    
    const recentOrders = await Order.findAll({
      where: {
        createdAt: { [Op.gte]: thirtyDaysAgo },
        status: { [Op.ne]: 'cancelled' },
        paymentStatus: { [Op.ne]: 'failed' }
      },
      attributes: ['totalAmount', 'createdAt']
    });

    const chartDataMap = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      chartDataMap[dateStr] = 0;
    }

    recentOrders.forEach(o => {
      const dateStr = new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (chartDataMap[dateStr] !== undefined) {
        chartDataMap[dateStr] += Number(o.totalAmount);
      }
    });

    chartData = Object.keys(chartDataMap).map(date => ({
      date,
      revenue: chartDataMap[date]
    }));

  } catch (error) {
    console.error('[Admin Dashboard Metrics] Failed to load actual values:', error);
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#1e293b] rounded-xl p-6 border border-slate-800 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-vedicana-green/10 rounded-full blur-2xl group-hover:bg-vedicana-green/20 transition-all"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Total Revenue</p>
              <h3 className="text-3xl font-bold text-white">₹{totalRevenue.toLocaleString('en-IN')}</h3>
            </div>
            <div className="bg-vedicana-green/20 p-2 rounded-lg text-vedicana-green">
              <TrendingUp size={24} />
            </div>
          </div>
          <div className="flex items-center text-sm text-vedicana-green relative z-10">
            <span className="text-slate-400">Live system revenue</span>
          </div>
        </div>

        <div className="bg-[#1e293b] rounded-xl p-6 border border-slate-800 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-vedicana-gold/10 rounded-full blur-2xl group-hover:bg-vedicana-gold/20 transition-all"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Active Orders</p>
              <h3 className="text-3xl font-bold text-white">{activeOrders}</h3>
            </div>
            <div className="bg-vedicana-gold/20 p-2 rounded-lg text-vedicana-gold">
              <Activity size={24} />
            </div>
          </div>
          <div className="flex items-center text-sm text-vedicana-gold relative z-10">
            <span className="font-medium">Awaiting fulfillment</span>
          </div>
        </div>

        <div className="bg-[#1e293b] rounded-xl p-6 border border-slate-800 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Product Catalog</p>
              <h3 className="text-3xl font-bold text-white">{productCatalog}</h3>
            </div>
            <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
              <Package size={24} />
            </div>
          </div>
          <div className="flex items-center text-sm text-slate-500 relative z-10">
            <span className="font-medium">All stored in database</span>
          </div>
        </div>
        
        <div className="bg-[#1e293b] rounded-xl p-6 border border-slate-800 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">DB Storage Usage</p>
              <h3 className="text-3xl font-bold text-white">{dbSizeStr}</h3>
            </div>
            <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400">
              <Database size={24} />
            </div>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1.5 mt-3 relative z-10">
            <div className="bg-purple-500 h-1.5 rounded-full transition-all duration-500" style={{ width: dbPercentage }}></div>
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2 relative z-10">
            <span>Limit: 500 MB (Free Supa)</span>
            <span>{dbPercentage}</span>
          </div>
        </div>
      </div>

      {/* Revenue Chart Section */}
      <div className="bg-[#1e293b] rounded-xl p-6 border border-slate-800 shadow-xl">
        <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
          <TrendingUp className="text-vedicana-green" /> 
          30-Day Revenue Trend
        </h3>
        <p className="text-slate-400 text-sm mb-4">Daily gross revenue (excluding cancelled orders)</p>
        <SalesChart data={chartData} />
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Frontend Control Panel */}
        <div className="lg:col-span-2 bg-[#1e293b] border border-slate-800 rounded-xl shadow-xl p-6">
          <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <HardDrive className="text-vedicana-green" /> 
              Frontend Synchronizer
            </h3>
            <button className="flex items-center gap-2 bg-vedicana-green hover:bg-vedicana-green/80 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-[0_0_10px_rgba(0,109,57,0.3)]">
              <RefreshCw size={16} /> Force Sync
            </button>
          </div>
          <div className="space-y-4">
            <p className="text-slate-400">
              Any changes made to products or layout here are instantly reflected on the front page via Direct DB injection. All images are compressed to WEBP and saved directly to the Postgres instances to avoid relying on Cloudinary.
            </p>
            
            {/* Mock Database log */}
            <div className="bg-black/40 border border-slate-800 rounded-lg p-4 font-mono text-sm h-48 overflow-y-auto mt-4">
              <div className="text-slate-500 mb-1">[SYS] Connecting to postgres://localhost:5432/vedicana...</div>
              <div className="text-vedicana-green mb-1">[OK] Database connection established.</div>
              <div className="text-slate-500 mb-1">[SYS] Fetching live HTML from vedicana.com...</div>
              <div className="text-vedicana-gold mb-1">[WARN] Local Postgres server seems offline.</div>
              <div className="text-slate-500 mb-1">[SYS] Awaiting manual start of PostgreSQL service.</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6 border-b border-slate-800 pb-4">System Actions</h3>
          <div className="space-y-3">
            <button className="w-full bg-slate-800 hover:bg-slate-700 text-left px-4 py-3 rounded-lg border border-slate-700 transition-colors group flex justify-between items-center">
              <span className="font-medium text-slate-300 group-hover:text-white">Run Seeder Script</span>
              <RefreshCw size={18} className="text-slate-500 group-hover:text-vedicana-green" />
            </button>
            <button className="w-full bg-slate-800 hover:bg-slate-700 text-left px-4 py-3 rounded-lg border border-slate-700 transition-colors group flex justify-between items-center">
              <span className="font-medium text-slate-300 group-hover:text-white">Optimize WebP Images</span>
              <RefreshCw size={18} className="text-slate-500 group-hover:text-vedicana-green" />
            </button>
            <button className="w-full bg-slate-800 hover:bg-slate-700 text-left px-4 py-3 rounded-lg border border-slate-700 transition-colors group flex justify-between items-center">
              <span className="font-medium text-slate-300 group-hover:text-white">Clear Cache</span>
              <RefreshCw size={18} className="text-slate-500 group-hover:text-vedicana-green" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
