"use client";

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { MessageSquare, Plus, Clock, CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function StudentComplaints() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });

  const fetchComplaints = async () => {
    try {
      const { data } = await api.get('/complaints');
      setComplaints(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchComplaints(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/complaints', formData);
      toast.success('Complaint submitted successfully');
      setFormData({ title: '', description: '' });
      setIsModalOpen(false);
      fetchComplaints();
    } catch (err) {}
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Resolved':    return 'badge-resolved';
      case 'In Progress': return 'badge-inprogress';
      case 'Pending':     return 'badge-pending';
      case 'Rejected':    return 'badge-rejected';
      default:            return 'badge-unalloc';
    }
  };

  const pending    = complaints.filter(c => c.status === 'Pending').length;
  const inProgress = complaints.filter(c => c.status === 'In Progress').length;
  const resolved   = complaints.filter(c => c.status === 'Resolved').length;

  return (
    <DashboardLayout allowedRoles={['student']}>
      <style dangerouslySetInnerHTML={{ __html: `
        /* ── Page Header ── */
        .pg-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:32px; gap:16px; flex-wrap:wrap }
        .pg-header-left h1 { font-size:1.6rem; font-weight:700; color:#fff; letter-spacing:-0.03em; margin-bottom:4px }
        .pg-header-left p  { font-size:0.83rem; color:rgba(255,255,255,0.38) }

        /* ── Stat Cards ── */
        .pg-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:24px }
        .pg-stat { background:rgba(255,255,255,0.035); border:1px solid rgba(255,255,255,0.07); border-radius:14px; padding:20px 22px; display:flex; flex-direction:column; gap:6px }
        .pg-stat-label { font-size:0.72rem; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:0.06em; font-weight:600 }
        .pg-stat-value { font-size:2rem; font-weight:800; color:#fff; line-height:1 }
        .pg-stat-sub   { font-size:0.75rem; color:rgba(255,255,255,0.3) }
        .sv-yellow { color:#fbbf24 }
        .sv-blue   { color:#60a5fa }
        .sv-green  { color:#34d399 }

        /* ── Primary Button ── */
        .btn-primary { display:flex; align-items:center; gap:7px; background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; border:none; border-radius:10px; padding:10px 20px; font-size:0.83rem; font-weight:600; cursor:pointer; box-shadow:0 0 22px rgba(99,102,241,0.35); transition:box-shadow .2s,transform .15s }
        .btn-primary:hover { box-shadow:0 0 34px rgba(99,102,241,0.5); transform:translateY(-1px) }

        /* ── Complaint List ── */
        .cmp-list { display:flex; flex-direction:column; gap:12px }
        .cmp-card { background:rgba(255,255,255,0.035); border:1px solid rgba(255,255,255,0.07); border-radius:14px; padding:20px 24px; transition:border-color .2s,background .2s }
        .cmp-card:hover { border-color:rgba(99,102,241,0.3); background:rgba(255,255,255,0.05) }
        .cmp-top { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:10px; flex-wrap:wrap }
        .cmp-title { font-size:1rem; font-weight:700; color:#fff }
        .cmp-badges { display:flex; gap:8px; flex-shrink:0; flex-wrap:wrap }
        .cmp-desc { font-size:0.83rem; color:rgba(255,255,255,0.5); line-height:1.6; margin-bottom:12px }
        .cmp-meta { font-size:0.75rem; color:rgba(255,255,255,0.3); display:flex; gap:16px; flex-wrap:wrap }
        .cmp-note { margin-top:12px; padding:12px 14px; background:rgba(99,102,241,0.08); border:1px solid rgba(99,102,241,0.18); border-radius:10px; font-size:0.8rem; color:rgba(255,255,255,0.6); line-height:1.5 }
        .cmp-note strong { color:#a5b4fc }

        /* ── Badges ── */
        .pg-badge { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:9999px; font-size:0.72rem; font-weight:600; border:1px solid transparent }
        .badge-pending    { background:rgba(251,191,36,0.12);  color:#fbbf24; border-color:rgba(251,191,36,0.25) }
        .badge-inprogress { background:rgba(96,165,250,0.12);  color:#60a5fa; border-color:rgba(96,165,250,0.25) }
        .badge-resolved   { background:rgba(52,211,153,0.12);  color:#34d399; border-color:rgba(52,211,153,0.25) }
        .badge-rejected   { background:rgba(255,255,255,0.06); color:#a1a1aa; border-color:rgba(255,255,255,0.1) }
        .badge-unalloc    { background:rgba(255,255,255,0.06); color:#a1a1aa; border-color:rgba(255,255,255,0.1) }
        .badge-type { background:rgba(129,140,248,0.12); color:#a5b4fc; border-color:rgba(129,140,248,0.2) }

        /* ── Empty ── */
        .pg-empty { padding:48px; text-align:center; color:rgba(255,255,255,0.3); font-size:0.87rem; border:1px dashed rgba(255,255,255,0.08); border-radius:14px }

        /* ── Modal ── */
        .pg-modal-overlay { position:fixed; inset:0; z-index:100; display:flex; align-items:center; justify-content:center; padding:1rem; background:rgba(0,0,0,0.65); backdrop-filter:blur(6px) }
        .pg-modal { background:#1a1b23; border:1px solid rgba(255,255,255,0.1); border-radius:18px; padding:2rem; width:100%; max-width:500px; box-shadow:0 25px 60px rgba(0,0,0,0.6) }
        .pg-modal-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:1.5rem }
        .pg-modal-head h2 { font-size:1.2rem; font-weight:700; color:#fff }
        .pg-modal-close { background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:6px; cursor:pointer; color:rgba(255,255,255,0.5); display:flex; align-items:center; transition:background .15s }
        .pg-modal-close:hover { background:rgba(255,255,255,0.1); color:#fff }
        .pg-form-group { margin-bottom:1.25rem }
        .pg-form-label { display:block; font-size:0.82rem; font-weight:600; color:rgba(255,255,255,0.6); margin-bottom:7px }
        .pg-form-input { width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:11px 14px; font-family:inherit; font-size:0.87rem; color:#fff; outline:none; transition:border-color .15s; box-sizing:border-box }
        .pg-form-input:focus { border-color:rgba(99,102,241,0.6) }
        .pg-form-input::placeholder { color:rgba(255,255,255,0.25) }
        textarea.pg-form-input { resize:vertical; min-height:120px }
        .pg-modal-actions { display:flex; justify-content:flex-end; gap:10px; margin-top:1.5rem }
        .pg-modal-cancel { font-family:inherit; font-size:0.83rem; font-weight:500; padding:10px 18px; border-radius:9px; border:1px solid rgba(255,255,255,0.12); background:transparent; color:rgba(255,255,255,0.5); cursor:pointer; transition:all .15s }
        .pg-modal-cancel:hover { background:rgba(255,255,255,0.06); color:#fff }

        /* ── Animations ── */
        @keyframes up { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
        .cmp-card { animation:up .4s ease both }
        .cmp-card:nth-child(1) { animation-delay:.03s }
        .cmp-card:nth-child(2) { animation-delay:.07s }
        .cmp-card:nth-child(3) { animation-delay:.11s }

        @media (max-width:768px) {
          .pg-stats { grid-template-columns:1fr }
        }
      `}} />

      {/* Header */}
      <div className="pg-header">
        <div className="pg-header-left">
          <h1>My Complaints</h1>
          <p>Submit and track your complaints</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={14} /> New Complaint
        </button>
      </div>

      {/* Stats */}
      <div className="pg-stats">
        <div className="pg-stat">
          <div className="pg-stat-label">Pending</div>
          <div className={`pg-stat-value ${pending > 0 ? 'sv-yellow' : ''}`}>{pending}</div>
          <div className="pg-stat-sub">awaiting review</div>
        </div>
        <div className="pg-stat">
          <div className="pg-stat-label">In Progress</div>
          <div className={`pg-stat-value ${inProgress > 0 ? 'sv-blue' : ''}`}>{inProgress}</div>
          <div className="pg-stat-sub">being worked on</div>
        </div>
        <div className="pg-stat">
          <div className="pg-stat-label">Resolved</div>
          <div className={`pg-stat-value ${resolved > 0 ? 'sv-green' : ''}`}>{resolved}</div>
          <div className="pg-stat-sub">closed issues</div>
        </div>
      </div>

      {/* Complaint Cards */}
      <div className="cmp-list">
        {complaints.length > 0 ? (
          complaints.map((c) => (
            <div key={c._id} className="cmp-card">
              <div className="cmp-top">
                <div className="cmp-title">{c.title}</div>
                <div className="cmp-badges">
                  <span className={`pg-badge ${getStatusBadge(c.status)}`}>{c.status}</span>
                  <span className="pg-badge badge-type">
                    {c.category === 'Other' && c.autoCategory ? `${c.autoCategory} (AI)` : c.category}
                  </span>
                </div>
              </div>
              <div className="cmp-desc">{c.description}</div>
              <div className="cmp-meta">
                <span>Submitted: {format(new Date(c.createdAt), 'MMM d, yyyy')}</span>
              </div>
              {c.adminNote && (
                <div className="cmp-note">
                  <strong>Admin Note:</strong> {c.adminNote}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="pg-empty">No complaints submitted yet.</div>
        )}
      </div>

      {/* New Complaint Modal */}
      {isModalOpen && (
        <div className="pg-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="pg-modal" onClick={e => e.stopPropagation()}>
            <div className="pg-modal-head">
              <h2>Submit New Complaint</h2>
              <button className="pg-modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="pg-form-group">
                <label className="pg-form-label">Title</label>
                <input
                  type="text" required
                  className="pg-form-input"
                  placeholder="e.g. Fan not working"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="pg-form-group">
                <label className="pg-form-label">Description</label>
                <textarea
                  required
                  className="pg-form-input"
                  placeholder="Provide details about the issue..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="pg-modal-actions">
                <button type="button" className="pg-modal-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Submit Complaint</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
