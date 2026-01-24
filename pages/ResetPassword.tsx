import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import BackgroundClouds from '../components/BackgroundClouds';
import { supabase } from '../services/supabase';

const ResetPassword: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        const handleHashFragment = async () => {
            // Check for double hash caused by HashRouter + Supabase
            // URL looks like: http://.../#/reset-password#access_token=...
            const fullUrl = window.location.href;
            const access_token_match = fullUrl.match(/access_token=([^&]+)/);
            const refresh_token_match = fullUrl.match(/refresh_token=([^&]+)/);

            if (access_token_match && refresh_token_match) {
                console.log('Found tokens in URL manually. Setting session...');
                const access_token = access_token_match[1];
                const refresh_token = refresh_token_match[1];

                const { data, error } = await supabase.auth.setSession({
                    access_token,
                    refresh_token,
                });

                if (error) {
                    console.error('Error setting session manually:', error);
                } else if (data.session) {
                    console.log('Session set successfully:', data.session);
                    setMessage('Recovery verified. You may now reset your password.');
                }
            } else {
                // Fallback to standard check
                supabase.auth.getSession().then(({ data: { session } }) => {
                    console.log('ResetPassword mount session:', session);
                });
            }
        };

        handleHashFragment();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('ResetPassword auth event:', event, session);
            if (event === 'PASSWORD_RECOVERY') {
                setMessage('Recovery mode verified. Please set your new password.');
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            // Check session before updating
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setError('Auth session missing! The link may have expired or is invalid. Please request a new one.');
                setIsLoading(false);
                return;
            }

            // Update the user's password using Supabase
            // This works because the user is authenticated via the magic link
            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            });

            if (updateError) {
                console.error('Error updating password:', updateError);
                setError(updateError.message);
                setIsLoading(false);
                return;
            }

            setMessage('Password has been reset successfully. You will be redirected to login.');

            // Wait a moment then redirect
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err: any) {
            console.error('Unexpected error resetting password:', err);
            setError('An unexpected error occurred.');
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
                </div>
            </nav>

            <BackgroundClouds />

            <main className="relative flex items-center justify-center min-h-screen py-20 px-4">
                <div className="w-full max-w-md relative z-10">
                    <div className="bg-white/40 backdrop-blur-2xl border border-white/70 rounded-[2.5rem] shadow-2xl shadow-blue-900/20 p-8 md:p-10">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">
                                Reset <span className="text-blue-600">Password</span>
                            </h2>
                            <p className="text-slate-600 font-medium">Enter your new password below.</p>
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
                                <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-4 py-3.5 rounded-xl border-2 border-white/60 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                                    placeholder="Enter new password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Confirm Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-4 py-3.5 rounded-xl border-2 border-white/60 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                                        Resetting...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        Set New Password
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

export default ResetPassword;
