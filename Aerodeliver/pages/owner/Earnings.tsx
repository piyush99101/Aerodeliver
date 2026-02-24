
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useData } from '../../services/DataContext';

const Earnings: React.FC = () => {
  const { orders } = useData();
  
  // Calculate stats based on delivered orders
  const completedOrders = orders.filter(o => o.status === 'delivered');
  const totalEarnings = completedOrders.reduce((acc, curr) => acc + (curr.price * 0.8), 0); // 80% split
  const pendingPayout = 0; // Mock

  // Mock data for charts - in a real app this would aggregate actual order dates
  const weeklyData = [
    { name: 'Mon', amount: 0 },
    { name: 'Tue', amount: 0 },
    { name: 'Wed', amount: 0 },
    { name: 'Thu', amount: 0 },
    { name: 'Fri', amount: 0 },
    { name: 'Sat', amount: 0 },
    { name: 'Sun', amount: totalEarnings > 0 ? totalEarnings : 0 }, // Visualize current earnings on Sunday for demo
  ];

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-amber-600/20 to-orange-500/15 backdrop-blur-sm rounded-3xl p-8 border border-white/10 mx-6 mt-6">
        <h1 className="text-4xl font-bold text-brand-dark mb-2">Earnings Dashboard</h1>
        <p className="text-gray-600 text-lg">Track your revenue, payouts, performance metrics, and transaction history.</p>
      </div>

      <div className="max-w-6xl mx-auto px-6 space-y-8">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Total Revenue Card */}
          <div className="glass-card p-6 rounded-2xl border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="text-slate-600 font-semibold uppercase tracking-wide text-xs">Total Revenue</div>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                <i className="fas fa-coins text-lg"></i>
              </div>
            </div>
            <div className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-600 mb-2">₹{totalEarnings.toFixed(2)}</div>
            <div className="h-1 w-20 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full mb-3"></div>
            <div className="text-sm text-amber-600 font-semibold flex items-center gap-1">
              <i className="fas fa-arrow-up text-xs"></i>
              <span>{totalEarnings > 0 ? '+12% from last week' : 'No recent earnings'}</span>
            </div>
          </div>

          {/* Pending Payout Card */}
          <div className="glass-card p-6 rounded-2xl border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="text-slate-600 font-semibold uppercase tracking-wide text-xs">Pending Payout</div>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 text-white rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                <i className="fas fa-hourglass-half text-lg"></i>
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">₹{pendingPayout.toFixed(2)}</div>
            <div className="h-1 w-20 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full mb-3"></div>
            <div className="text-sm text-slate-600 font-semibold">Next payout: Tuesday</div>
          </div>

          {/* Completed Deliveries Card */}
          <div className="glass-card p-6 rounded-2xl border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="text-slate-600 font-semibold uppercase tracking-wide text-xs">Completed Deliveries</div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-brand-blue text-white rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                <i className="fas fa-shuttle-space text-lg"></i>
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">{completedOrders.length}</div>
            <div className="h-1 w-20 bg-gradient-to-r from-blue-400 to-brand-blue rounded-full mb-3"></div>
            <div className="text-sm text-slate-600 font-semibold">Lifetime deliveries</div>
          </div>
        </div>

        {/* Charts and Performance Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Revenue Trend Chart */}
          <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/20 shadow-lg">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Revenue Trend</h3>
                <p className="text-sm text-gray-500 mt-1">Weekly earning progression</p>
              </div>
              <div className="flex items-center gap-3">
                <select className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-brand-blue outline-none">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                </select>
                <button className="secondary-btn text-sm px-4 py-2.5">Compare</button>
              </div>
            </div>
            <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorRevenueAmber" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.14}/>
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} tickFormatter={(value) => `₹${value}`} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                />
                <Area type="monotone" dataKey="amount" stroke="#F97316" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenueAmber)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

          {/* Performance Metrics */}
          <div className="glass-card p-6 rounded-2xl border border-white/20 shadow-lg">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Performance Metrics</h3>
            <div className="space-y-5">
              {/* On-time Delivery Rate */}
              <div className="bg-white/30 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                      <i className="fas fa-check text-sm"></i>
                    </div>
                    <span className="font-semibold text-gray-700">On-time Delivery</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">98%</span>
                </div>
                <div className="w-full bg-white/40 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-400 to-green-600 h-2.5 rounded-full" style={{width: '98%'}}></div>
                </div>
              </div>

              {/* Customer Rating */}
              <div className="bg-white/30 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center">
                      <i className="fas fa-star text-sm"></i>
                    </div>
                    <span className="font-semibold text-gray-700">Customer Rating</span>
                  </div>
                  <span className="text-lg font-bold text-yellow-600">4.9/5.0</span>
                </div>
                <div className="w-full bg-white/40 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2.5 rounded-full" style={{width: '96%'}}></div>
                </div>
              </div>

              {/* Acceptance Rate */}
              <div className="bg-white/30 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-brand-blue/20 text-brand-blue rounded-lg flex items-center justify-center">
                      <i className="fas fa-handshake text-sm"></i>
                    </div>
                    <span className="font-semibold text-gray-700">Acceptance Rate</span>
                  </div>
                  <span className="text-lg font-bold text-brand-blue">100%</span>
                </div>
                <div className="w-full bg-white/40 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-brand-blue to-blue-600 h-2.5 rounded-full" style={{width: '100%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Transaction History */}
      <div className="glass-card rounded-2xl overflow-hidden border border-white/20 shadow-lg">
        <div className="p-6 border-b border-white/20 bg-gradient-to-r from-slate-50/5 to-blue-50/5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Transaction History</h3>
            <div className="text-sm text-gray-600 mt-1">Complete transaction records and payout details</div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 sm:flex-none">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input placeholder="Search orders..." className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-brand-blue outline-none transition w-full sm:w-auto" />
            </div>
            <select className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-brand-blue outline-none transition">
              <option>All Transactions</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
            <button className="primary-btn text-sm px-5 py-2.5 flex items-center justify-center gap-2 whitespace-nowrap">
              <i className="fas fa-download"></i>Download Report
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 text-left text-xs font-bold text-slate-700 uppercase tracking-widest border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {completedOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <i className="fas fa-inbox text-3xl text-gray-300"></i>
                      <div className="text-gray-600 font-medium">No transactions found</div>
                      <div className="text-sm text-gray-500">Complete a delivery to see your earnings here</div>
                    </div>
                  </td>
                </tr>
              ) : (
                completedOrders.map(order => (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">{new Date(order.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm font-bold text-brand-blue">#{order.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">Delivery Fee - {order.item}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1.5 text-xs font-bold text-green-700 bg-green-100/60 rounded-full uppercase border border-green-200/30">Completed</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-green-600 text-right">+₹{(order.price * 0.8).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Earnings;
