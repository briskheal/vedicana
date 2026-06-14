"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Sparkles, User, Mail, Phone, FileText, CheckCircle, XCircle, Trash2, Loader, Search, CalendarCheck } from 'lucide-react';

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({
    consultation_prefix: 'CNS-2026-',
    consultation_start_no: 1001
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/appointments');
      if (!res.ok) throw new Error('Failed to load appointments');
      const data = await res.json();
      setAppointments(data);
      setError(null);

      // Fetch config settings
      const settingsRes = await fetch('/api/admin/settings');
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings({
          consultation_prefix: settingsData.consultation_prefix || 'CNS-2026-',
          consultation_start_no: settingsData.consultation_start_no !== undefined ? Number(settingsData.consultation_start_no) : 1001
        });
      }
    } catch (err) {
      console.error(err);
      setError('Could not retrieve consultation queue. PostgreSQL connection might be failing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusUpdate = async (id, currentStatus) => {
    const newStatus = currentStatus === 'confirmed' ? 'cancelled' : 'confirmed';
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Failed to update status');
      
      const updated = await res.json();
      setAppointments(appointments.map(a => a.id === id ? { ...a, status: updated.status } : a));
    } catch (err) {
      console.error(err);
      alert('Error updating consultation status.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this wellness call?')) return;
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete appointment');
      
      setAppointments(appointments.filter(a => a.id !== id));
      alert('Consultation booking deleted successfully.');
    } catch (err) {
      console.error(err);
      alert('Error deleting consultation.');
    }
  };

  // Filter & Search
  const filteredAppointments = appointments.filter(appt => {
    const matchesSearch = 
      appt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appt.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appt.phone.includes(searchQuery) ||
      appt.topic.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'All') return matchesSearch;
    return matchesSearch && appt.status.toLowerCase() === activeFilter.toLowerCase();
  });

  // Calculate statistics
  const totalCalls = appointments.length;
  const activeCalls = appointments.filter(a => a.status === 'confirmed').length;
  const cancelledCalls = appointments.filter(a => a.status === 'cancelled').length;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1e293b] p-6 rounded-xl border border-slate-800 shadow-sm">
        <div>
          <h2 className="text-2xl font-serif text-white font-bold mb-1 flex items-center gap-2">
            <span className="bg-[#0ea5e9] w-2 h-8 rounded-full inline-block animate-pulse"></span>
            Wellness Advisory Logistics
          </h2>
          <p className="text-slate-400 text-sm">Monitor online consultations scheduler, toggle call status, and inspect health notes.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow flex items-center gap-4">
          <div className="p-3 bg-[#0ea5e9]/10 text-[#0ea5e9] rounded-xl border border-[#0ea5e9]/20">
            <CalendarCheck size={24} />
          </div>
          <div>
            <span className="block text-slate-500 text-xs font-bold uppercase tracking-wider">Total Consultations</span>
            <span className="text-2xl font-bold text-white font-mono">{totalCalls}</span>
          </div>
        </div>

        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <CheckCircle size={24} />
          </div>
          <div>
            <span className="block text-slate-500 text-xs font-bold uppercase tracking-wider">Confirmed Calls</span>
            <span className="text-2xl font-bold text-white font-mono">{activeCalls}</span>
          </div>
        </div>

        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow flex items-center gap-4">
          <div className="p-3 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20">
            <XCircle size={24} />
          </div>
          <div>
            <span className="block text-slate-500 text-xs font-bold uppercase tracking-wider">Cancelled Calls</span>
            <span className="text-2xl font-bold text-white font-mono">{cancelledCalls}</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-4 flex flex-col lg:flex-row gap-4 items-center justify-between shadow-lg">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client name, email, topic, or phone..." 
            className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] transition-all placeholder-slate-700 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2 w-full lg:w-auto justify-end font-mono">
          {['All', 'Confirmed', 'Cancelled'].map(filter => (
            <button 
              key={filter} 
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border cursor-pointer ${
                activeFilter.toLowerCase() === filter.toLowerCase() 
                  ? 'bg-[#0ea5e9]/15 text-[#0ea5e9] border-[#0ea5e9]/30' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-[#1e293b] border border-slate-800 rounded-xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader size={36} className="animate-spin text-[#0ea5e9]" />
            <span className="text-sm">Fetching advisory queue...</span>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="py-20 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <p className="text-base font-serif text-slate-400">No scheduled calls mapping matched query</p>
            <p className="text-xs text-slate-600">Secure schedules are generated directly through VediCana Wellness consultation calls.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-900/60 text-slate-300 text-xs uppercase tracking-wider font-semibold border-b border-slate-800/80">
                  <th className="px-4 py-2 font-medium">Appt ID</th>
                  <th className="px-4 py-2 font-medium">Customer Identity</th>
                  <th className="px-4 py-2 font-medium">Focus Discipline</th>
                  <th className="px-4 py-2 font-medium">Date &amp; Slot</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {filteredAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-800/20 transition-colors group">
                    <td className="px-4 py-2 font-mono text-slate-300">
                      <div className="flex items-center gap-2">
                        <span className="text-[#0ea5e9] font-bold">#</span>
                        {settings.consultation_prefix || 'CNS-2026-'}{(() => {
                          const startNo = settings.consultation_start_no !== undefined ? Number(settings.consultation_start_no) : 1001;
                          return startNo === 0 ? appt.id : startNo + appt.id - 1;
                        })()}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <p className="font-semibold text-white">{appt.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5 font-mono">{appt.email}</p>
                      <p className="text-xs text-slate-500 font-mono">{appt.phone}</p>
                    </td>
                    <td className="px-4 py-2 text-slate-300">
                      <span className="bg-slate-900 px-2.5 py-1 rounded text-xs border border-slate-800 font-medium">
                        {appt.topic}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-slate-300 font-mono text-xs">
                      {new Date(appt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      <span className="text-vedicana-gold text-[10px] block mt-0.5 font-bold uppercase tracking-wider">
                        Slot: {appt.timeSlot}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleStatusUpdate(appt.id, appt.status)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border cursor-pointer transition-all ${
                          appt.status === 'confirmed'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20'
                        }`}
                        title={appt.status === 'confirmed' ? "Click to Cancel call" : "Click to Confirm call"}
                      >
                        {appt.status}
                      </button>
                    </td>
                    <td className="px-4 py-2 text-right flex items-center justify-end gap-3.5">
                      <button 
                        onClick={() => alert(`Customer Consultation Notes:\n\nName: ${appt.name}\nEmail: ${appt.email}\nTopic: ${appt.topic}\nNotes: ${appt.notes || 'None provided.'}`)}
                        className="text-slate-400 hover:text-white hover:bg-slate-800 px-3 py-1.5 rounded transition-colors text-xs font-semibold inline-flex items-center gap-1 cursor-pointer border border-transparent hover:border-slate-700"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => handleDelete(appt.id)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-500/10 p-1.5 rounded transition-colors cursor-pointer"
                        title="Delete Consultation permanently"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
