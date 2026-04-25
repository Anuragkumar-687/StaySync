"use client";

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AdminLeaves() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });

  const fetchLeaves = useCallback(async () => {
    try {
      const params = filter ? `?status=${filter}` : '';
      const { data } = await api.get(`/leaves${params}`);
      setLeaves(data.data);
    } catch (err) {
      console.error(err);
    }
  }, [filter]);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/leaves/stats');
      setStats(data.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchLeaves();
    fetchStats();
  }, [fetchLeaves, fetchStats]);

  const handleAction = async (id: string, status: 'Approved' | 'Rejected', adminNote?: string) => {
    try {
      await api.patch(`/leaves/${id}/status`, { status, adminNote: adminNote || '' });
      toast.success(`Leave ${status.toLowerCase()}!`);
      fetchLeaves();
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusClass = (s: string) => {
    switch (s) {
      case 'Approved': return 'al-badge-approved';
      case 'Rejected': return 'al-badge-rejected';
      default: return 'al-badge-pending';
    }
  };

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <style dangerouslySetInnerHTML={{ __html: `
        .al-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:28px; flex-wrap:wrap; gap:12px }
        .al-header h1 { font-family:'Syne',sans-serif; font-weight:800; font-size:1.6rem; letter-spacing:-0.035em; color:#fff }
        .al-header p { font-size:0.83rem; color:rgba(255,255,255,0.38) }

        .al-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:24px }
        .al-stat { background:rgba(255,255,255,0.035); border:1px solid rgba(255,255,255,0.07); border-radius:14px; padding:18px 22px }
        .al-stat-label { font-size:0.7rem; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:0.06em; font-weight:600; margin-bottom:6px }
        .al-stat-val { font-size:1.8rem; font-weight:800; color:#fff; line-height:1 }
        .al-sv-yellow { color:#fbbf24 }
        .al-sv-green { color:#34d399 }
        .al-sv-red { color:#f87171 }

        .al-filters { display:flex; gap:8px; margin-bottom:20px; flex-wrap:wrap }
        .al-filter-btn { padding:7px 16px; border-radius:8px; font-size:0.78rem; font-weight:500; cursor:pointer; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.5); transition:all .2s }
        .al-filter-btn:hover { background:rgba(255,255,255,0.08); color:#fff }
        .al-filter-btn.active { background:rgba(99,102,241,0.15); border-color:rgba(99,102,241,0.3); color:#a5b4fc }

        .al-panel { background:rgba(255,255,255,0.035); border:1px solid rgba(255,255,255,0.07); border-radius:16px; overflow:hidden }
        .al-thead { display:grid; grid-template-columns:2fr 1.5fr 1fr 1fr 1.5fr; gap:16px; padding:14px 24px; border-bottom:1px solid rgba(255,255,255,0.07); background:rgba(255,255,255,0.02) }
        .al-th { font-size:0.7rem; font-weight:700; color:rgba(255,255,255,0.35); text-transform:uppercase; letter-spacing:0.07em }
        .al-row { display:grid; grid-template-columns:2fr 1.5fr 1fr 1fr 1.5fr; gap:16px; padding:16px 24px; border-bottom:1px solid rgba(255,255,255,0.04); align-items:center; transition:background .15s }
        .al-row:last-child { border-bottom:none }
        .al-row:hover { background:rgba(255,255,255,0.03) }
        .al-name { font-size:0.87rem; font-weight:600; color:#fff; margin-bottom:2px }
        .al-sub { font-size:0.72rem; color:rgba(255,255,255,0.3) }
        .al-reason { font-size:0.82rem; color:rgba(255,255,255,0.6); white-space:nowrap; overflow:hidden; text-overflow:ellipsis }
        .al-dates { font-size:0.78rem; color:rgba(255,255,255,0.5) }
        .al-badge { display:inline-flex; padding:4px 12px; border-radius:20px; font-size:0.72rem; font-weight:600 }
        .al-badge-approved { background:rgba(52,211,153,0.12); color:#34d399 }
        .al-badge-rejected { background:rgba(248,113,113,0.12); color:#f87171 }
        .al-badge-pending { background:rgba(251,191,36,0.12); color:#fbbf24 }

        .al-actions { display:flex; gap:6px }
        .al-act-btn { padding:6px 14px; border-radius:8px; font-size:0.72rem; font-weight:600; cursor:pointer; border:none; transition:all .2s }
        .al-approve { background:rgba(52,211,153,0.15); color:#34d399 }
        .al-approve:hover { background:rgba(52,211,153,0.25) }
        .al-reject { background:rgba(248,113,113,0.15); color:#f87171 }
        .al-reject:hover { background:rgba(248,113,113,0.25) }
        .al-empty { padding:48px; text-align:center; color:rgba(255,255,255,0.3); font-size:0.87rem }

        @keyframes up { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        .al-panel { animation:up .4s ease both }

        @media (max-width:900px) {
          .al-stats { grid-template-columns:repeat(2,1fr) }
          .al-thead, .al-row { grid-template-columns:2fr 1fr 1fr; }
          .al-thead .al-th:nth-child(4), .al-thead .al-th:nth-child(2),
          .al-row > *:nth-child(4), .al-row > *:nth-child(2) { display:none }
        }
      `}} />

      <div className="al-header">
        <div>
          <h1>Leave Management</h1>
          <p>Review and manage student leave requests</p>
        </div>
      </div>

      {/* Stats */}
      <div className="al-stats">
        <div className="al-stat">
          <div className="al-stat-label">Total Requests</div>
          <div className="al-stat-val">{stats.total}</div>
        </div>
        <div className="al-stat">
          <div className="al-stat-label">Pending</div>
          <div className="al-stat-val al-sv-yellow">{stats.pending}</div>
        </div>
        <div className="al-stat">
          <div className="al-stat-label">Approved</div>
          <div className="al-stat-val al-sv-green">{stats.approved}</div>
        </div>
        <div className="al-stat">
          <div className="al-stat-label">Rejected</div>
          <div className="al-stat-val al-sv-red">{stats.rejected}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="al-filters">
        {['', 'Pending', 'Approved', 'Rejected'].map((f) => (
          <button key={f} className={`al-filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f || 'All'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="al-panel">
        <div className="al-thead">
          <div className="al-th">Student</div>
          <div className="al-th">Reason</div>
          <div className="al-th">Dates</div>
          <div className="al-th">Status</div>
          <div className="al-th">Actions</div>
        </div>
        {leaves.length > 0 ? leaves.map((l) => (
          <div key={l._id} className="al-row">
            <div>
              <div className="al-name">{l.student?.name || 'Unknown'}</div>
              <div className="al-sub">{l.student?.email} • Room {l.student?.room?.roomNumber || 'N/A'}</div>
            </div>
            <div className="al-reason" title={l.reason}>{l.reason}</div>
            <div className="al-dates">
              {format(new Date(l.departureDate), 'MMM d')} → {format(new Date(l.returnDate), 'MMM d')}
            </div>
            <div><span className={`al-badge ${getStatusClass(l.status)}`}>{l.status}</span></div>
            <div className="al-actions">
              {l.status === 'Pending' ? (
                <>
                  <button className="al-act-btn al-approve" onClick={() => handleAction(l._id, 'Approved')}>✓ Approve</button>
                  <button className="al-act-btn al-reject" onClick={() => handleAction(l._id, 'Rejected')}>✗ Reject</button>
                </>
              ) : (
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)' }}>Processed</span>
              )}
            </div>
          </div>
        )) : (
          <div className="al-empty">No leave requests found.</div>
        )}
      </div>
    </DashboardLayout>
  );
}
