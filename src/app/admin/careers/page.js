"use client";
import React, { useState, useEffect } from 'react';
import { Briefcase, Download, Trash2, Eye, Mail, Phone, Calendar, Clock, Loader2 } from 'lucide-react';

export default function AdminCareersPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // id to confirm delete
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/admin/careers');
      if (res.ok) {
        const data = await res.json();
        // API returns { applications: [...], total: N }
        setApplications(data.applications || data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/admin/careers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setApplications(apps => apps.map(app => 
          app.id === id ? { ...app, status: newStatus } : app
        ));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteApplication = async (id) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/careers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setApplications(apps => apps.filter(app => app.id !== id));
        if (selectedApp?.id === id) setSelectedApp(null);
        setConfirmDelete(null);
      } else {
        const err = await res.json();
        alert('Delete failed: ' + (err.error || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-500/20 text-yellow-500';
      case 'Reviewed': return 'bg-blue-500/20 text-blue-500';
      case 'Interviewed': return 'bg-purple-500/20 text-purple-500';
      case 'Hired': return 'bg-emerald-500/20 text-emerald-500';
      case 'Rejected': return 'bg-red-500/20 text-red-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  return (
    <div className="p-8 text-slate-200">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Briefcase className="text-vedicana-green" /> Career Applications
          </h1>
          <p className="text-slate-400 mt-2">Manage job applicants and review CVs</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-700">
                <th className="p-4 font-semibold text-slate-300">Candidate</th>
                <th className="p-4 font-semibold text-slate-300">Position</th>
                <th className="p-4 font-semibold text-slate-300">Experience</th>
                <th className="p-4 font-semibold text-slate-300">Status</th>
                <th className="p-4 font-semibold text-slate-300">Date Applied</th>
                <th className="p-4 font-semibold text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading applications...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 italic">
                    No applications received yet.
                  </td>
                </tr>
              ) : applications.map(app => (
                <tr key={app.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-white">{app.full_name}</div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-1"><Mail size={12}/> {app.email}</div>
                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1"><Phone size={12}/> {app.phone}</div>
                  </td>
                  <td className="p-4 font-medium text-slate-300">{app.position}</td>
                  <td className="p-4 text-slate-400">{app.experience_years} yrs</td>
                  <td className="p-4">
                    <select 
                      value={app.status}
                      onChange={(e) => updateStatus(app.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-xs font-bold border-none outline-none appearance-none cursor-pointer ${getStatusColor(app.status)}`}
                    >
                      <option className="bg-slate-800 text-white" value="Pending">Pending</option>
                      <option className="bg-slate-800 text-white" value="Reviewed">Reviewed</option>
                      <option className="bg-slate-800 text-white" value="Interviewed">Interviewed</option>
                      <option className="bg-slate-800 text-white" value="Hired">Hired</option>
                      <option className="bg-slate-800 text-white" value="Rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="p-4 text-slate-400 text-sm">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setSelectedApp(app)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <a 
                        href={`/api/admin/careers/${app.id}/download`}
                        target="_blank"
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg transition-colors inline-flex items-center"
                        title="Download CV"
                      >
                        <Download size={16} />
                      </a>
                      <button 
                        onClick={() => deleteApplication(app.id)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-red-400 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out Panel for Details */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md bg-slate-900 h-full border-l border-slate-800 shadow-2xl p-6 overflow-y-auto animate-fade-in-up">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">Application Details</h2>
              <button onClick={() => setSelectedApp(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Candidate</label>
                <p className="text-lg text-white font-semibold">{selectedApp.full_name}</p>
                <div className="flex flex-col gap-2 mt-2">
                  <a href={`mailto:${selectedApp.email}`} className="flex items-center gap-2 text-sm text-blue-400 hover:underline"><Mail size={14}/> {selectedApp.email}</a>
                  <a href={`tel:${selectedApp.phone}`} className="flex items-center gap-2 text-sm text-emerald-400 hover:underline"><Phone size={14}/> {selectedApp.phone}</a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-800">
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Position</label>
                  <p className="text-sm text-slate-200 mt-1">{selectedApp.position}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Experience</label>
                  <p className="text-sm text-slate-200 mt-1">{selectedApp.experience_years} Years</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Location</label>
                  <p className="text-sm text-slate-200 mt-1">{selectedApp.location}</p>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-2 block">Cover Letter</label>
                <div className="bg-slate-800 p-4 rounded-xl text-sm text-slate-300 leading-relaxed border border-slate-700 min-h-[100px]">
                  {selectedApp.cover_letter || <span className="italic text-slate-500">No cover letter provided.</span>}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <a 
                  href={`/api/admin/careers/${selectedApp.id}/download`}
                  target="_blank"
                  className="w-full flex items-center justify-center gap-2 bg-vedicana-green hover:bg-emerald-600 text-white py-3 rounded-xl font-bold transition-colors"
                >
                  <Download size={18} /> Download CV ({selectedApp.resume_file_name || 'Resume.pdf'})
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
