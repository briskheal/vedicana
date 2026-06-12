"use client";
import React, { useState, useEffect } from 'react';
import { 
  Mail, Briefcase, Users, Trash2, Reply, Download, Eye, 
  RefreshCw, CheckCircle2, Circle, Clock, MapPin, Phone,
  ChevronRight, Search, Filter, X, AlertTriangle, Maximize2, Minimize2,
  MessageSquare, FileText, Inbox, Send, ChevronDown, ChevronUp
} from 'lucide-react';
import Link from 'next/link';

const TABS = [
  { id: 'contact', label: 'General Enquiries', icon: Mail, color: 'blue', api: '/api/admin/contact' },
  { id: 'career', label: 'Job Applications', icon: Briefcase, color: 'emerald', api: '/api/admin/careers' },
  { id: 'subscribe', label: 'Newsletter', icon: Users, color: 'purple', api: '/api/admin/subscribers' },
];

const STATUS_COLORS = {
  Unread: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  Read: 'bg-slate-700/50 text-slate-400 border border-slate-600/30',
  Replied: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  Pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  Reviewed: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  Interviewed: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  Hired: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  Rejected: 'bg-red-500/20 text-red-400 border border-red-500/30',
};

export default function InboxPage() {
  const [activeTab, setActiveTab] = useState('contact');
  const [contacts, setContacts] = useState([]);
  const [careers, setCareers] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState(false); // fullscreen reading mode
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const [r1, r2, r3] = await Promise.all([
        fetch('/api/admin/contact'),
        fetch('/api/admin/careers'),
        fetch('/api/admin/subscribers'),
      ]);
      if (r1.ok) setContacts(await r1.json());
      if (r2.ok) { const d = await r2.json(); setCareers(d.applications || d); }
      if (r3.ok) setSubscribers(await r3.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const markRead = async (id) => {
    const msg = contacts.find(c => c.id === id);
    if (!msg || msg.status !== 'Unread') return;
    try {
      const res = await fetch(`/api/admin/contact/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Read' }),
      });
      if (res.ok) setContacts(prev => prev.map(c => c.id === id ? { ...c, status: 'Read' } : c));
    } catch (e) { console.error(e); }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    const { type, id } = deleteConfirm;
    const urls = { contact: `/api/admin/contact/${id}`, career: `/api/admin/careers/${id}`, subscribe: `/api/admin/subscribers/${id}` };
    try {
      const res = await fetch(urls[type], { method: 'DELETE' });
      if (res.ok) {
        if (type === 'contact') setContacts(p => p.filter(i => i.id !== id));
        if (type === 'career') setCareers(p => p.filter(i => i.id !== id));
        if (type === 'subscribe') setSubscribers(p => p.filter(i => i.id !== id));
        if (selected?.id === id) setSelected(null);
      }
    } catch (e) { console.error(e); }
    finally { setDeleting(false); setDeleteConfirm(null); }
  };

  const sendReply = async () => {
    if (!replyText.trim() || !selected) return;
    setSending(true);
    try {
      const subjectPrefix = selected._type === 'contact' ? `Re: ${selected.subject}` : `Re: Your Application for ${selected.position}`;
      const res = await fetch('/api/admin/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selected.email,
          subject: subjectPrefix,
          message: replyText,
          bucket: selected._type,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setToast({ type: 'success', msg: `Reply sent to ${selected.email}` });
        setReplyText('');
        setReplyOpen(false);
        if (selected._type === 'contact') {
          await fetch(`/api/admin/contact/${selected.id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Replied' }),
          });
          setContacts(prev => prev.map(c => c.id === selected.id ? { ...c, status: 'Replied' } : c));
          setSelected(s => ({ ...s, status: 'Replied' }));
        }
      } else {
        setToast({ type: 'error', msg: data.error || 'Failed to send reply' });
      }
    } catch (e) {
      setToast({ type: 'error', msg: 'Network error. Please try again.' });
    } finally {
      setSending(false);
      setTimeout(() => setToast(null), 4000);
    }
  };

  const currentList = () => {
    const term = search.toLowerCase();
    if (activeTab === 'contact') return contacts.filter(c => c.name?.toLowerCase().includes(term) || c.email?.toLowerCase().includes(term) || c.subject?.toLowerCase().includes(term));
    if (activeTab === 'career') return careers.filter(c => c.full_name?.toLowerCase().includes(term) || c.email?.toLowerCase().includes(term) || c.position?.toLowerCase().includes(term));
    return subscribers.filter(s => s.email?.toLowerCase().includes(term));
  };

  const unreadCount = contacts.filter(c => c.status === 'Unread').length;

  const tabColors = { contact: 'blue', career: 'emerald', subscribe: 'purple' };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-300 flex flex-col">
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1a2235] border border-red-500/30 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-500/10 rounded-xl"><AlertTriangle className="text-red-400" size={24} /></div>
              <h3 className="text-lg font-bold text-white">Confirm Delete</h3>
            </div>
            <p className="text-slate-400 mb-6 text-sm leading-relaxed">
              This action is permanent and cannot be undone. The record and all associated data will be erased from the database.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {deleting ? <RefreshCw size={16} className="animate-spin" /> : <Trash2 size={16} />}
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-8 right-8 z-[300] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold transition-all ${
          toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          {toast.msg}
        </div>
      )}
      <div className="bg-[#111827] border-b border-slate-800 px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Unified Inbox</h1>
          <p className="text-slate-500 text-sm mt-0.5">All communications in one place</p>
        </div>
        <button onClick={() => fetchAll(true)} className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-all ${refreshing ? 'opacity-60 pointer-events-none' : ''}`}>
          <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Tabs */}
        <div className="w-72 bg-[#111827] border-r border-slate-800 flex flex-col p-4 gap-2 flex-shrink-0">
          {/* Stats summary */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-blue-500/10 rounded-xl p-3 text-center border border-blue-500/20">
              <p className="text-xl font-bold text-blue-400">{contacts.length}</p>
              <p className="text-xs text-slate-500 mt-0.5">Queries</p>
            </div>
            <div className="bg-emerald-500/10 rounded-xl p-3 text-center border border-emerald-500/20">
              <p className="text-xl font-bold text-emerald-400">{careers.length}</p>
              <p className="text-xs text-slate-500 mt-0.5">CVs</p>
            </div>
            <div className="bg-purple-500/10 rounded-xl p-3 text-center border border-purple-500/20">
              <p className="text-xl font-bold text-purple-400">{subscribers.length}</p>
              <p className="text-xs text-slate-500 mt-0.5">Subs</p>
            </div>
          </div>

          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const count = tab.id === 'contact' ? contacts.length : tab.id === 'career' ? careers.length : subscribers.length;
            const badge = tab.id === 'contact' && unreadCount > 0;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSelected(null); setSearch(''); }}
                className={`flex items-center gap-3 p-4 rounded-xl transition-all text-left group ${isActive ? 'bg-gradient-to-r from-slate-700 to-slate-800 border border-slate-600 shadow-lg' : 'hover:bg-slate-800/60 border border-transparent'}`}
              >
                <div className={`p-2.5 rounded-lg ${isActive ? `bg-${tab.color}-500/20` : 'bg-slate-800 group-hover:bg-slate-700'} transition-colors`}>
                  <Icon size={18} className={isActive ? `text-${tab.color}-400` : 'text-slate-400 group-hover:text-slate-300'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>{tab.label}</p>
                  <p className="text-xs text-slate-600 mt-0.5 truncate">
                    {tab.id === 'contact' ? 'info@vedicana.com' : tab.id === 'career' ? 'hrpartner@' : 'newsletter@'}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isActive ? `bg-${tab.color}-500/20 text-${tab.color}-400` : 'bg-slate-700 text-slate-400'}`}>{count}</span>
                  {badge && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
                </div>
              </button>
            );
          })}
        </div>

        {/* Middle List */}
        <div className="w-80 flex flex-col border-r border-slate-800 bg-[#0d1526] flex-shrink-0">
          <div className="p-4 border-b border-slate-800">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-slate-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 flex flex-col gap-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="animate-pulse bg-slate-800/60 rounded-xl h-20"></div>
                ))}
              </div>
            ) : currentList().length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-slate-600">
                <Mail size={40} className="mb-3 opacity-30" />
                <p className="text-sm">No messages found</p>
              </div>
            ) : activeTab === 'subscribe' ? (
              <div className="p-3 flex flex-col gap-2">
                {currentList().map(sub => (
                  <div key={sub.id} className="group flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-purple-500/30 hover:bg-slate-800/70 transition-all">
                    <div className="w-9 h-9 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-400 text-sm font-bold">{sub.email[0].toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{sub.email}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{new Date(sub.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <button
                      onClick={() => setDeleteConfirm({ type: 'subscribe', id: sub.id })}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                      title="Delete Subscriber"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 flex flex-col gap-2">
                {currentList().map(item => {
                  const isContact = activeTab === 'contact';
                  const name = isContact ? item.name : item.full_name;
                  const sub = isContact ? item.subject : item.position;
                  const preview = isContact ? item.message : `${item.experience_years}y exp • ${item.location}`;
                  const isUnread = isContact && item.status === 'Unread';
                  const isSelected = selected?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setSelected({ ...item, _type: activeTab }); if (isContact) markRead(item.id); }}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${isSelected ? 'bg-slate-700 border-slate-500 shadow-lg' : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/70'} ${isUnread ? 'border-l-4 !border-l-blue-500' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-1.5 gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {isUnread && <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0 mt-1"></span>}
                          <p className={`text-sm truncate ${isUnread ? 'font-bold text-white' : 'font-medium text-slate-300'}`}>{name}</p>
                        </div>
                        <span className="text-xs text-slate-600 flex-shrink-0">{new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      </div>
                      <p className={`text-xs truncate mb-1 ${isContact ? 'text-blue-400' : 'text-emerald-400'} font-medium`}>{sub}</p>
                      <p className="text-xs text-slate-500 truncate leading-relaxed">{preview}</p>
                      {item.status && (
                        <span className={`mt-2 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[item.status] || ''}`}>
                          {item.status}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Detail Panel — switches to fullscreen when expanded */}
        <div className={expanded && selected ? 'fixed inset-0 z-[150] flex flex-col bg-[#0a0f1e]' : 'flex-1 flex flex-col bg-[#0a0f1e] overflow-hidden'}>
          {selected ? (
            <>
              {/* Detail Header — compact horizontal */}
              <div className="bg-[#111827] border-b border-slate-800 px-6 py-3 flex items-center gap-4 flex-wrap">
                {/* Left: avatar + meta */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 border border-slate-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-white">
                      {(selected._type === 'contact' ? selected.name : selected.full_name)?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm">{selected._type === 'contact' ? selected.name : selected.full_name}</span>
                      <span className="text-slate-600">•</span>
                      <a href={`mailto:${selected.email}`} className="text-blue-400 hover:underline text-xs">{selected.email}</a>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(selected.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-semibold truncate mt-0.5">
                      {selected._type === 'contact' ? selected.subject : `Application — ${selected.position}`}
                    </p>
                  </div>
                </div>

                {/* Right: action buttons (compact icon+label) */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => { setReplyOpen(r => !r); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                      replyOpen ? 'bg-blue-500 text-white border-blue-500' : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/20'
                    }`}
                  >
                    <Reply size={13} /> {replyOpen ? 'Close' : 'Reply'}
                  </button>
                  {selected._type === 'career' && (
                    <a
                      href={`/api/admin/careers/${selected.id}/download`}
                      target="_blank"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold transition-all"
                    >
                      <Download size={13} /> CV
                    </a>
                  )}
                  <button
                    onClick={() => setDeleteConfirm({ type: selected._type, id: selected.id })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold transition-all"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                  <div className="w-px h-5 bg-slate-700 mx-0.5"></div>
                  <button
                    onClick={() => setExpanded(e => !e)}
                    title={expanded ? 'Collapse' : 'Expand to fullscreen'}
                    className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-500 hover:text-white transition-colors border border-slate-700"
                  >
                    {expanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                  </button>
                  <button onClick={() => { setSelected(null); setExpanded(false); }} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors">
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Detail Body */}
              <div className="flex-1 overflow-y-auto p-8">
                {selected._type === 'contact' && (
                  <div className="max-w-2xl">
                    <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 leading-relaxed text-slate-300 whitespace-pre-wrap text-[15px]">
                      {selected.message}
                    </div>
                    {selected.status && (
                      <div className="mt-6 flex items-center gap-3">
                        <span className="text-sm text-slate-500">Status:</span>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[selected.status] || ''}`}>{selected.status}</span>
                      </div>
                    )}
                  </div>
                )}

                {selected._type === 'career' && (
                  <div className="max-w-3xl space-y-6">
                    {/* Info Row — horizontal pills */}
                    <div className="flex flex-wrap gap-3">
                      {[
                        { label: 'Position', value: selected.position, icon: Briefcase, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                        { label: 'Experience', value: `${selected.experience_years} Yrs`, icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
                        { label: 'Phone', value: selected.phone, icon: Phone, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
                        { label: 'Location', value: selected.location || 'Not provided', icon: MapPin, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
                      ].map(({ label, value, icon: Icon, color, bg }) => (
                        <div key={label} className={`flex items-center gap-2 px-4 py-2 rounded-full border ${bg}`}>
                          <Icon size={13} className={color} />
                          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide">{label}:</span>
                          <span className={`text-sm font-bold ${color}`}>{value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-500">Application Status:</span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[selected.status] || ''}`}>{selected.status}</span>
                      <Link href="/admin/careers" className="text-xs text-blue-400 hover:underline ml-2">Manage in Career Portal →</Link>
                    </div>

                    {/* Cover Letter */}
                    <div>
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Cover Letter</h4>
                      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 text-slate-300 whitespace-pre-wrap text-sm leading-relaxed min-h-[120px]">
                        {selected.cover_letter || <span className="italic text-slate-600">No cover letter was provided with this application.</span>}
                      </div>
                    </div>

                    {/* CV File */}
                    {selected.resume_file_name && (
                      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 flex items-center gap-3 flex-wrap">
                        <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20 flex-shrink-0">
                          <span className="text-red-400 text-xs font-bold uppercase">{selected.resume_file_name.split('.').pop()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{selected.resume_file_name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">Attached CV / Resume</p>
                        </div>
                        <a
                          href={`/api/admin/careers/${selected.id}/download`}
                          target="_blank"
                          className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition-colors"
                        >
                          <Download size={14} /> Download CV
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Reply Composer */}
              {replyOpen && (
                <div className="border-t border-slate-800 bg-[#111827] flex flex-col">
                  <div className="px-6 pt-4 pb-2 flex items-center justify-between">
                    <div className="text-xs text-slate-500 space-y-0.5">
                      <div><span className="text-slate-600">To:</span> <span className="text-slate-300 font-medium">{selected.email}</span></div>
                      <div><span className="text-slate-600">Subject:</span> <span className="text-slate-400">{selected._type === 'contact' ? `Re: ${selected.subject}` : `Re: Your Application for ${selected.position}`}</span></div>
                    </div>
                    <button onClick={() => setReplyOpen(false)} className="p-1 text-slate-600 hover:text-slate-400"><X size={14}/></button>
                  </div>
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Type your reply here..."
                    rows={5}
                    className="mx-6 mb-3 bg-[#0a0f1e] border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-slate-500 resize-none leading-relaxed"
                  />
                  <div className="px-6 pb-4 flex items-center justify-between">
                    <p className="text-xs text-slate-600">Sending via {selected._type === 'career' ? 'hrpartner@vedicana.com' : selected._type === 'subscribe' ? 'newsletter@vedicana.com' : 'info@vedicana.com'}</p>
                    <button
                      onClick={sendReply}
                      disabled={!replyText.trim() || sending}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-colors"
                    >
                      {sending ? <RefreshCw size={15} className="animate-spin" /> : <Send size={15} />}
                      {sending ? 'Sending...' : 'Send Reply'}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center mb-6 border border-slate-700 shadow-xl">
                <Inbox size={36} className="text-slate-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-400 mb-2">Select a message to read</h3>
              <p className="text-sm text-slate-600 mb-10 max-w-xs leading-relaxed">Click any message from the list on the left. Use the <strong className="text-slate-500">⤢ expand</strong> button to read in full-screen mode.</p>
              <div className="grid grid-cols-3 gap-4 w-full max-w-lg">
                <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-5 text-center">
                  <MessageSquare size={22} className="text-blue-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-blue-400 mb-1">General</p>
                  <p className="text-xs text-slate-600">Contact form messages from customers</p>
                </div>
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5 text-center">
                  <FileText size={22} className="text-emerald-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-emerald-400 mb-1">Careers</p>
                  <p className="text-xs text-slate-600">Job applications with CV attached</p>
                </div>
                <div className="bg-purple-500/5 border border-purple-500/10 rounded-2xl p-5 text-center">
                  <Users size={22} className="text-purple-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-purple-400 mb-1">Newsletter</p>
                  <p className="text-xs text-slate-600">All newsletter subscriber emails</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
