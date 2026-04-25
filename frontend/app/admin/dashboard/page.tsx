"use client";

import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>({
    students: { totalStudents: 0 },
    rooms: { total: 0, available: 0, occupied: 0 },
    complaints: { pending: 0, inProgress: 0, total: 0 },
    payments: { paid: 0, pending: 0, totalRevenue: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentRes, roomRes, compRes, payRes] = await Promise.all([
          api.get('/users/stats'),
          api.get('/rooms/stats'),
          api.get('/complaints/stats'),
          api.get('/payments/stats'),
        ]);
        setStats({
          students: studentRes.data.data,
          rooms: roomRes.data.data,
          complaints: compRes.data.data,
          payments: payRes.data.data,
        });
      } catch (err) {
        console.error(err);
      }

      // Fetch revenue chart data
      try {
        const chartRes = await api.get('/payments/revenue-chart');
        setRevenueData(chartRes.data.data || []);
      } catch (err) {
        console.error('Chart data fetch failed:', err);
      }

      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return null;

  const handleGenerateReport = () => {
    const csvContent = `StaySync System Report
Generated on: ${new Date().toLocaleString()}

--- STUDENTS ---
Total Students,${stats.students.totalStudents || 0}

--- ROOMS ---
Total Rooms,${stats.rooms.total || 0}
Occupied Rooms,${stats.rooms.occupied || 0}
Available Rooms,${stats.rooms.available || 0}

--- COMPLAINTS ---
Total Complaints,${stats.complaints.total || 0}
Pending Complaints,${stats.complaints.pending || 0}
In Progress,${stats.complaints.inProgress || 0}

--- PAYMENTS ---
Total Revenue (This Month),${stats.payments.totalRevenue || 0}
Paid Payments,${stats.payments.paid || 0}
Pending Payments,${stats.payments.pending || 0}
`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `StaySync_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalRooms = stats.rooms.total || 1;
  const occupiedPct = Math.round((stats.rooms.occupied / totalRooms) * 100) || 0;
  const availablePct = Math.round((stats.rooms.available / totalRooms) * 100) || 0;
  
  const totalPayments = (stats.payments.paid + stats.payments.pending) || 1;
  const paidPct = Math.round((stats.payments.paid / totalPayments) * 100) || 0;
  const pendingPct = Math.round((stats.payments.pending / totalPayments) * 100) || 0;

  const occupancyData = [
    { name: 'Occupied', value: stats.rooms.occupied || 0 },
    { name: 'Available', value: stats.rooms.available || 0 },
  ];
  const COLORS = ['#818cf8', '#34d399'];

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <style dangerouslySetInnerHTML={{ __html: `
        /* page head */
        .ph { display:flex; align-items:center; justify-content:space-between; margin-bottom:28px }
        .ph-left h1 { font-family:'Syne',sans-serif; font-weight:800; font-size:1.6rem; letter-spacing:-0.035em; color:#fff; margin-bottom:5px }
        .ph-left p { font-size:0.83rem; color:rgba(255,255,255,0.38); font-weight:400 }
        .ph-left p em { color:#818cf8; font-style:normal }
        .ph-right { display:flex; align-items:center; gap:10px }
        .date-chip { display:flex; align-items:center; gap:7px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); border-radius:9px; padding:8px 14px; font-size:0.78rem; color:rgba(255,255,255,0.45) }
        .date-chip svg { width:13px; height:13px; color:rgba(255,255,255,0.3) }
        .rep-btn { display:flex; align-items:center; gap:8px; background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; border:none; border-radius:10px; padding:10px 20px; font-size:0.83rem; font-weight:600; font-family:'Inter',sans-serif; cursor:pointer; box-shadow:0 0 22px rgba(99,102,241,0.38); transition:box-shadow .2s,transform .15s; white-space:nowrap }
        .rep-btn:hover { box-shadow:0 0 34px rgba(99,102,241,0.52); transform:translateY(-1px) }
        .rep-btn svg { width:13px; height:13px }

        /* ── STAT ROW ── */
        .stats { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:20px }

        .sc {
          background:rgba(255,255,255,0.035);
          border:1px solid rgba(255,255,255,0.075);
          border-radius:16px; padding:20px 22px 18px;
          position:relative; overflow:hidden;
          transition:transform .22s,border-color .22s,background .22s;
          cursor:default;
        }
        .sc:hover { transform:translateY(-4px); border-color:rgba(99,102,241,0.28); background:rgba(255,255,255,0.06) }
        /* colored top line per card */
        .sc::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; opacity:.7 }
        .sc.c1::before { background:linear-gradient(90deg,transparent,#818cf8,transparent) }
        .sc.c2::before { background:linear-gradient(90deg,transparent,#c4b5fd,transparent) }
        .sc.c3::before { background:linear-gradient(90deg,transparent,#f87171,transparent) }
        .sc.c4::before { background:linear-gradient(90deg,transparent,#34d399,transparent) }

        .sc-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:18px }
        .sc-ico { width:40px; height:40px; border-radius:11px; display:flex; align-items:center; justify-content:center }
        .sc-ico svg { width:18px; height:18px }
        .ico1 { background:rgba(99,102,241,0.16); box-shadow:0 0 14px rgba(99,102,241,0.14) }
        .ico2 { background:rgba(167,139,250,0.16); box-shadow:0 0 14px rgba(167,139,250,0.14) }
        .ico3 { background:rgba(248,113,113,0.16); box-shadow:0 0 14px rgba(248,113,113,0.12) }
        .ico4 { background:rgba(52,211,153,0.16); box-shadow:0 0 14px rgba(52,211,153,0.14) }

        .sc-badge { display:flex; align-items:center; gap:4px; font-size:0.69rem; font-weight:600; padding:4px 9px; border-radius:20px }
        .b-up { background:rgba(52,211,153,0.12); color:#34d399 }
        .b-warn { background:rgba(251,191,36,0.12); color:#fbbf24 }
        .b-red { background:rgba(248,113,113,0.12); color:#f87171 }
        .b-up svg, .b-warn svg, .b-red svg { width:8px; height:8px }

        .sc-num { font-family:'DM Sans',sans-serif; font-weight:800; font-size:2rem; letter-spacing:-0.045em; color:#fff; line-height:1; margin-bottom:5px }
        .sc-num.sm { font-size:1.55rem }
        .sc-lbl { font-size:0.76rem; color:rgba(255,255,255,0.38); font-weight:400 }

        /* ── MIDDLE ROW ── */
        .mid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:20px }

        .pc {
          background:rgba(255,255,255,0.035);
          border:1px solid rgba(255,255,255,0.075);
          border-radius:16px; padding:22px 24px;
          position:relative; overflow:hidden;
          transition:border-color .22s;
        }
        .pc:hover { border-color:rgba(99,102,241,0.22) }
        .pc::after { content:''; position:absolute; left:0; top:0; bottom:0; width:2px; background:linear-gradient(180deg,#6366f1,#8b5cf6 60%,transparent) }

        .pc-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px }
        .pc-title { display:flex; align-items:center; gap:9px; font-family:'Syne',sans-serif; font-weight:700; font-size:0.95rem; letter-spacing:-0.02em; color:#fff }
        .pc-title svg { width:15px; height:15px; color:#818cf8 }
        .pc-link { font-size:0.72rem; color:#818cf8; text-decoration:none; font-weight:500; transition:color .2s }
        .pc-link:hover { color:#a5b4fc }

        .pr { margin-bottom:15px }
        .pr:last-child { margin-bottom:0 }
        .pr-meta { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px }
        .pr-name { font-size:0.8rem; color:rgba(255,255,255,0.65); font-weight:400 }
        .pr-sub { font-size:0.7rem; color:rgba(255,255,255,0.28); margin-left:5px }
        .pr-pct { font-size:0.8rem; font-weight:600 }
        .pr-track { height:5px; border-radius:5px; background:rgba(255,255,255,0.07); overflow:hidden }
        .pr-fill { height:100%; border-radius:5px; position:relative }
        .pr-fill::after { content:''; position:absolute; top:0; right:0; bottom:0; width:24px; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.22)) }
        .pf-b { background:linear-gradient(90deg,#4f46e5,#818cf8) }
        .pf-g { background:linear-gradient(90deg,#059669,#34d399) }
        .pf-a { background:linear-gradient(90deg,#b45309,#fbbf24) }
        .pf-r { background:linear-gradient(90deg,#dc2626,#f87171) }

        /* ── BOTTOM ROW ── */
        .bot { display:grid; grid-template-columns:1.15fr 0.85fr; gap:14px }

        /* activity */
        .ac-list { display:flex; flex-direction:column; gap:7px }
        .ac-item { display:flex; align-items:center; gap:13px; padding:11px 14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:11px; transition:background .2s,border-color .2s,transform .2s }
        .ac-item:hover { background:rgba(255,255,255,0.06); border-color:rgba(255,255,255,0.1); transform:translateX(3px) }
        .ac-dot { width:7px; height:7px; border-radius:50%; flex-shrink:0 }
        .d-b { background:#818cf8; box-shadow:0 0 7px rgba(129,140,248,0.7) }
        .d-g { background:#34d399; box-shadow:0 0 7px rgba(52,211,153,0.7) }
        .d-a { background:#fbbf24; box-shadow:0 0 7px rgba(251,191,36,0.7) }
        .d-r { background:#f87171; box-shadow:0 0 7px rgba(248,113,113,0.7) }
        .d-v { background:#c4b5fd; box-shadow:0 0 7px rgba(196,181,253,0.7) }
        .ac-body { flex:1; min-width:0 }
        .ac-txt { font-size:0.78rem; color:rgba(255,255,255,0.7); font-weight:400; white-space:nowrap; overflow:hidden; text-overflow:ellipsis }
        .ac-time { font-size:0.66rem; color:rgba(255,255,255,0.26); margin-top:1.5px }
        .ac-tag { font-size:0.63rem; font-weight:600; padding:3px 9px; border-radius:20px; flex-shrink:0 }
        .at-b { background:rgba(99,102,241,0.18); color:#a5b4fc }
        .at-g { background:rgba(52,211,153,0.15); color:#6ee7b7 }
        .at-a { background:rgba(251,191,36,0.15); color:#fde68a }
        .at-r { background:rgba(248,113,113,0.15); color:#fca5a5 }

        /* quick actions */
        .qa { display:grid; grid-template-columns:1fr 1fr; gap:9px }
        .qa-b { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; padding:18px 10px; background:rgba(255,255,255,0.035); border:1px solid rgba(255,255,255,0.075); border-radius:14px; cursor:pointer; transition:all .22s; border-top:1.5px solid rgba(99,102,241,0.0) }
        .qa-b:hover { background:rgba(99,102,241,0.1); border-color:rgba(99,102,241,0.28); transform:translateY(-3px); box-shadow:0 8px 28px rgba(99,102,241,0.12) }
        .qa-ico { width:40px; height:40px; border-radius:11px; display:flex; align-items:center; justify-content:center }
        .qa-ico svg { width:18px; height:18px }
        .qi1 { background:rgba(99,102,241,0.18) }
        .qi2 { background:rgba(167,139,250,0.18) }
        .qi3 { background:rgba(52,211,153,0.18) }
        .qi4 { background:rgba(251,191,36,0.18) }
        .qa-lbl { font-size:0.75rem; font-weight:500; color:rgba(255,255,255,0.55); text-align:center; transition:color .2s }
        .qa-b:hover .qa-lbl { color:rgba(255,255,255,0.85) }

        /* animations */
        @keyframes up { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        .sc { animation:up .45s ease both }
        .sc:nth-child(1) { animation-delay:.03s }
        .sc:nth-child(2) { animation-delay:.07s }
        .sc:nth-child(3) { animation-delay:.11s }
        .sc:nth-child(4) { animation-delay:.15s }
        .pc, .bot > * { animation:up .45s .18s ease both }

        @media (max-width: 1024px) {
          .stats, .mid, .bot { grid-template-columns: 1fr; }
        }
      `}} />
      <>
        {/* Page header */}
        <div className="ph">
          <div className="ph-left">
            <h1>Admin Overview</h1>
            <p>Welcome back, <em>{user?.name || 'Admin'}</em>. Here&apos;s what&apos;s happening today.</p>
          </div>
          <div className="ph-right hidden sm:flex">
            <div className="date-chip">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <button className="rep-btn" onClick={handleGenerateReport}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>
              Generate Report
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats">
          <div className="sc c1">
            <div className="sc-head">
              <div className="sc-ico ico1"><svg viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg></div>
              <div className="sc-badge b-up"><svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="1,8 5,2 9,8"/></svg>+2.4%</div>
            </div>
            <div className="sc-num">{stats.students.totalStudents}</div>
            <div className="sc-lbl">Total Students</div>
          </div>
          <div className="sc c2">
            <div className="sc-head">
              <div className="sc-ico ico2"><svg viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg></div>
              <div className="sc-badge b-warn"><svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="1,2 5,8 9,2"/></svg>−1.2%</div>
            </div>
            <div className="sc-num">{stats.rooms.available}</div>
            <div className="sc-lbl">Available Rooms</div>
          </div>
          <div className="sc c3">
            <div className="sc-head">
              <div className="sc-ico ico3"><svg viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="1.8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></div>
              <div className="sc-badge b-red"><svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="1,8 5,2 9,8"/></svg>+{stats.complaints.pending || 0}</div>
            </div>
            <div className="sc-num">{stats.complaints.pending}</div>
            <div className="sc-lbl">Pending Complaints</div>
          </div>
          <div className="sc c4">
            <div className="sc-head">
              <div className="sc-ico ico4"><svg viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.8"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/></svg></div>
              <div className="sc-badge b-up"><svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="1,8 5,2 9,8"/></svg>+2.4%</div>
            </div>
            <div className="sc-num sm">₹{stats.payments.totalRevenue.toLocaleString()}</div>
            <div className="sc-lbl">This Month&apos;s Revenue</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="mid">
          <div className="pc">
            <div className="pc-head">
              <div className="pc-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>Revenue Trend</div>
            </div>
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer>
                <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                  <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.03)'}} contentStyle={{ backgroundColor: '#1e1e2d', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="revenue" fill="#818cf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="pc">
            <div className="pc-head">
              <div className="pc-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21.21 15.89A10 10 0 118 2.83M22 12A10 10 0 0012 2v10z"/></svg>Room Occupancy Chart</div>
            </div>
            <div style={{ width: '100%', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={occupancyData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                    {occupancyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1e1e2d', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>{stats.rooms.total}</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>Total Rooms</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mid panels */}
        <div className="mid">
          <div className="pc">
            <div className="pc-head">
              <div className="pc-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>Room Occupancy</div>
              <a href="#" className="pc-link">View all →</a>
            </div>
            <div className="pr">
              <div className="pr-meta"><span className="pr-name">Occupied <span className="pr-sub">({stats.rooms.occupied}/{stats.rooms.total})</span></span><span className="pr-pct" style={{color:'#818cf8'}}>{occupiedPct}%</span></div>
              <div className="pr-track"><div className="pr-fill pf-b" style={{width: `${occupiedPct}%`}}></div></div>
            </div>
            <div className="pr">
              <div className="pr-meta"><span className="pr-name">Available <span className="pr-sub">({stats.rooms.available}/{stats.rooms.total})</span></span><span className="pr-pct" style={{color: occupiedPct === 100 ? 'rgba(255,255,255,0.3)' : '#34d399'}}>{availablePct}%</span></div>
              <div className="pr-track"><div className="pr-fill pf-g" style={{width: `${availablePct}%`}}></div></div>
            </div>
            <div className="pr">
              <div className="pr-meta"><span className="pr-name">Maintenance <span className="pr-sub">(0/{stats.rooms.total})</span></span><span className="pr-pct" style={{color:'rgba(255,255,255,0.3)'}}>0%</span></div>
              <div className="pr-track"><div className="pr-fill pf-a" style={{width: '0%'}}></div></div>
            </div>
          </div>
          <div className="pc">
            <div className="pc-head">
              <div className="pc-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/></svg>Payment Collection</div>
              <a href="#" className="pc-link">View all →</a>
            </div>
            <div className="pr">
              <div className="pr-meta"><span className="pr-name">Paid <span className="pr-sub">({stats.payments.paid}/{totalPayments})</span></span><span className="pr-pct" style={{color:'#34d399'}}>{paidPct}%</span></div>
              <div className="pr-track"><div className="pr-fill pf-g" style={{width: `${paidPct}%`}}></div></div>
            </div>
            <div className="pr">
              <div className="pr-meta"><span className="pr-name">Pending <span className="pr-sub">({stats.payments.pending}/{totalPayments})</span></span><span className="pr-pct" style={{color:'#fbbf24'}}>{pendingPct}%</span></div>
              <div className="pr-track"><div className="pr-fill pf-a" style={{width: `${pendingPct}%`}}></div></div>
            </div>
            <div className="pr">
              <div className="pr-meta"><span className="pr-name">Overdue <span className="pr-sub">(0/{totalPayments})</span></span><span className="pr-pct" style={{color:'rgba(255,255,255,0.3)'}}>0%</span></div>
              <div className="pr-track"><div className="pr-fill pf-r" style={{width: '0%'}}></div></div>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="bot">
          {/* Activity */}
          <div className="pc" style={{paddingBottom:'18px'}}>
            <div className="pc-head">
              <div className="pc-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>Recent Activity</div>
              <a href="#" className="pc-link">See all →</a>
            </div>
            <div className="ac-list">
              <div className="ac-item"><div className="ac-dot d-b"></div><div className="ac-body"><div className="ac-txt">New student Priya Sharma registered</div><div className="ac-time">2 min ago</div></div><div className="ac-tag at-b">Student</div></div>
              <div className="ac-item"><div className="ac-dot d-g"></div><div className="ac-body"><div className="ac-txt">Payment received — Room 204 · ₹8,500</div><div className="ac-time">18 min ago</div></div><div className="ac-tag at-g">Payment</div></div>
              <div className="ac-item"><div className="ac-dot d-a"></div><div className="ac-body"><div className="ac-txt">Complaint raised — Water leakage Room 101</div><div className="ac-time">45 min ago</div></div><div className="ac-tag at-a">Complaint</div></div>
              <div className="ac-item"><div className="ac-dot d-r"></div><div className="ac-body"><div className="ac-txt">Overdue rent alert — Rahul Verma</div><div className="ac-time">1 hr ago</div></div><div className="ac-tag at-r">Alert</div></div>
              <div className="ac-item"><div className="ac-dot d-b"></div><div className="ac-body"><div className="ac-txt">Room 305 allocated to Ankit Singh</div><div className="ac-time">3 hr ago</div></div><div className="ac-tag at-b">Room</div></div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pc">
            <div className="pc-head">
              <div className="pc-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>Quick Actions</div>
            </div>
            <div className="qa">
              <button className="qa-b">
                <div className="qa-ico qi1"><svg viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.8"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg></div>
                <span className="qa-lbl">Add Student</span>
              </button>
              <button className="qa-b">
                <div className="qa-ico qi2"><svg viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/><line x1="12" y1="3" x2="12" y2="9"/></svg></div>
                <span className="qa-lbl">Add Room</span>
              </button>
              <button className="qa-b">
                <div className="qa-ico qi3"><svg viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></div>
                <span className="qa-lbl">Record Payment</span>
              </button>
              <button className="qa-b" onClick={handleGenerateReport}>
                <div className="qa-ico qi4"><svg viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg></div>
                <span className="qa-lbl">Generate Report</span>
              </button>
            </div>
          </div>
        </div>

      </>
    </DashboardLayout>
  );
}
