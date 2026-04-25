"use client";

import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchPayments = async () => {
    try {
      const { data } = await api.get('/payments');
      setPayments(data.data);
    } catch (err) {} finally { setLoading(false); }
  };

  useEffect(() => { fetchPayments(); }, []);

  const markAsPaid = async (id: string) => {
    if (confirm('Mark this rent payment as Paid?')) {
      try {
        await api.put(`/payments/${id}`, { status: 'Paid', paymentMethod: 'Cash' });
        toast.success('Payment marked as Paid');
        fetchPayments();
      } catch (err) {}
    }
  };

  const filtered = useMemo(() => {
    return payments.filter(p => {
      const q = search.toLowerCase();
      const matchSearch = !q || p.student?.name?.toLowerCase().includes(q) || p.student?.email?.toLowerCase().includes(q) || p.room?.roomNumber?.toString().includes(q);
      const matchFilter = filter === 'all' || p.status?.toLowerCase() === filter;
      return matchSearch && matchFilter;
    });
  }, [payments, search, filter]);

  const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const paidCount = payments.filter(p => p.status === 'Paid').length;
  const pendingCount = payments.filter(p => p.status === 'Pending').length;
  const overdueCount = payments.filter(p => p.status === 'Overdue').length;
  const totalRevenue = payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .pm-page { font-family:'DM Sans',sans-serif; }

        /* ── HEADER ── */
        .pm-header { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:48px; gap:24px }
        .pm-title { font-family:'Syne',sans-serif; font-size:32px; font-weight:800; color:#fff; letter-spacing:-0.04em; margin:0 0 6px }
        .pm-subtitle { font-size:15px; color:#6b7280; margin:0 }
        
        .pm-search { display:flex; align-items:center; gap:10px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px 16px; width:280px; transition:border-color .2s }
        .pm-search:focus-within { border-color:#6366f1 }
        .pm-search input { background:none; border:none; outline:none; font-family:inherit; font-size:14px; color:#fff; width:100% }
        .pm-search input::placeholder { color:#4b5563 }

        /* ── STAT CARDS ── */
        .pm-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:24px; margin-bottom:48px }
        .pm-stat {
          background:rgba(255,255,255,0.025);
          border:1px solid rgba(255,255,255,0.06);
          border-radius:14px;
          padding:24px 28px 22px;
          position:relative;
          overflow:hidden;
          transition:transform .25s,border-color .25s;
        }
        .pm-stat:hover { transform:translateY(-3px); border-color:rgba(255,255,255,0.12) }
        .pm-stat::before {
          content:'';
          position:absolute;
          top:0; left:0; right:0;
          height:3px;
        }
        .pm-stat.st-total::before { background:#6366f1 }
        .pm-stat.st-paid::before { background:#10b981 }
        .pm-stat.st-pending::before { background:#fbbf24 }
        .pm-stat.st-rev::before  { background:#a855f7 }

        .pm-stat-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px }
        .pm-stat-label { font-size:12px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:1.2px }
        .pm-stat-icon { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center }
        .pm-stat-icon svg { width:16px; height:16px }
        .ico-total { background:rgba(99,102,241,0.15) }
        .ico-paid { background:rgba(16,185,129,0.15) }
        .ico-pending { background:rgba(251,191,36,0.15) }
        .ico-rev  { background:rgba(168,85,247,0.15) }

        .pm-stat-val { font-family:'DM Sans',sans-serif; font-size:38px; font-weight:800; color:#fff; line-height:1; margin:0 0 8px; letter-spacing:-0.03em }
        .pm-stat-val.v-emerald { color:#10b981 }
        .pm-stat-val.v-amber   { color:#fbbf24 }
        .pm-stat-val.v-purple  { color:#a855f7 }
        .pm-stat-sub { font-size:13px; color:#6b7280 }

        /* ── FILTER TABS ── */
        .pm-filters { display:flex; gap:12px; margin-bottom:32px; flex-wrap:wrap }
        .pm-tab { display:flex; align-items:center; gap:8px; font-family:inherit; font-size:14px; font-weight:600; padding:10px 22px; border-radius:10px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.025); color:#9ca3af; cursor:pointer; transition:all .2s }
        .pm-tab:hover { background:rgba(255,255,255,0.06); border-color:rgba(255,255,255,0.14); color:#d1d5db }
        .pm-tab.active { border-color:rgba(255,255,255,0.3); color:#fff }
        .pm-tab-count { font-size:11px; font-weight:700; background:rgba(255,255,255,0.08); color:#9ca3af; padding:2px 8px; border-radius:6px; min-width:20px; text-align:center }
        .pm-tab.active .pm-tab-count { background:rgba(255,255,255,0.2); color:#fff }

        /* ── TABLE ── */
        .pm-table { width:100%; border-collapse:separate; border-spacing:0 }
        .pm-table-wrap { background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:16px; overflow:hidden }
        .pm-table th {
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
        .pm-table td {
          padding:22px 24px;
          border-bottom:1px solid rgba(255,255,255,0.04);
          font-size:14px;
          color:#d1d5db;
          vertical-align:middle;
        }
        .pm-table tr:last-child td { border-bottom:none }
        .pm-table tbody tr { transition:background .15s }
        .pm-table tbody tr:hover { background:rgba(255,255,255,0.025) }

        /* Columns Content */
        .pm-col-name { font-size:15px; font-weight:600; color:#fff; letter-spacing:-0.01em; margin-bottom:3px }
        .pm-col-email { font-size:13px; color:#6b7280 }
        .pm-col-room { font-family:'Syne',sans-serif; font-size:15px; font-weight:700; color:#e5e7eb }
        .pm-col-period { font-size:14px; color:#9ca3af; font-weight:500 }
        .pm-col-amount { font-family:'Syne',sans-serif; font-size:16px; font-weight:700; color:#fff }

        /* Badges */
        .pm-status { display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:999px; font-size:12px; font-weight:600 }
        .pm-status::before { content:''; width:6px; height:6px; border-radius:50%; flex-shrink:0 }
        .st-paid   { background:rgba(16,185,129,0.12); color:#10b981 }
        .st-paid::before { background:#10b981; box-shadow:0 0 6px rgba(16,185,129,0.5) }
        .st-pending  { background:rgba(251,191,36,0.12); color:#fbbf24 }
        .st-pending::before { background:#fbbf24; box-shadow:0 0 6px rgba(251,191,36,0.5) }
        .st-overdue  { background:rgba(248,113,113,0.12); color:#f87171 }
        .st-overdue::before { background:#f87171; box-shadow:0 0 6px rgba(248,113,113,0.5) }

        /* Action Dropdown/Button */
        .pm-action-btn { display:inline-flex; align-items:center; justify-content:center; padding:8px 16px; font-family:inherit; font-size:13px; font-weight:600; color:#10b981; background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.25); border-radius:8px; cursor:pointer; transition:all .2s }
        .pm-action-btn:hover { background:rgba(16,185,129,0.15) }
        
        .pm-paid-text { font-family:'DM Sans', sans-serif; font-size:13px; font-weight:500; color:#6b7280 }

        /* Empty */
        .pm-empty { padding:64px 32px; text-align:center; color:#6b7280; font-size:15px }

        /* ── ANIMATIONS ── */
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        .pm-stat { animation:fadeUp .4s ease both }
        .pm-stat:nth-child(1) { animation-delay:.03s }
        .pm-stat:nth-child(2) { animation-delay:.07s }
        .pm-stat:nth-child(3) { animation-delay:.11s }
        .pm-stat:nth-child(4) { animation-delay:.15s }
        .pm-table-wrap { animation:fadeUp .4s .18s ease both }

        /* ── RESPONSIVE ── */
        @media (max-width:1200px) { .pm-stats { grid-template-columns:repeat(2,1fr) } }
        @media (max-width:768px) {
          .pm-stats { grid-template-columns:1fr }
          .pm-header { flex-direction:column; align-items:flex-start }
          .pm-search { width:100% }
          .pm-table-wrap { overflow-x:auto }
          .pm-table { min-width:800px }
        }
      `}} />

      <div className="pm-page">
        {/* Header */}
        <div className="pm-header">
          <div>
            <h1 className="pm-title">Payments</h1>
            <p className="pm-subtitle">Track and update student rent payments</p>
          </div>
          <div className="pm-search">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="#6b7280" strokeWidth="1.5"/><path d="M11 11l3.5 3.5" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round"/></svg>
            <input type="text" placeholder="Search students or rooms..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Stat Cards */}
        <div className="pm-stats">
          <div className="pm-stat st-total">
            <div className="pm-stat-top">
              <div className="pm-stat-label">Total Records</div>
              <div className="pm-stat-icon ico-total">
                <svg viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
            </div>
            <div className="pm-stat-val">{payments.length}</div>
            <div className="pm-stat-sub">all rent logs</div>
          </div>
          <div className="pm-stat st-paid">
            <div className="pm-stat-top">
              <div className="pm-stat-label">Paid</div>
              <div className="pm-stat-icon ico-paid">
                <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
            </div>
            <div className="pm-stat-val v-emerald">{paidCount}</div>
            <div className="pm-stat-sub">collected this term</div>
          </div>
          <div className="pm-stat st-pending">
            <div className="pm-stat-top">
              <div className="pm-stat-label">Pending</div>
              <div className="pm-stat-icon ico-pending">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
            </div>
            <div className="pm-stat-val v-amber">{pendingCount}</div>
            <div className="pm-stat-sub">awaiting clearance</div>
          </div>
          <div className="pm-stat st-rev">
            <div className="pm-stat-top">
              <div className="pm-stat-label">Revenue</div>
              <div className="pm-stat-icon ico-rev">
                <svg viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
              </div>
            </div>
            <div className="pm-stat-val v-purple">₹{totalRevenue.toLocaleString()}</div>
            <div className="pm-stat-sub">total collected</div>
          </div>
        </div>

        {/* Filters */}
        <div className="pm-filters">
          {[
            { key: 'all', label: 'All', count: payments.length },
            { key: 'paid', label: 'Paid', count: paidCount },
            { key: 'pending', label: 'Pending', count: pendingCount },
            { key: 'overdue', label: 'Overdue', count: overdueCount },
          ].map(f => (
            <button key={f.key} className={`pm-tab ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>
              {f.label}
              <span className="pm-tab-count">{f.count}</span>
            </button>
          ))}
        </div>

        {/* Payments Table */}
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Room</th>
                <th>Period</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map(p => {
                   let statusClass = '';
                   if(p.status === 'Paid') statusClass = 'st-paid';
                   if(p.status === 'Pending') statusClass = 'st-pending';
                   if(p.status === 'Overdue') statusClass = 'st-overdue';

                   return (
                    <tr key={p._id}>
                      <td>
                        <div className="pm-col-name">{p.student?.name}</div>
                        <div className="pm-col-email">{p.student?.email}</div>
                      </td>
                      <td>
                        <div className="pm-col-room">{p.room?.roomNumber || 'N/A'}</div>
                      </td>
                      <td>
                         <div className="pm-col-period">{monthNames[p.month]} {p.year}</div>
                      </td>
                      <td>
                         <div className="pm-col-amount">₹{p.amount?.toLocaleString()}</div>
                      </td>
                      <td>
                         <span className={`pm-status ${statusClass}`}>{p.status}</span>
                      </td>
                      <td>
                         {p.status !== 'Paid' ? (
                           <button className="pm-action-btn" onClick={() => markAsPaid(p._id)}>
                              Mark Paid
                           </button>
                         ) : (
                           <div className="pm-paid-text">
                              Paid on {format(new Date(p.paidAt), 'MMM d')}
                           </div>
                         )}
                      </td>
                    </tr>
                  )
                })
              ) : (
                 <tr><td colSpan={6} className="pm-empty">
                   {!loading ? "No payments found." : "Loading payments..."}
                 </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
