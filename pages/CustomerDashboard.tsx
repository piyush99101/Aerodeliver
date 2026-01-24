

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '../services/DataContext';
import { useAuth } from '../services/AuthContext';
import BackgroundClouds from '../components/BackgroundClouds';

const data = [
  { name: 'Jun', orders: 0 },
  { name: 'Jul', orders: 0 },
  { name: 'Aug', orders: 0 },
  { name: 'Sep', orders: 0 },
  { name: 'Oct', orders: 0 },
  { name: 'Nov', orders: 1 }, // Demo data for chart only
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
  const stats = getStats('customer');

  const [openOrder, setOpenOrder] = useState<any>(null);

  // close modal on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenOrder(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Get active orders (not delivered)
  const activeOrders = orders.filter(o => o.status !== 'delivered');

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 to-blue-600 font-sans text-slate-900 relative overflow-hidden selection:bg-white selection:text-blue-600">
      {/* Floating Clouds Background */}
      <BackgroundClouds />

      {/* Main Content - with relative z-index to appear above clouds */}
      <div className="relative z-10 space-y-8 p-6 md:p-8">
        <div className="glass-card p-6 rounded-[2.5rem]">
          <h1 className="section-title mb-2">Welcome back, <span className="text-blue-600">{user?.name.split(' ')[0]}</span>!</h1>
          <p className="section-sub">You have <span className="font-bold text-slate-900">{stats.inTransit}</span> package(s) in transit — view and manage them below.</p>
        </div>

        <div className="stats-grid">
          <StatCard
            icon="fa-box"
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
            value={stats.totalOrders}
            label="Total Orders"
          />
          <StatCard
            icon="fa-circle-check"
            gradient="bg-gradient-to-br from-green-500 to-green-600"
            value={stats.delivered}
            label="Delivered"
          />
          <StatCard
            icon="fa-plane"
            gradient="bg-gradient-to-br from-yellow-500 to-orange-500"
            value={stats.inTransit}
            label="In Transit"
          />
          <StatCard
            icon="fa-dollar-sign"
            gradient="bg-gradient-to-br from-purple-500 to-purple-600"
            value={`₹${stats.spent}`}
            label="Total Spent"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-card p-6 rounded-3xl hover:shadow-blue-900/30 transition-all duration-500">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900">Active Orders</h3>
              <Link to="/customer/book" className="text-sm text-blue-600 font-bold hover:text-blue-700 hover:underline flex items-center gap-1">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg> New Order
              </Link>
            </div>

            {activeOrders.length === 0 ? (
              <div className="text-center py-12 bg-white/30 backdrop-blur-sm rounded-2xl border-2 border-dashed border-white/60">
                <div className="w-20 h-20 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <svg className="w-10 h-10 text-slate-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /><path d="M7 7v-2h10v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <p className="text-slate-600 font-semibold">No active orders</p>
                <p className="text-slate-500 text-sm mt-1">Create your first delivery</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeOrders.map(order => (
                  <div key={order.id} className="glass-card p-5 rounded-2xl hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-4">
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg relative">
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600" />
                          <svg className="w-6 h-6 text-white relative" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 12V7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 10h16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-lg">Order #{order.id}</div>
                          <div className="text-sm text-slate-600 font-medium">{order.item}</div>
                        </div>
                      </div>
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1.5 rounded-full text-xs font-bold capitalize shadow-md">
                        {order.status}
                      </span>
                    </div>

                    <div className="glass-card p-3 rounded-lg mb-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full flex items-center justify-center text-red-500">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.686 2 6 4.686 6 8c0 4.418 6 11 6 11s6-6.582 6-11c0-3.314-2.686-6-6-6z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="8" r="1.4" fill="currentColor" /></svg>
                          </div>
                          <span className="muted">From:</span>
                          <span className="strong truncate">{order.pickup}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full flex items-center justify-center text-blue-600">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.2" /><path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          </div>
                          <span className="muted">ETA:</span>
                          <span className="strong">{order.eta}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Link
                        to={`/track/${order.id}`}
                        className="flex-1 bg-gradient-to-r from-slate-800 to-slate-900 text-white py-2.5 rounded-xl text-sm font-bold text-center hover:shadow-lg transition-all hover:scale-105"
                      >
                        <svg className="w-4 h-4 mr-2 inline" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" /><circle cx="12" cy="12" r="3" fill="currentColor" /></svg>
                        Track Live
                      </Link>
                      <button
                        onClick={() => setOpenOrder(order)}
                        className="flex-1 border-2 border-white/60 bg-white/30 backdrop-blur-sm text-slate-800 py-2.5 rounded-xl text-sm font-bold hover:bg-white/50 transition-all"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card p-6 rounded-[2.5rem]">
            <h3 className="text-xl font-black text-slate-900 mb-6">Monthly Deliveries</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.5} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 600 }} />
                  <Tooltip
                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.6)',
                      borderRadius: '12px',
                      fontWeight: 'bold'
                    }}
                  />
                  <Bar dataKey="orders" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} barSize={40} />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      {/* Order Details Modal */}
      {openOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpenOrder(null)} />
          <div className="relative z-10 w-full max-w-xl p-6">
            <div className="glass-card p-6 rounded-2xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Order #{openOrder.id}</h3>
                  <div className="text-sm text-slate-600">{openOrder.item}</div>
                </div>
                <div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-400 text-white">{openOrder.status}</span>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="glass-card p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-red-500">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.686 2 6 4.686 6 8c0 4.418 6 11 6 11s6-6.582 6-11c0-3.314-2.686-6-6-6z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="8" r="1.4" fill="currentColor" /></svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 uppercase font-semibold">Pickup</div>
                      <div className="text-slate-900 font-medium">{openOrder.pickup}</div>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-blue-600">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" /><circle cx="12" cy="12" r="3" fill="currentColor" /></svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 uppercase font-semibold">Delivery</div>
                      <div className="text-slate-900 font-medium">{openOrder.delivery}</div>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-400 uppercase font-semibold">Item</div>
                      <div className="text-slate-900 font-medium">{openOrder.item}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 uppercase font-semibold">Cost</div>
                      <div className="text-slate-900 font-medium">₹{openOrder.price}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Link
                  to={`/track/${openOrder.id}`}
                  className="primary-btn flex-1 text-sm text-center"
                  onClick={() => setOpenOrder(null)}
                >
                  Track Live
                </Link>
                <button onClick={() => setOpenOrder(null)} className="secondary-btn flex-1 text-sm text-center">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
