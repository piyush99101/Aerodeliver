
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import Footer from '../components/Footer';
import BackgroundClouds from '../components/BackgroundClouds';
import { useAuth } from '../services/AuthContext';
import { useData } from '../services/DataContext';
import { supabase } from '../services/supabase';

const Contact: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const orderId = location.state?.orderId;

    const [scrolled, setScrolled] = useState(false);
    const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'sent' | 'error'>('idle');
    const { orders } = useData();

    // Direct fetch to avoid stale context data
    const [fetchedOrder, setFetchedOrder] = useState<any>(null);

    useEffect(() => {
        if (orderId) {
            const fetchOrderDetails = async () => {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('id', orderId)
                    .single();

                if (data && !error) {
                    setFetchedOrder({
                        id: data.id,
                        ownerEmail: data.owner_email,
                        ownerName: data.owner_name
                    });
                }
            };
            fetchOrderDetails();
        }
    }, [orderId]);

    // Combine context and fetched data
    const currentOrder = fetchedOrder || orders.find(o => o.id === orderId);
    const pilotEmail = currentOrder?.ownerEmail;

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        topic: orderId ? `Order #${orderId}` : 'General Inquiry',
        message: ''
    });

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Removed the useEffect for fetching pilot info

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus('submitting');

        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const templateId = import.meta.env.VITE_EMAILJS_CONTACT_TEMPLATE_ID; // Removed fallback
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

        const emailRecipient = orderId ? pilotEmail : 'support@aerodeliver.com';

        if (orderId && !pilotEmail) {
            console.error('Error: Mission contact requested but no pilot email found for order:', orderId);
            // If it's still missing after fetch, we might need to alert the user
            if (!fetchedOrder) {
                console.warn('Still waiting for order details fetch...');
            }
        }

        if (!serviceId || !templateId || !publicKey || serviceId === 'your_service_id') {
            console.warn('EmailJS is not configured. Falling back to simulation.');
            setTimeout(() => {
                setFormStatus('sent');
            }, 1500);
            return;
        }

        try {
            await emailjs.send(
                serviceId,
                templateId,
                {
                    from_name: formData.name,
                    from_email: formData.email,
                    subject: formData.topic,
                    message: formData.message,
                    to_name: pilotEmail ? `Pilot (${currentOrder?.ownerName})` : 'AeroDeliver Support',
                    pilot_email: emailRecipient, // This allows the template to use {{pilot_email}} in the "To" field
                    order_id: orderId || 'N/A'
                },
                publicKey
            );
            setFormStatus('sent');
        } catch (error) {
            console.error('EmailJS Error:', error);
            setFormStatus('error');
            alert("Failed to send message. Please try again later.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 font-sans text-slate-900 overflow-x-hidden selection:bg-white selection:text-blue-600">
            {/* Cinematic Floating Header */}
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-4 sm:px-6 ${scrolled ? 'pt-4' : 'pt-6'}`}>
                <div className={`max-w-7xl mx-auto backdrop-blur-2xl border border-white/40 rounded-[2rem] px-6 py-4 flex justify-between items-center transition-all duration-500 ${scrolled ? 'bg-white/80 shadow-[0_8px_32px_rgba(30,58,138,0.15)]' : 'bg-white/20'}`}>
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-lg shadow-blue-500/30 transform group-hover:scale-110 group-hover:rotate-6 transition-all">
                            <i className="fas fa-paper-plane text-sm"></i>
                        </div>
                        <span className="font-display font-bold text-2xl tracking-tighter text-slate-900">
                            Aero<span className="text-blue-700">Deliver</span>
                        </span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="hidden sm:flex items-center gap-2 px-5 py-2.5 text-slate-600 hover:text-slate-900 font-medium transition-colors"
                        >
                            <i className="fas fa-arrow-left text-xs"></i>
                            Back
                        </button>
                        <Link
                            to={user ? (user.role === 'customer' ? '/customer/dashboard' : '/owner/dashboard') : '/login'}
                            className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95"
                        >
                            {user ? 'Dashboard' : 'Login'}
                        </Link>
                    </div>
                </div>
            </header>

            <BackgroundClouds />

            <main className="relative pt-32 pb-20 px-4 min-h-screen flex items-center justify-center">
                {/* Decorative background element */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="container mx-auto max-w-2xl relative z-10 w-full">
                    <div className="bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-bl-[10rem] pointer-events-none"></div>

                        <div className="mb-10 relative">
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-3">
                                Connect <span className="text-blue-700">Mission Control</span>
                            </h1>
                            <p className="text-slate-700 font-medium text-lg">Secure channel for support and technical operations.</p>
                        </div>

                        {formStatus === 'sent' ? (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-10 rounded-[2rem] text-center animate-in zoom-in-95 duration-500">
                                <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-full flex items-center justify-center text-4xl mb-8 mx-auto shadow-2xl shadow-emerald-500/20">
                                    <i className="fas fa-check"></i>
                                </div>
                                <h3 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Signal Received!</h3>
                                <p className="text-slate-700 text-lg leading-relaxed">Your transmission has been logged. Mission Control will contact you at <strong>{formData.email}</strong> shortly.</p>
                                <button
                                    onClick={() => setFormStatus('idle')}
                                    className="mt-10 px-10 py-4 bg-white text-blue-600 border border-blue-100 rounded-2xl font-bold hover:shadow-lg transition-all transform hover:scale-105"
                                >
                                    New Transmission
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6 relative">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-blue-700 uppercase tracking-[0.2em] ml-1">Callsign (Name)</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-white/60 border border-white/40 rounded-2xl px-5 py-4 text-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-400 hover:bg-white/80"
                                            placeholder="Pilot Name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-blue-700 uppercase tracking-[0.2em] ml-1">Comms (Email)</label>
                                        <input
                                            required
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-white/60 border border-white/40 rounded-2xl px-5 py-4 text-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-400 hover:bg-white/80"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-blue-700 uppercase tracking-[0.2em] ml-1">Mission Objective</label>
                                    <div className="relative">
                                        <select
                                            value={formData.topic}
                                            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                            className="w-full bg-white/60 border border-white/40 rounded-2xl px-5 py-4 text-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none cursor-pointer hover:bg-white/80"
                                        >
                                            <option value="General Inquiry" className="bg-white">General Inquiry</option>
                                            <option value="Technical Issue" className="bg-white">Technical Issue</option>
                                            <option value="Urgent Mission Help" className="bg-white">Urgent Mission Help</option>
                                            {orderId && <option value={`Order #${orderId}`} className="bg-white">Current Mission (#{orderId})</option>}
                                            <option value="Other" className="bg-white">Other</option>
                                        </select>
                                        <i className="fas fa-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"></i>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-blue-700 uppercase tracking-[0.2em] ml-1">Transmission Data</label>
                                    <textarea
                                        required
                                        rows={5}
                                        placeholder="Describe your situation in detail..."
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full bg-white/60 border border-white/40 rounded-2xl px-5 py-4 text-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-400 resize-none hover:bg-white/80"
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={formStatus === 'submitting'}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 py-5 rounded-[1.25rem] font-black text-lg tracking-wider uppercase text-white hover:shadow-xl hover:shadow-blue-500/40 transform hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-4 group"
                                >
                                    {formStatus === 'submitting' ? (
                                        <>
                                            <i className="fas fa-satellite fa-spin"></i>
                                            Transmitting Signal...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-broadcast-tower group-hover:animate-pulse"></i>
                                            Dispatch Signal
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Contact;
