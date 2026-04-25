"use client";

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function VerifyGatePassContent() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [manualToken, setManualToken] = useState('');

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const verify = useCallback(async (token: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/leaves/verify/${token}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ valid: false, message: 'Network error. Could not verify.' });
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verify(token);
    } else {
      setLoading(false);
    }
  }, [searchParams, verify]);

  const handleManualVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualToken.trim()) {
      verify(manualToken.trim());
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing:border-box; margin:0; padding:0 }
        body { background:#07091a; font-family:'DM Sans',sans-serif; min-height:100vh }
        .gp-page { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:20px; position:relative; overflow:hidden }
        .gp-page::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse 60% 55% at 50% 30%, rgba(99,102,241,0.12) 0%, transparent 65%), #07091a; z-index:0 }
        .gp-card { position:relative; z-index:1; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:24px; padding:40px 36px; max-width:440px; width:100%; text-align:center; backdrop-filter:blur(12px) }
        .gp-logo { font-family:'Syne',sans-serif; font-weight:800; font-size:1.5rem; color:#fff; margin-bottom:4px; letter-spacing:-0.03em }
        .gp-sub { font-size:0.78rem; color:rgba(255,255,255,0.35); margin-bottom:28px }

        .gp-valid { border-color:rgba(52,211,153,0.3); box-shadow:0 0 40px rgba(52,211,153,0.1) }
        .gp-invalid { border-color:rgba(248,113,113,0.3); box-shadow:0 0 40px rgba(248,113,113,0.1) }

        .gp-icon { width:80px; height:80px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; font-size:2.2rem }
        .gp-icon-ok { background:rgba(52,211,153,0.15); color:#34d399 }
        .gp-icon-fail { background:rgba(248,113,113,0.15); color:#f87171 }

        .gp-msg { font-size:1.1rem; font-weight:700; color:#fff; margin-bottom:8px }
        .gp-desc { font-size:0.83rem; color:rgba(255,255,255,0.45); margin-bottom:24px }

        .gp-details { text-align:left; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.06); border-radius:14px; padding:18px 20px; margin-bottom:16px }
        .gp-row { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.04); font-size:0.82rem }
        .gp-row:last-child { border-bottom:none }
        .gp-label { color:rgba(255,255,255,0.4); font-weight:500 }
        .gp-value { color:#fff; font-weight:600 }

        .gp-form { display:flex; gap:8px; margin-top:16px }
        .gp-input { flex:1; padding:12px 16px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-radius:10px; color:#fff; font-size:0.85rem; outline:none }
        .gp-input:focus { border-color:rgba(99,102,241,0.5) }
        .gp-verify-btn { padding:12px 20px; background:linear-gradient(135deg,#6366f1,#8b5cf6); border:none; border-radius:10px; color:#fff; font-weight:600; font-size:0.83rem; cursor:pointer; transition:all .2s }
        .gp-verify-btn:hover { box-shadow:0 0 20px rgba(99,102,241,0.4) }

        .gp-loading { color:rgba(255,255,255,0.4); font-size:0.9rem; padding:40px 0 }

        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.5 } }
        .gp-loading { animation:pulse 1.5s ease-in-out infinite }
      `}} />

      <div className="gp-page">
        <div className={`gp-card ${result ? (result.valid ? 'gp-valid' : 'gp-invalid') : ''}`}>
          <div className="gp-logo">StaySync</div>
          <div className="gp-sub">Gate Pass Verification System</div>

          {loading ? (
            <div className="gp-loading">Verifying gate pass…</div>
          ) : result ? (
            <>
              <div className={`gp-icon ${result.valid ? 'gp-icon-ok' : 'gp-icon-fail'}`}>
                {result.valid ? '✓' : '✗'}
              </div>
              <div className="gp-msg">{result.valid ? 'APPROVED' : 'NOT VALID'}</div>
              <div className="gp-desc">{result.message}</div>

              {result.data && (
                <div className="gp-details">
                  {result.data.studentName && (
                    <div className="gp-row"><span className="gp-label">Student</span><span className="gp-value">{result.data.studentName}</span></div>
                  )}
                  {result.data.room && (
                    <div className="gp-row"><span className="gp-label">Room</span><span className="gp-value">{result.data.room}</span></div>
                  )}
                  {result.data.phone && (
                    <div className="gp-row"><span className="gp-label">Phone</span><span className="gp-value">{result.data.phone}</span></div>
                  )}
                  {result.data.reason && (
                    <div className="gp-row"><span className="gp-label">Reason</span><span className="gp-value">{result.data.reason}</span></div>
                  )}
                  {result.data.departureDate && (
                    <div className="gp-row"><span className="gp-label">Departure</span><span className="gp-value">{new Date(result.data.departureDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span></div>
                  )}
                  {result.data.returnDate && (
                    <div className="gp-row"><span className="gp-label">Return</span><span className="gp-value">{new Date(result.data.returnDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span></div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{ fontSize:'0.9rem', color:'rgba(255,255,255,0.5)', marginBottom:'16px' }}>
                Scan a student&apos;s QR code or enter the token manually:
              </div>
              <form className="gp-form" onSubmit={handleManualVerify}>
                <input className="gp-input" placeholder="Enter gate pass token…" value={manualToken} onChange={(e) => setManualToken(e.target.value)} />
                <button type="submit" className="gp-verify-btn">Verify</button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function VerifyGatePass() {
  return (
    <Suspense fallback={<div className="gp-page"><div className="gp-loading">Loading...</div></div>}>
      <VerifyGatePassContent />
    </Suspense>
  );
}
