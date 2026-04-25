"use client";

import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [activeUpdateId, setActiveUpdateId] = useState<string | null>(null);

  const fetchComplaints = async () => {
    try {
      const { data } = await api.get('/complaints');
      setComplaints(data.data);
    } catch (err) {}
  };

  useEffect(() => { fetchComplaints(); }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
       await api.put(`/complaints/${id}`, { status });
       toast.success(`Complaint marked as ${status}`);
       setActiveUpdateId(null);
       fetchComplaints();
    } catch (err) {}
  };

  const filtered = useMemo(() => {
    return complaints.filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !q || c.title?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q) || c.student?.name?.toLowerCase().includes(q);
      const statusMap: Record<string, string> = { pending: 'Pending', inprogress: 'In Progress', resolved: 'Resolved', rejected: 'Rejected' };
      const matchFilter = filter === 'all' || c.status === statusMap[filter];
      return matchSearch && matchFilter;
    });
  }, [complaints, search, filter]);

  const pendingCount = complaints.filter(c => c.status === 'Pending').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
  const rejectedCount = complaints.filter(c => c.status === 'Rejected').length;

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .cp-page { font-family:'DM Sans',sans-serif; }

        /* ── HEADER ── */
        .cp-header { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:48px; gap:24px }
        .cp-title { font-family:'Syne',sans-serif; font-size:32px; font-weight:800; color:#fff; letter-spacing:-0.04em; margin:0 0 6px }
        .cp-subtitle { font-size:15px; color:#6b7280; margin:0 }
        
        .cp-search { display:flex; align-items:center; gap:10px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px 16px; width:280px; transition:border-color .2s }
        .cp-search:focus-within { border-color:#6366f1 }
        .cp-search input { background:none; border:none; outline:none; font-family:inherit; font-size:14px; color:#fff; width:100% }
        .cp-search input::placeholder { color:#4b5563 }

        /* ── STAT CARDS ── */
        .cp-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:24px; margin-bottom:48px }
        .cp-stat {
          background:rgba(255,255,255,0.025);
          border:1px solid rgba(255,255,255,0.06);
          border-radius:14px;
          padding:24px 28px 22px;
          position:relative;
          overflow:hidden;
          transition:transform .25s,border-color .25s;
        }
        .cp-stat:hover { transform:translateY(-3px); border-color:rgba(255,255,255,0.12) }
        .cp-stat::before {
          content:'';
          position:absolute;
          top:0; left:0; right:0;
          height:3px;
        }
        .cp-stat.st-total::before { background:#6366f1 }
        .cp-stat.st-pending::before { background:#fbbf24 }
        .cp-stat.st-progress::before   { background:#60a5fa }
        .cp-stat.st-resolved::before  { background:#2dd4bf }

        .cp-stat-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px }
        .cp-stat-label { font-size:12px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:1.2px }
        .cp-stat-icon { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center }
        .cp-stat-icon svg { width:16px; height:16px }
        .ico-total { background:rgba(99,102,241,0.15) }
        .ico-pending { background:rgba(251,191,36,0.15) }
        .ico-progress   { background:rgba(96,165,250,0.15) }
        .ico-resolved  { background:rgba(45,212,191,0.15) }

        .cp-stat-val { font-family:'DM Sans',sans-serif; font-size:40px; font-weight:800; color:#fff; line-height:1; margin:0 0 8px; letter-spacing:-0.04em }
        .cp-stat-val.v-amber { color:#fbbf24 }
        .cp-stat-val.v-blue  { color:#60a5fa }
        .cp-stat-val.v-teal   { color:#2dd4bf }
        .cp-stat-sub { font-size:13px; color:#6b7280 }

        /* ── FILTER TABS ── */
        .cp-filters { display:flex; gap:12px; margin-bottom:32px; flex-wrap:wrap }
        .cp-tab { display:flex; align-items:center; gap:8px; font-family:inherit; font-size:14px; font-weight:600; padding:10px 22px; border-radius:10px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.025); color:#9ca3af; cursor:pointer; transition:all .2s }
        .cp-tab:hover { background:rgba(255,255,255,0.06); border-color:rgba(255,255,255,0.14); color:#d1d5db }
        .cp-tab.active { border-color:rgba(255,255,255,0.3); color:#fff }
        .cp-tab-count { font-size:11px; font-weight:700; background:rgba(255,255,255,0.08); color:#9ca3af; padding:2px 8px; border-radius:6px; min-width:20px; text-align:center }
        .cp-tab.active .cp-tab-count { background:rgba(255,255,255,0.2); color:#fff }

        /* ── TABLE ── */
        .cp-table { width:100%; border-collapse:separate; border-spacing:0 }
        .cp-table-wrap { background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:16px; overflow:hidden }
        .cp-table th {
          font-size:11px;
          font-weight:700;
          color:#6b7280;
          text-transform:uppercase;
          letter-spacing:1.4px;
          padding:18px 24px;
          text-align:left;
          border-bottom:1px solid rgba(255,255,255,0.06);
          background:rgba(255,255,255,0.015);
        }
        .cp-table td {
          padding:22px 24px;
          border-bottom:1px solid rgba(255,255,255,0.04);
          font-size:14px;
          color:#d1d5db;
          vertical-align:top;
        }
        .cp-table tr:last-child td { border-bottom:none }
        .cp-table tbody tr { transition:background .15s }
        .cp-table tbody tr:hover { background:rgba(255,255,255,0.025) }

        /* Columns Content */
        .cp-col-title { font-family:'Syne',sans-serif; font-size:16px; font-weight:700; color:#fff; letter-spacing:-0.02em; margin-bottom:4px }
        .cp-col-desc { font-size:13px; color:#9ca3af; margin-bottom:8px; display:-webkit-box; -webkit-line-clamp:2; line-clamp:2; -webkit-box-orient:vertical; overflow:hidden }
        .cp-col-meta { font-size:12px; color:#6b7280 }
        
        .cp-col-user { font-size:14px; font-weight:500; color:#e5e7eb }

        /* Action Dropdown/Button */
        .cp-action-wrap { position:relative; display:inline-block }
        .cp-action-btn { display:inline-flex; align-items:center; justify-content:center; padding:8px 16px; font-family:inherit; font-size:13px; font-weight:600; color:#e5e7eb; background:transparent; border:1px solid rgba(255,255,255,0.15); border-radius:8px; cursor:pointer; transition:all .2s }
        .cp-action-btn:hover { background:rgba(255,255,255,0.05); border-color:rgba(255,255,255,0.3) }
        
        .cp-action-menu { position:absolute; right:0; top:calc(100% + 8px); background:#1f2937; border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:6px; min-width:160px; box-shadow:0 10px 25px rgba(0,0,0,0.5); z-index:10; display:flex; flex-direction:column; gap:2px }
        .cp-action-item { display:block; width:100%; text-align:left; padding:8px 12px; font-family:inherit; font-size:13px; font-weight:500; color:#d1d5db; background:transparent; border:none; border-radius:6px; cursor:pointer; transition:all .15s }
        .cp-action-item:hover { background:rgba(255,255,255,0.05); color:#fff }

        /* Badges */
        .cp-pill { display:inline-flex; align-items:center; padding:5px 12px; border-radius:999px; font-size:12px; font-weight:600 }
        .cp-pill-purple { background:rgba(167,139,250,0.12); color:#a78bfa }
        
        .cp-status { display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:999px; font-size:12px; font-weight:600 }
        .cp-status::before { content:''; width:6px; height:6px; border-radius:50%; flex-shrink:0 }
        .st-pending   { background:rgba(251,191,36,0.12); color:#fbbf24 }
        .st-pending::before { background:#fbbf24; box-shadow:0 0 6px rgba(251,191,36,0.5) }
        .st-progress  { background:rgba(96,165,250,0.12); color:#60a5fa }
        .st-progress::before { background:#60a5fa; box-shadow:0 0 6px rgba(96,165,250,0.5) }
        .st-resolved  { background:rgba(45,212,191,0.12); color:#2dd4bf }
        .st-resolved::before { background:#2dd4bf; box-shadow:0 0 6px rgba(45,212,191,0.5) }
        .st-rejected  { background:rgba(248,113,113,0.12); color:#f87171 }
        .st-rejected::before { background:#f87171; box-shadow:0 0 6px rgba(248,113,113,0.5) }

        /* Empty */
        .cp-empty { padding:64px 32px; text-align:center; color:#6b7280; font-size:15px }

        /* ── ANIMATIONS ── */
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        .cp-stat { animation:fadeUp .4s ease both }
        .cp-stat:nth-child(1) { animation-delay:.03s }
        .cp-stat:nth-child(2) { animation-delay:.07s }
        .cp-stat:nth-child(3) { animation-delay:.11s }
        .cp-stat:nth-child(4) { animation-delay:.15s }
        .cp-table-wrap { animation:fadeUp .4s .18s ease both }

        /* ── RESPONSIVE ── */
        @media (max-width:1200px) { .cp-stats { grid-template-columns:repeat(2,1fr) } }
        @media (max-width:768px) {
          .cp-stats { grid-template-columns:1fr }
          .cp-header { flex-direction:column; align-items:flex-start }
          .cp-search { width:100% }
          .cp-table-wrap { overflow-x:auto }
          .cp-table { min-width:800px }
        }
      `}} />

      <div className="cp-page">
        {/* Header */}
        <div className="cp-header">
          <div>
            <h1 className="cp-title">Complaints</h1>
            <p className="cp-subtitle">Review and resolve student issues</p>
          </div>
          <div className="cp-search">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="#6b7280" strokeWidth="1.5"/><path d="M11 11l3.5 3.5" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round"/></svg>
            <input type="text" placeholder="Search complaints..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Stat Cards */}
        <div className="cp-stats">
          <div className="cp-stat st-total">
            <div className="cp-stat-top">
              <div className="cp-stat-label">Total</div>
              <div className="cp-stat-icon ico-total">
                <svg viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
            </div>
            <div className="cp-stat-val">{complaints.length}</div>
            <div className="cp-stat-sub">all complaints</div>
          </div>
          <div className="cp-stat st-pending">
            <div className="cp-stat-top">
              <div className="cp-stat-label">Pending</div>
              <div className="cp-stat-icon ico-pending">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
            </div>
            <div className="cp-stat-val v-amber">{pendingCount}</div>
            <div className="cp-stat-sub">awaiting action</div>
          </div>
          <div className="cp-stat st-progress">
            <div className="cp-stat-top">
              <div className="cp-stat-label">In Progress</div>
              <div className="cp-stat-icon ico-progress">
                <svg viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
              </div>
            </div>
            <div className="cp-stat-val v-blue">{inProgressCount}</div>
            <div className="cp-stat-sub">being worked on</div>
          </div>
          <div className="cp-stat st-resolved">
            <div className="cp-stat-top">
              <div className="cp-stat-label">Resolved</div>
              <div className="cp-stat-icon ico-resolved">
                <svg viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
            </div>
            <div className="cp-stat-val v-teal">{resolvedCount}</div>
            <div className="cp-stat-sub">closed issues</div>
          </div>
        </div>

        {/* Filters */}
        <div className="cp-filters">
          {[
            { key: 'all', label: 'All', count: complaints.length },
            { key: 'pending', label: 'Pending', count: pendingCount },
            { key: 'inprogress', label: 'In Progress', count: inProgressCount },
            { key: 'resolved', label: 'Resolved', count: resolvedCount },
            { key: 'rejected', label: 'Rejected', count: rejectedCount },
          ].map(f => (
            <button key={f.key} className={`cp-tab ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>
              {f.label}
              <span className="cp-tab-count">{f.count}</span>
            </button>
          ))}
        </div>

        {/* Complaints Table */}
        <div className="cp-table-wrap">
          <table className="cp-table">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Complaint</th>
                <th>Category</th>
                <th>Reported By</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map(c => {
                   let statusClass = '';
                   if(c.status === 'Pending') statusClass = 'st-pending';
                   if(c.status === 'In Progress') statusClass = 'st-progress';
                   if(c.status === 'Resolved') statusClass = 'st-resolved';
                   if(c.status === 'Rejected') statusClass = 'st-rejected';
                   
                   const categoryName = c.category === 'Other' && c.autoCategory ? `${c.autoCategory} (AI)` : c.category;

                   return (
                    <tr key={c._id}>
                      <td>
                        <div className="cp-col-title">{c.title}</div>
                        <div className="cp-col-desc">{c.description}</div>
                        <div className="cp-col-meta">
                          Reported by {c.student?.name} — {format(new Date(c.createdAt), 'MMM d, yyyy h:mm a')}
                        </div>
                      </td>
                      <td>
                        <span className="cp-pill cp-pill-purple">{categoryName}</span>
                      </td>
                      <td>
                         <div className="cp-col-user">{c.student?.name}</div>
                      </td>
                      <td>
                         <span className={`cp-status ${statusClass}`}>{c.status}</span>
                      </td>
                      <td>
                         <div className="cp-action-wrap">
                           <button 
                             className="cp-action-btn"
                             onClick={() => setActiveUpdateId(activeUpdateId === c._id ? null : c._id)}
                           >
                              Update Status
                           </button>
                           {activeUpdateId === c._id && (
                             <div className="cp-action-menu">
                               {c.status !== 'Pending' && <button className="cp-action-item" onClick={() => updateStatus(c._id, 'Pending')}>Mark Pending</button>}
                               {c.status !== 'In Progress' && <button className="cp-action-item" onClick={() => updateStatus(c._id, 'In Progress')}>Mark In Progress</button>}
                               {c.status !== 'Resolved' && <button className="cp-action-item" onClick={() => updateStatus(c._id, 'Resolved')}>Mark Resolved</button>}
                               {c.status !== 'Rejected' && <button className="cp-action-item" onClick={() => updateStatus(c._id, 'Rejected')}>Reject</button>}
                             </div>
                           )}
                         </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr><td colSpan={5} className="cp-empty">No complaints found matching your criteria.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
