"use client";

import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const AVATAR_COLORS = ['av-a','av-b','av-c','av-d','av-e','av-f'];
function getAvatarClass(index: number) { return AVATAR_COLORS[index % AVATAR_COLORS.length]; }
function getInitials(name: string) { return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2); }

export default function AdminStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'allocated' | 'unallocated'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });

  const fetchData = async () => {
    try {
      const [studentRes, roomRes] = await Promise.all([
        api.get('/users?role=student'),
        api.get('/rooms?status=Available'),
      ]);
      setStudents(studentRes.data.data);
      setRooms(roomRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAllocate = async (studentId: string, roomId: string) => {
    if (!roomId) return;
    try {
      await api.post(`/rooms/${roomId}/allocate`, { studentId });
      toast.success('Room allocated successfully');
      fetchData();
    } catch (err) {}
  };

  const handleDeallocate = async (studentId: string, roomId: string) => {
    if (!roomId) return;
    if (confirm('Are you sure you want to remove this student from the room?')) {
      try {
        await api.post(`/rooms/${roomId}/deallocate`, { studentId });
        toast.success('Student removed from room');
        fetchData();
      } catch (err) {}
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { ...formData, role: 'student' });
      toast.success('Student added successfully');
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', phone: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add student');
    }
  };

  const filtered = useMemo(() => {
    return students.filter(s => {
      const q = search.toLowerCase();
      const matchSearch = !q || s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || s.phone?.includes(q);
      const matchFilter = filter === 'all' || (filter === 'allocated' ? !!s.room : !s.room);
      return matchSearch && matchFilter;
    });
  }, [students, search, filter]);

  const allocatedCount = students.filter(s => s.room).length;
  const unallocatedCount = students.filter(s => !s.room).length;

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .st-page { font-family:'DM Sans',sans-serif; }

        /* ── HEADER ── */
        .st-header { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:48px; gap:24px }
        .st-title { font-family:'Syne',sans-serif; font-size:32px; font-weight:800; color:#fff; letter-spacing:-0.04em; margin:0 0 6px }
        .st-subtitle { font-size:15px; color:#6b7280; margin:0 }
        
        .st-actions { display:flex; align-items:center; gap:12px; }

        .st-search { display:flex; align-items:center; gap:10px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px 16px; width:280px; transition:border-color .2s }
        .st-search:focus-within { border-color:#6366f1 }
        .st-search input { background:none; border:none; outline:none; font-family:inherit; font-size:14px; color:#fff; width:100% }
        .st-search input::placeholder { color:#4b5563 }

        .st-add { display:flex; align-items:center; gap:8px; background:#fff; color:#0f172a; border:none; border-radius:10px; padding:12px 24px; font-family:inherit; font-size:14px; font-weight:700; cursor:pointer; transition:all .2s; letter-spacing:-0.01em }
        .st-add:hover { background:#e2e8f0; transform:translateY(-1px) }

        /* ── STAT CARDS ── */
        .st-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; margin-bottom:48px }
        .st-stat {
          background:rgba(255,255,255,0.025);
          border:1px solid rgba(255,255,255,0.06);
          border-radius:14px;
          padding:24px 28px 22px;
          position:relative;
          overflow:hidden;
          transition:transform .25s,border-color .25s;
        }
        .st-stat:hover { transform:translateY(-3px); border-color:rgba(255,255,255,0.12) }
        .st-stat::before {
          content:'';
          position:absolute;
          top:0; left:0; right:0;
          height:3px;
        }
        .st-stat.st-total::before { background:#6366f1 }
        .st-stat.st-alloc::before { background:#10b981 }
        .st-stat.st-unalloc::before { background:#fbbf24 }

        .st-stat-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px }
        .st-stat-label { font-size:12px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:1.2px }
        .st-stat-icon { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center }
        .st-stat-icon svg { width:16px; height:16px }
        .ico-total { background:rgba(99,102,241,0.15) }
        .ico-alloc { background:rgba(16,185,129,0.15) }
        .ico-unalloc { background:rgba(251,191,36,0.15) }

        .st-stat-val { font-family:'DM Sans',sans-serif; font-size:38px; font-weight:800; color:#fff; line-height:1; margin:0 0 8px; letter-spacing:-0.03em }
        .st-stat-val.v-emerald { color:#10b981 }
        .st-stat-val.v-amber   { color:#fbbf24 }
        .st-stat-sub { font-size:13px; color:#6b7280 }

        /* ── FILTER TABS ── */
        .st-filters { display:flex; gap:12px; margin-bottom:32px; flex-wrap:wrap }
        .st-tab { display:flex; align-items:center; gap:8px; font-family:inherit; font-size:14px; font-weight:600; padding:10px 22px; border-radius:10px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.025); color:#9ca3af; cursor:pointer; transition:all .2s }
        .st-tab:hover { background:rgba(255,255,255,0.06); border-color:rgba(255,255,255,0.14); color:#d1d5db }
        .st-tab.active { border-color:rgba(255,255,255,0.3); color:#fff }
        .st-tab-count { font-size:11px; font-weight:700; background:rgba(255,255,255,0.08); color:#9ca3af; padding:2px 8px; border-radius:6px; min-width:20px; text-align:center }
        .st-tab.active .st-tab-count { background:rgba(255,255,255,0.2); color:#fff }

        /* ── TABLE ── */
        .st-table { width:100%; border-collapse:separate; border-spacing:0 }
        .st-table-wrap { background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:16px; overflow:hidden }
        .st-table th {
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
        .st-table td {
          padding:22px 24px;
          border-bottom:1px solid rgba(255,255,255,0.04);
          font-size:14px;
          color:#d1d5db;
          vertical-align:middle;
        }
        .st-table tr:last-child td { border-bottom:none }
        .st-table tbody tr { transition:background .15s }
        .st-table tbody tr:hover { background:rgba(255,255,255,0.025) }

        /* Student Identity */
        .st-identity { display:flex; align-items:center; gap:16px }
        .st-avatar { width:40px; height:40px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-family:'Syne',sans-serif; font-size:15px; font-weight:700; flex-shrink:0 }
        .av-a { background:rgba(99,102,241,0.15); color:#818cf8 }
        .av-b { background:rgba(16,185,129,0.15); color:#34d399 }
        .av-c { background:rgba(245,158,11,0.15); color:#fbbf24 }
        .av-d { background:rgba(168,85,247,0.15); color:#c084fc }
        .av-e { background:rgba(239,68,68,0.15); color:#f87171 }
        .av-f { background:rgba(14,165,233,0.15); color:#38bdf8 }
        .st-col-name { font-size:15px; font-weight:600; color:#fff; letter-spacing:-0.01em; margin-bottom:3px }
        .st-col-email { font-size:13px; color:#6b7280 }
        
        .st-col-phone { font-family:'Syne',sans-serif; font-size:15px; color:#e5e7eb }

        /* Badges */
        .st-status { display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:999px; font-size:12px; font-weight:600 }
        .st-status::before { content:''; width:6px; height:6px; border-radius:50%; flex-shrink:0 }
        .s-alloc   { background:rgba(16,185,129,0.12); color:#10b981 }
        .s-alloc::before { background:#10b981; box-shadow:0 0 6px rgba(16,185,129,0.5) }
        .s-unalloc  { background:rgba(251,191,36,0.12); color:#fbbf24 }
        .s-unalloc::before { background:#fbbf24; box-shadow:0 0 6px rgba(251,191,36,0.5) }

        /* Actions */
        .st-action-cell { display:flex; align-items:center; gap:10px }
        .st-btn-dealloc { display:inline-flex; align-items:center; justify-content:center; padding:9px 18px; font-family:inherit; font-size:13px; font-weight:600; color:#f87171; background:transparent; border:1px solid rgba(248,113,113,0.2); border-radius:8px; cursor:pointer; transition:all .2s }
        .st-btn-dealloc:hover { background:rgba(248,113,113,0.1); border-color:rgba(248,113,113,0.3) }
        
        select.st-btn-alloc {
          appearance:none;
          cursor:pointer;
          background-color:rgba(99,102,241,0.1);
          color:#818cf8;
          border:1px solid rgba(99,102,241,0.25);
          font-family:inherit;
          font-size:13px;
          font-weight:600;
          padding:9px 36px 9px 18px;
          border-radius:8px;
          outline:none;
          transition:all .2s;
          background-image:url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23818cf8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat:no-repeat;
          background-position:right 14px center;
        }
        select.st-btn-alloc:hover { background-color:rgba(99,102,241,0.15) }
        select.st-btn-alloc option { background:#12131a; color:#d1d5db }

        .st-empty { padding:64px 32px; text-align:center; color:#6b7280; font-size:15px }

        /* ── MODAL ── */
        .st-overlay { position:fixed; inset:0; z-index:100; display:flex; align-items:center; justify-content:center; padding:1rem; background:rgba(0,0,0,0.65); backdrop-filter:blur(8px) }
        .st-modal-box { background:#12131a; border:1px solid rgba(255,255,255,0.08); border-radius:20px; padding:2.5rem; width:100%; max-width:520px; box-shadow:0 30px 60px rgba(0,0,0,0.5); animation:fadeUp .3s ease both }
        .st-modal-box h2 { font-family:'Syne',sans-serif; font-size:22px; font-weight:700; color:#fff; margin:0 0 2rem; letter-spacing:-0.03em }
        .st-fg { margin-bottom:1.5rem }
        .st-fl { display:block; font-size:13px; font-weight:600; color:#9ca3af; margin-bottom:8px }
        .st-fi { width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px 16px; font-family:inherit; font-size:14px; color:#fff; outline:none; transition:border-color .2s; box-sizing:border-box }
        .st-fi:focus { border-color:rgba(99,102,241,0.5) }
        .st-fi::placeholder { color:#4b5563 }
        .st-modal-actions { display:flex; justify-content:flex-end; gap:12px; margin-top:2rem }
        .st-modal-cancel { font-family:inherit; font-size:14px; font-weight:600; padding:12px 22px; border-radius:10px; border:1px solid rgba(255,255,255,0.1); background:transparent; color:#9ca3af; cursor:pointer; transition:all .2s }
        .st-modal-cancel:hover { background:rgba(255,255,255,0.06); color:#fff }
        .st-modal-save { font-family:inherit; font-size:14px; font-weight:700; padding:12px 28px; border-radius:10px; border:none; background:#6366f1; color:#fff; cursor:pointer; transition:all .2s; box-shadow:0 0 20px rgba(99,102,241,0.2) }
        .st-modal-save:hover { background:#4f46e5; box-shadow:0 0 30px rgba(99,102,241,0.35) }

        /* ── ANIMATIONS ── */
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        .st-stat { animation:fadeUp .4s ease both }
        .st-stat:nth-child(1) { animation-delay:.03s }
        .st-stat:nth-child(2) { animation-delay:.07s }
        .st-stat:nth-child(3) { animation-delay:.11s }
        .st-table-wrap { animation:fadeUp .4s .15s ease both }

        /* ── RESPONSIVE ── */
        @media (max-width:1024px) {
          .st-header { flex-direction:column; align-items:flex-start }
          .st-actions { width:100%; flex-wrap:wrap }
          .st-search { flex:1; min-width:200px }
        }
        @media (max-width:768px) {
          .st-stats { grid-template-columns:1fr }
          .st-table-wrap { overflow-x:auto }
          .st-table { min-width:800px }
        }
      `}} />

      <div className="st-page">
        {/* Header */}
        <div className="st-header">
          <div>
            <h1 className="st-title">Students</h1>
            <p className="st-subtitle">View residents and manage room allocations</p>
          </div>
          <div className="st-actions">
            <div className="st-search">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="#6b7280" strokeWidth="1.5"/><path d="M11 11l3.5 3.5" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round"/></svg>
              <input type="text" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button className="st-add" onClick={() => setIsModalOpen(true)}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              Add Student
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="st-stats">
          <div className="st-stat st-total">
            <div className="st-stat-top">
              <div className="st-stat-label">Total Students</div>
              <div className="st-stat-icon ico-total">
                <svg viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
              </div>
            </div>
            <div className="st-stat-val">{students.length}</div>
            <div className="st-stat-sub">registered in system</div>
          </div>
          <div className="st-stat st-alloc">
            <div className="st-stat-top">
              <div className="st-stat-label">Allocated</div>
              <div className="st-stat-icon ico-alloc">
                <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
            </div>
            <div className="st-stat-val v-emerald">{allocatedCount}</div>
            <div className="st-stat-sub">rooms assigned</div>
          </div>
          <div className="st-stat st-unalloc">
            <div className="st-stat-top">
              <div className="st-stat-label">Unallocated</div>
              <div className="st-stat-icon ico-unalloc">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
            </div>
            <div className="st-stat-val v-amber">{unallocatedCount}</div>
            <div className="st-stat-sub">pending assignment</div>
          </div>
        </div>

        {/* Filters */}
        <div className="st-filters">
          {[
            { key: 'all', label: 'All', count: students.length },
            { key: 'allocated', label: 'Allocated', count: allocatedCount },
            { key: 'unallocated', label: 'Unallocated', count: unallocatedCount },
          ].map(f => (
            <button key={f.key} className={`st-tab ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key as any)}>
              {f.label}
              <span className="st-tab-count">{f.count}</span>
            </button>
          ))}
        </div>

        {/* Students Table */}
        <div className="st-table-wrap">
          <table className="st-table">
            <thead>
              <tr>
                <th>Student Identity</th>
                <th>Contact Number</th>
                <th>Room Allocation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((student, i) => (
                  <tr key={student._id}>
                    <td>
                      <div className="st-identity">
                        <div className={`st-avatar ${getAvatarClass(i)}`}>{getInitials(student.name)}</div>
                        <div>
                          <div className="st-col-name">{student.name}</div>
                          <div className="st-col-email">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="st-col-phone">{student.phone || 'N/A'}</div>
                    </td>
                    <td>
                       {student.room ? (
                         <span className="st-status s-alloc">Room {student.room.roomNumber}</span>
                       ) : (
                         <span className="st-status s-unalloc">Unallocated</span>
                       )}
                    </td>
                    <td>
                       <div className="st-action-cell">
                         {student.room ? (
                           <button className="st-btn-dealloc" onClick={() => handleDeallocate(student._id, student.room._id)}>
                             Deallocate
                           </button>
                         ) : (
                           <select
                             className="st-btn-alloc"
                             onChange={(e) => { if (e.target.value) handleAllocate(student._id, e.target.value); e.target.value = ''; }}
                             defaultValue=""
                           >
                             <option value="" disabled>Allocate Room</option>
                             {rooms.map(r => (
                               <option key={r._id} value={r._id}>
                                 Room {r.roomNumber} ({r.capacity - r.occupied} left)
                               </option>
                             ))}
                           </select>
                         )}
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                 <tr><td colSpan={4} className="st-empty">
                   {!loading ? "No students found." : "Loading..."}
                 </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {isModalOpen && (
        <div className="st-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="st-modal-box" onClick={e => e.stopPropagation()}>
            <h2>Add New Student</h2>
            <form onSubmit={handleAddStudent}>
              <div className="st-fg">
                <label className="st-fl">Full Name</label>
                <input className="st-fi" type="text" required placeholder="e.g. John Doe" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="st-fg">
                <label className="st-fl">Email Address</label>
                <input className="st-fi" type="email" required placeholder="john@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="st-fg">
                  <label className="st-fl">Password</label>
                  <input className="st-fi" type="password" required placeholder="Minimum 6 chars" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                </div>
                <div className="st-fg">
                  <label className="st-fl">Phone (Optional)</label>
                  <input className="st-fi" type="text" placeholder="+123456789" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>
              </div>
              <div className="st-modal-actions">
                <button type="button" className="st-modal-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="st-modal-save">Add Student</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
