
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import BackgroundClouds from '../components/BackgroundClouds';
import Header from '../components/Header';


const TermsOfService: React.FC = () => {
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
                                Terms of <span className="text-blue-600">Service</span>
                            </h1>
                            <p className="text-slate-600 font-bold uppercase tracking-widest text-sm">
                                Last updated: {lastUpdated}
                            </p>
                        </div>

                        <div className="prose prose-slate max-w-none space-y-8 text-slate-700 font-medium leading-relaxed">
                            <p className="text-lg">
                                These Terms of Service ("Terms") govern your access to and use of the AeroDeliver platform. By using AeroDeliver, you agree to these Terms.
                            </p>

                            <section>
                                <h2 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">1</span>
                                    Nature of the Platform
                                </h2>
                                <p className="bg-white/20 p-5 rounded-2xl border border-white/40 shadow-sm">
                                    AeroDeliver is a <span className="font-bold text-blue-700">technology intermediary</span> that connects customers with independent drone owners. AeroDeliver does not operate drones and is not an air transport service provider.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">2</span>
                                    Eligibility
                                </h2>
                                <p>You must be at least 13 years old and legally capable of entering into these Terms to use the platform.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">3</span>
                                    User Accounts
                                </h2>
                                <ul className="list-none p-0 space-y-3">
                                    <li className="flex gap-4 items-start bg-white/20 p-4 rounded-xl border border-white/40">
                                        <i className="fas fa-user-shield text-blue-500 mt-1"></i>
                                        <span>Users are responsible for maintaining account security</span>
                                    </li>
                                    <li className="flex gap-4 items-start bg-white/20 p-4 rounded-xl border border-white/40">
                                        <i className="fas fa-user-slash text-red-500 mt-1"></i>
                                        <span>False or misleading information may result in suspension or termination</span>
                                    </li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">4</span>
                                    Services
                                </h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="bg-white/30 p-6 rounded-2xl border border-white/50 shadow-sm">
                                        <h3 className="text-lg font-bold text-blue-700 mb-3 flex items-center gap-2">
                                            <i className="fas fa-users text-blue-400"></i>
                                            4.1 Customers
                                        </h3>
                                        <ul className="list-disc pl-6 space-y-1 text-sm">
                                            <li>Request drone-based parcel delivery</li>
                                            <li>Ensure parcels comply with Indian laws</li>
                                        </ul>
                                    </div>
                                    <div className="bg-slate-800/90 text-white p-6 rounded-2xl border border-slate-700 shadow-xl">
                                        <h3 className="text-lg font-bold text-blue-400 mb-3 flex items-center gap-2">
                                            <i className="fas fa-helicopter text-blue-300"></i>
                                            4.2 Drone Owners
                                        </h3>
                                        <p className="text-xs text-blue-200 font-bold uppercase tracking-wider mb-3">DGCA Compliance</p>
                                        <ul className="list-disc pl-6 space-y-1 text-xs text-slate-300">
                                            <li>Drone registration on Digital Sky Platform</li>
                                            <li>Valid Remote Pilot Certificate (RPC)</li>
                                            <li>Airspace & altitude compliance</li>
                                            <li>Required permissions & approvals</li>
                                        </ul>
                                    </div>
                                </div>
                                <p className="mt-4 text-sm font-bold text-slate-900 border-l-4 border-blue-500 pl-4 py-2">
                                    Drone owners are solely responsible for safe and lawful drone operations under Drone Rules, 2021.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">5</span>
                                    Prohibited Items
                                </h2>
                                <div className="bg-red-50/50 border border-red-200 p-6 rounded-2xl flex items-center gap-6">
                                    <i className="fas fa-ban text-red-500 text-3xl"></i>
                                    <p className="font-bold text-red-800">Users must not send illegal, hazardous, or prohibited goods under Indian law.</p>
                                </div>
                            </section>

                            <section className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">6</span>
                                        Payments
                                    </h2>
                                    <p className="text-sm">Prices are shown before order confirmation. Payments are processed via trusted third-party gateways.</p>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">7</span>
                                        Cancellations
                                    </h2>
                                    <p className="text-sm">Cancellations and refunds are subject to AeroDeliver's published internal policies.</p>
                                </div>
                            </section>

                            <section className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold">8</span>
                                    Disclaimer & Liability
                                </h2>
                                <div className="space-y-4 text-slate-300 text-sm">
                                    <p><span className="text-blue-400 font-bold">Disclaimer:</span> AeroDeliver provides the platform on an "as is" basis and does not guarantee delivery outcomes or timing.</p>
                                    <p><span className="text-blue-400 font-bold">Limitation of Liability:</span> Total liability is limited to the amount paid for the service.</p>
                                </div>
                            </section>

                            <section className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 mb-4">10. Indemnity</h2>
                                    <p className="text-sm">Users agree to indemnify AeroDeliver against claims arising from misuse or violation of law.</p>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 mb-4">11. Intellectual Property</h2>
                                    <p className="text-sm">All AeroDeliver content and branding remain the exclusive property of AeroDeliver.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">13</span>
                                    Governing Law
                                </h2>
                                <p>These Terms are governed by the laws of <span className="font-bold text-slate-900 underline">India</span>. Courts in India shall have jurisdiction.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">15</span>
                                    Contact
                                </h2>
                                <div className="bg-white/30 backdrop-blur-sm border border-white/50 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div className="flex items-center gap-3">
                                        <i className="fas fa-envelope text-blue-600 text-xl"></i>
                                        <span className="font-bold text-slate-800">support@aerodeliver.com</span>
                                    </div>
                                    <button className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold hover:scale-105 transition-transform">Email Us</button>
                                </div>
                            </section>

                            <p className="text-xs text-slate-400 text-center mt-12 border-t border-slate-200/50 pt-8 italic">
                                *This document is a general template and does not constitute legal advice.*
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default TermsOfService;
