"use client";

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminNotifications() {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'Announcement',
    recipients: 'all',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/notifications', formData);
      toast.success('Notification sent successfully');
      setFormData({ ...formData, title: '', message: '' });
    } catch (err) {} finally { setLoading(false); }
  };

  const typeOptions = [
    { value: 'Announcement', label: 'Announcement', badgeClass: 'type-announcement' },
    { value: 'Maintenance', label: 'Maintenance', badgeClass: 'type-maintenance' },
    { value: 'Payment', label: 'Payment Reminder', badgeClass: 'type-payment' },
    { value: 'General', label: 'General', badgeClass: 'type-general' },
  ];

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .nt-page { font-family:'DM Sans',sans-serif; max-width:700px; margin:0 auto; padding-top:20px; }

        /* ── HEADER ── */
        .nt-header { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:48px; gap:24px }
        .nt-title { font-family:'Syne',sans-serif; font-size:32px; font-weight:800; color:#fff; letter-spacing:-0.04em; margin:0 0 6px }
        .nt-subtitle { font-size:15px; color:#6b7280; margin:0 }

        /* ── PREVIEW BADGES ── */
        .nt-filters { display:flex; gap:12px; margin-bottom:32px; flex-wrap:wrap }
        .nt-type-badge { display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:9999px; font-size:13px; font-weight:600; letter-spacing:0.02em }
        .type-announcement { background:rgba(99,102,241,0.12); color:#818cf8; border:1px solid rgba(99,102,241,0.2) }
        .type-maintenance { background:rgba(251,191,36,0.12); color:#fbbf24; border:1px solid rgba(251,191,36,0.2) }
        .type-payment { background:rgba(16,185,129,0.12); color:#34d399; border:1px solid rgba(16,185,129,0.2) }
        .type-general { background:rgba(255,255,255,0.06); color:#a1a1aa; border:1px solid rgba(255,255,255,0.1) }

        /* ── FORM CARD ── */
        .nt-form-card {
          background:rgba(255,255,255,0.02);
          border:1px solid rgba(255,255,255,0.06);
          border-radius:16px;
          padding:2.5rem 3rem;
          max-width:700px;
          animation:fadeUp .4s ease both;
        }
        
        .nt-form-group { margin-bottom:1.75rem }
        .nt-form-label { display:block; font-size:14px; font-weight:600; color:#d1d5db; margin-bottom:10px; letter-spacing:-0.01em }
        
        .nt-form-input {
          width:100%;
          background:rgba(255,255,255,0.03);
          border:1px solid rgba(255,255,255,0.08);
          border-radius:10px;
          padding:14px 18px;
          font-family:inherit;
          font-size:15px;
          color:#f0f0ec;
          outline:none;
          transition:all .2s;
          box-sizing:border-box;
        }
        .nt-form-input:focus { border-color:rgba(99,102,241,0.5); background:rgba(255,255,255,0.05); box-shadow:0 0 0 4px rgba(99,102,241,0.1) }
        .nt-form-input::placeholder { color:#4b5563 }
        
        textarea.nt-form-input { resize:vertical; min-height:160px; line-height:1.6 }
        
        select.nt-form-input {
          cursor:pointer;
          appearance:none;
          background-image:url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat:no-repeat;
          background-position:right 16px center;
          padding-right:40px;
        }
        select.nt-form-input option { background:#12131a; color:#d1d5db }

        .nt-form-submit {
          display:flex;
          align-items:center;
          justify-content:center;
          gap:8px;
          width:100%;
          background:#6366f1;
          color:#fff;
          border:none;
          border-radius:10px;
          padding:16px;
          font-family:inherit;
          font-size:15px;
          font-weight:700;
          cursor:pointer;
          transition:all .2s;
          margin-top:1rem;
          box-shadow:0 0 24px rgba(99,102,241,0.2);
          letter-spacing:0.01em;
        }
        .nt-form-submit:hover:not(:disabled) { background:#4f46e5; box-shadow:0 0 32px rgba(99,102,241,0.35); transform:translateY(-1px) }
        .nt-form-submit:disabled { opacity:0.6; cursor:not-allowed; box-shadow:none }

        /* ── ANIMATIONS ── */
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }

        /* ── RESPONSIVE ── */
        @media (max-width:768px) {
          .nt-header { flex-direction:column; align-items:flex-start }
          .nt-form-card { padding:1.5rem 1.5rem }
        }
      `}} />

      <div className="nt-page">
        {/* Header */}
        <div className="nt-header">
          <div>
            <h1 className="nt-title">Notifications</h1>
            <p className="nt-subtitle">Broadcast announcements to all students</p>
          </div>
        </div>

        {/* Type badges preview */}
        <div className="nt-filters">
          {typeOptions.map(t => (
            <span key={t.value} className={`nt-type-badge ${t.badgeClass}`}>
              {t.label}
            </span>
          ))}
        </div>

        {/* Form */}
        <div className="nt-form-card">
          <form onSubmit={handleSubmit}>
            <div className="nt-form-group">
              <label className="nt-form-label">Notification Title</label>
              <input
                className="nt-form-input"
                type="text"
                required
                placeholder="e.g. Scheduled Power Outage"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="nt-form-group">
              <label className="nt-form-label">Message Content</label>
              <textarea
                className="nt-form-input"
                required
                rows={5}
                placeholder="Type the announcement here..."
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
              />
            </div>

            <div className="nt-form-group">
              <label className="nt-form-label">Type</label>
              <select
                className="nt-form-input"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
              >
                {typeOptions.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="nt-form-submit" disabled={loading}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              {loading ? 'Sending...' : 'Send Notification to All Students'}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
