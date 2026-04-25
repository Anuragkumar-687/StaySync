import Link from 'next/link';

export default function Home() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        .landing-wrap {
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
          background: #060b18;
          color: #fff;
        }

        .landing-wrap *, .landing-wrap *::before, .landing-wrap *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .landing-wrap .canvas {
          position: relative;
          height: 100vh;
          width: 100vw;
          display: flex;
          flex-direction: column;
          padding: 0 60px;
          overflow: hidden;
        }

        .landing-wrap .bg-assets { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
        .landing-wrap .bg-assets::before {
          content: ''; position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 70% 20%, rgba(99,102,241,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 20% 80%, rgba(139,92,246,0.12) 0%, transparent 55%),
            radial-gradient(ellipse 40% 40% at 85% 75%, rgba(59,130,246,0.1) 0%, transparent 50%),
            linear-gradient(160deg, #060b18 0%, #0d1225 50%, #060b18 100%);
        }

        .landing-wrap .aurora {
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent 0%, #6366f1 25%, #8b5cf6 50%, #3b82f6 75%, transparent 100%);
          opacity: 0.8;
        }

        .landing-wrap .dots {
          position: absolute; inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px);
          background-size: 30px 30px;
          mask-image: radial-gradient(ellipse 90% 90% at 50% 50%, black 20%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 90% 90% at 50% 50%, black 20%, transparent 100%);
        }

        .landing-wrap .orb { position: absolute; border-radius: 50%; filter: blur(90px); }
        .landing-wrap .orb1 { width: 500px; height: 500px; background: rgba(99,102,241,0.15); top: -150px; right: 0; animation: float1 16s ease-in-out infinite alternate; }
        .landing-wrap .orb2 { width: 350px; height: 350px; background: rgba(139,92,246,0.12); bottom: -80px; left: -50px; animation: float2 20s ease-in-out infinite alternate; }
        .landing-wrap .orb3 { width: 250px; height: 250px; background: rgba(59,130,246,0.1); top: 30%; left: 40%; animation: float3 24s ease-in-out infinite alternate; }

        @keyframes float1 { to { transform: translate(-40px,60px) scale(1.1); } }
        @keyframes float2 { to { transform: translate(60px,-40px) scale(1.05); } }
        @keyframes float3 { to { transform: translate(-30px,40px) scale(0.9); } }

        .landing-wrap nav {
          position: relative; z-index: 20;
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          height: 80px;
          flex-shrink: 0;
        }

        .landing-wrap .logo {
          display: flex; align-items: center;
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: 1.5rem; letter-spacing: -0.04em; color: #fff;
        }

        .landing-wrap .nav-right { display: flex; align-items: center; gap: 12px; }
        .landing-wrap .nbtn {
          background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.8);
          border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;
          padding: 8px 18px; font-size: 0.85rem; font-weight: 500;
          font-family: 'Inter', sans-serif; cursor: pointer; text-decoration: none;
          transition: background .2s, border-color .2s;
        }
        .landing-wrap .nbtn:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); }
        .landing-wrap .nbtn-cta {
          background: linear-gradient(135deg,#6366f1,#8b5cf6);
          color: #fff; border: none; border-radius: 8px;
          padding: 9px 20px; font-size: 0.85rem; font-weight: 600; text-decoration: none;
          font-family: 'Inter', sans-serif; cursor: pointer;
          box-shadow: 0 0 20px rgba(99,102,241,0.35);
          transition: box-shadow .2s, transform .15s, opacity .2s;
        }
        .landing-wrap .nbtn-cta:hover { box-shadow: 0 0 28px rgba(99,102,241,0.5); transform: translateY(-1px); }

        .landing-wrap .main-sec {
          position: relative; z-index: 10;
          flex-grow: 1;
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; text-align: center;
          max-width: 900px; margin: 0 auto;
          width: 100%;
        }

        .landing-wrap h1 {
          font-family: 'Inter', sans-serif; font-weight: 800;
          font-size: clamp(2.5rem, 5vw, 4.5rem); line-height: 1.1; letter-spacing: -0.03em;
          color: #fff; margin-bottom: 24px;
          animation: fadeup .55s .07s ease both;
        }
        .landing-wrap h1 .hi {
          background: linear-gradient(90deg,#818cf8,#a78bfa,#60a5fa);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }

        .landing-wrap .desc {
          font-size: 1.1rem; font-weight: 400; line-height: 1.6;
          color: rgba(255,255,255,0.6); max-width: 650px;
          margin-bottom: 36px;
          animation: fadeup .55s .14s ease both;
        }

        .landing-wrap .ctas { display: flex; gap: 14px; margin-bottom: 48px; animation: fadeup .55s .21s ease both; justify-content: center; }
        .landing-wrap .cta-p {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg,#6366f1,#8b5cf6);
          color: #fff; border: none; border-radius: 10px;
          padding: 14px 28px; font-size: 0.95rem; font-weight: 600;
          font-family: 'Inter', sans-serif; cursor: pointer; text-decoration: none;
          box-shadow: 0 0 28px rgba(99,102,241,0.4);
          transition: box-shadow .2s, transform .18s, opacity .2s;
          position: relative; overflow: hidden;
        }
        .landing-wrap .cta-p::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg,rgba(255,255,255,0.1),transparent);
        }
        .landing-wrap .cta-p:hover { box-shadow: 0 0 40px rgba(99,102,241,0.55); transform: translateY(-2px); }
        .landing-wrap .cta-p svg { transition: transform .18s; position: relative; z-index: 1; }
        .landing-wrap .cta-p:hover svg { transform: translateX(3px); }

        .landing-wrap .cta-s {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.9);
          border: 1px solid rgba(255,255,255,0.15); border-radius: 10px;
          padding: 13px 28px; font-size: 0.95rem; font-weight: 500;
          font-family: 'Inter', sans-serif; cursor: pointer; text-decoration: none;
          backdrop-filter: blur(10px);
          transition: background .2s, border-color .2s, transform .18s;
        }
        .landing-wrap .cta-s:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.25); transform: translateY(-1px); }

        .landing-wrap .divider {
          width: 80%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          margin-bottom: 48px;
          animation: fadeup .55s .28s ease both;
        }

        .landing-wrap .feats { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; text-align: left; animation: fadeup .55s .35s ease both; }
        .landing-wrap .feat {
          background: transparent; border: none;
          border-radius: 16px; padding: 10px;
          position: relative; overflow: hidden;
          cursor: default;
        }
        .landing-wrap .ficon {
          width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center; margin-bottom: 16px;
        }
        
        /* Specific colors for features */
        .landing-wrap .ficon.fi-room { background: rgba(147,197,253,0.15); color: #93c5fd; }
        .landing-wrap .ficon.fi-ai { background: rgba(216,180,254,0.15); color: #d8b4fe; }
        .landing-wrap .ficon.fi-pay { background: rgba(134,239,172,0.15); color: #86efac; }
        
        .landing-wrap .feat h3 { font-size: 1.05rem; font-weight: 700; color: rgba(255,255,255,0.95); margin-bottom: 8px; letter-spacing: -0.01em; line-height: 1.3;}
        .landing-wrap .feat p { font-size: 0.9rem; line-height: 1.6; color: rgba(255,255,255,0.5); font-weight: 400; }

        .landing-wrap footer {
          position: relative; z-index: 20;
          display: flex; align-items: center; justify-content: space-between;
          border-top: 1px solid rgba(255,255,255,0.06);
          height: 60px;
          flex-shrink: 0;
        }
        .landing-wrap .flogo {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: 1.1rem; letter-spacing: -0.04em; color: rgba(255,255,255,0.7);
        }
        .landing-wrap footer p { font-size: 0.75rem; color: rgba(255,255,255,0.3); margin: 0; }

        @keyframes fadeup { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
      `}} />

      <div className="landing-wrap">
        <div className="bg-assets">
          <div className="aurora"></div>
          <div className="dots"></div>
          <div className="orb orb1"></div>
          <div className="orb orb2"></div>
          <div className="orb orb3"></div>
        </div>

        <div className="canvas">
          <nav>
            <div className="logo">
              StaySync
            </div>
            
            <div className="nav-right">
              <Link href="/login" className="nbtn">Sign In</Link>
              <Link href="/register" className="nbtn-cta">Get Started &rarr;</Link>
            </div>
          </nav>

          <div className="main-sec">
            <h1>
              Manage your properties<br />with <span className="hi">precision.</span>
            </h1>

            <p className="desc">
              StaySync is the ultimate smart hostel and PG management platform.<br/>
              Experience seamless room allocations, AI-categorized complaints, and<br/>
              effortless payment tracking.
            </p>

            <div className="ctas">
              <Link href="/register" className="cta-p">
                Get Started Now
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
              <Link href="/login" className="cta-s">Sign In to Dashboard</Link>
            </div>

            <div className="divider"></div>

            <div className="feats">
              <div className="feat">
                <div className="ficon fi-room">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                </div>
                <h3>Smart Room Management</h3>
                <p>Easily allocate, track, and manage room occupancy with real-time updates.</p>
              </div>

              <div className="feat">
                <div className="ficon fi-ai">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </div>
                <h3>AI Complaint Routing</h3>
                <p>Automatically categorize and route maintenance requests to the right department.</p>
              </div>

              <div className="feat">
                <div className="ficon fi-pay">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
                </div>
                <h3>Secure Payments</h3>
                <p>Track and manage student rent collection with a reliable ledger system.</p>
              </div>
            </div>
          </div>

          <footer>
            <div className="flogo">StaySync</div>
            <p>&copy; 2026 StaySync Inc. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </>
  );
}
