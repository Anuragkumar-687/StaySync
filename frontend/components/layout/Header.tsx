"use client";

import { useAuth } from '@/context/AuthContext';
import { Menu } from 'lucide-react';

export default function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { user, logout } = useAuth();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        /* ══ TOPBAR ══ */
        .topbar {
          grid-column: 1 / -1; grid-row: 1;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 28px 0 24px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(7,9,26,0.75);
          backdrop-filter: blur(20px);
          z-index: 50;
        }
        .t-logo { 
          display:flex; align-items:center; 
          font-family:'Syne',sans-serif; font-weight:800; 
          font-size:1.25rem; letter-spacing:-0.03em; color: #fff;
        }

        .t-search { display:flex; align-items:center; gap:9px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:0 14px; width:260px; transition:border-color .2s,background .2s }
        .t-search:focus-within { border-color:rgba(99,102,241,0.5); background:rgba(99,102,241,0.07) }
        .t-search svg { width:13px; height:13px; color:rgba(255,255,255,0.28); flex-shrink:0 }
        .t-search input { background:transparent; border:none; outline:none; color:#fff; font-family:'Poppins',sans-serif; font-size:0.82rem; padding:9px 0; width:100% }
        .t-search input::placeholder { color:rgba(255,255,255,0.2) }

        .t-right { display:flex; align-items:center; gap:10px }
        .t-icon { width:34px; height:34px; border-radius:9px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:center; cursor:pointer; position:relative; transition:background .2s }
        .t-icon:hover { background:rgba(255,255,255,0.09) }
        .t-icon svg { width:15px; height:15px; color:rgba(255,255,255,0.5) }
        .ndot { position:absolute; top:7px; right:7px; width:6px; height:6px; border-radius:50%; background:#f87171; border:1.5px solid #07091a }
        .t-sep { width:1px; height:22px; background:rgba(255,255,255,0.09) }
        .t-user { display:flex; align-items:center; gap:10px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:6px 14px 6px 7px; cursor:pointer; transition:background .2s }
        .t-user:hover { background:rgba(255,255,255,0.08) }
        .t-av { width:28px; height:28px; border-radius:8px; background:linear-gradient(135deg,#6366f1,#8b5cf6); display:flex; align-items:center; justify-content:center; font-family:'Poppins',sans-serif; font-weight:800; font-size:0.7rem; color:#fff; flex-shrink:0 }
        .t-uname { font-size:0.8rem; font-weight:500; color:#fff }
        .t-role { font-size:0.62rem; color:#818cf8; font-weight:500; letter-spacing:.05em; text-transform:uppercase }
        .t-logout { display:flex; align-items:center; gap:6px; background:transparent; border:none; cursor:pointer; color:rgba(255,255,255,0.38); font-family:'Poppins',sans-serif; font-size:0.78rem; font-weight:500; padding:7px 10px; border-radius:8px; transition:color .2s,background .2s }
        .t-logout:hover { color:#f87171; background:rgba(248,113,113,0.08) }
        .t-logout svg { width:13px; height:13px }

        @media (max-width: 768px) {
          .t-search { display: none; }
          .t-logo { display: none; }
        }
      `}} />
      <header className="topbar">
        <div className="flex items-center gap-4">
          <button onClick={toggleSidebar} className="lg:hidden text-slate-400 hover:text-white transition-colors">
            <Menu className="h-6 w-6" />
          </button>
          <div className="t-logo hidden lg:flex">
            StaySync
          </div>
        </div>
        
        <div className="t-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Search students, rooms, payments…" />
        </div>
        
        <div className="t-right">
          <div className="t-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
            <div className="ndot"></div>
          </div>
          <div className="t-sep hidden sm:block"></div>
          <div className="t-user hidden sm:flex">
            <div className="t-av">{user?.name?.charAt(0).toUpperCase() || 'U'}</div>
            <div>
              <div className="t-uname">{user?.name || 'User'}</div>
              <div className="t-role">{user?.role || 'Guest'}</div>
            </div>
          </div>
          <button className="t-logout" onClick={logout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>
    </>
  );
}
