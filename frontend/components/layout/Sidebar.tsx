"use client";

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Building, MessageSquare, CreditCard, Bell, Settings, ClipboardList } from 'lucide-react';

const ADMIN_LINKS = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
  { name: 'Students', href: '/admin/students', icon: Users },
  { name: 'Rooms', href: '/admin/rooms', icon: Building },
  { name: 'Complaints', href: '/admin/complaints', icon: MessageSquare },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
  { name: 'Leave Requests', href: '/admin/leaves', icon: ClipboardList },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell },
];

const STUDENT_LINKS = [
  { name: 'Dashboard', href: '/student/dashboard', icon: Home },
  { name: 'Complaints', href: '/student/complaints', icon: MessageSquare },
  { name: 'Payments', href: '/student/payments', icon: CreditCard },
  { name: 'Leave / Gate Pass', href: '/student/leaves', icon: ClipboardList },
];

export default function Sidebar({ isOpen }: { isOpen: boolean }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const links = user?.role === 'admin' ? ADMIN_LINKS : STUDENT_LINKS;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        /* ══ SIDEBAR ══ */
        .sidebar {
          grid-column: 1; grid-row: 2;
          border-right: 1px solid rgba(255,255,255,0.06);
          background: rgba(7,9,26,0.55);
          backdrop-filter: blur(14px);
          padding: 24px 14px 20px;
          display: flex; flex-direction: column;
          gap: 2px; overflow-y: auto; overflow-x: hidden;
        }
        .s-section { font-size:0.61rem; font-weight:600; color:rgba(255,255,255,0.22); letter-spacing:.1em; text-transform:uppercase; padding:0 12px; margin:14px 0 6px }
        .s-section:first-child { margin-top:0 }
        .s-item { display:flex; align-items:center; gap:11px; padding:10px 14px; border-radius:11px; cursor:pointer; text-decoration:none; color:rgba(255,255,255,0.4); font-size:0.83rem; font-weight:400; transition:all .2s; position:relative; border:1px solid transparent }
        .s-item svg { width:16px; height:16px; flex-shrink:0 }
        .s-item:hover { background:rgba(255,255,255,0.05); color:rgba(255,255,255,0.75) }
        .s-item.on { background:rgba(99,102,241,0.14); color:#c7d2fe; border-color:rgba(99,102,241,0.22) }
        .s-item.on::before { content:''; position:absolute; left:-1px; top:22%; bottom:22%; width:2.5px; border-radius:0 2px 2px 0; background:linear-gradient(180deg,#6366f1,#8b5cf6) }
        .s-item.on svg { color:#818cf8 }
        .s-pip { margin-left:auto; padding:2px 8px; border-radius:20px; font-size:0.64rem; font-weight:600 }
        .pip-indigo { background:rgba(99,102,241,0.2); color:#a5b4fc }
        .pip-red { background:rgba(248,113,113,0.18); color:#fca5a5 }

        .s-gap { flex:1 }
        .s-helpcard { background:rgba(99,102,241,0.09); border:1px solid rgba(99,102,241,0.18); border-radius:13px; padding:16px 14px; position:relative; overflow:hidden }
        .s-helpcard::after { content:''; position:absolute; top:-30px; right:-30px; width:100px; height:100px; border-radius:50%; background:rgba(99,102,241,0.14); filter:blur(24px) }
        .s-helpcard h4 { font-size:0.82rem; font-weight:600; color:#c7d2fe; margin-bottom:5px }
        .s-helpcard p { font-size:0.71rem; color:rgba(255,255,255,0.35); line-height:1.55; margin-bottom:11px }
        .s-hbtn { width:100%; background:rgba(99,102,241,0.22); border:1px solid rgba(99,102,241,0.32); border-radius:8px; padding:8px; color:#a5b4fc; font-family:'Poppins',sans-serif; font-size:0.75rem; font-weight:600; cursor:pointer; transition:background .2s }
        .s-hbtn:hover { background:rgba(99,102,241,0.32) }

        /* Hide scrollbar for sidebar */
        .sidebar::-webkit-scrollbar { width: 0px; background: transparent; }
        
        @media (max-width: 1024px) {
          .sidebar.mobile-open {
            display: flex;
            position: fixed;
            top: 62px;
            bottom: 0;
            left: 0;
            z-index: 50;
            width: 240px;
            background: #07091a;
          }
        }
      `}} />
      <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
        <div className="s-section">Main Menu</div>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`s-item ${isActive ? 'on' : ''}`}
            >
              <Icon />
              {link.name}
            </Link>
          );
        })}

        {user?.role === 'admin' && (
          <>
            <div className="s-section mt-4">System</div>
            <Link href="#" className="s-item">
              <Settings />
              Settings
            </Link>
          </>
        )}
        
        <div className="s-gap"></div>
        <div className="s-helpcard z-10">
          <h4>Need Help?</h4>
          <p>Contact hostel administration for urgent assistance.</p>
          <a href="mailto:admin@staysync.com?subject=Urgent%20Assistance%20Requested" className="s-hbtn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}>Contact Admin</a>
        </div>
      </aside>
    </>
  );
}
