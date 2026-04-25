"use client";

import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import ProtectedRoute from '../ProtectedRoute';

export default function DashboardLayout({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: ('student' | 'admin')[];
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Can be used for mobile toggle later if needed

  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        
        /* Reset basic elements to match exactly inside the dashboard layout */
        .dash-container *, .dash-container *::before, .dash-container *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        .dash-container {
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
          background: #07091a;
          color: #fff;
          position: relative;
        }

        /* ══ BG ══ */
        .dash-container .bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
        .dash-container .bg::before {
          content: ''; position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 60% 55% at 75% 5%, rgba(99,102,241,0.16) 0%, transparent 65%),
            radial-gradient(ellipse 45% 45% at 5% 90%, rgba(139,92,246,0.11) 0%, transparent 60%),
            radial-gradient(ellipse 35% 35% at 55% 55%, rgba(59,130,246,0.07) 0%, transparent 55%),
            #07091a;
        }
        .dash-container .aurora { position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, #6366f1 30%, #8b5cf6 55%, #3b82f6 78%, transparent); opacity: .9; }
        .dash-container .dots { position: absolute; inset: 0; background-image: radial-gradient(rgba(255,255,255,0.045) 1px, transparent 1px); background-size: 32px 32px; mask-image: radial-gradient(ellipse 85% 85% at 50% 50%, black 15%, transparent 100%); }
        .dash-container .orb { position: absolute; border-radius: 50%; filter: blur(100px); }
        .dash-container .o1 { width: 560px; height: 560px; background: rgba(99,102,241,0.11); top: -180px; right: -60px; animation: fa 18s ease-in-out infinite alternate; }
        .dash-container .o2 { width: 320px; height: 320px; background: rgba(139,92,246,0.09); bottom: -100px; left: 160px; animation: fb 22s ease-in-out infinite alternate; }
        @keyframes fa { to { transform: translate(-50px, 70px) scale(1.08); } }
        @keyframes fb { to { transform: translate(60px, -40px) scale(1.04); } }

        /* ══ APP GRID ══ */
        .dash-container .app { position: relative; z-index: 10; height: 100vh; width: 100vw; display: grid; grid-template-columns: 240px 1fr; grid-template-rows: 62px 1fr; overflow: hidden; }

        /* ══ MAIN CONTENT ══ */
        .dash-container .main { grid-column: 2; grid-row: 2; overflow-y: auto; overflow-x: hidden; padding: 48px 56px; min-height: 0; }
        .dash-container .main::-webkit-scrollbar { width: 6px; }
        .dash-container .main::-webkit-scrollbar-track { background: transparent; }
        .dash-container .main::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
        .dash-container .main::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

        @media (max-width: 1024px) {
          .dash-container .app { grid-template-columns: 1fr; }
          .dash-container .sidebar { display: none; }
          .dash-container .main { grid-column: 1; padding: 20px 16px; }
        }
      `}} />

      <div className="dash-container">
        <div className="bg">
          <div className="aurora"></div>
          <div className="dots"></div>
          <div className="orb o1"></div>
          <div className="orb o2"></div>
        </div>

        <div className="app">
          <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <Sidebar isOpen={sidebarOpen} />
          
          {/* Main Content Area */}
          <main className="main">
            {children}
          </main>
          
        </div>

        {/* Mobile Sidebar Overlay (optional for later) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-gray-900 bg-opacity-50 z-[40] lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
