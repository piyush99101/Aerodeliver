import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import Footer from '../components/Footer';
import BackgroundClouds from '../components/BackgroundClouds';
import Header from '../components/Header';
import { User } from '../types';

const SignUp: React.FC = () => {
  const [role, setRole] = useState<'customer' | 'owner'>('customer');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [scrolled, setScrolled] = useState(false);

  const { register, signInWithGoogle, loading, user } = useAuth();
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

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: `${firstName} ${lastName}`,
      email,
      role,
      avatar: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=0D8ABC&color=fff`
    };

    // Pass password to register function
    const result = await register(newUser, password);

    if (result.success) {
      // If we got a success but with a message (like "check email"), show it instead of navigating immediately if session is missing
      if (result.message) {
        setError(result.message); // Not really an error, but using the error box for feedback for now
        // If it was just "check email", we probably shouldn't navigate yet unless the user is actually signed in.
        // My auth logic returns success=true if user object is present. 
        // If "Confirm Email" is on, session might be null but user is created.
        if (result.message.includes('check your email')) {
          // Stay on page and show message
          return;
        }
      }

      navigate(role === 'customer' ? '/customer/dashboard' : '/owner/dashboard');
    } else {
      setError(result.message || 'User with this email already exists.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      setError('');
      await signInWithGoogle(role);
    } catch (err: any) {
      setError(err.message || 'Failed to sign up with Google');
      setGoogleLoading(false);
    }
  };

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
      <main className="relative flex items-center justify-center min-h-screen py-24 px-4">
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl w-full relative z-10">

          {/* Info Side - Glassmorphic Panel */}
          <div className="hidden lg:flex flex-col justify-center bg-white/30 backdrop-blur-2xl border border-white/60 rounded-[2.5rem] p-12 shadow-2xl shadow-blue-900/20">
            <div className="relative z-10">
              <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                Join the Future of <span className="text-blue-600">Delivery</span>
              </h2>
              <p className="text-xl mb-10 text-slate-700 font-medium leading-relaxed">
                Connect with thousands of drone pilots and customers worldwide.
              </p>
              <div className="space-y-5">
                {[
                  { icon: 'fa-bolt', text: 'Instant delivery requests' },
                  { icon: 'fa-map-location-dot', text: 'Real-time tracking' },
                  { icon: 'fa-shield-halved', text: 'Secure payments' },
                  { icon: 'fa-headset', text: '24/7 support' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                      <i className={`fas ${item.icon} text-lg`}></i>
                    </div>
                    <span className="text-lg font-semibold text-slate-800">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form Side - Glassmorphic Card */}
          <div className="bg-white/40 backdrop-blur-2xl border border-white/70 rounded-[2.5rem] shadow-2xl shadow-blue-900/20 p-8 md:p-10">
            <h1 className="text-4xl font-black text-slate-800 mb-2 text-center tracking-tight">
              Create <span className="text-blue-600">Account</span>
            </h1>
            <p className="text-center text-slate-600 font-medium mb-8">Start your journey today</p>

            {/* Role Selector */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`p-5 border-2 rounded-2xl text-center transition-all duration-300 ${role === 'customer'
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-lg shadow-blue-500/20'
                  : 'border-white/60 bg-white/30 hover:border-blue-300 hover:bg-white/40'
                  }`}
              >
                <i className="fas fa-box-open text-3xl mb-2 text-blue-600"></i>
                <div className="font-bold text-slate-800">Customer</div>
                <div className="text-xs text-slate-600 mt-1">Send packages</div>
              </button>
              <button
                type="button"
                onClick={() => setRole('owner')}
                className={`p-5 border-2 rounded-2xl text-center transition-all duration-300 ${role === 'owner'
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-lg shadow-blue-500/20'
                  : 'border-white/60 bg-white/30 hover:border-blue-300 hover:bg-white/40'
                  }`}
              >
                <i className="fas fa-helicopter text-3xl mb-2 text-blue-600"></i>
                <div className="font-bold text-slate-800">Drone Owner</div>
                <div className="text-xs text-slate-600 mt-1">Deliver packages</div>
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50/90 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 font-medium">
                <i className="fas fa-exclamation-circle mr-2"></i>
                <span>{error}</span>
              </div>
            )}

            {/* Sign Up Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">First Name</label>
                  <input
                    type="text"
                    placeholder="Piyush"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-white/60 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    placeholder="Kharat"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-white/60 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="Piyush.Kharat@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-white/60 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                <input
                  type="password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-white/60 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                  required
                />
              </div>

              {role === 'owner' && (
                <div className="pt-4 border-t-2 border-white/40">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <i className="fas fa-helicopter text-blue-600"></i>
                    Drone Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">Drone Model</label>
                      <input
                        type="text"
                        placeholder="DJI Mavic 3"
                        className="w-full px-4 py-3 rounded-xl border-2 border-white/60 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">License Number</label>
                      <input
                        type="text"
                        placeholder="FAA-123456"
                        className="w-full px-4 py-3 rounded-xl border-2 border-white/60 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] transition-all duration-300 mt-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fas fa-spinner fa-spin"></i>
                    Creating Account...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Create Account
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

            {/* Login Link */}
            <div className="mt-6 text-center text-sm font-medium text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 font-bold hover:text-blue-700 hover:underline transition-colors">
                Login here
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SignUp;