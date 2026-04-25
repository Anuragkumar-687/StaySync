"use client";

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';

export default function StudentLeaves() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ reason: '', departureDate: '', returnDate: '' });
  const [submitting, setSubmitting] = useState(false);
  const [selectedQR, setSelectedQR] = useState<any>(null);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const { data } = await api.get('/leaves/my-leaves');
      setLeaves(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/leaves/apply', form);
      toast.success('Leave request submitted!');
      setForm({ reason: '', departureDate: '', returnDate: '' });
      setShowForm(false);
      fetchLeaves();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Approved': return 'lv-badge-approved';
      case 'Rejected': return 'lv-badge-rejected';
      default: return 'lv-badge-pending';
    }
  };

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  return (
    <DashboardLayout allowedRoles={['student']}>
      <style dangerouslySetInnerHTML={{ __html: `
        .lv-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:28px; flex-wrap:wrap; gap:12px }
        .lv-header h1 { font-family:'Syne',sans-serif; font-weight:800; font-size:1.6rem; letter-spacing:-0.035em; color:#fff }
        .lv-header p { font-size:0.83rem; color:rgba(255,255,255,0.38) }
        .lv-apply-btn { display:flex; align-items:center; gap:8px; background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; border:none; border-radius:10px; padding:10px 20px; font-size:0.83rem; font-weight:600; cursor:pointer; box-shadow:0 0 22px rgba(99,102,241,0.38); transition:all .2s; white-space:nowrap }
        .lv-apply-btn:hover { box-shadow:0 0 34px rgba(99,102,241,0.52); transform:translateY(-1px) }
        .lv-apply-btn:disabled { opacity:0.5; cursor:not-allowed }

        .lv-form-card { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:24px; margin-bottom:24px; animation:fadeIn .3s ease }
        .lv-form-card h3 { font-family:'Syne',sans-serif; font-weight:700; font-size:1rem; color:#fff; margin-bottom:16px }
        .lv-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px }
        .lv-field { display:flex; flex-direction:column; gap:6px }
        .lv-field.full { grid-column:1/-1 }
        .lv-field label { font-size:0.75rem; font-weight:600; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:0.06em }
        .lv-field input, .lv-field textarea { background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:10px 14px; color:#fff; font-size:0.85rem; outline:none; transition:border-color .2s; font-family:inherit }
        .lv-field input:focus, .lv-field textarea:focus { border-color:rgba(99,102,241,0.5) }
        .lv-field textarea { resize:vertical; min-height:80px }
        .lv-form-actions { display:flex; gap:10px; margin-top:16px }
        .lv-cancel-btn { padding:10px 20px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-radius:10px; color:rgba(255,255,255,0.6); font-size:0.83rem; font-weight:500; cursor:pointer; transition:all .2s }
        .lv-cancel-btn:hover { background:rgba(255,255,255,0.1) }

        .lv-list { display:flex; flex-direction:column; gap:10px }
        .lv-card { background:rgba(255,255,255,0.035); border:1px solid rgba(255,255,255,0.07); border-radius:14px; padding:18px 22px; display:flex; align-items:center; gap:18px; transition:all .22s }
        .lv-card:hover { border-color:rgba(99,102,241,0.2); transform:translateY(-2px) }
        .lv-card-body { flex:1; min-width:0 }
        .lv-card-reason { font-size:0.88rem; font-weight:600; color:#fff; margin-bottom:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis }
        .lv-card-dates { font-size:0.76rem; color:rgba(255,255,255,0.4) }
        .lv-badge { display:inline-flex; padding:4px 12px; border-radius:20px; font-size:0.72rem; font-weight:600 }
        .lv-badge-approved { background:rgba(52,211,153,0.12); color:#34d399 }
        .lv-badge-rejected { background:rgba(248,113,113,0.12); color:#f87171 }
        .lv-badge-pending { background:rgba(251,191,36,0.12); color:#fbbf24 }
        .lv-qr-btn { padding:6px 14px; background:rgba(99,102,241,0.15); border:1px solid rgba(99,102,241,0.3); border-radius:8px; color:#a5b4fc; font-size:0.75rem; font-weight:600; cursor:pointer; transition:all .2s; white-space:nowrap }
        .lv-qr-btn:hover { background:rgba(99,102,241,0.25) }
        .lv-empty { text-align:center; padding:60px 20px; color:rgba(255,255,255,0.3); font-size:0.88rem }

        .qr-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.7); backdrop-filter:blur(6px); z-index:1000; display:flex; align-items:center; justify-content:center }
        .qr-modal { background:#0f1129; border:1px solid rgba(255,255,255,0.1); border-radius:20px; padding:32px; text-align:center; max-width:380px; width:90%; animation:scaleIn .25s ease }
        .qr-modal h3 { font-family:'Syne',sans-serif; font-weight:700; color:#fff; margin-bottom:6px }
        .qr-modal p { font-size:0.78rem; color:rgba(255,255,255,0.4); margin-bottom:20px }
        .qr-wrap { background:#fff; border-radius:16px; padding:24px; display:inline-block; margin-bottom:16px }
        .qr-info { font-size:0.72rem; color:rgba(255,255,255,0.35); margin-bottom:16px }
        .qr-close { padding:10px 28px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.12); border-radius:10px; color:#fff; font-size:0.83rem; font-weight:500; cursor:pointer; transition:all .2s }
        .qr-close:hover { background:rgba(255,255,255,0.14) }

        @keyframes fadeIn { from { opacity:0; transform:translateY(-10px) } to { opacity:1; transform:translateY(0) } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.9) } to { opacity:1; transform:scale(1) } }
        @keyframes up { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        .lv-card { animation:up .4s ease both }
        .lv-card:nth-child(1) { animation-delay:.03s }
        .lv-card:nth-child(2) { animation-delay:.06s }
        .lv-card:nth-child(3) { animation-delay:.09s }

        @media (max-width:600px) {
          .lv-form-grid { grid-template-columns:1fr }
          .lv-card { flex-direction:column; align-items:flex-start; gap:12px }
        }
      `}} />

      {/* Header */}
      <div className="lv-header">
        <div>
          <h1>Leave & Gate Pass</h1>
          <p>Apply for leave and get your digital gate pass</p>
        </div>
        <button className="lv-apply-btn" onClick={() => setShowForm(!showForm)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Apply for Leave
        </button>
      </div>

      {/* Application Form */}
      {showForm && (
        <div className="lv-form-card">
          <h3>New Leave Application</h3>
          <form onSubmit={handleSubmit}>
            <div className="lv-form-grid">
              <div className="lv-field">
                <label>Departure Date</label>
                <input type="date" value={form.departureDate} onChange={(e) => setForm({...form, departureDate: e.target.value})} required />
              </div>
              <div className="lv-field">
                <label>Return Date</label>
                <input type="date" value={form.returnDate} onChange={(e) => setForm({...form, returnDate: e.target.value})} required />
              </div>
              <div className="lv-field full">
                <label>Reason</label>
                <textarea value={form.reason} onChange={(e) => setForm({...form, reason: e.target.value})} placeholder="Why do you need leave?" required />
              </div>
            </div>
            <div className="lv-form-actions">
              <button type="submit" className="lv-apply-btn" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit Request'}
              </button>
              <button type="button" className="lv-cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Leave List */}
      <div className="lv-list">
        {leaves.length > 0 ? leaves.map((leave) => (
          <div key={leave._id} className="lv-card">
            <div className="lv-card-body">
              <div className="lv-card-reason">{leave.reason}</div>
              <div className="lv-card-dates">
                {format(new Date(leave.departureDate), 'MMM d, yyyy')} → {format(new Date(leave.returnDate), 'MMM d, yyyy')}
                {leave.adminNote && <span style={{marginLeft:8, color:'rgba(255,255,255,0.25)'}}>• {leave.adminNote}</span>}
              </div>
            </div>
            <span className={`lv-badge ${getStatusClass(leave.status)}`}>{leave.status}</span>
            {leave.status === 'Approved' && leave.qrToken && (
              <button className="lv-qr-btn" onClick={() => setSelectedQR(leave)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12" style={{marginRight:4,verticalAlign:'middle'}}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                View Gate Pass
              </button>
            )}
          </div>
        )) : (
          <div className="lv-empty">No leave applications yet. Click "Apply for Leave" to get started.</div>
        )}
      </div>

      {/* QR Code Modal */}
      {selectedQR && (
        <div className="qr-overlay" onClick={() => setSelectedQR(null)}>
          <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Digital Gate Pass</h3>
            <p>Show this QR code to the security guard at the gate</p>
            <div className="qr-wrap">
              <QRCodeSVG
                value={`${API_BASE}/leaves/verify/${selectedQR.qrToken}`}
                size={200}
                level="H"
                includeMargin={false}
              />
            </div>
            <div className="qr-info">
              {format(new Date(selectedQR.departureDate), 'MMM d')} → {format(new Date(selectedQR.returnDate), 'MMM d, yyyy')}
              <br />Valid for: {selectedQR.reason}
            </div>
            <button className="qr-close" onClick={() => setSelectedQR(null)}>Close</button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
