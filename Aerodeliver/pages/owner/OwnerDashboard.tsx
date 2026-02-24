
import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '../../services/DataContext';
import { useAuth } from '../../services/AuthContext';
import { Link } from 'react-router-dom';

const earningsData = [
  { name: 'Mon', amount: 0 },
  { name: 'Tue', amount: 0 },
  { name: 'Wed', amount: 0 },
  { name: 'Thu', amount: 0 },
  { name: 'Fri', amount: 0 },
  { name: 'Sat', amount: 0 },
  { name: 'Sun', amount: 0 },
];

const StatCard = ({ icon, colorFrom = 'from-blue-400', colorTo = 'to-blue-600', value, label, trend }: any) => (
  <div className="glass-card p-4 sm:p-6 rounded-2xl border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="text-xs sm:text-sm text-gray-600 uppercase font-bold tracking-wide mb-2">{label}</div>
        <div className="text-2xl sm:text-3xl font-bold text-brand-dark">{value}</div>
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

const OwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { orders, getStats, updateOrderStatus } = useData();
  const stats = getStats('owner');

  // Find all active orders (In-Transit)
  const activeMissions = orders.filter(o => o.status === 'in-transit');
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const [query, setQuery] = useState('');

  const filteredPending = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pendingOrders;
    return pendingOrders.filter(o => (
      `${o.id}`.includes(q) || (o.pickup || '').toLowerCase().includes(q) || (o.delivery || '').toLowerCase().includes(q) || (o.item || '').toLowerCase().includes(q)
    ));
  }, [pendingOrders, query]);

  return (
    <div className="space-y-8">
      {/* Enhanced Header with Gradient Background */}
      <div className="bg-gradient-to-r from-indigo-600/20 to-brand-blue/10 backdrop-blur-sm rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/10 mx-4 sm:mx-6 mt-4 sm:mt-6">
        <div className="flex flex-col gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-dark mb-2">Mission Control 🎮</h1>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg">Manage your fleet, track deliveries, and maximize your earnings.</p>
          </div>

          {/* Total Earnings Card */}
          <div className="glass-card p-4 sm:p-6 rounded-2xl border border-white/20 shadow-lg w-full sm:w-auto sm:self-end">
            <div className="text-center sm:text-left">
              <div className="text-xs text-gray-600 uppercase tracking-wider font-bold mb-1">Total Earnings</div>
              <div className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-600 mb-2">₹{stats.earnings.toFixed(2)}</div>
              <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1 justify-center sm:justify-start">

                <i className="fas fa-arrow-up text-xs"></i>
                <span>{stats.weekChange ?? '0.0'}% this week</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">
        {/* Statistics Grid */}
        <div className="stats-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard icon="fa-dollar-sign" colorFrom="from-amber-400" colorTo="to-orange-600" value={`₹${stats.earnings.toFixed(0)}`} label="Earnings" trend="+12%" />
          <StatCard icon="fa-box" colorFrom="from-blue-400" colorTo="to-brand-blue" value={stats.deliveries} label="Completed Deliveries" />
          <StatCard icon="fa-star" colorFrom="from-yellow-300" colorTo="to-amber-500" value="5.0" label="Pilot Rating" />
          <StatCard icon="fa-clock" colorFrom="from-purple-400" colorTo="to-purple-600" value={`${stats.flightHours}h`} label="Flight Time" />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-3">
          <Link to="/owner/my-drones" className="primary-btn px-4 sm:px-5 py-2.5 flex items-center justify-center gap-2 font-semibold text-sm sm:text-base">
            <i className="fas fa-plus text-xs sm:text-sm"></i>Add Drone
          </Link>
          <Link to="/owner/requests" className="secondary-btn px-4 sm:px-5 py-2.5 flex items-center justify-center gap-2 font-semibold text-sm sm:text-base">
            <i className="fas fa-bell text-xs sm:text-sm"></i>Requests
          </Link>
          <Link to="/owner/earnings" className="secondary-btn px-4 sm:px-5 py-2.5 flex items-center justify-center gap-2 font-semibold text-sm sm:text-base">
            <i className="fas fa-chart-line text-xs sm:text-sm"></i>Earnings
          </Link>
          <div className="sm:ml-auto">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search incoming orders..." className="rounded-lg pl-10 pr-4 py-2.5 bg-white border border-gray-300 text-sm focus:ring-2 focus:ring-brand-blue outline-none transition w-full sm:w-auto" />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column: Active Missions and Earnings */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Active Missions Section */}
            <div className="glass-card p-4 sm:p-6 rounded-2xl border border-white/20 shadow-lg">
              <div className="flex justify-between items-center mb-4 sm:mb-5 flex-wrap gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-brand-dark flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center text-white">
                    <i className="fas fa-gamepad text-sm sm:text-base"></i>
                  </div>
                  Active Missions
                </h3>
                <span className="bg-blue-100 text-brand-blue text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-full border border-blue-200">{activeMissions.length} Active</span>
              </div>

              {activeMissions.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {activeMissions.map(mission => (
                    <div key={mission.id} className="glass-strong p-4 sm:p-5 rounded-xl border border-white/10 hover:shadow-lg transition-all group">
                      <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
                        <div className="flex gap-2 sm:gap-3 items-start flex-1 min-w-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg relative flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-600" />
                            <div className="relative text-white text-base sm:text-lg"><i className="fas fa-plane" /></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm sm:text-lg text-brand-dark flex items-center gap-2 flex-wrap">
                              <span className="truncate">Mission #{mission.id.slice(0, 8)}</span>
                              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0"></span>
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600 mt-0.5 truncate">DRONE-X1 • ALT: 120m • Battery: 78%</div>
                          </div>
                        </div>
                        <div className="text-xs px-2 sm:px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 flex-shrink-0">LIVE</div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4 bg-white/10 p-3 sm:p-4 rounded-lg border border-white/10">
                        <div className="min-w-0">
                          <div className="text-xs text-gray-600 uppercase font-bold tracking-wide mb-1">Pickup</div>
                          <div className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{mission.pickup}</div>
                        </div>
                        <div className="text-right min-w-0">
                          <div className="text-xs text-gray-600 uppercase font-bold tracking-wide mb-1">Delivery</div>
                          <div className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{mission.delivery}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-xs text-gray-600 mb-1.5">
                            <span className="font-semibold">Battery</span>
                            <span className="font-bold">78%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5 overflow-hidden border border-gray-300">
                            <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 sm:h-2.5 rounded-full" style={{ width: '78%' }} />
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => updateOrderStatus(mission.id, 'delivered')}
                        className="w-full primary-btn px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-center gap-2 font-semibold text-xs sm:text-sm"
                      >
                        <i className="fas fa-check-circle text-xs"></i> Land & Deliver
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 sm:py-16 border-2 border-dashed border-white/20 rounded-xl">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-400 to-brand-blue rounded-full flex items-center justify-center text-white mx-auto mb-3 sm:mb-4 text-xl sm:text-2xl">
                    <i className="fas fa-helicopter" />
                  </div>
                  <p className="text-gray-700 font-semibold text-base sm:text-lg mb-1">No Drones in Flight</p>
                  <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6 px-4">Accept requests to start a mission</p>
                  <Link to="/owner/requests" className="inline-block primary-btn px-5 sm:px-6 py-2 sm:py-2.5 font-semibold text-sm sm:text-base">
                    <i className="fas fa-bell mr-2"></i>View Pending Requests
                  </Link>
                </div>
              )}
            </div>

            {/* Weekly Earnings Chart */}
            <div className="glass-card p-4 sm:p-6 rounded-2xl border border-white/20 shadow-lg">
              <div className="mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-brand-dark mb-1 sm:mb-2">Weekly Earnings</h3>
                <p className="text-xs sm:text-sm text-gray-600">Your daily revenue progression</p>
              </div>
              <div className="h-48 sm:h-56 rounded-xl overflow-hidden bg-white/5 border border-white/10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={earningsData}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0A74DA" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#0A74DA" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} tickFormatter={(value) => `₹${value}`} />
                    <Tooltip contentStyle={{ fontSize: '12px' }} />
                    <Area type="monotone" dataKey="amount" stroke="#0A74DA" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAmount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right Column: Incoming Feed */}
          <div className="glass-card p-4 sm:p-6 rounded-2xl border border-white/20 shadow-lg h-fit lg:sticky lg:top-24">
            <div className="flex justify-between items-center mb-4 sm:mb-5">
              <h3 className="text-lg sm:text-xl font-bold text-brand-dark flex items-center gap-2">
                <i className="fas fa-inbox text-brand-blue text-sm sm:text-base"></i>Incoming Feed
              </h3>
              <Link to="/owner/requests" className="text-xs text-brand-blue font-bold hover:text-brand-dark transition whitespace-nowrap">View All →</Link>
            </div>

            {filteredPending.length > 0 ? (
              <div className="space-y-3">
                {filteredPending.slice(0, 5).map(order => (
                  <div key={order.id} className="glass-strong p-3 sm:p-4 rounded-lg border border-white/10 hover:border-white/20 transition-all group">
                    <div className="flex justify-between items-start mb-2 sm:mb-3 gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                          <span className="truncate">Order #{order.id.slice(0, 8)}</span>
                          <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse flex-shrink-0" />
                        </div>
                        <div className="text-[10px] sm:text-xs text-gray-600 mt-1 flex items-center gap-1.5">
                          <i className="fas fa-clock text-gray-400"></i>
                          <span className="truncate">{order.eta} • {order.item}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-emerald-600 text-xs sm:text-sm">₹{order.price}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-600 mb-2 sm:mb-3 px-1.5 sm:px-2 py-1 sm:py-1.5 bg-white/5 rounded border border-white/10">
                      <i className="fas fa-map-marker-alt text-amber-500 text-[10px]"></i>
                      <span className="truncate max-w-[100px] sm:max-w-[140px]">{order.pickup}</span>
                      <i className="fas fa-arrow-right text-gray-400"></i>
                      <i className="fas fa-flag-checkered text-red-500 text-[10px]"></i>
                      <span className="truncate max-w-[100px] sm:max-w-[140px]">{order.delivery}</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => updateOrderStatus(order.id, 'in-transit', user?.id, user?.name)}
                        className="flex-1 primary-btn text-xs sm:text-sm py-1.5 sm:py-2 font-semibold"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'rejected')}
                        className="flex-1 secondary-btn text-xs sm:text-sm py-1.5 sm:py-2 font-semibold"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 sm:py-12">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 text-blue-600 text-lg sm:text-xl">
                  <i className="fas fa-satellite" />
                </div>
                <p className="text-gray-700 font-semibold text-sm mb-1">Scanning for Orders...</p>
                <p className="text-xs text-gray-600">You are online and visible to customers</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
