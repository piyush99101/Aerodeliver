import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import Footer from '../components/Footer';
import BackgroundClouds from '../components/BackgroundClouds';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { resetPassword } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submitting forgot password request...');
        setError('');
        setMessage('');
        setIsLoading(true);

        try {
            const result = await resetPassword(email);
            console.log('Reset password result:', result);

            if (result.success) {
                setMessage('If an account exists with this email, a password reset link has been sent.');
            } else {
                setError(result.message || 'Failed to send reset email.');
            }
        } catch (err) {
            console.error('Error in ForgotPassword handleSubmit:', err);
            setError('An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-400 to-blue-600 font-sans text-slate-900 overflow-x-hidden selection:bg-white selection:text-blue-600">
            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-transparent py-6">
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-500/30 transform hover:scale-105 transition-transform">
                            <i className="fas fa-paper-plane text-sm"></i>
                        </div>
                        <span className="font-display font-bold text-2xl tracking-tighter text-slate-900">
                            Aero<span className="text-blue-600">Deliver</span>
                        </span>
                    </Link>
                    <Link
                        to="/login"
                        className="px-5 py-2.5 bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-300"
                    >
                        Back to Login
                    </Link>
                </div>
            </nav>

            <BackgroundClouds />

            <main className="relative flex items-center justify-center min-h-screen py-20 px-4">
                <div className="w-full max-w-md relative z-10">
                    <div className="bg-white/40 backdrop-blur-2xl border border-white/70 rounded-[2.5rem] shadow-2xl shadow-blue-900/20 p-8 md:p-10">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">
                                Forgot <span className="text-blue-600">Password?</span>
                            </h2>
                            <p className="text-slate-600 font-medium">Enter your email to reset your password.</p>
                        </div>

                        {error && (
                            <div className="bg-red-50/90 backdrop-blur-sm border border-red-200 text-red-700 text-sm p-4 rounded-xl mb-6 font-medium">
                                <i className="fas fa-exclamation-circle mr-2"></i>
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="bg-green-50/90 backdrop-blur-sm border border-green-200 text-green-700 text-sm p-4 rounded-xl mb-6 font-medium">
                                <i className="fas fa-check-circle mr-2"></i>
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Email address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-3.5 rounded-xl border-2 border-white/60 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <i className="fas fa-spinner fa-spin"></i>
                                        Sending Request...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        Send Reset Link
                                        <i className="fas fa-arrow-right"></i>
                                    </span>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ForgotPassword;
