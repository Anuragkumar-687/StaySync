"use client";

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';

export default function StudentPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchPayments();
  }, []);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const fetchPayments = async () => {
    try {
      const { data } = await api.get('/payments');
      setPayments(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePayNow = async (paymentId: string) => {
    setLoadingId(paymentId);
    try {
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        toast.error('Failed to load payment gateway. Check your connection.');
        setLoadingId(null);
        return;
      }

      const { data } = await api.post(`/payments/${paymentId}/create-order`);
      const { order, key, payment } = data.data;

      const options = {
        key: key,
        amount: order.amount,
        currency: order.currency,
        name: 'StaySync',
        description: `Hostel Rent - Room ${payment.room?.roomNumber || 'N/A'}`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await api.post('/payments/verify', {
              ...response,
              paymentId
            });
            if (verifyRes.data.success) {
              toast.success('Payment successful! Invoice will be emailed shortly.');
              fetchPayments();
            }
          } catch (err) {
            toast.error('Payment verification failed. Contact admin.');
          }
        },
        prefill: {
          name: payment.student?.name || '',
          email: payment.student?.email || '',
          contact: payment.student?.phone || ''
        },
        theme: {
          color: '#6366f1'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error(response.error.description || 'Payment failed');
      });
      rzp.open();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Payment initiation failed';
      toast.error(msg);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDownloadInvoice = async (paymentId: string) => {
    try {
      const response = await api.get(`/payments/${paymentId}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Invoice downloaded!');
    } catch (err) {
      toast.error('Could not download invoice.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':    return 'badge-paid';
      case 'Pending': return 'badge-pending';
      case 'Overdue': return 'badge-overdue';
      default:        return 'badge-unalloc';
    }
  };

  const monthNames = ["", "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  const paid    = payments.filter(p => p.status === 'Paid').length;
  const pending = payments.filter(p => p.status === 'Pending').length;
  const overdue = payments.filter(p => p.status === 'Overdue').length;
  const totalRevenue = payments.filter(p => p.status === 'Paid').reduce((s, p) => s + p.amount, 0);

  return (
    <DashboardLayout allowedRoles={['student']}>
      <style dangerouslySetInnerHTML={{ __html: `
        /* ── Page Header ── */
        .pg-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:32px; gap:16px; flex-wrap:wrap }
        .pg-header-left h1 { font-size:1.6rem; font-weight:700; color:#fff; letter-spacing:-0.03em; margin-bottom:4px }
        .pg-header-left p  { font-size:0.83rem; color:rgba(255,255,255,0.38) }

        /* ── Stat Cards ── */
        .pg-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:24px }
        .pg-stat { background:rgba(255,255,255,0.035); border:1px solid rgba(255,255,255,0.07); border-radius:14px; padding:20px 22px; display:flex; flex-direction:column; gap:6px }
        .pg-stat-label { font-size:0.72rem; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:0.06em; font-weight:600 }
        .pg-stat-value { font-size:2rem; font-weight:800; color:#fff; line-height:1 }
        .pg-stat-sub   { font-size:0.75rem; color:rgba(255,255,255,0.3) }
        .sv-green  { color:#34d399 }
        .sv-yellow { color:#fbbf24 }
        .sv-red    { color:#f87171 }

        /* ── Table Panel ── */
        .pay-panel { background:rgba(255,255,255,0.035); border:1px solid rgba(255,255,255,0.07); border-radius:16px; overflow:hidden }
        .pay-thead { display:grid; grid-template-columns:2fr 1fr 1fr 1fr 1.2fr; gap:16px; padding:14px 24px; border-bottom:1px solid rgba(255,255,255,0.07); background:rgba(255,255,255,0.02) }
        .pay-th { font-size:0.7rem; font-weight:700; color:rgba(255,255,255,0.35); text-transform:uppercase; letter-spacing:0.07em }
        .pay-row { display:grid; grid-template-columns:2fr 1fr 1fr 1fr 1.2fr; gap:16px; padding:16px 24px; border-bottom:1px solid rgba(255,255,255,0.05); align-items:center; transition:background .15s }
        .pay-row:last-child { border-bottom:none }
        .pay-row:hover { background:rgba(255,255,255,0.03) }
        .pay-period-main { font-size:0.87rem; font-weight:600; color:#fff; margin-bottom:2px }
        .pay-period-sub  { font-size:0.72rem; color:rgba(255,255,255,0.3) }
        .pay-amount { font-size:0.9rem; font-weight:700; color:#fff }
        .pay-date { font-size:0.8rem; color:rgba(255,255,255,0.5) }
        .pay-empty { padding:48px; text-align:center; color:rgba(255,255,255,0.3); font-size:0.87rem }

        /* ── Badges ── */
        .pg-badge { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:9999px; font-size:0.72rem; font-weight:600; border:1px solid transparent; white-space:nowrap }
        .badge-paid    { background:rgba(52,211,153,0.12);  color:#34d399; border-color:rgba(52,211,153,0.25) }
        .badge-pending { background:rgba(251,191,36,0.12);  color:#fbbf24; border-color:rgba(251,191,36,0.25) }
        .badge-overdue { background:rgba(248,113,113,0.12); color:#f87171; border-color:rgba(248,113,113,0.25) }
        .badge-unalloc { background:rgba(255,255,255,0.06); color:#a1a1aa; border-color:rgba(255,255,255,0.1) }

        /* ── Action Buttons ── */
        .pay-actions { display:flex; gap:6px; align-items:center }
        .pay-btn { padding:6px 14px; border-radius:8px; font-size:0.72rem; font-weight:600; cursor:pointer; border:none; transition:all .2s; white-space:nowrap }
        .pay-btn-stripe { background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; box-shadow:0 0 12px rgba(99,102,241,0.25) }
        .pay-btn-stripe:hover { box-shadow:0 0 20px rgba(99,102,241,0.45); transform:translateY(-1px) }
        .pay-btn-stripe:disabled { opacity:0.5; cursor:not-allowed; transform:none }
        .pay-btn-invoice { background:rgba(52,211,153,0.12); color:#34d399; border:1px solid rgba(52,211,153,0.25) }
        .pay-btn-invoice:hover { background:rgba(52,211,153,0.2) }

        /* ── Animation ── */
        @keyframes up { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
        .pay-panel { animation:up .4s ease both }

        @media (max-width:900px) {
          .pg-stats { grid-template-columns:repeat(2,1fr) }
          .pay-thead, .pay-row { grid-template-columns:2fr 1fr 1.2fr; }
          .pay-thead .pay-th:nth-child(4),
          .pay-thead .pay-th:nth-child(3),
          .pay-row > *:nth-child(4),
          .pay-row > *:nth-child(3) { display:none }
        }
        @media (max-width:600px) {
          .pg-stats { grid-template-columns:1fr 1fr }
        }
      `}} />

      {/* Header */}
      <div className="pg-header">
        <div className="pg-header-left">
          <h1>Payment History</h1>
          <p>Track your rent payments and dues</p>
        </div>
      </div>

      {/* Stats */}
      <div className="pg-stats">
        <div className="pg-stat">
          <div className="pg-stat-label">Total Paid</div>
          <div className="pg-stat-value sv-green">₹{totalRevenue.toLocaleString()}</div>
          <div className="pg-stat-sub">lifetime payments</div>
        </div>
        <div className="pg-stat">
          <div className="pg-stat-label">Paid</div>
          <div className={`pg-stat-value ${paid > 0 ? 'sv-green' : ''}`}>{paid}</div>
          <div className="pg-stat-sub">cleared months</div>
        </div>
        <div className="pg-stat">
          <div className="pg-stat-label">Pending</div>
          <div className={`pg-stat-value ${pending > 0 ? 'sv-yellow' : ''}`}>{pending}</div>
          <div className="pg-stat-sub">awaiting payment</div>
        </div>
        <div className="pg-stat">
          <div className="pg-stat-label">Overdue</div>
          <div className={`pg-stat-value ${overdue > 0 ? 'sv-red' : ''}`}>{overdue}</div>
          <div className="pg-stat-sub">past due date</div>
        </div>
      </div>

      {/* Payment Table */}
      <div className="pay-panel">
        <div className="pay-thead">
          <div className="pay-th">Period</div>
          <div className="pay-th">Amount</div>
          <div className="pay-th">Status</div>
          <div className="pay-th">Due Date</div>
          <div className="pay-th">Actions</div>
        </div>
        {payments.length > 0 ? (
          payments.map((p) => (
            <div key={p._id} className="pay-row">
              <div>
                <div className="pay-period-main">{monthNames[p.month]} {p.year}</div>
                <div className="pay-period-sub">Monthly Rent</div>
              </div>
              <div className="pay-amount">₹{p.amount.toLocaleString()}</div>
              <div>
                <span className={`pg-badge ${getStatusBadge(p.status)}`}>{p.status}</span>
              </div>
              <div className="pay-date">
                {p.dueDate ? format(new Date(p.dueDate), 'MMM d, yyyy') : '—'}
              </div>
              <div className="pay-actions">
                {(p.status === 'Pending' || p.status === 'Overdue') && (
                  <button
                    className="pay-btn pay-btn-stripe"
                    onClick={() => handlePayNow(p._id)}
                    disabled={loadingId === p._id}
                  >
                    {loadingId === p._id ? 'Processing…' : '💳 Pay Now'}
                  </button>
                )}
                {p.status === 'Paid' && (
                  <button
                    className="pay-btn pay-btn-invoice"
                    onClick={() => handleDownloadInvoice(p._id)}
                  >
                    📄 Invoice
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="pay-empty">No payment records found.</div>
        )}
      </div>
    </DashboardLayout>
  );
}
