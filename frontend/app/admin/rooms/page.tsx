"use client";

import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminRooms() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    roomNumber: '', floor: 1, type: 'Single', capacity: 1, rent: 0,
  });

  const fetchRooms = async () => {
    try {
      const { data } = await api.get('/rooms');
      setRooms(data.data);
    } catch (err) {}
  };

  useEffect(() => { fetchRooms(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/rooms', formData);
      toast.success('Room created successfully');
      setIsModalOpen(false);
      setFormData({ roomNumber: '', floor: 1, type: 'Single', capacity: 1, rent: 0 });
      fetchRooms();
    } catch (err) {}
  };

  const filtered = useMemo(() => {
    return rooms.filter(r => {
      const q = search.toLowerCase();
      const matchSearch = !q || r.roomNumber?.toString().includes(q);
      const matchFilter = filter === 'all' || r.status?.toLowerCase() === filter;
      return matchSearch && matchFilter;
    });
  }, [rooms, search, filter]);

  const available = rooms.filter(r => r.status === 'Available').length;
  const occupied = rooms.filter(r => r.status === 'Occupied').length;
  const full = rooms.filter(r => r.status === 'Full').length;

  const getOccupancyColor = (room: any) => {
    const pct = room.capacity > 0 ? (room.occupied / room.capacity) : 0;
    if (pct >= 1) return '#f87171';
    if (pct > 0) return '#60a5fa';
    return 'rgba(255,255,255,0.12)';
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Available': return 'rs-avail';
      case 'Occupied': return 'rs-occ';
      case 'Full': return 'rs-full';
      default: return '';
    }
  };

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

        /* ── PAGE ── */
        .rm-page { font-family:'DM Sans',sans-serif; }

        /* ── HEADER ── */
        .rm-header { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:48px; gap:24px }
        .rm-title { font-family:'Syne',sans-serif; font-size:32px; font-weight:800; color:#fff; letter-spacing:-0.04em; margin:0 0 6px }
        .rm-subtitle { font-size:15px; color:#6b7280; margin:0 }
        .rm-actions { display:flex; gap:12px; align-items:center }
        .rm-search { display:flex; align-items:center; gap:10px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px 16px; width:240px; transition:border-color .2s }
        .rm-search:focus-within { border-color:#6366f1 }
        .rm-search input { background:none; border:none; outline:none; font-family:inherit; font-size:14px; color:#fff; width:100% }
        .rm-search input::placeholder { color:#4b5563 }
        .rm-add { display:flex; align-items:center; gap:8px; background:#fff; color:#0f172a; border:none; border-radius:10px; padding:12px 24px; font-family:inherit; font-size:14px; font-weight:700; cursor:pointer; transition:all .2s; letter-spacing:-0.01em }
        .rm-add:hover { background:#e2e8f0; transform:translateY(-1px) }

        /* ── STAT CARDS ── */
        .rm-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:24px; margin-bottom:48px }
        .rm-stat {
          background:rgba(255,255,255,0.025);
          border:1px solid rgba(255,255,255,0.06);
          border-radius:16px;
          padding:24px 28px 22px;
          position:relative;
          overflow:hidden;
          transition:transform .25s,border-color .25s;
        }
        .rm-stat:hover { transform:translateY(-3px); border-color:rgba(255,255,255,0.12) }
        .rm-stat::before {
          content:'';
          position:absolute;
          top:0; left:0; right:0;
          height:3px;
          border-radius:16px 16px 0 0;
        }
        .rm-stat.st-total::before { background:linear-gradient(90deg,#6366f1,#818cf8) }
        .rm-stat.st-avail::before { background:linear-gradient(90deg,#059669,#34d399) }
        .rm-stat.st-occ::before   { background:linear-gradient(90deg,#2563eb,#60a5fa) }
        .rm-stat.st-full::before  { background:linear-gradient(90deg,#dc2626,#f87171) }

        .rm-stat-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px }
        .rm-stat-label { font-size:12px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:1.2px }
        .rm-stat-icon { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center }
        .rm-stat-icon svg { width:16px; height:16px }
        .ico-total { background:rgba(99,102,241,0.15) }
        .ico-avail { background:rgba(52,211,153,0.15) }
        .ico-occ   { background:rgba(96,165,250,0.15) }
        .ico-full  { background:rgba(248,113,113,0.15) }

        .rm-stat-val { font-family:'DM Sans',sans-serif; font-size:40px; font-weight:800; color:#fff; line-height:1; margin:0 0 8px; letter-spacing:-0.04em }
        .rm-stat-val.v-green { color:#34d399 }
        .rm-stat-val.v-blue  { color:#60a5fa }
        .rm-stat-val.v-red   { color:#f87171 }
        .rm-stat-sub { font-size:13px; color:#6b7280 }

        /* ── FILTER TABS ── */
        .rm-filters { display:flex; gap:12px; margin-bottom:32px; flex-wrap:wrap }
        .rm-tab { display:flex; align-items:center; gap:8px; font-family:inherit; font-size:14px; font-weight:600; padding:10px 22px; border-radius:10px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.025); color:#9ca3af; cursor:pointer; transition:all .2s }
        .rm-tab:hover { background:rgba(255,255,255,0.06); border-color:rgba(255,255,255,0.14); color:#d1d5db }
        .rm-tab.active { background:rgba(99,102,241,0.12); border-color:rgba(99,102,241,0.3); color:#a5b4fc }
        .rm-tab-count { font-size:11px; font-weight:700; background:rgba(255,255,255,0.08); color:#9ca3af; padding:2px 8px; border-radius:6px; min-width:20px; text-align:center }
        .rm-tab.active .rm-tab-count { background:rgba(99,102,241,0.25); color:#c7d2fe }

        /* ── TABLE ── */
        .rm-table { width:100%; border-collapse:separate; border-spacing:0 }
        .rm-table-wrap { background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:16px; overflow:hidden }
        .rm-table th {
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
        .rm-table th:last-child { text-align:right }
        .rm-table td {
          padding:22px 24px;
          border-bottom:1px solid rgba(255,255,255,0.04);
          font-size:14px;
          color:#d1d5db;
          vertical-align:middle;
        }
        .rm-table tr:last-child td { border-bottom:none }
        .rm-table tbody tr { transition:background .15s }
        .rm-table tbody tr:hover { background:rgba(99,102,241,0.04) }

        /* Room name cell */
        .rm-name { font-family:'Syne',sans-serif; font-size:16px; font-weight:700; color:#fff; letter-spacing:-0.02em }
        .rm-id { font-size:12px; color:#4b5563; margin-top:3px; font-family:'DM Mono',monospace; letter-spacing:0.04em }

        /* Occupancy bar */
        .rm-occ-cell { display:flex; align-items:center; gap:12px }
        .rm-occ-bar { width:60px; height:5px; background:rgba(255,255,255,0.07); border-radius:3px; overflow:hidden; flex-shrink:0 }
        .rm-occ-fill { height:100%; border-radius:3px; transition:width .3s }
        .rm-occ-text { font-size:13px; color:#9ca3af; font-weight:500; white-space:nowrap }

        /* Status badge */
        .rm-status { display:inline-flex; align-items:center; gap:6px; padding:5px 14px; border-radius:8px; font-size:12px; font-weight:600 }
        .rm-status::before { content:''; width:6px; height:6px; border-radius:50%; flex-shrink:0 }
        .rs-avail { background:rgba(52,211,153,0.1); color:#34d399 }
        .rs-avail::before { background:#34d399; box-shadow:0 0 6px rgba(52,211,153,0.5) }
        .rs-occ { background:rgba(96,165,250,0.1); color:#60a5fa }
        .rs-occ::before { background:#60a5fa; box-shadow:0 0 6px rgba(96,165,250,0.5) }
        .rs-full { background:rgba(248,113,113,0.1); color:#f87171 }
        .rs-full::before { background:#f87171; box-shadow:0 0 6px rgba(248,113,113,0.5) }

        /* Rent */
        .rm-rent { font-family:'Syne',sans-serif; font-size:16px; font-weight:700; color:#fff; text-align:right; letter-spacing:-0.02em }

        /* Empty */
        .rm-empty { padding:64px 32px; text-align:center; color:#6b7280; font-size:15px }

        /* ── MODAL ── */
        .rm-overlay { position:fixed; inset:0; z-index:100; display:flex; align-items:center; justify-content:center; padding:1rem; background:rgba(0,0,0,0.65); backdrop-filter:blur(8px) }
        .rm-modal { background:#12131a; border:1px solid rgba(255,255,255,0.08); border-radius:20px; padding:2.5rem; width:100%; max-width:520px; box-shadow:0 30px 60px rgba(0,0,0,0.5) }
        .rm-modal h2 { font-family:'Syne',sans-serif; font-size:22px; font-weight:700; color:#fff; margin:0 0 2rem; letter-spacing:-0.03em }
        .rm-fg { margin-bottom:1.5rem }
        .rm-fl { display:block; font-size:13px; font-weight:600; color:#9ca3af; margin-bottom:8px }
        .rm-fi { width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px 16px; font-family:inherit; font-size:14px; color:#fff; outline:none; transition:border-color .2s; box-sizing:border-box }
        .rm-fi:focus { border-color:rgba(99,102,241,0.5) }
        .rm-fi::placeholder { color:#4b5563 }
        select.rm-fi { appearance:none; cursor:pointer; background-image:url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 14px center; padding-right:36px }
        select.rm-fi option { background:#12131a; color:#d1d5db }
        .rm-modal-actions { display:flex; justify-content:flex-end; gap:12px; margin-top:2rem }
        .rm-modal-cancel { font-family:inherit; font-size:14px; font-weight:600; padding:12px 22px; border-radius:10px; border:1px solid rgba(255,255,255,0.1); background:transparent; color:#9ca3af; cursor:pointer; transition:all .2s }
        .rm-modal-cancel:hover { background:rgba(255,255,255,0.06); color:#fff }
        .rm-modal-save { font-family:inherit; font-size:14px; font-weight:700; padding:12px 28px; border-radius:10px; border:none; background:#6366f1; color:#fff; cursor:pointer; transition:all .2s; box-shadow:0 0 20px rgba(99,102,241,0.2) }
        .rm-modal-save:hover { background:#4f46e5; box-shadow:0 0 30px rgba(99,102,241,0.35) }

        /* ── ANIMATIONS ── */
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        .rm-stat { animation:fadeUp .4s ease both }
        .rm-stat:nth-child(1) { animation-delay:.03s }
        .rm-stat:nth-child(2) { animation-delay:.07s }
        .rm-stat:nth-child(3) { animation-delay:.11s }
        .rm-stat:nth-child(4) { animation-delay:.15s }
        .rm-table-wrap { animation:fadeUp .4s .18s ease both }

        /* ── RESPONSIVE ── */
        @media (max-width:1200px) { .rm-stats { grid-template-columns:repeat(2,1fr) } }
        @media (max-width:768px) {
          .rm-stats { grid-template-columns:1fr }
          .rm-header { flex-direction:column; align-items:flex-start }
          .rm-actions { width:100% }
          .rm-search { flex:1 }
          .rm-table-wrap { overflow-x:auto }
          .rm-table { min-width:700px }
        }
      `}} />

      <div className="rm-page">
        {/* Header */}
        <div className="rm-header">
          <div>
            <h1 className="rm-title">Rooms</h1>
            <p className="rm-subtitle">Create and oversee all hostel rooms</p>
          </div>
          <div className="rm-actions">
            <div className="rm-search">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="#6b7280" strokeWidth="1.5"/><path d="M11 11l3.5 3.5" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round"/></svg>
              <input type="text" placeholder="Search rooms..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button className="rm-add" onClick={() => setIsModalOpen(true)}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              Add Room
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="rm-stats">
          <div className="rm-stat st-total">
            <div className="rm-stat-top">
              <div className="rm-stat-label">Total Rooms</div>
              <div className="rm-stat-icon ico-total">
                <svg viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
              </div>
            </div>
            <div className="rm-stat-val">{rooms.length}</div>
            <div className="rm-stat-sub">in system</div>
          </div>
          <div className="rm-stat st-avail">
            <div className="rm-stat-top">
              <div className="rm-stat-label">Available</div>
              <div className="rm-stat-icon ico-avail">
                <svg viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
            </div>
            <div className="rm-stat-val v-green">{available}</div>
            <div className="rm-stat-sub">ready for allocation</div>
          </div>
          <div className="rm-stat st-occ">
            <div className="rm-stat-top">
              <div className="rm-stat-label">Occupied</div>
              <div className="rm-stat-icon ico-occ">
                <svg viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
              </div>
            </div>
            <div className="rm-stat-val v-blue">{occupied}</div>
            <div className="rm-stat-sub">partially filled</div>
          </div>
          <div className="rm-stat st-full">
            <div className="rm-stat-top">
              <div className="rm-stat-label">Full</div>
              <div className="rm-stat-icon ico-full">
                <svg viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
            </div>
            <div className="rm-stat-val v-red">{full}</div>
            <div className="rm-stat-sub">at capacity</div>
          </div>
        </div>

        {/* Filters */}
        <div className="rm-filters">
          {[
            { key: 'all', label: 'All', count: rooms.length },
            { key: 'available', label: 'Available', count: available },
            { key: 'occupied', label: 'Occupied', count: occupied },
            { key: 'full', label: 'Full', count: full },
          ].map(f => (
            <button key={f.key} className={`rm-tab ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>
              {f.label}
              <span className="rm-tab-count">{f.count}</span>
            </button>
          ))}
        </div>

        {/* Room Table */}
        <div className="rm-table-wrap">
          <table className="rm-table">
            <thead>
              <tr>
                <th>Room</th>
                <th>Floor</th>
                <th>Type</th>
                <th>Occupancy</th>
                <th>Status</th>
                <th>Monthly Rent</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map(room => {
                  const pct = room.capacity > 0 ? Math.round((room.occupied / room.capacity) * 100) : 0;
                  return (
                    <tr key={room._id}>
                      <td>
                        <div className="rm-name">Room {room.roomNumber}</div>
                        <div className="rm-id">#R{String(room.roomNumber).padStart(4, '0')}</div>
                      </td>
                      <td>Floor {room.floor}</td>
                      <td>{room.type}</td>
                      <td>
                        <div className="rm-occ-cell">
                          <div className="rm-occ-bar">
                            <div className="rm-occ-fill" style={{ width: `${pct}%`, background: getOccupancyColor(room) }} />
                          </div>
                          <span className="rm-occ-text">{room.occupied}/{room.capacity}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`rm-status ${getStatusClass(room.status)}`}>{room.status}</span>
                      </td>
                      <td className="rm-rent">₹{room.rent?.toLocaleString()}</td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={6} className="rm-empty">No rooms found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Room Modal */}
      {isModalOpen && (
        <div className="rm-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="rm-modal" onClick={e => e.stopPropagation()}>
            <h2>Add New Room</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="rm-fg">
                  <label className="rm-fl">Room Number</label>
                  <input className="rm-fi" type="text" required placeholder="e.g. 101" value={formData.roomNumber} onChange={e => setFormData({ ...formData, roomNumber: e.target.value })} />
                </div>
                <div className="rm-fg">
                  <label className="rm-fl">Floor</label>
                  <input className="rm-fi" type="number" required min="0" value={formData.floor} onChange={e => setFormData({ ...formData, floor: parseInt(e.target.value) })} />
                </div>
                <div className="rm-fg">
                  <label className="rm-fl">Capacity</label>
                  <input className="rm-fi" type="number" required min="1" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) })} />
                </div>
                <div className="rm-fg">
                  <label className="rm-fl">Monthly Rent (₹)</label>
                  <input className="rm-fi" type="number" required min="0" value={formData.rent} onChange={e => setFormData({ ...formData, rent: parseInt(e.target.value) })} />
                </div>
              </div>
              <div className="rm-fg">
                <label className="rm-fl">Room Type</label>
                <select className="rm-fi" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="Triple">Triple</option>
                  <option value="Dormitory">Dormitory</option>
                </select>
              </div>
              <div className="rm-modal-actions">
                <button type="button" className="rm-modal-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="rm-modal-save">Save Room</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
