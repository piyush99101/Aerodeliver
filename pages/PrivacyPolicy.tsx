
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import BackgroundClouds from '../components/BackgroundClouds';
import Header from '../components/Header';


const PrivacyPolicy: React.FC = () => {
    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const lastUpdated = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-400 to-blue-600 font-sans text-slate-900 overflow-x-hidden selection:bg-white selection:text-blue-600">
            <Header />

            {/* Floating Clouds Background */}
            <BackgroundClouds />

            {/* Main Content */}
            <main className="relative pt-32 pb-20 px-4 flex flex-col items-center">
                <div className="w-full max-w-4xl relative z-10">
                    <div className="bg-white/40 backdrop-blur-2xl border border-white/70 rounded-[2.5rem] shadow-2xl shadow-blue-900/20 p-8 md:p-12">
                        <div className="mb-10 text-center md:text-left border-b border-slate-200/50 pb-8">
                            <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-4 tracking-tight">
                                Privacy <span className="text-blue-600">Policy</span>
                            </h1>
                            <p className="text-slate-600 font-bold uppercase tracking-widest text-sm">
                                Last updated: {lastUpdated}
                            </p>
                        </div>

                        <div className="prose prose-slate max-w-none space-y-8 text-slate-700 font-medium leading-relaxed">
                            <p className="text-lg">
                                AeroDeliver ("we", "our", "us") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, store, and protect personal data in compliance with the <span className="font-bold text-blue-700 underline decoration-blue-200">Digital Personal Data Protection Act, 2023 (India)</span>.
                            </p>

                            <p className="bg-blue-50/50 border-l-4 border-blue-500 p-4 rounded-r-xl italic">
                                By using AeroDeliver, you consent to the practices described in this Privacy Policy.
                            </p>

                            <section>
                                <h2 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">1</span>
                                    Scope of This Policy
                                </h2>
                                <p>This Privacy Policy applies to all users of the AeroDeliver website, mobile application, and related services (collectively, the "Platform").</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">2</span>
                                    Personal Data We Collect
                                </h2>
                                <div className="space-y-6">
                                    <div className="bg-white/30 p-6 rounded-2xl border border-white/50 shadow-sm">
                                        <h3 className="text-lg font-bold text-blue-700 mb-3 flex items-center gap-2">
                                            <i className="fas fa-id-card text-blue-400"></i>
                                            2.1 Identity & Contact Data
                                        </h3>
                                        <ul className="list-disc pl-6 space-y-1">
                                            <li>Name</li>
                                            <li>Email address</li>
                                            <li>Phone number</li>
                                            <li>Delivery address</li>
                                        </ul>
                                    </div>

                                    <div className="bg-white/30 p-6 rounded-2xl border border-white/50 shadow-sm">
                                        <h3 className="text-lg font-bold text-blue-700 mb-3 flex items-center gap-2">
                                            <i className="fas fa-user-lock text-blue-400"></i>
                                            2.2 Account Data
                                        </h3>
                                        <ul className="list-disc pl-6 space-y-1">
                                            <li>Username and encrypted password</li>
                                            <li>User role (Customer or Drone Owner)</li>
                                        </ul>
                                    </div>

                                    <div className="bg-white/30 p-6 rounded-2xl border border-white/50 shadow-sm">
                                        <h3 className="text-lg font-bold text-blue-700 mb-3 flex items-center gap-2">
                                            <i className="fas fa-location-crosshairs text-blue-400"></i>
                                            2.3 Location Data
                                        </h3>
                                        <p>Real-time or approximate location for delivery tracking (with consent)</p>
                                    </div>

                                    <div className="bg-white/30 p-6 rounded-2xl border border-white/50 shadow-sm">
                                        <h3 className="text-lg font-bold text-blue-700 mb-3 flex items-center gap-2">
                                            <i className="fas fa-credit-card text-blue-400"></i>
                                            2.4 Transaction Data
                                        </h3>
                                        <ul className="list-disc pl-6 space-y-1">
                                            <li>Order details and delivery history</li>
                                            <li>Payment status (payments handled by third-party gateways)</li>
                                        </ul>
                                    </div>

                                    <div className="bg-white/30 p-6 rounded-2xl border border-white/50 shadow-sm">
                                        <h3 className="text-lg font-bold text-blue-700 mb-3 flex items-center gap-2">
                                            <i className="fas fa-cog text-blue-400"></i>
                                            2.5 Automatically Collected Data
                                        </h3>
                                        <ul className="list-disc pl-6 space-y-1">
                                            <li>IP address</li>
                                            <li>Device and browser information</li>
                                            <li>Cookies and usage analytics</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">3</span>
                                    Purpose of Data Processing
                                </h2>
                                <p className="mb-4">Your personal data is processed to:</p>
                                <ul className="grid md:grid-cols-2 gap-3 list-none p-0">
                                    <li className="bg-white/20 p-4 rounded-xl border border-white/40 flex items-center gap-3">
                                        <i className="fas fa-check-circle text-emerald-500"></i>
                                        Provide and operate the Platform
                                    </li>
                                    <li className="bg-white/20 p-4 rounded-xl border border-white/40 flex items-center gap-3">
                                        <i className="fas fa-check-circle text-emerald-500"></i>
                                        Connect customers with drone owners
                                    </li>
                                    <li className="bg-white/20 p-4 rounded-xl border border-white/40 flex items-center gap-3">
                                        <i className="fas fa-check-circle text-emerald-500"></i>
                                        Track and complete deliveries
                                    </li>
                                    <li className="bg-white/20 p-4 rounded-xl border border-white/40 flex items-center gap-3">
                                        <i className="fas fa-check-circle text-emerald-500"></i>
                                        Improve performance and security
                                    </li>
                                    <li className="bg-white/20 p-4 rounded-xl border border-white/40 flex items-center gap-3">
                                        <i className="fas fa-check-circle text-emerald-500"></i>
                                        Communicate updates and support
                                    </li>
                                    <li className="bg-white/20 p-4 rounded-xl border border-white/40 flex items-center gap-3">
                                        <i className="fas fa-check-circle text-emerald-500"></i>
                                        Comply with legal obligations
                                    </li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">4</span>
                                    Consent
                                </h2>
                                <p>Personal data is processed only after obtaining <span className="font-bold text-slate-900">clear and lawful consent</span>, as required under the DPDP Act, 2023. You may withdraw your consent at any time, subject to legal obligations.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">5</span>
                                    Data Sharing
                                </h2>
                                <p className="mb-4">We do <span className="font-bold text-red-600 underline">not sell</span> personal data. Data may be shared only with:</p>
                                <ul className="space-y-3 list-none p-0">
                                    <li className="flex gap-4 items-start">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                                        <span>Drone owners or customers, strictly for delivery fulfillment</span>
                                    </li>
                                    <li className="flex gap-4 items-start">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                                        <span>Trusted service providers (hosting, analytics, payment gateways)</span>
                                    </li>
                                    <li className="flex gap-4 items-start">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                                        <span>Government or legal authorities when required by law</span>
                                    </li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">6</span>
                                    Data Security
                                </h2>
                                <p className="mb-4">We implement reasonable technical and organizational safeguards including:</p>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="bg-slate-800/80 text-white p-6 rounded-2xl shadow-xl border border-slate-700">
                                        <i className="fas fa-lock text-blue-400 text-2xl mb-4"></i>
                                        <h4 className="font-bold mb-2">Encryption</h4>
                                        <p className="text-xs text-slate-400">All sensitive info is encrypted at rest and in transit.</p>
                                    </div>
                                    <div className="bg-slate-800/80 text-white p-6 rounded-2xl shadow-xl border border-slate-700">
                                        <i className="fas fa-shield-alt text-blue-400 text-2xl mb-4"></i>
                                        <h4 className="font-bold mb-2">Access Control</h4>
                                        <p className="text-xs text-slate-400">Secure servers with restricted access protocols.</p>
                                    </div>
                                    <div className="bg-slate-800/80 text-white p-6 rounded-2xl shadow-xl border border-slate-700">
                                        <i className="fas fa-eye text-blue-400 text-2xl mb-4"></i>
                                        <h4 className="font-bold mb-2">Monitoring</h4>
                                        <p className="text-xs text-slate-400">Regular system monitoring and security audits.</p>
                                    </div>
                                </div>
                                <p className="mt-4 text-sm text-slate-500 italic">Despite safeguards, no system is completely secure.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">7</span>
                                    Data Retention
                                </h2>
                                <p>Personal data is retained only for as long as necessary to fulfill the stated purposes or comply with Indian law. Data is securely deleted or anonymized when no longer required.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">8</span>
                                    Your Rights (DPDP Act, 2023)
                                </h2>
                                <p className="mb-4">You have the right to:</p>
                                <div className="bg-white/50 rounded-2xl p-6 border border-white shadow-sm grid md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 font-bold text-slate-800">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        Access your personal data
                                    </div>
                                    <div className="flex items-center gap-3 font-bold text-slate-800">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        Correct inaccurate data
                                    </div>
                                    <div className="flex items-center gap-3 font-bold text-slate-800">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        Request erasure of data
                                    </div>
                                    <div className="flex items-center gap-3 font-bold text-slate-800">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        Withdraw consent
                                    </div>
                                    <div className="flex items-center gap-3 font-bold text-slate-800">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        Nominate a representative
                                    </div>
                                </div>
                                <p className="mt-4">Requests can be made using the contact details below.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">9</span>
                                    Children’s Data
                                </h2>
                                <p>AeroDeliver does not knowingly collect personal data from children under 13 years of age.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">10</span>
                                    Grievance Redressal
                                </h2>
                                <p>If you have concerns regarding your personal data, you may contact our grievance officer:</p>
                                <div className="mt-4 p-4 bg-white/40 rounded-xl border border-white inline-block">
                                    <strong>Email:</strong> <a href="mailto:support@aerodeliver.com" className="text-blue-600 font-bold hover:underline">support@aerodeliver.com</a>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">11</span>
                                    Changes to This Policy
                                </h2>
                                <p>We may update this Privacy Policy from time to time. Continued use of the platform indicates acceptance of the updated policy.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">12</span>
                                    Contact
                                </h2>
                                <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-bl-[4rem] group-hover:scale-110 transition-transform"></div>
                                    <h4 className="text-xl font-black mb-4 uppercase tracking-widest text-blue-400">AeroDeliver</h4>
                                    <p className="flex items-center gap-3 mb-2 font-medium">
                                        <i className="fas fa-envelope text-blue-400"></i>
                                        Email: support@aerodeliver.com
                                    </p>
                                </div>
                            </section>

                            <p className="text-xs text-slate-400 text-center mt-12 border-t border-slate-200/50 pt-8 italic">
                                *This Privacy Policy is provided for general informational purposes and does not constitute legal advice.*
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PrivacyPolicy;
