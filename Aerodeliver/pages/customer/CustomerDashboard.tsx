import React, { useMemo, useState, useEffect } from 'react'; // Added useState, useEffect
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '../../services/DataContext';
import { useAuth } from '../../services/AuthContext';
import { motion } from 'framer-motion';

const StatCard = ({ icon, colorFrom = 'from-blue-400', colorTo = 'to-blue-600', value, label, trend }: any) => (
  <div className="glass-card p-6 rounded-2xl border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="text-sm text-gray-600 uppercase font-bold tracking-wide mb-2">{label}</div>
        <div className="text-3xl font-bold text-brand-dark">{value}</div>
        {trend && <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1"><i className="fas fa-arrow-up"></i>{trend}</div>}
      </div>
      <div className="w-12 h-12 rounded-xl relative flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
        <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${colorFrom} ${colorTo}`} />
        <div className="relative text-white text-lg">
          <i className={`fas ${icon}`} />
        </div>
      </div>
    </div>
  </div>
);

const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { orders, getStats, loading } = useData();
  const [mounted, setMounted] = useState(false); // Guard for browser-only rendering

  // Initialize mounting state
  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = getStats('customer');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only run if window/document exists
    if (typeof document === 'undefined') return;
    
    const cards = document.getElementsByClassName('spotlight-card');
    for (const card of cards) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      (card as HTMLElement).style.setProperty('--mouse-x', `${x}px`);
      (card as HTMLElement).style.setProperty('--mouse-y', `${y}px`);
    }
  };

  const activeOrders = orders.filter(o => o.status !== 'delivered');

  const chartData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        name: days[d.getDay()],
        fullDate: d.toISOString().split('T')[0],
        orders: 0
      };
    });

    orders.forEach(order => {
      if (order.date) {
        const orderDate = order.date.split('T')[0];
        const dayMatch = last7Days.find(d => d.fullDate === orderDate);
        if (dayMatch) dayMatch.orders += 1;
      }
    });

    return last7Days;
  }, [orders]);

  // IMPORTANT: If we are not mounted, return a simple loader or null
  // This prevents Recharts and Framer Motion from crashing the Render build
  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center">
          <i className="fas fa-circle-notch fa-spin text-3xl text-blue-500 mb-2"></i>
          <p className="text-gray-500 font-bold">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" onMouseMove={handleMouseMove}>
      <div className="bg-white/10 backdrop-blur-md p-6 sm:p-8 lg:px-10 border-b border-white/20 w-full shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-dark mb-2">
              Welcome back, {user?.name ? user.name.split(' ')[0] : 'User'}! 📦
            </h1>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
              You have {stats.inTransit} package(s) currently in transit.
            </p>
          </div>

          <div className="glass-card p-4 sm:p-6 rounded-2xl border border-white/20 shadow-lg w-full sm:w-auto sm:self-end">
            <div className="text-center sm:text-left">
              <div className="text-xs text-gray-600 uppercase tracking-wider font-bold mb-1">Total Spent</div>
              <div className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600 mb-2">
                ₹{stats.spent}
              </div>
              <div className="text-xs text-blue-600 font-semibold flex items-center gap-1 justify-center sm:justify-start">
                <i className="fas fa-wallet text-xs"></i>
                <span>Active Wallet Balance</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard icon="fa-box" colorFrom="from-blue-400" colorTo="to-blue-600" value={stats.totalOrders} label="Total Orders" />
          <StatCard icon="fa-circle-check" colorFrom="from-emerald-300" colorTo="to-emerald-600" value={stats.delivered} label="Delivered" />
          <StatCard icon="fa-plane" colorFrom="from-yellow-300" colorTo="to-yellow-600" value={stats.inTransit} label="In Transit" />
          <StatCard icon="fa-dollar-sign" colorFrom="from-purple-300" colorTo="to-purple-600" value={`₹${stats.spent}`} label="Total Spent" trend="+5%" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="glass-card p-4 sm:p-6 rounded-2xl border border-white/20 shadow-lg">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-5 gap-3">
                <h3 className="text-lg sm:text-xl font-bold text-brand-dark flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center text-white">
                    <i className="fas fa-box text-sm sm:text-base"></i>
                  </div>
                  Active Missions
                </h3>
                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  <Link to="/customer/book" className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2">
                    <i className="fas fa-plus text-xs"></i> New Order
                  </Link>
                  <Link to="/customer/orders" className="text-xs text-blue-600 font-bold hover:text-brand-dark">View All →</Link>
                </div>
              </div>

              {activeOrders.length === 0 ? (
                <div className="text-center py-12 sm:py-16 border-2 border-dashed border-white/20 rounded-xl">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white mx-auto mb-3 sm:mb-4 text-xl sm:text-2xl">
                    <i className="fas fa-box-open" />
                  </div>
                  <p className="text-gray-700 font-semibold text-base sm:text-lg">No Orders in Transit</p>
                  <Link to="/customer/book" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-xl font-bold">Book Now</Link>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {activeOrders.map(order => (
                    <div key={order.id} className="p-4 sm:p-5 rounded-xl border border-white/10 hover:shadow-lg transition-all group bg-white/40">
                      <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
                        <div className="flex gap-2 sm:gap-3 items-start flex-1 min-w-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg relative flex items-center justify-center shadow-lg bg-gradient-to-br from-indigo-400 to-indigo-600 text-white flex-shrink-0">
                            <i className="fas fa-gift" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm sm:text-lg text-brand-dark truncate">Order #{order.id}</div>
                            <div className="text-xs sm:text-sm text-gray-600">{order.item} • ETA {order.eta}</div>
                          </div>
                        </div>
                        <div className="text-xs px-2 py-1 rounded-full font-bold bg-blue-100 text-blue-700 border border-blue-200 capitalize">
                          {order.status}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Link to={`/customer/track/${order.id}`} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-center font-bold text-xs sm:text-sm">Track Live</Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-card p-4 sm:p-6 rounded-2xl border border-white/20 shadow-lg">
              <h3 className="text-lg sm:text-xl font-bold text-brand-dark mb-4">Order Activity</h3>
              <div className="h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={3} fill="url(#colorOrders)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-4 sm:p-6 rounded-[2.5rem] border border-white/20 shadow-xl h-fit bg-white/5 backdrop-blur-xl relative overflow-hidden"
          >
            <h3 className="text-xl sm:text-2xl font-black text-blue-950 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white shadow-lg flex items-center justify-center text-amber-500">
                <i className="fas fa-lightbulb"></i>
              </div>
              Smart Tips
            </h3>
            <div className="space-y-4">
              {[
                { icon: "fa-shield-halved", title: "SECURE PACKAGING", desc: "Use bubble wrap for fragile items.", color: "from-blue-600 to-indigo-600" },
                { icon: "fa-map-pin", title: "ACCURATE DROPOFF", desc: "Pin the exact coordinates for drones.", color: "from-emerald-500 to-teal-600" }
              ].map((tip, idx) => (
                <div key={idx} className="spotlight-card relative flex gap-4 p-5 bg-white/10 rounded-2xl border border-white/10 group overflow-hidden">
                   <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tip.color} flex items-center justify-center text-white shrink-0 shadow-lg transition-transform group-hover:scale-110`}>
                    <i className={`fas ${tip.icon}`}></i>
                  </div>
                  <div className="flex-1">
                    <div className="font-black text-blue-950 text-sm mb-1 uppercase tracking-wider">{tip.title}</div>
                    <p className="text-xs text-slate-700 font-bold opacity-80">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
