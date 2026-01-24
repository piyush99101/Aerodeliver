import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import Footer from '../components/Footer';
import BackgroundClouds from '../components/BackgroundClouds';
import Header from '../components/Header';

const Login: React.FC = () => {
  const [role, setRole] = useState<'customer' | 'owner'>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [scrolled, setScrolled] = useState(false);

  const { login, signInWithGoogle, loading, user } = useAuth();
  const navigate = useNavigate();
  const [googleLoading, setGoogleLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate(user.role === 'customer' ? '/customer/dashboard' : '/owner/dashboard');
    }
  }, [user, loading, navigate]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Pass password to login function
    const result = await login(email, password, role);

    if (result.success) {
      // Navigation happens in useEffect or automatically via state change, 
      // but explicit push here ensures immediate response after await
      navigate(role === 'customer' ? '/customer/dashboard' : '/owner/dashboard');
    } else {
      setError(result.message || 'Invalid email or password. Please check your credentials or Sign Up.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      setError('');
      await signInWithGoogle(role);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      setGoogleLoading(false);
    }
  };

  // Prevent flashing of login form if we are checking session
  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-400 to-blue-600">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 to-blue-600 font-sans text-slate-900 overflow-x-hidden selection:bg-white selection:text-blue-600">
      <Header />

      {/* Floating Clouds Background */}
      <BackgroundClouds />

      {/* Main Content */}
      <main className="relative flex items-center justify-center min-h-screen py-20 px-4">
        <div className="w-full max-w-md relative z-10">
          {/* Glassmorphic Card */}
          <div className="bg-white/40 backdrop-blur-2xl border border-white/70 rounded-[2.5rem] shadow-2xl shadow-blue-900/20 p-8 md:p-10">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-black text-slate-800 mb-3 tracking-tight">
                Welcome <span className="text-blue-600">Back</span>
              </h2>
              <p className="text-slate-600 font-medium">Sign in to continue your journey</p>
            </div>

            {/* Role Selector */}
            <div className="flex bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl mb-6 border border-white/60">
              <button
                onClick={() => setRole('customer')}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${role === 'customer'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Customer
              </button>
              <button
                onClick={() => setRole('owner')}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${role === 'owner'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Drone Owner
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50/90 backdrop-blur-sm border border-red-200 text-red-700 text-sm p-4 rounded-xl mb-6 font-medium">
                <i className="fas fa-exclamation-circle mr-2"></i>
                {error}
              </div>
            )}

            {/* Login Form */}
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
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-white/60 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fas fa-spinner fa-spin"></i>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign In
                    <i className="fas fa-arrow-right"></i>
                  </span>
                )}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/30"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 text-slate-600 font-bold bg-transparent backdrop-blur-sm">OR</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading || googleLoading}
                className="w-full bg-white/40 backdrop-blur-md border border-white/60 text-slate-800 py-4 rounded-xl font-bold text-lg shadow-md hover:bg-white/60 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95"
              >
                {googleLoading ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
                )}
                <span>Continue with Google</span>
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center text-sm font-medium text-slate-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-600 font-bold hover:text-blue-700 hover:underline transition-colors">
                Sign up now
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;