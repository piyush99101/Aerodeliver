
import React, { useMemo } from 'react';
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
  const stats = getStats('customer');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const cards = document.getElementsByClassName('spotlight-card');
    for (const card of cards) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      (card as HTMLElement).style.setProperty('--mouse-x', `${x}px`);
      (card as HTMLElement).style.setProperty('--mouse-y', `${y}px`);
    }
  };

  // Get active orders (not delivered)
  const activeOrders = orders.filter(o => o.status !== 'delivered');

  // Dynamic Chart Data: Counts orders per day for the last 7 days
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

  if (loading) {
    return (
      <div className="section flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center">
          <i className="fas fa-circle-notch fa-spin text-3xl text-brand-blue mb-2"></i>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" onMouseMove={handleMouseMove}>
      {/* Enhanced Header with Glassmorphic Sky Effect */}
      <div className="bg-white/10 backdrop-blur-md p-6 sm:p-8 lg:px-10 border-b border-white/20 w-full shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-dark mb-2">Welcome back, {user?.name ? user.name.split(' ')[0] : 'User'}! 📦</h1>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg">You have {stats.inTransit} package(s) currently in transit.</p>
          </div>

          {/* Wallet/Spent Card - Centered on mobile, right-aligned on desktop */}
          <div className="glass-card p-4 sm:p-6 rounded-2xl border border-white/20 shadow-lg w-full sm:w-auto sm:self-end">
            <div className="text-center sm:text-left">
              <div className="text-xs text-gray-600 uppercase tracking-wider font-bold mb-1">Total Spent</div>
              <div className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-brand-blue to-indigo-600 mb-2">₹{stats.spent}</div>
              <div className="text-xs text-brand-blue font-semibold flex items-center gap-1 justify-center sm:justify-start">
                <i className="fas fa-wallet text-xs"></i>
                <span>Active Wallet Balance</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">

        {/* Statistics Grid */}
        <div className="stats-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard icon="fa-box" colorFrom="from-blue-400" colorTo="to-blue-600" value={stats.totalOrders} label="Total Orders" />
          <StatCard icon="fa-circle-check" colorFrom="from-emerald-300" colorTo="to-emerald-600" value={stats.delivered} label="Delivered" />
          <StatCard icon="fa-plane" colorFrom="from-yellow-300" colorTo="to-yellow-600" value={stats.inTransit} label="In Transit" />
          <StatCard icon="fa-dollar-sign" colorFrom="from-purple-300" colorTo="to-purple-600" value={`₹${stats.spent}`} label="Total Spent" trend="+5%" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column: Active Orders */}
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
                  <Link to="/customer/book" className="primary-btn px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 flex-1 sm:flex-initial justify-center">
                    <i className="fas fa-plus text-xs"></i> <span className="hidden xs:inline">New</span> Order
                  </Link>
                  <Link to="/customer/orders" className="text-xs text-brand-blue font-bold hover:text-brand-dark transition whitespace-nowrap">View All →</Link>
                </div>
              </div>

              {activeOrders.length === 0 ? (
                <div className="text-center py-12 sm:py-16 border-2 border-dashed border-white/20 rounded-xl">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-400 to-brand-blue rounded-full flex items-center justify-center text-white mx-auto mb-3 sm:mb-4 text-xl sm:text-2xl">
                    <i className="fas fa-box-open" />
                  </div>
                  <p className="text-gray-700 font-semibold text-base sm:text-lg mb-1">No Orders in Transit</p>
                  <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6 px-4">Book a delivery to see your package live</p>
                  <Link to="/customer/book" className="inline-block primary-btn px-5 sm:px-6 py-2 sm:py-2.5 font-semibold text-sm sm:text-base">
                    Book Now
                  </Link>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {activeOrders.map(order => (
                    <div key={order.id} className="glass-strong p-4 sm:p-5 rounded-xl border border-white/10 hover:shadow-lg transition-all group">
                      <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
                        <div className="flex gap-2 sm:gap-3 items-start flex-1 min-w-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg relative flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-600" />
                            <div className="relative text-white text-base sm:text-lg"><i className="fas fa-gift" /></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm sm:text-lg text-brand-dark flex items-center gap-2 flex-wrap">
                              <span className="truncate">Order #{order.id ? order.id.slice(0, 8) : '...'}</span>
                              {order.status === 'in-transit' && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0"></span>}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600 mt-0.5 truncate">{order.item} • ETA {order.eta}</div>
                          </div>
                        </div>
                        <div className={`text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-bold border capitalize flex-shrink-0 ${order.status === 'pending' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                          order.status === 'in-transit' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                            'bg-blue-100 text-blue-700 border-blue-200'
                          }`}>
                          {order.status}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4 bg-white/10 p-3 sm:p-4 rounded-lg border border-white/10">
                        <div className="min-w-0">
                          <div className="text-xs text-gray-600 uppercase font-bold tracking-wide mb-1">Pickup</div>
                          <div className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{order.pickup}</div>
                        </div>
                        <div className="text-right min-w-0">
                          <div className="text-xs text-gray-600 uppercase font-bold tracking-wide mb-1">Delivery</div>
                          <div className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{order.delivery}</div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <Link to={`/track/${order.id}`} className="flex-1 primary-btn px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-center gap-1.5 sm:gap-2 font-semibold text-xs sm:text-sm">
                          <i className="fas fa-location-crosshairs text-xs"></i> Track Live
                        </Link>
                        <Link to={`/customer/orders`} className="flex-1 secondary-btn px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-center gap-1.5 sm:gap-2 font-semibold text-xs sm:text-sm">
                          Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Activity Chart */}
            <div className="glass-card p-4 sm:p-6 rounded-2xl border border-white/20 shadow-lg">
              <div className="mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-brand-dark mb-1 sm:mb-2">Order Activity</h3>
                <p className="text-xs sm:text-sm text-gray-600">Your delivery history overview</p>
              </div>
              <div className="h-48 sm:h-56 md:h-64 rounded-xl overflow-hidden bg-white/5 border border-white/10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0A74DA" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#0A74DA" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="orders" stroke="#0A74DA" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOrders)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right Column: Redesigned Delivery Tips with Apple Glass Effect */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-4 sm:p-6 rounded-[2.5rem] border border-white/20 shadow-xl h-fit bg-white/5 backdrop-blur-xl relative overflow-hidden group/main"
          >
            {/* Decorative Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl group-hover/main:bg-blue-400/20 transition-all duration-700" />

            <h3 className="text-xl sm:text-2xl font-black text-blue-950 mb-6 flex items-center gap-3 relative z-10 tracking-tight">
              <div className="w-10 h-10 rounded-xl bg-white shadow-lg flex items-center justify-center">
                <i className="fas fa-lightbulb text-amber-500 text-lg"></i>
              </div>
              Smart Tips
            </h3>

            <div className="space-y-4 relative z-10">
              {[
                {
                  icon: "fa-shield-halved",
                  title: "SECURE PACKAGING",
                  desc: "Use bubble wrap for electronics & glassware to ensure stability.",
                  color: "from-blue-600 to-indigo-600",
                  delay: 0.1
                },
                {
                  icon: "fa-map-pin",
                  title: "ACCURATE DROPOFF",
                  desc: "Pin the exact coordinates for the drone to land safely.",
                  color: "from-emerald-500 to-teal-600",
                  delay: 0.2
                },
                {
                  icon: "fa-bolt",
                  title: "EXPRESS DELIVERY",
                  desc: "Choose express routes for priorities & fragile items.",
                  color: "from-purple-500 to-pink-600",
                  delay: 0.3
                }
              ].map((tip, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: tip.delay }}
                  className="spotlight-card group relative flex gap-4 p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 hover:border-white/30 transition-all cursor-default overflow-hidden"
                >
                  {/* Spotlight Effect Overlay */}
                  <div
                    className="pointer-events-none absolute -inset-px transition duration-300 opacity-0 group-hover:opacity-100"
                    style={{
                      background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.15), transparent 40%)`,
                    }}
                  />

                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tip.color} flex items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                    <i className={`fas ${tip.icon} text-lg`}></i>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-black text-blue-950 text-sm mb-1 uppercase tracking-wider drop-shadow-sm">{tip.title}</div>
                    <p className="text-xs text-slate-700 font-bold leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">{tip.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom Decorative Line */}
            <div className="absolute bottom-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent blur-[0.5px]" />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;