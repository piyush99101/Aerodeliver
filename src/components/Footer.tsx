import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <footer className="relative mt-12 pt-10 pb-8 overflow-hidden bg-white/50 backdrop-blur-2xl border-t border-white/60 shadow-2xl shadow-blue-900/10">

            {/* Decorative Light Catchers */}
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-400/10 rounded-full blur-[100px] -translate-y-1/2"></div>
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-300/10 rounded-full blur-[120px] -translate-y-1/2"></div>

            <div className="container mx-auto px-6 max-w-4xl relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
                    {/* Brand Section */}
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <Link to="/" className="flex items-center group">
                            <img src="/logo.svg" alt="AeroDeliver Logo" className="h-8 w-auto transform group-hover:scale-105 transition-transform" />
                        </Link>
                        <div className="flex gap-3">
                            {[
                                { icon: 'fa-twitter', href: '#' },
                                { icon: 'fa-instagram', href: '#' },
                                { icon: 'fa-linkedin-in', href: '#' },
                                { icon: 'fa-discord', href: '#' }
                            ].map((social, i) => (
                                <a
                                    key={i}
                                    href={social.href}
                                    className="w-8 h-8 rounded-lg bg-white/50 border border-white/60 flex items-center justify-center text-blue-950 hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm"
                                >
                                    <i className={`fab ${social.icon} text-[10px]`}></i>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Section */}
                    <div className="flex gap-10">
                        <div className="flex flex-col gap-2">
                            <h4 className="text-blue-950 font-black uppercase tracking-widest text-[10px] opacity-40">Platform</h4>
                            <div className="flex gap-4">
                                <Link to="/login" className="text-slate-800 font-bold opacity-70 hover:opacity-100 hover:text-blue-600 transition-all text-xs">Login</Link>
                                <Link to="/signup" className="text-slate-800 font-bold opacity-70 hover:opacity-100 hover:text-blue-600 transition-all text-xs">Sign Up</Link>
                                <Link to="/support" className="text-slate-800 font-bold opacity-70 hover:opacity-100 hover:text-blue-600 transition-all text-xs">Support</Link>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h4 className="text-blue-950 font-black uppercase tracking-widest text-[10px] opacity-40">Legal</h4>
                            <div className="flex gap-4">
                                <Link to="/privacy" className="text-slate-800 font-bold opacity-70 hover:opacity-100 hover:text-blue-600 transition-all text-xs">Privacy</Link>
                                <Link to="/terms" className="text-slate-800 font-bold opacity-70 hover:opacity-100 hover:text-blue-600 transition-all text-xs">Terms</Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-blue-900/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-800 text-[10px] font-black uppercase tracking-widest opacity-30">
                        &copy; {new Date().getFullYear()} AeroDeliver Inc.
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[9px] font-black text-blue-900 uppercase tracking-widest opacity-40">Network Online</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default React.memo(Footer);
