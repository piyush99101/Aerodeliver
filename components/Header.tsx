import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../services/AuthContext';

const Header: React.FC = () => {
    const { user, loading } = useAuth();
    const location = useLocation();
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getResponsiveValues = () => {
        if (windowWidth < 768) return { top: "8px", px: "px-4" }; // Mobile
        if (windowWidth < 1024) return { top: "12px", px: "px-6" }; // Tablet
        if (windowWidth < 1440) return { top: "16px", px: "px-8" }; // Laptop
        return { top: "20px", px: "px-8" }; // Desktop/UltraWide
    };

    const resp = getResponsiveValues();

    return (
        <nav
            className={`fixed left-0 right-0 z-[100] transition-all duration-300`}
            style={{ top: resp.top }}
        >
            <div className={`container mx-auto ${resp.px} max-w-7xl`}>
                <div
                    style={{
                        backgroundColor: "rgba(255, 255, 255, 0.35)",
                        backdropFilter: "blur(20px)",
                        boxShadow: "0 8px 32px rgba(30, 58, 138, 0.08)",
                        borderColor: "rgba(255, 255, 255, 0.5)"
                    }}
                    className="flex justify-between items-center rounded-full border px-6 md:px-8 py-3 md:py-4 transition-all"
                >
                    {/* Brand Logo */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3"
                    >
                        <Link to="/" className="relative flex items-center group overflow-hidden rounded-xl">
                            {/* Premium Hover Shine Effect */}
                            <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] z-10" />

                            <img
                                src="/logo.svg"
                                alt="AeroDeliver Logo"
                                className="h-8 md:h-10 w-auto transform group-hover:scale-110 group-active:scale-95 transition-all duration-500 relative z-0"
                            />
                        </Link>

                        {/* Launch Badge - Hidden on small mobile */}
                        <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-600/90 text-white shadow-md border border-white/20 ml-1 md:ml-2"
                        >
                            <span className="relative flex h-1.5 w-1.5 md:h-2 md:w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-emerald-400"></span>
                            </span>
                            <span className="text-[8px] md:text-[10px] font-black tracking-widest uppercase">
                                Live in Dhule
                            </span>
                        </motion.div>
                    </motion.div>

                    {/* Navigation Actions */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 md:gap-4"
                    >
                        {!user ? (
                            <>
                                <Link
                                    to="/support"
                                    className={`hidden md:block px-4 py-2 text-blue-950 font-bold text-sm tracking-tight rounded-xl hover:bg-white/40 transition-all ${location.pathname === '/support' ? 'bg-white/40' : ''}`}
                                >
                                    Support
                                </Link>
                                <Link
                                    to="/login"
                                    className={`px-4 py-2 text-blue-950 font-bold text-sm tracking-tight rounded-xl hover:bg-white/40 transition-all ${location.pathname === '/login' ? 'bg-white/40' : ''}`}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="px-5 md:px-6 py-2 md:py-2.5 bg-blue-600 text-white text-sm md:text-base font-black rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.03] active:scale-95 transition-all"
                                >
                                    Join
                                </Link>
                            </>
                        ) : (
                            <Link
                                to={user.role === 'customer' ? '/customer/dashboard' : '/owner/dashboard'}
                                className="px-5 md:px-6 py-2 md:py-2.5 bg-slate-900 text-white text-sm md:text-base font-black rounded-xl shadow-lg hover:bg-slate-800 hover:scale-[1.03] active:scale-95 transition-all flex items-center gap-2"
                            >
                                <span>Dashboard</span>
                                <i className="fas fa-arrow-right text-[10px] opacity-60"></i>
                            </Link>
                        )}
                    </motion.div>
                </div>
            </div>
        </nav>
    );
};

export default Header;
