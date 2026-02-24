
import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import Footer from './Footer';
import BackgroundClouds from './BackgroundClouds';

interface LayoutProps {
  type: 'customer' | 'owner';
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ type, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const isActive = (path: string) => {
    const isCurrent = location.pathname.includes(path);
    return {
      classes: isCurrent
        ? 'bg-white/10 text-white shadow-xl shadow-blue-500/10'
        : 'text-slate-400 hover:text-white hover:bg-white/5',
      indicator: isCurrent
    };
  };

  // Scroll Animations to match Landing Page
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  const getResponsiveValues = () => {
    if (isMobile) return { top: ["12px", "8px"], pad: ["10px", "4px"], sidebarTop: ["70px", "56px"] };
    if (windowWidth < 1024) return { top: ["24px", "12px"], pad: ["12px", "6px"], sidebarTop: ["100px", "80px"] };
    if (windowWidth < 1440) return { top: ["32px", "16px"], pad: ["16px", "8px"], sidebarTop: ["120px", "90px"] };
    return { top: ["40px", "20px"], pad: ["20px", "10px"], sidebarTop: ["140px", "100px"] };
  };

  const resp = getResponsiveValues();
  const navTop = useTransform(smoothProgress, [0, 0.05], resp.top);
  const navPadding = useTransform(smoothProgress, [0, 0.05], resp.pad);
  const sidebarTop = useTransform(smoothProgress, [0, 0.05], resp.sidebarTop);

