import React from 'react';
import { useData } from '../../services/DataContext';
import { useAuth } from '../../services/AuthContext';
import { useNavigate } from 'react-router-dom';

const Requests: React.FC = () => {
  const { orders, updateOrderStatus } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Filter for pending requests
  const requests = orders.filter(o => o.status === 'pending');

  const handleAccept = (id: string) => {
    // Check if we already have an active mission (optional logic, but good for demo)
    const activeMissions = orders.filter(o => o.status === 'in-transit');
    if (activeMissions.length >= 3) {
      alert("Fleet capacity reached! Complete current missions before accepting more.");
      return;
    }

    if (!user) {
      alert("You must be logged in to accept missions.");
      return;
    }

    // Pass user ID, Name, and Email to updateOrderStatus
    updateOrderStatus(id, 'in-transit', user.id, user.name, user.email);

    // Immediate feedback: Go to dashboard to control the mission
    navigate('/owner/dashboard');
  };

  const handleDecline = (id: string) => {
    // For demo purposes, we'll just alert. In real app, update to 'rejected'
    alert("Request declined. Removing from feed...");
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600/20 to-brand-blue/10 backdrop-blur-sm rounded-3xl p-8 border border-white/10 mx-6 mt-6">
        <h1 className="text-4xl font-bold text-brand-dark mb-2">Delivery Requests</h1>
        <p className="text-gray-600 text-lg">Review new missions, check details, and build your earnings. {requests.length > 0 && <span className="text-brand-blue font-semibold">{requests.length} request{requests.length !== 1 ? 's' : ''} waiting</span>}</p>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 glass-card rounded-2xl border border-white/20 hover:shadow-lg transition-all">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-200 to-brand-blue/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <i className="fas fa-satellite-dish text-brand-blue text-4xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No Active Requests</h2>
            <p className="text-gray-600 max-w-md text-center mb-6">There are no pending delivery requests in your area right now. Stay online to receive notifications when new missions arrive.</p>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
              <i className="fas fa-circle text-green-500 text-xs animate-pulse"></i>
              <span className="text-sm font-medium text-blue-700">You're online and ready to receive requests</span>
            </div>
          </div>
        ) : (
          <div>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="glass-card p-4 rounded-xl border border-white/10 text-center">
                <div className="text-3xl font-bold text-brand-dark mb-1">{requests.length}</div>
                <div className="text-xs text-gray-600 uppercase font-semibold">Pending Requests</div>
              </div>
              <div className="glass-card p-4 rounded-xl border border-white/10 text-center">
                <div className="text-3xl font-bold text-amber-600 mb-1">₹{(requests.reduce((sum, r) => sum + r.price, 0)).toFixed(0)}</div>
                <div className="text-xs text-gray-600 uppercase font-semibold">Total Earnings</div>
              </div>
              <div className="glass-card p-4 rounded-xl border border-white/10 text-center">
                <div className="text-3xl font-bold text-emerald-600 mb-1">{requests.reduce((sum, r) => sum + parseInt(r.eta), 0)} min</div>
                <div className="text-xs text-gray-600 uppercase font-semibold">Avg Total Time</div>
              </div>
            </div>

            {/* Request Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-1 gap-5">
              {requests.map(request => (
                <div key={request.id} className="glass-card rounded-2xl border border-white/20 overflow-hidden hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 group">
                  <div className="p-6">
                    {/* Header with Order Info */}
                    <div className="flex justify-between items-start mb-5">
                      <div className="flex gap-4 flex-1">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-brand-blue rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                          <i className="fas fa-cube text-xl"></i>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-brand-dark">Order #{request.id}</h3>
                          <p className="text-gray-500 text-sm flex items-center gap-2">
                            <i className="fas fa-clock text-xs"></i>
                            {new Date(request.date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-600 mb-1">₹{request.price}</div>
                        <div className="text-xs text-amber-600 uppercase font-bold">Your Earning</div>
                      </div>
                    </div>

                    {/* Route Section */}
                    <div className="space-y-4 mb-6 bg-white/10 rounded-xl p-5 border border-white/10">
                      {/* Pickup */}
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/50"></div>
                          <div className="w-0.5 h-8 bg-gradient-to-b from-green-500 to-gray-300 my-1"></div>
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="text-xs text-gray-500 uppercase font-bold tracking-wide">Pickup Location</div>
                          <div className="text-gray-900 font-semibold text-sm mt-1">{request.pickup}</div>
                        </div>
                      </div>

                      {/* Delivery */}
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/50"></div>
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="text-xs text-gray-500 uppercase font-bold tracking-wide">Delivery Location</div>
                          <div className="text-gray-900 font-semibold text-sm mt-1">{request.delivery}</div>
                        </div>
                      </div>
                    </div>

                    {/* Package Details */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="bg-white/30 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
                        <div className="text-xs text-gray-600 uppercase font-bold mb-1">Weight</div>
                        <div className="text-lg font-bold text-brand-dark flex items-center justify-center gap-1">
                          <i className="fas fa-weight-hanging text-sm text-gray-500"></i>
                          {request.weight || '-'} kg
                        </div>
                      </div>
                      <div className="bg-white/30 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
                        <div className="text-xs text-gray-600 uppercase font-bold mb-1">Dimensions</div>
                        <div className="text-sm font-bold text-brand-dark flex items-center justify-center gap-1 h-full">
                          <i className="fas fa-box text-sm text-gray-500"></i>
                          {request.lengthCm ? `${request.lengthCm}x${request.widthCm}x${request.heightCm}` : 'Std'}
                        </div>
                      </div>
                      <div className={`backdrop-blur-sm rounded-xl p-3 text-center border ${request.fragile ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/30 border-white/20'}`}>
                        <div className={`text-xs uppercase font-bold mb-1 ${request.fragile ? 'text-amber-700' : 'text-gray-600'}`}>Type</div>
                        <div className={`text-lg font-bold flex items-center justify-center gap-1 ${request.fragile ? 'text-amber-700' : 'text-brand-dark'}`}>
                          {request.fragile ? <i className="fas fa-wine-glass-alt text-sm"></i> : <i className="fas fa-cube text-sm text-gray-500"></i>}
                          {request.fragile ? 'Fragile' : 'Standard'}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleDecline(request.id)}
                        className="py-3 px-4 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2 group/btn"
                      >
                        <i className="fas fa-times-circle group-hover/btn:scale-110 transition-transform"></i>
                        Decline
                      </button>
                      <button
                        onClick={() => handleAccept(request.id)}
                        className="py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-brand-blue to-blue-600 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 flex items-center justify-center gap-2 group/btn"
                      >
                        <i className="fas fa-check-circle group-hover/btn:scale-110 transition-transform"></i>
                        Accept Mission
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Requests;