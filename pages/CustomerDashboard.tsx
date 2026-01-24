// Force dynamic rendering to handle Auth and Data contexts safely
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '../services/DataContext';
import { useAuth } from '../services/AuthContext';
import BackgroundClouds from '../components/BackgroundClouds';

const chartData = [
  { name: 'Jun', orders: 0 },
  { name: 'Jul', orders: 0 },
  { name: 'Aug', orders: 0 },
  { name: 'Sep', orders: 0 },
  { name: 'Oct', orders: 0 },
  { name: 'Nov', orders: 1 },
];

const renderStatIcon = (icon: string) => {
  switch (icon) {
    case 'fa-box':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="7" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.2" />
          <path d="M7 7v-2h10v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'fa-circle-check':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" />
          <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'fa-plane':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 16l20-8-7 8-5-2-8 2z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'fa-dollar-sign':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
};

const StatCard = ({ icon, color, bg, gradient, value, label }: any) => (
  <div className={`glass-card p-6 rounded-3xl hover:shadow-blue-900/30 transition-all duration-500 hover:-translate-y-2 hover:scale-105`}>
    <div className="flex items-center justify-between mb-3">
      <div className={`w-12 h-12 ${gradient} rounded-xl flex items-center justify-center text-white shadow-lg`}>
        {renderStatIcon(icon)}
      </div>
    </div>
    <div className="text-3xl font-black text-slate-900 mb-1">{value}</div>
    <div className="text-sm text-slate-600 font-semibold">{label}</div>
  </div>
);

const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { orders, getStats } = useData();
  const [isClient, setIsClient] = useState(false);
  const [openOrder, setOpenOrder] = useState<any>(null);

  const stats = getStats('customer');
  const activeOrders = orders.filter(o => o.status !== 'delivered');

  // SSR Safety: Only enable browser features after mount
  useEffect(() => {
    setIsClient(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenOrder(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 to-blue-600 font-sans text-slate-900 relative overflow-hidden">
      <BackgroundClouds />

      <div className="relative z-10 space-y-8 p-6 md:p-8">
        <div className="glass-card p-6 rounded-[2.5rem]">
          <h1 className="section-title mb-2">
            Welcome back, <span className="text-blue-600">{user?.name?.split(' ')[0] || 'User'}</span>!
          </h1>
          <p className="section-sub">
            You have <span className="font-bold text-slate-900">{stats.inTransit}</span> package(s) in transit.
          </p>
        </div>

        <div className="stats-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="fa-box" gradient="bg-gradient-to-br from-blue-500 to-blue-600" value={stats.totalOrders} label="Total Orders" />
          <StatCard icon="fa-circle-check" gradient="bg-gradient-to-br from-green-500 to-green-600" value={stats.delivered} label="Delivered" />
          <StatCard icon="fa-plane" gradient="bg-gradient-to-br from-yellow-500 to-orange-500" value={stats.inTransit} label="In Transit" />
          <StatCard icon="fa-dollar-sign" gradient="bg-gradient-to-br from-purple-500 to-purple-600" value={`₹${stats.spent}`} label="Total Spent" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Orders Section */}
          <div className="glass-card p-6 rounded-3xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900">Active Orders</h3>
              <Link to="/customer/book" className="text-sm text-blue-600 font-bold hover:underline flex items-center gap-1">
                New Order
              </Link>
            </div>

            {activeOrders.length === 0 ? (
              <div className="text-center py-12 bg-white/30 backdrop-blur-sm rounded-2xl border-2 border-dashed border-white/60">
                <p className="text-slate-600 font-semibold">No active orders</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeOrders.map(order => (
                  <div key={order.id} className="glass-card p-5 rounded-2xl bg-white/40">
                    <div className="flex justify-between items-start mb-4">
                      <div className="font-bold text-slate-900 text-lg">Order #{order.id}</div>
                      <span className="bg-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold">{order.status}</span>
                    </div>
                    <div className="flex gap-3">
                      <Link to={`/track/${order.id}`} className="flex-1 bg-slate-900 text-white py-2 rounded-xl text-sm font-bold text-center">Track Live</Link>
                      <button onClick={() => setOpenOrder(order)} className="flex-1 bg-white/50 text-slate-800 py-2 rounded-xl text-sm font-bold">Details</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chart Section - Protected by isClient */}
          <div className="glass-card p-6 rounded-[2.5rem]">
            <h3 className="text-xl font-black text-slate-900 mb-6">Monthly Deliveries</h3>
            <div className="h-64">
              {isClient ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.5} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} contentStyle={{ borderRadius: '12px' }} />
                    <Bar dataKey="orders" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">Loading Chart...</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Logic */}
      {openOrder && isClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpenOrder(null)} />
          <div className="relative z-10 w-full max-w-xl glass-card p-8 rounded-3xl bg-white/90">
            <h3 className="text-2xl font-black mb-4">Order Details</h3>
            <div className="space-y-4 mb-6">
              <p><strong>Item:</strong> {openOrder.item}</p>
              <p><strong>Pickup:</strong> {openOrder.pickup}</p>
              <p><strong>Delivery:</strong> {openOrder.delivery}</p>
              <p><strong>Cost:</strong> ₹{openOrder.price}</p>
            </div>
            <button onClick={() => setOpenOrder(null)} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
