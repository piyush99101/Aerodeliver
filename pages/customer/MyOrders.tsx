
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../../services/DataContext';

const MyOrders: React.FC = () => {
  const { orders, loading } = useData();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredOrders = orders.filter(order => {
    if (filter === 'active') return order.status !== 'delivered';
    if (filter === 'completed') return order.status === 'delivered';
    return true;
  });

  const safeDate = (dateStr: string) => {
    try {
      if (!dateStr) return '—';
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? '—' : d.toLocaleString();
    } catch (e) {
      return '—';
    }
  };

  const handleReorder = (order: any) => {
    // Navigate to BookDelivery with pre-filled data
    navigate('/customer/book', {
      state: {
        reorderData: {
          pickup: order.pickup,
          delivery: order.delivery,
          item: order.item,
          weight: order.weight,
          dimensions: {
            length: order.lengthCm,
            width: order.widthCm
          },
          contact: {
            senderName: order.senderName,
            senderPhone: order.senderPhone,
            recipientName: order.recipientName,
            recipientPhone: order.recipientPhone
          }
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="section-title mb-1">My Orders</h1>
          <p className="section-sub">Track and manage your delivery history — quick actions and detailed info at a glance.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2 bg-white/10 glass-card p-1 rounded-xl">
            <button onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${filter === 'all' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' : 'text-slate-700 hover:bg-white/20'}`}>
              All
            </button>
            <button onClick={() => setFilter('active')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${filter === 'active' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' : 'text-slate-700 hover:bg-white/20'}`}>
              Active
            </button>
            <button onClick={() => setFilter('completed')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${filter === 'completed' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' : 'text-slate-700 hover:bg-white/20'}`}>
              Completed
            </button>
          </div>

          <Link to="/customer/book" className="primary-btn">
            + New Delivery
          </Link>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-5">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-2xl border border-dashed border-white/30">
            <div className="w-20 h-20 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <svg className="w-10 h-10 text-slate-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 7h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 7v-2h10v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">No orders yet</h3>
            <p className="text-slate-600 mb-6">You haven't placed any deliveries. Start by creating a new delivery.</p>
            <Link to="/customer/book" className="primary-btn">Create Delivery</Link>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="glass-card rounded-2xl p-5 md:p-6 hover:shadow-lg transition-transform transform hover:-translate-y-1">
              <div className="flex flex-col md:flex-row gap-4 items-start">

                {/* Left - Icon & ID (fixed width) */}
                <div className="w-full md:w-56 flex-shrink-0 flex items-center gap-3">
                  <div className="flex items-center gap-3">
                    {order.status === 'delivered' ? (
                      <>
                        <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg relative" aria-hidden>
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 to-green-600" />
                          <svg className="w-6 h-6 text-white relative" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                            <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div className="ml-2 hidden sm:block">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/90 text-emerald-700 text-xs font-semibold">Delivered</span>
                        </div>
                      </>
                    ) : (
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md relative">
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600" />
                        <svg className="w-6 h-6 text-white relative" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="4" y="7" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.2" />
                          <path d="M8 7v-2h8v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="ml-2 text-left">
                    <div className="font-semibold text-slate-900">#{order.id ? order.id.slice(0, 8) : '...'}</div>
                    <div className="text-xs muted">{safeDate(order.date)}</div>
                  </div>
                </div>

                {/* Middle - Details (flexible) */}
                <div className="flex-1 w-full">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div className="glass-card p-3 rounded-lg flex items-start gap-3">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center text-red-500 mt-1">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.686 2 6 4.686 6 8c0 4.418 6 11 6 11s6-6.582 6-11c0-3.314-2.686-6-6-6z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="8" r="1.4" fill="currentColor" /></svg>
                      </div>
                      <div>
                        <div className="text-xs muted uppercase">Pickup</div>
                        <div className="text-sm strong truncate">{order.pickup}</div>
                      </div>
                    </div>
                    <div className="glass-card p-3 rounded-lg flex items-start gap-3">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center text-blue-600 mt-1">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" /><circle cx="12" cy="12" r="3" fill="currentColor" /></svg>
                      </div>
                      <div>
                        <div className="text-xs muted uppercase">Delivery</div>
                        <div className="text-sm strong truncate">{order.delivery}</div>
                      </div>
                    </div>
                    <div className="glass-card p-3 rounded-lg flex items-start gap-3">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center text-slate-700 mt-1">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="7" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.2" /></svg>
                      </div>
                      <div>
                        <div className="text-xs muted uppercase">Item</div>
                        <div className="text-sm strong">{order.item}</div>
                      </div>
                    </div>
                    <div className="glass-card p-3 rounded-lg flex items-start gap-3 justify-between">
                      <div>
                        <div className="text-xs muted uppercase">Cost</div>
                        <div className="text-sm strong">₹{order.price}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs muted">ETA</div>
                        <div className="text-sm strong">{order.eta}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right - Actions & Status */}
                <div className="w-full md:w-48 flex flex-col items-stretch gap-3 md:items-end">
                  <div className="w-full md:w-auto">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'pending' ? 'bg-orange-100 text-orange-700' : order.status === 'in-transit' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    {order.status !== 'delivered' && (
                      <Link to={`/track/${order.id}`} className="primary-btn flex-1 md:flex-none">Track</Link>
                    )}
                    <button onClick={() => handleReorder(order)} className="secondary-btn flex-1 md:flex-none">Reorder</button>
                  </div>
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyOrders;
