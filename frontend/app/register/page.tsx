"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Mail, Phone, Lock, Eye, EyeOff, Shield } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'student',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', formData);
      login(data.token, data.user);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@300;400;500;600&display=swap');

        .auth-wrap {
          min-height: 100vh;
          width: 100vw;
          font-family: 'Inter', sans-serif;
          background: #060b18;
          color: #fff;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: auto;
          padding: 2rem 0;
        }

        .auth-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
        .auth-bg::before {
          content: ''; position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 70% 20%, rgba(99,102,241,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 20% 80%, rgba(139,92,246,0.12) 0%, transparent 55%),
            radial-gradient(ellipse 40% 40% at 85% 75%, rgba(59,130,246,0.1) 0%, transparent 50%),
            linear-gradient(160deg, #060b18 0%, #0d1225 50%, #060b18 100%);
        }
        
        .aurora {
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent 0%, #6366f1 25%, #8b5cf6 50%, #3b82f6 75%, transparent 100%);
          opacity: 0.8;
        }
        
        .dots {
          position: absolute; inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px);
          background-size: 30px 30px;
          mask-image: radial-gradient(ellipse 90% 90% at 50% 50%, black 20%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 90% 90% at 50% 50%, black 20%, transparent 100%);
        }
        
        .orb { position: absolute; border-radius: 50%; filter: blur(90px); }
        .orb1 { width: 500px; height: 500px; background: rgba(99,102,241,0.15); top: -150px; right: 0; animation: float1 16s ease-in-out infinite alternate; }
        .orb2 { width: 350px; height: 350px; background: rgba(139,92,246,0.12); bottom: -80px; left: -50px; animation: float2 20s ease-in-out infinite alternate; }
        .orb3 { width: 250px; height: 250px; background: rgba(59,130,246,0.1); top: 30%; left: 40%; animation: float3 24s ease-in-out infinite alternate; }
        
        @keyframes float1 { to { transform: translate(-40px, 60px) scale(1.1); } }
        @keyframes float2 { to { transform: translate(60px, -40px) scale(1.05); } }
        @keyframes float3 { to { transform: translate(-30px, 40px) scale(0.9); } }

        .auth-card {
          width: 100%; max-width: 460px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 20px;
          backdrop-filter: blur(20px);
          padding: 32px 32px 28px;
          position: relative; overflow: hidden;
          z-index: 10;
          animation: fadeup 0.5s ease both;
          margin-top: 20px; margin-bottom: 20px;
        }
        
        .auth-card::before {
          content: ''; position: absolute;
          top: 0; left: 15%; right: 15%; height: 1px;
          background: linear-gradient(90deg, transparent, #6366f1 40%, #8b5cf6 60%, transparent);
        }
        
        .auth-card::after {
          content: ''; position: absolute;
          top: -60px; left: 50%; transform: translateX(-50%);
          width: 280px; height: 120px;
          background: radial-gradient(ellipse, rgba(99,102,241,0.11) 0%, transparent 70%);
          pointer-events: none;
        }

        .card-logo {
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 25px;
        }
        
        .lname {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: 1.7rem; letter-spacing: -0.04em; color: #fff;
          background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .ctitle {
          text-align: center;
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: 1.3rem; letter-spacing: -0.03em;
          color: #fff; margin-bottom: 5px;
        }
        
        .csub {
          text-align: center;
          font-size: 0.81rem; color: rgba(255,255,255,0.38);
          font-weight: 400; line-height: 1.5; margin-bottom: 20px;
        }

        .tabs {
          display: grid; grid-template-columns: 1fr 1fr;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px; padding: 3px; gap: 3px;
          margin-bottom: 20px;
        }
        
        .tab {
          border: 1px solid transparent; background: transparent;
          color: rgba(255,255,255,0.33);
          font-family: 'Inter', sans-serif; font-size: 0.83rem; font-weight: 500;
          padding: 9px 0; border-radius: 8px; cursor: pointer; text-align: center;
          transition: all 0.2s;
        }
        
        .tab.active {
          background: rgba(99,102,241,0.2); color: #c7d2fe;
          border-color: rgba(99,102,241,0.35);
          box-shadow: 0 0 16px rgba(99,102,241,0.14);
        }
        
        .tab:not(.active):hover { color: rgba(255,255,255,0.65); }

        .field { display: flex; flex-direction: column; }
        
        .field label {
          display: block; font-size: 0.69rem; font-weight: 500;
          color: rgba(255,255,255,0.36);
          letter-spacing: .06em; text-transform: uppercase;
          margin-bottom: 6px;
        }
        
        .iw {
          display: flex; align-items: center; gap: 9px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; padding: 0 13px;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        
        .iw:focus-within {
          border-color: rgba(99,102,241,0.6);
          background: rgba(99,102,241,0.07);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }
        
        .iw svg { width: 13px; height: 13px; flex-shrink: 0; color: rgba(255,255,255,0.2); transition: color 0.2s; }
        .iw:focus-within svg { color: rgba(129,140,248,0.7); }
        
        .iw input, .iw select {
          flex: 1; background: transparent; border: none; outline: none;
          color: #fff; font-family: 'Inter', sans-serif;
          font-size: 0.85rem; font-weight: 400;
          padding: 11px 0; width: 100%;
        }
        
        .iw input::placeholder { color: rgba(255,255,255,0.17); }
        
        .iw select { cursor: pointer; -webkit-appearance: none; appearance: none; }
        .iw select option { background: #0d1225; color: #fff; }
        
        .eye {
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.2); padding: 0;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          transition: color 0.2s;
        }
        
        .eye:hover, .eye.on { color: rgba(129,140,248,0.9); }

        .sub {
          width: 100%; border: none; border-radius: 10px; padding: 13px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff; font-family: 'Inter', sans-serif;
          font-size: 0.9rem; font-weight: 600; cursor: pointer;
          position: relative; overflow: hidden;
          box-shadow: 0 0 28px rgba(99,102,241,0.4);
          transition: box-shadow 0.2s, transform 0.18s, opacity 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        
        .sub:disabled { opacity: 0.7; cursor: not-allowed; }
        .sub::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.08), transparent); }
        .sub:not(:disabled):hover { box-shadow: 0 0 42px rgba(99,102,241,0.58); transform: translateY(-1px); }
        .sub svg { position: relative; z-index: 1; transition: transform 0.18s; }
        .sub:not(:disabled):hover svg { transform: translateX(3px); }

        .divider { display: flex; align-items: center; gap: 10px; margin-top: 20px; margin-bottom: 20px; }
        .div-l { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
        .div-t { font-size: 0.68rem; color: rgba(255,255,255,0.2); white-space: nowrap; }

        .sw { text-align: center; font-size: 0.78rem; color: rgba(255,255,255,0.28); }
        .sw a { color: #818cf8; text-decoration: none; font-weight: 500; transition: color 0.2s; }
        .sw a:hover { color: #a5b4fc; }
        
        .frow { display: grid; grid-template-columns: 1fr 1fr; gap: 11px; }

        @keyframes fadeup { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        
        /* Specific adjustments for smaller screens to make form responsive */
        @media (max-width: 480px) {
          .frow { grid-template-columns: 1fr; }
        }
      `}} />

      <div className="auth-wrap">
        <div className="auth-bg">
          <div className="aurora"></div>
          <div className="dots"></div>
          <div className="orb orb1"></div>
          <div className="orb orb2"></div>
          <div className="orb orb3"></div>
        </div>

        <div className="auth-card">
          <div className="card-logo">
            <div className="lname">StaySync</div>
          </div>

          <div className="ctitle">Join StaySync</div>
          <div className="csub">Create your account to start managing your hostel experience.</div>

          <div className="tabs">
            <Link href="/login" className="tab">Sign In</Link>
            <Link href="/register" className="tab active">Create Account</Link>
          </div>

          <form className="flex flex-col gap-[13px]" onSubmit={handleSubmit}>
            <div className="frow">
              <div className="field">
                <label>Full Name</label>
                <div className="iw">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
              <div className="field">
                <label>Email Address</label>
                <div className="iw">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>
                  <input
                    type="email"
                    required
                    placeholder="john@university.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="frow">
              <div className="field">
                <label>Phone Number</label>
                <div className="iw">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.09 5.18 2 2 0 015.09 3h3a2 2 0 012 1.72c.127.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L9.09 10.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 17.92z"/></svg>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="field">
                <label>Password</label>
                <div className="iw">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                  <input
                    type={showPassword ? "text" : "password"}
                    required minLength={6}
                    placeholder="Min. 6 chars"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className={`eye ${showPassword ? 'on' : ''}`}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="field">
              <label>Account Type</label>
              <div className="iw">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="student">Student Account</option>
                  <option value="admin">Administrator (Demo Only)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="sub mt-2"
            >
              <span className="relative z-10">{loading ? 'Creating Account...' : 'Complete Registration'}</span>
              {!loading && (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              )}
            </button>
          </form>
          
          <div className="divider">
            <div className="div-l"></div>
            <span className="div-t">Already have an account?</span>
            <div className="div-l"></div>
          </div>
          
          <div className="sw">
            <Link href="/login">Sign in securely →</Link>
          </div>

        </div>
      </div>
    </>
  );
}
