
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import Footer from '../components/Footer';
import BackgroundClouds from '../components/BackgroundClouds';
import Header from '../components/Header';

const Support: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);
    const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'sent' | 'error'>('idle');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'Delivery Status',
        message: ''
    });


    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus('submitting');

        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

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
                    subject: formData.subject,
                    message: formData.message,
                    to_name: 'AeroDeliver Support'
                },
                publicKey
            );
            setFormStatus('sent');
            setFormData({ name: '', email: '', subject: 'Delivery Status', message: '' });
        } catch (error) {
            console.error('EmailJS Error:', error);
            setFormStatus('error');
            alert("Failed to send message. Please try again later or email us directly.");
        }
    };

    const faqs = [
        {
            q: "How do I track my delivery in real-time?",
            a: "Once your order is accepted by a drone pilot, you can click 'Track Package' in your dashboard to see live GPS location, altitude, and estimated arrival time."
        },
        {
            q: "What is the maximum weight a drone can carry?",
            a: "Most of our standard fleet drones can carry up to 5kg. For heavier items, please contact us for a specialized cargo drone assignment."
        },
        {
            q: "How are the delivery fees calculated?",
            a: "Fees are based on the straight-line distance between pickup and drop-off points, the weight of the parcel, and current weather/traffic conditions."
        },
        {
            q: "Is my package insured during flight?",
            a: "Yes! Every delivery on AeroDeliver is covered by our flight insurance policy up to ₹10,000 for loss or damage."
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-400 to-blue-600 font-sans text-slate-900 overflow-x-hidden selection:bg-white selection:text-blue-600">
            <Header />

            {/* Floating Clouds Background */}
            <BackgroundClouds />

            {/* Main Content */}
            <main className="relative pt-32 pb-20 px-4">
                <div className="container mx-auto max-w-6xl relative z-10">
                    {/* Hero Header */}
                    <div className="text-center mb-16">
                        <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
                            How can we <span className="text-blue-600">help?</span>
                        </h1>
                        <p className="text-xl text-slate-700 font-medium max-w-2xl mx-auto">
                            Our support team is flying high to help you. Reach out through any of the channels below or browse our common questions.
                        </p>
                    </div>

                    {/* Support Channels Grid */}
                    <div className="grid md:grid-cols-3 gap-6 mb-16">
                        <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-[2rem] shadow-xl shadow-blue-900/10 text-center group hover:-translate-y-2 transition-transform">
                            <div className="w-16 h-16 bg-blue-500 text-white rounded-2xl flex items-center justify-center text-2xl mb-6 mx-auto shadow-lg shadow-blue-500/30">
                                <i className="fas fa-envelope"></i>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Email Us</h3>
                            <p className="text-slate-600 font-medium mb-4">Response within 2 hours</p>
                            <a href="mailto:support@aerodeliver.com" className="text-blue-600 font-black hover:underline">Support@aerodeliver.com</a>
                        </div>

                        <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-[2rem] shadow-xl shadow-blue-900/10 text-center group hover:-translate-y-2 transition-transform">
                            <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-2xl mb-6 mx-auto shadow-lg shadow-emerald-500/30">
                                <i className="fas fa-comment-dots"></i>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Live Chat</h3>
                            <p className="text-slate-600 font-medium mb-4">Available 24/7</p>
                            <div className="inline-flex items-center gap-2 bg-emerald-50 py-1 px-4 rounded-full border border-emerald-100">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                <span className="text-emerald-700 text-sm font-bold">Online Now</span>
                            </div>
                        </div>

                        <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-[2rem] shadow-xl shadow-blue-900/10 text-center group hover:-translate-y-2 transition-transform">
                            <div className="w-16 h-16 bg-indigo-500 text-white rounded-2xl flex items-center justify-center text-2xl mb-6 mx-auto shadow-lg shadow-indigo-500/30">
                                <i className="fas fa-phone"></i>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Call Pilot</h3>
                            <p className="text-slate-600 font-medium mb-4">Direct mission support</p>
                            <a href="tel:+911800-AERO-DELI" className="text-indigo-600 font-black hover:underline">+91 1800-AERO-DELI</a>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 items-start">
                        {/* Sending a Message Form */}
                        <div className="bg-slate-900 text-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-bl-[8rem] pointer-events-none"></div>
                            <h2 className="text-3xl font-black mb-2 tracking-tight">Send a <span className="text-blue-400">Message</span></h2>
                            <p className="text-slate-400 font-medium mb-8 text-sm">Have a specific issue? File a support ticket below.</p>

                            {formStatus === 'sent' ? (
                                <div className="bg-emerald-500/10 border border-emerald-500/50 p-8 rounded-2xl text-center">
                                    <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center text-3xl mb-6 mx-auto shadow-lg shadow-emerald-500/30">
                                        <i className="fas fa-check"></i>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Message Received!</h3>
                                    <p className="text-slate-300">Our team is reviewing your ticket and will respond shortly via email.</p>
                                    <button onClick={() => setFormStatus('idle')} className="mt-6 text-sm font-bold text-blue-400 hover:text-blue-300">Send another message</button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="Piyush Kharat"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-white/5 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                                            <input
                                                required
                                                type="email"
                                                placeholder="Piyush@example.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full bg-white/5 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Subject</label>
                                        <select
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="w-full bg-white/5 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="Delivery Status" className="bg-slate-900">Delivery Status</option>
                                            <option value="Payment Issue" className="bg-slate-900">Payment Issue</option>
                                            <option value="Technical Bug" className="bg-slate-900">Technical Bug</option>
                                            <option value="Other" className="bg-slate-900">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Your Message</label>
                                        <textarea
                                            required
                                            rows={4}
                                            placeholder="Describe your issue in detail..."
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="w-full bg-white/5 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={formStatus === 'submitting'}
                                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-blue-500/40 transform hover:scale-[1.01] transition-all disabled:opacity-50 disabled:hover:scale-100"
                                    >
                                        {formStatus === 'submitting' ? <i className="fas fa-circle-notch fa-spin"></i> : "Submit Support Ticket"}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* FAQs Section */}
                        <div className="space-y-6">
                            <h2 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                <i className="fas fa-question-circle text-blue-500"></i>
                                Common Questions
                            </h2>
                            <div className="space-y-4">
                                {faqs.map((faq, i) => (
                                    <div key={i} className="bg-white/50 backdrop-blur-md border border-white/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                        <h4 className="font-bold text-slate-800 text-lg mb-3 flex items-start gap-4">
                                            <span className="text-blue-600 font-mono mt-0.5">Q.</span>
                                            {faq.q}
                                        </h4>
                                        <p className="text-slate-600 font-medium pl-9 leading-relaxed">
                                            {faq.a}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Mission Status Bar */}
                            <div className="bg-white/30 border border-white p-6 rounded-[2rem] flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                                    <span className="font-bold text-slate-700">AeroDeliver Network Status</span>
                                </div>
                                <span className="text-xs font-black uppercase text-emerald-600 bg-emerald-50 py-1 px-3 rounded-full border border-emerald-100">Optimal (100%)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Support;
