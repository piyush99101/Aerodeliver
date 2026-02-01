import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './services/AuthContext';
import { DataProvider } from './services/DataContext';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import BookDelivery from './pages/customer/BookDelivery';
import Profile from './pages/customer/Profile';
import MyOrders from './pages/customer/MyOrders';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import MyDrones from './pages/owner/MyDrones';
import Requests from './pages/owner/Requests';
import Earnings from './pages/owner/Earnings';
import OwnerProfile from './pages/owner/Profile';
import TrackPackage from './pages/TrackPackage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Support from './pages/Support';
import Contact from './pages/Contact';

// Components
import Layout from './components/Layout';
import StartupAnimation from './components/StartupAnimation';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode, allowedRole?: 'customer' | 'owner' }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-blue-600">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'customer' ? '/customer/dashboard' : '/owner/dashboard'} replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [showStartup, setShowStartup] = useState(false);
  const [isAuthRedirect, setIsAuthRedirect] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 1. Mark as mounted to signal we are in the browser
    setMounted(true);

    // 2. Browser-only logic for startup animation and tokens
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 768;
      const hasVisited = sessionStorage.getItem('hasVisited');

      if (!hasVisited && !isMobile) {
        setShowStartup(true);
        sessionStorage.setItem('hasVisited', 'true');
      } else if (isMobile) {
        // Mark as visited so it doesn't show even if they rotate to desktop
        sessionStorage.setItem('hasVisited', 'true');
      }

      const redirecting = window.location.hash.includes('access_token=') ||
        window.location.hash.includes('recovery_token=') ||
        window.location.href.includes('access_token=');
      setIsAuthRedirect(redirecting);
    }
  }, []);

  // Prevent Prerendering Error: Return nothing until mounted in browser
  if (!mounted) return null;

  const handleAnimationComplete = () => setShowStartup(false);

  if (isAuthRedirect && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-400 to-blue-600">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white mx-auto mb-4"></div>
          <p className="text-white font-bold tracking-wide">Completing authentication...</p>
        </div>
      </div>
    );
  }

  if (showStartup) {
    return <StartupAnimation onComplete={handleAnimationComplete} />;
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/support" element={<Support />} />
      <Route path="/contact" element={<Contact />} />

      {/* Customer Routes */}
      <Route path="/customer/*" element={
        <ProtectedRoute allowedRole="customer">
          <Layout type="customer">
            <Routes>
              <Route path="dashboard" element={<CustomerDashboard />} />
              <Route path="book" element={<BookDelivery />} />
              <Route path="orders" element={<MyOrders />} />
              <Route path="profile" element={<Profile />} />
              <Route path="track/:orderId" element={<TrackPackage />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />

      {/* Owner Routes */}
      <Route path="/owner/*" element={
        <ProtectedRoute allowedRole="owner">
          <Layout type="owner">
            <Routes>
              <Route path="dashboard" element={<OwnerDashboard />} />
              <Route path="drones" element={<MyDrones />} />
              <Route path="requests" element={<Requests />} />
              <Route path="earnings" element={<Earnings />} />
              <Route path="profile" element={<OwnerProfile />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;