  const navPillBg = useTransform(smoothProgress, [0, 0.05], ["rgba(255, 255, 255, 0.3)", "rgba(255, 255, 255, 0.6)"]);
  const navPillBlur = useTransform(smoothProgress, [0, 0.05], ["blur(16px)", "blur(32px)"]);
  const navPillShadow = useTransform(smoothProgress, [0, 0.05], ["0 10px 40px rgba(30, 58, 138, 0.08)", "0 20px 60px rgba(30, 58, 138, 0.15)"]);
  const navPillBorder = useTransform(smoothProgress, [0, 0.05], ["rgba(255, 255, 255, 0.5)", "rgba(255, 255, 255, 0.8)"]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 to-blue-600 flex flex-col overflow-hidden selection:bg-white selection:text-blue-600">
      {/* GLOBAL BACKGROUND ELEMENTS (Unified Mist) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-blue-400/10 backdrop-blur-[2px]" />

        {/* Animated Mist Layers */}
        <motion.div
          animate={{ x: [0, 120, 0], y: [0, -60, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 -left-40 w-[800px] h-[800px] bg-white/20 rounded-full blur-[140px] opacity-60"
        />
        <motion.div
          animate={{ x: [0, -120, 0], y: [0, 80, 0], scale: [1.2, 1, 1.2] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 -right-40 w-[1000px] h-[1000px] bg-sky-200/10 rounded-full blur-[160px] opacity-40"
        />
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.15)_0%,_transparent_70%)]"
        />

        <BackgroundClouds />
      </div>

      {/* Header */}
      <motion.header
        style={{ top: navTop }}
        className="fixed left-0 right-0 z-[60] transition-colors duration-300"
      >
        <div className="container mx-auto px-4 md:px-8 max-w-[1600px]">
          <motion.div
            style={{
              backgroundColor: navPillBg,
              backdropFilter: navPillBlur,
              paddingBlock: navPadding,
              boxShadow: navPillShadow,
              borderColor: navPillBorder
            }}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex justify-between items-center h-full border rounded-full px-8"
          >
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSidebar}
                className="p-2.5 text-slate-800 hover:bg-white/40 rounded-full transition-all active:scale-95"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <div className="hidden sm:flex items-center gap-3 ml-2 border-l border-slate-300/50 pl-5">
                <Link to="/" className="relative flex items-center group overflow-hidden rounded-xl">
                  {/* Premium Hover Shine Effect */}
                  <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] z-10" />

                  <img
                    src="/logo.svg"
                    alt="AeroDeliver Logo"
                    className="h-10 w-auto transform group-hover:scale-110 group-active:scale-95 transition-all duration-500 relative z-0"
                  />
                </Link>
                <div className="hidden lg:flex items-center gap-1.5 ml-3 px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-white/20">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
                  </span>
                  <span className="text-[8px] font-black tracking-widest uppercase py-0.5">
                    {type === 'customer' ? 'Customer' : 'Partner'} Console
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative p-2.5 text-slate-700 hover:bg-white/40 rounded-full transition-all group">
                <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18.6 14.2V11a6 6 0 1 0-12 0v3.2c0 .538-.214 1.055-.595 1.395L4 17h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white"></span>
              </button>

              <div className="flex items-center gap-3 pl-3 border-l border-slate-300/50">
                <div className="hidden md:block text-right">
                  <div className="font-bold text-sm text-slate-900 leading-none">{user?.name}</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-1">Tier: Platinum</div>
                </div>
                <div className="relative group cursor-pointer">
                  <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=0D8ABC&color=fff`} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md transition-transform group-hover:scale-105" alt="User" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
                </div>
                <button onClick={logout} className="p-2.5 text-red-500 hover:bg-red-50 rounded-full transition-all hover:scale-110 active:scale-90" title="Sign Out">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.header>

      <motion.div
        style={{ paddingTop: sidebarTop }}
        className="flex flex-1 relative z-10"
      >
        {/* Sidebar */}
        <>
          {/* Mobile Overlay */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-blue-900/20 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          <motion.aside
            style={{ top: sidebarTop }}
            className={`
              fixed bottom-6 left-6 
              ${isSidebarOpen ? 'w-64' : 'w-20'} 
              bg-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem]
              transition-all duration-500 z-40 overflow-y-auto
              shadow-2xl shadow-blue-900/40
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-[120%] md:translate-x-0'}
            `}
          >
            <div className="p-6">
              <nav className="space-y-2">
                {type === 'customer' ? (
                  <>
                    <Link
                      to="/customer/dashboard"
                      title={!isSidebarOpen ? "Dashboard" : ""}
                      className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-semibold transition-all relative group/item ${isActive('/dashboard').classes} ${!isSidebarOpen ? 'justify-center px-0' : ''}`}
                    >
                      {isActive('/dashboard').indicator && (
                        <div className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_10px_#3b82f6]" />
                      )}
                      <svg className="w-5 h-5 flex-shrink-0 transition-transform group-hover/item:scale-110" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0zm9-5v6l4 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      <span className={`transition-all duration-300 whitespace-nowrap ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 md:hidden'}`}>Dashboard</span>
                    </Link>
                    <Link
                      to="/customer/book"
                      title={!isSidebarOpen ? "Book Delivery" : ""}
                      className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-semibold transition-all relative group/item ${isActive('/book').classes} ${!isSidebarOpen ? 'justify-center px-0' : ''}`}
                    >
                      {isActive('/book').indicator && (
                        <div className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_10px_#3b82f6]" />
                      )}
                      <svg className="w-5 h-5 flex-shrink-0 transition-transform group-hover/item:scale-110" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      <span className={`transition-all duration-300 whitespace-nowrap ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 md:hidden'}`}>Book Delivery</span>
                    </Link>
                    <Link
                      to="/customer/orders"
                      title={!isSidebarOpen ? "My Orders" : ""}
                      className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-semibold transition-all relative group/item ${isActive('/orders').classes} ${!isSidebarOpen ? 'justify-center px-0' : ''}`}
                    >
                      {isActive('/orders').indicator && (
                        <div className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_10px_#3b82f6]" />
                      )}
                      <svg className="w-5 h-5 flex-shrink-0 transition-transform group-hover/item:scale-110" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="7" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.2" /></svg>
                      <span className={`transition-all duration-300 whitespace-nowrap ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 md:hidden'}`}>My Orders</span>
                    </Link>
                    <Link
                      to="/customer/profile"
                      title={!isSidebarOpen ? "Profile" : ""}
                      className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-semibold transition-all relative group/item ${isActive('/profile').classes} ${!isSidebarOpen ? 'justify-center px-0' : ''}`}
                    >
                      {isActive('/profile').indicator && (
                        <div className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_10px_#3b82f6]" />
                      )}
                      <svg className="w-5 h-5 flex-shrink-0 transition-transform group-hover/item:scale-110" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.2" /></svg>
                      <span className={`transition-all duration-300 whitespace-nowrap ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 md:hidden'}`}>Profile</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/owner/dashboard"
                      title={!isSidebarOpen ? "Dashboard" : ""}
                      className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-semibold transition-all relative group/item ${isActive('/dashboard').classes} ${!isSidebarOpen ? 'justify-center px-0' : ''}`}
                    >
                      {isActive('/dashboard').indicator && (
                        <div className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_10px_#3b82f6]" />
                      )}
                      <svg className="w-5 h-5 flex-shrink-0 transition-transform group-hover/item:scale-110" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0zm9-5v6l4 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      <span className={`transition-all duration-300 whitespace-nowrap ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 md:hidden'}`}>Dashboard</span>
                    </Link>
                    <Link
                      to="/owner/drones"
                      title={!isSidebarOpen ? "My Drones" : ""}
                      className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-semibold transition-all relative group/item ${isActive('/drones').classes} ${!isSidebarOpen ? 'justify-center px-0' : ''}`}
                    >
                      {isActive('/drones').indicator && (
                        <div className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_10px_#3b82f6]" />
                      )}
                      <svg className="w-5 h-5 flex-shrink-0 transition-transform group-hover/item:scale-110" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2v4M8 6h8M4 12h16M6 18h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      <span className={`transition-all duration-300 whitespace-nowrap ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 md:hidden'}`}>My Drones</span>
                    </Link>
                    <Link
                      to="/owner/requests"
                      title={!isSidebarOpen ? "Requests" : ""}
                      className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-semibold transition-all relative group/item ${isActive('/requests').classes} ${!isSidebarOpen ? 'justify-center px-0' : ''}`}
                    >
                      {isActive('/requests').indicator && (
                        <div className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_10px_#3b82f6]" />
                      )}
                      <svg className="w-5 h-5 flex-shrink-0 transition-transform group-hover/item:scale-110" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      <span className={`transition-all duration-300 whitespace-nowrap ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 md:hidden'}`}>Requests</span>
                      {isSidebarOpen && <span className="ml-auto bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">5</span>}
                    </Link>
                    <Link
                      to="/owner/earnings"
                      title={!isSidebarOpen ? "Earnings" : ""}
                      className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-semibold transition-all relative group/item ${isActive('/earnings').classes} ${!isSidebarOpen ? 'justify-center px-0' : ''}`}
                    >
                      {isActive('/earnings').indicator && (
                        <div className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_10px_#3b82f6]" />
                      )}
                      <svg className="w-5 h-5 flex-shrink-0 transition-transform group-hover/item:scale-110" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3v18h18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M7 13l4-4 4 4 4-8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      <span className={`transition-all duration-300 whitespace-nowrap ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 md:hidden'}`}>Earnings</span>
                    </Link>
                    <Link
                      to="/owner/profile"
                      title={!isSidebarOpen ? "Profile" : ""}
                      className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-semibold transition-all relative group/item ${isActive('/profile').classes} ${!isSidebarOpen ? 'justify-center px-0' : ''}`}
                    >
                      {isActive('/profile').indicator && (
                        <div className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_10px_#3b82f6]" />
                      )}
                      <svg className="w-5 h-5 flex-shrink-0 transition-transform group-hover/item:scale-110" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM6 20a6 6 0 0 1 12 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      <span className={`transition-all duration-300 whitespace-nowrap ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 md:hidden'}`}>Profile</span>
                    </Link>
                  </>
                )}
              </nav>

            </div>
          </motion.aside>
        </>

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-500 overflow-x-hidden flex flex-col ${isSidebarOpen ? 'md:ml-72' : 'md:ml-32'}`}>
          <div className="flex-1 px-4 md:px-8 py-4">
            <div className="max-w-[1600px] mx-auto">
              {children}
            </div>
          </div>
          <Footer />
        </main>
      </motion.div>
    </div>
  );
};

export default Layout;
