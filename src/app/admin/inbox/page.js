"use client";
import React, { useState, useEffect } from 'react';
import { Mail, Briefcase, Users, Search, Trash2, Check, Reply, Filter, Eye } from 'lucide-react';
import Link from 'next/link';

export default function InboxPage() {
  const [activeTab, setActiveTab] = useState('contact');
  const [contacts, setContacts] = useState([]);
  const [careers, setCareers] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resContacts, resCareers, resSubs] = await Promise.all([
        fetch('/api/admin/contact'),
        fetch('/api/admin/careers'),
        fetch('/api/admin/subscribers')
      ]);
      if (resContacts.ok) setContacts(await resContacts.json());
      if (resCareers.ok) {
        const data = await resCareers.json();
        setCareers(data.applications || data);
      }
      if (resSubs.ok) setSubscribers(await resSubs.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (type, id) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    try {
      let url = '';
      if (type === 'contact') url = `/api/admin/contact/${id}`;
      if (type === 'career') url = `/api/admin/careers/${id}`;
      if (type === 'subscribe') url = `/api/admin/subscribers/${id}`;

      const res = await fetch(url, { method: 'DELETE' });
      if (res.ok) {
        if (type === 'contact') setContacts(prev => prev.filter(i => i.id !== id));
        if (type === 'career') setCareers(prev => prev.filter(i => i.id !== id));
        if (type === 'subscribe') setSubscribers(prev => prev.filter(i => i.id !== id));
        setSelectedMessage(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markContactRead = async (id, currentStatus) => {
    if (currentStatus === 'Read') return;
    try {
      const res = await fetch(`/api/admin/contact/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Read' })
      });
      if (res.ok) {
        setContacts(prev => prev.map(c => c.id === id ? { ...c, status: 'Read' } : c));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const renderContactList = () => (
    <div className="flex flex-col space-y-2">
      {contacts.length === 0 ? (
        <div className="text-center py-10 text-slate-500">No contact messages yet.</div>
      ) : (
        contacts.map(msg => (
          <div 
            key={msg.id} 
            onClick={() => { setSelectedMessage({ type: 'contact', data: msg }); markContactRead(msg.id, msg.status); }}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedMessage?.data?.id === msg.id ? 'bg-slate-800 border-vedicana-green' : 'bg-[#1e293b] border-slate-700 hover:border-slate-500'} ${msg.status === 'Unread' ? 'border-l-4 border-l-vedicana-green' : ''}`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className={`font-medium ${msg.status === 'Unread' ? 'text-white' : 'text-slate-300'}`}>{msg.name}</h3>
              <span className="text-xs text-slate-500">{new Date(msg.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="text-sm font-semibold text-vedicana-green truncate mb-1">{msg.subject}</p>
            <p className="text-xs text-slate-400 truncate">{msg.message}</p>
          </div>
        ))
      )}
    </div>
  );

  const renderCareerList = () => (
    <div className="flex flex-col space-y-2">
      {careers.length === 0 ? (
        <div className="text-center py-10 text-slate-500">No job applications yet.</div>
      ) : (
        careers.map(app => (
          <div 
            key={app.id} 
            onClick={() => setSelectedMessage({ type: 'career', data: app })}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedMessage?.data?.id === app.id ? 'bg-slate-800 border-vedicana-green' : 'bg-[#1e293b] border-slate-700 hover:border-slate-500'}`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-white">{app.full_name}</h3>
              <span className="text-xs text-slate-500">{new Date(app.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="text-sm font-semibold text-vedicana-gold truncate mb-1">{app.position}</p>
            <p className="text-xs text-slate-400 truncate">{app.experience_years} years exp • {app.location}</p>
          </div>
        ))
      )}
    </div>
  );

  const renderSubscriberList = () => (
    <div className="flex flex-col space-y-2">
      {subscribers.length === 0 ? (
        <div className="text-center py-10 text-slate-500">No subscribers yet.</div>
      ) : (
        subscribers.map(sub => (
          <div 
            key={sub.id} 
            className="p-4 rounded-xl border bg-[#1e293b] border-slate-700 flex justify-between items-center"
          >
            <div>
              <h3 className="font-medium text-white">{sub.email}</h3>
              <p className="text-xs text-slate-400 mt-1">Subscribed on {new Date(sub.createdAt).toLocaleDateString()}</p>
            </div>
            <button onClick={() => deleteItem('subscribe', sub.id)} className="p-2 text-slate-500 hover:text-red-400 transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto h-screen flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif text-white mb-2">Unified Inbox</h1>
          <p className="text-slate-400 text-sm">Manage all incoming emails, applications, and subscriptions.</p>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Left Sidebar - Tabs */}
        <div className="w-64 flex flex-col gap-2 flex-shrink-0">
          <button 
            onClick={() => { setActiveTab('contact'); setSelectedMessage(null); }}
            className={`flex items-center gap-3 p-4 rounded-xl transition-all ${activeTab === 'contact' ? 'bg-vedicana-green text-white shadow-lg' : 'bg-[#1e293b] text-slate-400 hover:bg-slate-800'}`}
          >
            <Mail size={20} />
            <div className="text-left flex-1">
              <div className="font-semibold text-sm">General Enquiries</div>
              <div className="text-xs opacity-70">info@vedicana.com</div>
            </div>
            {contacts.filter(c => c.status === 'Unread').length > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {contacts.filter(c => c.status === 'Unread').length}
              </span>
            )}
          </button>

          <button 
            onClick={() => { setActiveTab('career'); setSelectedMessage(null); }}
            className={`flex items-center gap-3 p-4 rounded-xl transition-all ${activeTab === 'career' ? 'bg-vedicana-green text-white shadow-lg' : 'bg-[#1e293b] text-slate-400 hover:bg-slate-800'}`}
          >
            <Briefcase size={20} />
            <div className="text-left flex-1">
              <div className="font-semibold text-sm">Job Applications</div>
              <div className="text-xs opacity-70">hrpartner@</div>
            </div>
            <span className="bg-slate-700 text-slate-300 text-xs font-bold px-2 py-0.5 rounded-full">{careers.length}</span>
          </button>

          <button 
            onClick={() => { setActiveTab('subscribe'); setSelectedMessage(null); }}
            className={`flex items-center gap-3 p-4 rounded-xl transition-all ${activeTab === 'subscribe' ? 'bg-vedicana-green text-white shadow-lg' : 'bg-[#1e293b] text-slate-400 hover:bg-slate-800'}`}
          >
            <Users size={20} />
            <div className="text-left flex-1">
              <div className="font-semibold text-sm">Newsletter</div>
              <div className="text-xs opacity-70">newsletter@</div>
            </div>
            <span className="bg-slate-700 text-slate-300 text-xs font-bold px-2 py-0.5 rounded-full">{subscribers.length}</span>
          </button>
        </div>

        {/* Middle Column - List */}
        <div className="w-1/3 bg-[#0f172a] border border-slate-800 rounded-2xl p-4 overflow-y-auto">
          {loading ? (
            <div className="animate-pulse flex flex-col gap-4">
              {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-800 rounded-xl"></div>)}
            </div>
          ) : (
            <>
              {activeTab === 'contact' && renderContactList()}
              {activeTab === 'career' && renderCareerList()}
              {activeTab === 'subscribe' && renderSubscriberList()}
            </>
          )}
        </div>

        {/* Right Column - Detail View */}
        <div className="flex-1 bg-[#1e293b] border border-slate-700 rounded-2xl overflow-hidden flex flex-col">
          {selectedMessage ? (
            <div className="h-full flex flex-col">
              {/* Detail Header */}
              <div className="p-6 border-b border-slate-700 bg-[#161f2e] flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">
                    {selectedMessage.type === 'contact' ? selectedMessage.data.subject : `Application for ${selectedMessage.data.position}`}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span className="font-medium text-slate-300">
                      {selectedMessage.type === 'contact' ? selectedMessage.data.name : selectedMessage.data.full_name}
                    </span>
                    <span>&lt;{selectedMessage.data.email}&gt;</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a 
                    href={`mailto:${selectedMessage.data.email}`}
                    className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors flex items-center gap-2"
                    title="Reply via Email"
                  >
                    <Reply size={16} /> <span className="text-sm font-medium">Reply</span>
                  </a>
                  <button 
                    onClick={() => deleteItem(selectedMessage.type, selectedMessage.data.id)}
                    className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    title="Delete Message"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Detail Body */}
              <div className="p-6 overflow-y-auto flex-1 text-slate-300">
                {selectedMessage.type === 'contact' && (
                  <div className="whitespace-pre-wrap leading-relaxed text-[15px]">
                    {selectedMessage.data.message}
                  </div>
                )}
                
                {selectedMessage.type === 'career' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-[#0f172a] rounded-xl border border-slate-800">
                        <p className="text-xs text-slate-500 mb-1">Phone Number</p>
                        <p className="text-white font-medium">{selectedMessage.data.phone}</p>
                      </div>
                      <div className="p-4 bg-[#0f172a] rounded-xl border border-slate-800">
                        <p className="text-xs text-slate-500 mb-1">Location</p>
                        <p className="text-white font-medium">{selectedMessage.data.location}</p>
                      </div>
                      <div className="p-4 bg-[#0f172a] rounded-xl border border-slate-800">
                        <p className="text-xs text-slate-500 mb-1">Experience</p>
                        <p className="text-white font-medium">{selectedMessage.data.experience_years} Years</p>
                      </div>
                      <div className="p-4 bg-[#0f172a] rounded-xl border border-slate-800">
                        <p className="text-xs text-slate-500 mb-1">Status</p>
                        <p className="text-vedicana-gold font-medium">{selectedMessage.data.status}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-bold text-white mb-2 uppercase tracking-wider">Cover Letter</h4>
                      <div className="p-4 bg-[#0f172a] rounded-xl border border-slate-800 whitespace-pre-wrap text-sm leading-relaxed">
                        {selectedMessage.data.cover_letter || <span className="italic text-slate-500">No cover letter provided.</span>}
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <a 
                        href={`/api/admin/careers/${selectedMessage.data.id}/download`} 
                        target="_blank"
                        className="px-6 py-3 bg-vedicana-green hover:bg-vedicana-dark-green text-white font-bold rounded-xl transition-colors flex items-center gap-2"
                      >
                        <Eye size={18} /> View CV / Resume
                      </a>
                      <Link 
                        href="/admin/careers"
                        className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors"
                      >
                        Manage in Career Portal
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
              <Mail size={48} className="mb-4 opacity-20" />
              <p>Select a message to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
