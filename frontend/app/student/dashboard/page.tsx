"use client";

import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { useEffect, useState } from 'react';
import { Home, AlertTriangle, Bell, Clock, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, notifRes] = await Promise.all([
          api.get('/complaints/stats'),
          api.get('/notifications'),
        ]);
        setStats(statsRes.data.data);
        setNotifications(notifRes.data.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  return (
    <DashboardLayout allowedRoles={['student']}>
      <style dangerouslySetInnerHTML={{ __html: `
        /* page head */
        .ph { display:flex; align-items:center; justify-content:space-between; margin-bottom:28px }
        .ph-left h1 { font-family:'Syne',sans-serif; font-weight:800; font-size:1.6rem; letter-spacing:-0.035em; color:#fff; margin-bottom:5px }
        .ph-left p { font-size:0.83rem; color:rgba(255,255,255,0.38); font-weight:400 }
        .ph-left p em { color:#818cf8; font-style:normal }
        
        /* ── PANELS ── */
        .mid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:20px }
        .bot { display:flex; flex-direction:column; gap:14px; margin-bottom:20px; }

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

        /* Room details rows */
        .rd-row { display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid rgba(255,255,255,0.05); }
        .rd-row:last-child { border-bottom:none; }
        .rd-label { font-size:0.8rem; color:rgba(255,255,255,0.5); }
        .rd-val { font-size:0.85rem; font-weight:600; color:#fff; }
        .rd-val.highlight { background:rgba(99,102,241,0.15); color:#a5b4fc; padding:4px 10px; border-radius:6px; border: 1px solid rgba(99,102,241,0.2); }

        /* Complaint stats */
        .c-stats { display:grid; grid-template-columns:1fr 1fr; gap:12px; height: calc(100% - 40px); min-height: 120px; }
        .c-stat-box { background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:16px; display:flex; flex-direction:column; align-items:center; justify-content:center; transition: background .2s, border-color .2s; }
        .c-stat-box:hover { background:rgba(255,255,255,0.04); border-color:rgba(255,255,255,0.1); }
        .c-stat-box .c-num { font-size:2rem; font-weight:800; font-family:'DM Sans',sans-serif; margin-bottom:6px; line-height: 1; }
        .c-stat-box .c-lbl { display: flex; align-items: center; gap: 6px; font-size:0.7rem; color:rgba(255,255,255,0.5); text-transform:uppercase; letter-spacing:0.05em; font-weight:600; }
        .c-stat-box.pending .c-num { color:#fbbf24; text-shadow: 0 0 20px rgba(251,191,36,0.2); }
        .c-stat-box.resolved .c-num { color:#34d399; text-shadow: 0 0 20px rgba(52,211,153,0.2); }

        /* activity */
        .ac-list { display:flex; flex-direction:column; gap:7px }
        .ac-item { display:flex; align-items:flex-start; gap:13px; padding:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:11px; transition:background .2s,border-color .2s,transform .2s }
        .ac-item:hover { background:rgba(255,255,255,0.06); border-color:rgba(255,255,255,0.1); transform:translateX(3px) }
        .ac-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; margin-top: 5px; }
        .d-b { background:#818cf8; box-shadow:0 0 7px rgba(129,140,248,0.7) }
        .ac-body { flex:1; min-width:0; }
        .ac-txt { font-size:0.85rem; color:rgba(255,255,255,0.9); font-weight:600; margin-bottom:4px; }
        .ac-desc { font-size:0.75rem; color:rgba(255,255,255,0.5); line-height:1.4; }
        .ac-time { font-size:0.66rem; color:rgba(255,255,255,0.3); font-weight:600; padding:4px 10px; background:rgba(255,255,255,0.05); border-radius:20px; white-space: nowrap; }

        /* no items state */
        .no-items { padding: 40px 20px; text-align: center; border: 1px dashed rgba(255,255,255,0.1); border-radius: 12px; margin-top: 10px; }
        .no-items svg { width: 32px; height: 32px; color: rgba(255,255,255,0.2); margin: 0 auto 12px; }
        .no-items p { font-size: 0.85rem; color: rgba(255,255,255,0.4); }

        /* animations */
        @keyframes up { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        .pc { animation:up .45s ease both }
        .pc:nth-child(1) { animation-delay:.03s }
        .pc:nth-child(2) { animation-delay:.07s }
        .bot .pc { animation-delay:.11s }

        @media (max-width: 1024px) {
          .mid { grid-template-columns: 1fr; }
        }
      `}} />

      <div className="ph">
        <div className="ph-left">
          <h1>Student Portal</h1>
          <p>Hello, <em>{user?.name || 'Student'}</em>. Here&apos;s your personalized dashboard.</p>
        </div>
      </div>

      <div className="mid">
        {/* Room Details Card */}
        <div className="pc">
          <div className="pc-head">
            <div className="pc-title"><Home size={16} /> Room Details</div>
          </div>
          {user?.room ? (
            <div>
              <div className="rd-row">
                <span className="rd-label">Room Number</span>
                <span className="rd-val highlight">{user.room.roomNumber}</span>
              </div>
              <div className="rd-row">
                <span className="rd-label">Floor</span>
                <span className="rd-val">{user.room.floor}</span>
              </div>
              <div className="rd-row">
                <span className="rd-label">Type</span>
                <span className="rd-val">{user.room.type}</span>
              </div>
            </div>
          ) : (
            <div className="no-items">
              <Home />
              <p>You haven&apos;t been allocated a room yet.</p>
            </div>
          )}
        </div>

        {/* Complaint Stats Card */}
        <div className="pc">
          <div className="pc-head">
            <div className="pc-title"><AlertTriangle size={16} /> Your Complaints</div>
          </div>
          <div className="c-stats">
            <div className="c-stat-box pending">
              <div className="c-num">{stats?.pending || 0}</div>
              <div className="c-lbl"><Clock size={12} /> Pending</div>
            </div>
            <div className="c-stat-box resolved">
              <div className="c-num">{stats?.resolved || 0}</div>
              <div className="c-lbl"><CheckCircle2 size={12} /> Resolved</div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bot">
        <div className="pc">
          <div className="pc-head">
            <div className="pc-title"><Bell size={16} /> Recent Notifications</div>
          </div>
          <div className="ac-list">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div key={notif._id} className="ac-item">
                  <div className="ac-dot d-b"></div>
                  <div className="ac-body">
                    <div className="ac-txt">{notif.title}</div>
                    <div className="ac-desc">{notif.message}</div>
                  </div>
                  <div className="ac-time">
                    {format(new Date(notif.createdAt), 'MMM d, yyyy')}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-items">
                <Bell />
                <p>No new notifications</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
