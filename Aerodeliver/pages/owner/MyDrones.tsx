import React, { useState, useMemo } from 'react';
import { useData } from '../../services/DataContext';
import { useAuth } from '../../services/AuthContext';
import { Drone } from '../../types';

const MyDrones: React.FC = () => {
  const [isAdding, setIsAdding] = useState(false);
  const { drones, addDrone, updateDroneStatus } = useData();
  const { user } = useAuth();

  const [newDrone, setNewDrone] = useState({ model: '', id: '' });
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all'|'active'|'offline'|'charging'|'maintenance'>('all');
  const [selectedDrone, setSelectedDrone] = useState<Drone | null>(null);
  const [modalTab, setModalTab] = useState<'details'|'settings'>('details');

  // Filter drones belonging to current user
  const myDrones = drones.filter(d => d.ownerId === user?.id);

  const filteredDrones = useMemo(() => {
    return myDrones.filter(d => {
      const matchesQuery = query.trim() === '' || d.model.toLowerCase().includes(query.toLowerCase()) || d.id.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = filterStatus === 'all' || d.status === filterStatus;
      return matchesQuery && matchesStatus;
    });
  }, [myDrones, query, filterStatus]);

  const totalCount = myDrones.length;
  const onlineCount = myDrones.filter(d => d.status === 'active').length;
  const avgBattery = myDrones.length ? Math.round(myDrones.reduce((s, d) => s + d.battery, 0) / myDrones.length) : 0;

  const handleAddDrone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const drone: Drone = {
      id: newDrone.id || `D-${Math.floor(Math.random() * 1000)}`,
      ownerId: user.id,
      model: newDrone.model,
      status: 'offline', // Default new drone to offline
      battery: 100,
      flights: 0,
      hours: 0,
      lastMaintenance: new Date().toISOString().split('T')[0],
      image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&q=80&w=300&h=200'
    };
    
    addDrone(drone);
    setIsAdding(false);
    setNewDrone({ model: '', id: '' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'charging': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'maintenance': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 60) return 'bg-green-500';
    if (level > 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-600/10 to-brand-blue/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-brand-dark mb-2">My Fleet</h1>
            <p className="text-gray-600">Manage, monitor, and optimize your drone fleet in real-time.</p>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="primary-btn px-6 py-3 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            <i className="fas fa-plus"></i> Add Drone
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="glass-card p-5 rounded-2xl flex items-center gap-4 hover:shadow-lg hover:scale-105 transition-all duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-brand-blue text-white rounded-xl flex items-center justify-center shadow-lg">
              <i className="fas fa-dove text-xl"></i>
            </div>
            <div>
              <div className="text-sm text-gray-500 font-medium">Total Drones</div>
              <div className="text-2xl font-bold text-brand-dark">{totalCount}</div>
            </div>
          </div>
          <div className="glass-card p-5 rounded-2xl flex items-center gap-4 hover:shadow-lg hover:scale-105 transition-all duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-xl flex items-center justify-center shadow-lg">
              <i className="fas fa-signal text-xl"></i>
            </div>
            <div>
              <div className="text-sm text-gray-500 font-medium">Online</div>
              <div className="text-2xl font-bold text-brand-dark">{onlineCount}</div>
            </div>
          </div>
          <div className="glass-card p-5 rounded-2xl flex items-center gap-4 hover:shadow-lg hover:scale-105 transition-all duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 text-white rounded-xl flex items-center justify-center shadow-lg">
              <i className="fas fa-battery-three-quarters text-xl"></i>
            </div>
            <div>
              <div className="text-sm text-gray-500 font-medium">Avg Battery</div>
              <div className="text-2xl font-bold text-brand-dark">{avgBattery}%</div>
            </div>
          </div>
        </div>

        {/* Search and filter bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mb-6 bg-white/40 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <div className="flex-1 relative">
            <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by model or ID..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue bg-white focus:bg-white outline-none transition"
            />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="px-4 py-2.5 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-brand-blue outline-none transition">
            <option value="all">All Statuses</option>
            <option value="active">Online</option>
            <option value="offline">Offline</option>
            <option value="charging">Charging</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <button onClick={() => { setQuery(''); setFilterStatus('all'); }} className="secondary-btn px-6 py-2.5 whitespace-nowrap">
            <i className="fas fa-redo mr-2"></i>Reset
          </button>
        </div>

      {isAdding && (
        <div className="mb-8 glass-card p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-brand-dark">Register New Drone</h3>
            <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600">
              <i className="fas fa-times"></i>
            </button>
          </div>
          <form onSubmit={handleAddDrone} className="grid md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model Name</label>
              <input 
                type="text" 
                required
                value={newDrone.model}
                onChange={(e) => setNewDrone({...newDrone, model: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none"
                placeholder="e.g. SkyRunner X1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Drone ID (Optional)</label>
              <input 
                type="text" 
                value={newDrone.id}
                onChange={(e) => setNewDrone({...newDrone, id: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none"
                placeholder="e.g. D-505"
              />
            </div>
            <button type="submit" className="primary-btn px-6 py-2">
              Register Drone
            </button>
          </form>
        </div>
      )}

      {myDrones.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 glass-card rounded-2xl border-dashed border-white/10 text-center">
            <div className="w-20 h-20 bg-white/30 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-helicopter text-white/80 text-3xl"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Drones Registered</h3>
            <p className="text-slate-500 max-w-sm mb-6">You haven't added any drones to your fleet yet. Add your first drone to start accepting missions.</p>
            <button 
              onClick={() => setIsAdding(true)}
              className="primary-btn"
            >
              + Add your first drone
            </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrones.map(drone => (
            <div key={drone.id} className="glass-card rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                  {/* Image section with improved hover overlay */}
                  <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                    <img src={drone.image} alt={drone.model} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />

                    {/* Enhanced hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="flex gap-3">
                        <button onClick={() => updateDroneStatus(drone.id, 'active')} aria-label="Send mission" className="primary-btn px-4 py-2 text-sm font-semibold shadow-lg transform hover:scale-110 transition">Send</button>
                        <button onClick={() => { setSelectedDrone(drone); setModalTab('settings'); }} className="secondary-btn px-4 py-2 text-sm font-semibold shadow-lg transform hover:scale-110 transition">Settings</button>
                      </div>
                    </div>

                    {/* Status badge with enhanced styling */}
                    <div className="absolute top-3 right-3 z-10">
                      <button onClick={() => setSelectedDrone(drone)} className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg border-2 backdrop-blur-sm ${getStatusColor(drone.status)} hover:shadow-xl transition-shadow`}>
                        {drone.status === 'active' ? 'Online' : drone.status}
                      </button>
                    </div>

                    {/* Model and ID overlay */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                      <h3 className="text-white font-bold text-lg truncate">{drone.model}</h3>
                      <p className="text-white/80 text-xs font-mono mt-1">{drone.id}</p>
                    </div>
                  </div>

                  {/* Battery panel with gradient */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 p-4 border-b border-white/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Battery</span>
                      <span className="text-sm font-bold text-brand-dark">{drone.battery}%</span>
                    </div>
                    <div className="w-full bg-white/50 rounded-full h-3 overflow-hidden border border-white/40 shadow-inner">
                      <div 
                        className={`h-3 rounded-full transition-all duration-300 ${getBatteryColor(drone.battery)}`} 
                        style={{width: `${drone.battery}%`}} 
                      />
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div className="flex-1 p-4 grid grid-cols-2 gap-2">
                    <div className="bg-white/40 backdrop-blur-sm rounded-xl p-3 text-center border border-white/30 hover:bg-white/50 transition">
                      <div className="text-xs text-gray-600 uppercase font-semibold tracking-wider">Flights</div>
                      <div className="text-xl font-bold text-brand-dark mt-1">{drone.flights}</div>
                    </div>
                    <div className="bg-white/40 backdrop-blur-sm rounded-xl p-3 text-center border border-white/30 hover:bg-white/50 transition">
                      <div className="text-xs text-gray-600 uppercase font-semibold tracking-wider">Hours</div>
                      <div className="text-xl font-bold text-brand-dark mt-1">{drone.hours}h</div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="p-4 bg-white/30 border-t border-white/30 space-y-2">
                    <button 
                      onClick={() => updateDroneStatus(drone.id, drone.status === 'offline' ? 'active' : 'offline')}
                      className={`w-full px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${drone.status === 'offline' ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 shadow-md hover:shadow-lg' : 'bg-gray-200 hover:bg-gray-300 text-gray-800 shadow-md hover:shadow-lg'}`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <i className={`fas ${drone.status === 'offline' ? 'fa-power-off' : 'fa-ban'}`}></i>
                        {drone.status === 'offline' ? 'Go Online' : 'Go Offline'}
                      </span>
                    </button>
                    <div className="flex gap-2">
                      <button onClick={() => { setSelectedDrone(drone); setModalTab('details'); }} className="flex-1 px-3 py-2 rounded-lg bg-white/50 hover:bg-white/70 text-brand-dark text-sm font-semibold transition shadow-sm">
                        <i className="fas fa-eye mr-2"></i>Details
                      </button>
                      <button className="flex-1 px-3 py-2 rounded-lg bg-white/50 hover:bg-white/70 text-brand-dark text-sm font-semibold transition shadow-sm" onClick={() => { setSelectedDrone(drone); setModalTab('settings'); }}>
                        <i className="fas fa-cog mr-2"></i>Settings
                      </button>
                    </div>
                  </div>
            </div>
          ))}

          {/* Add New Card Placeholder */}
          <button 
            onClick={() => setIsAdding(true)}
            className="glass-card rounded-2xl border-2 border-dashed border-white/30 flex flex-col items-center justify-center min-h-96 hover:border-brand-blue hover:shadow-xl transition-all duration-300 group"
          >
              <div className="w-16 h-16 bg-gradient-to-br from-brand-blue to-blue-600 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <i className="fas fa-plus text-2xl"></i>
              </div>
              <h3 className="text-gray-800 font-bold text-lg">Add New Drone</h3>
              <p className="text-gray-500 text-sm mt-2 text-center max-w-xs">Register and manage a new drone in your fleet</p>
              <div className="mt-6">
                <button onClick={() => setIsAdding(true)} className="primary-btn px-6 py-2.5">+ Add Drone</button>
              </div>
          </button>
        </div>
      )}

      {selectedDrone && (
        <div className="modal-backdrop fixed inset-0 z-40 flex items-center justify-center backdrop-blur-sm bg-black/30 p-4" onClick={() => setSelectedDrone(null)}>
          <div className="modal-panel glass-card p-0 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal header with gradient */}
            <div className="bg-gradient-to-r from-blue-600/20 to-brand-blue/10 border-b border-white/20 p-6 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-brand-dark">{selectedDrone.model}</h3>
                <div className="text-sm text-gray-500 font-mono mt-1">ID: {selectedDrone.id}</div>
              </div>
              <button onClick={() => setSelectedDrone(null)} className="text-gray-400 hover:text-gray-600 hover:bg-white/20 rounded-lg p-2 transition">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            {/* Tab navigation */}
            <div className="flex border-b border-white/10 bg-white/5">
              <button 
                onClick={() => { setModalTab('details'); }} 
                className={`flex-1 py-4 text-center font-semibold transition-all ${modalTab === 'details' ? 'text-brand-dark border-b-2 border-brand-blue bg-white/20' : 'text-gray-600 hover:text-gray-700'}`}
              >
                <i className="fas fa-info-circle mr-2"></i>Details
              </button>
              <button 
                onClick={() => { setModalTab('settings'); }} 
                className={`flex-1 py-4 text-center font-semibold transition-all ${modalTab === 'settings' ? 'text-brand-dark border-b-2 border-brand-blue bg-white/20' : 'text-gray-600 hover:text-gray-700'}`}
              >
                <i className="fas fa-cog mr-2"></i>Settings
              </button>
            </div>

            {/* Modal content */}
            <div className="p-6">
              {modalTab === 'details' ? (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <img src={selectedDrone.image} alt={selectedDrone.model} className="w-full h-56 object-cover rounded-2xl shadow-lg" />
                  </div>
                  <div className="space-y-4">
                    <div className="glass-card p-4 rounded-xl border border-white/10">
                      <div className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Status</div>
                      <div className={`inline-block mt-2 px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(selectedDrone.status)}`}>{selectedDrone.status.toUpperCase()}</div>
                    </div>
                    
                    <div className="glass-card p-4 rounded-xl border border-white/10">
                      <div className="text-xs text-gray-500 uppercase font-semibold tracking-wide mb-2">Battery Level</div>
                      <div className="text-3xl font-bold text-brand-dark mb-3">{selectedDrone.battery}%</div>
                      <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden border border-white/40">
                        <div className={`h-3 rounded-full transition-all ${getBatteryColor(selectedDrone.battery)}`} style={{width: `${selectedDrone.battery}%`}} />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="glass-card p-3 rounded-xl text-center border border-white/10">
                        <div className="text-xs text-gray-500 uppercase font-semibold">Flights</div>
                        <div className="text-2xl font-bold text-brand-dark mt-1">{selectedDrone.flights}</div>
                      </div>
                      <div className="glass-card p-3 rounded-xl text-center border border-white/10">
                        <div className="text-xs text-gray-500 uppercase font-semibold">Hours</div>
                        <div className="text-2xl font-bold text-brand-dark mt-1">{selectedDrone.hours}h</div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button className="flex-1 primary-btn py-2.5 flex items-center justify-center gap-2 font-semibold">
                        <i className="fas fa-paper-plane"></i>Send Mission
                      </button>
                      <button className="secondary-btn px-4 py-2.5 flex items-center justify-center gap-2 font-semibold" onClick={() => { updateDroneStatus(selectedDrone.id, 'maintenance'); setSelectedDrone(null); }}>
                        <i className="fas fa-wrench"></i>Maintenance
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="glass-card p-4 rounded-xl border border-white/10">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Drone Status</label>
                    <select defaultValue={selectedDrone.status} onChange={(e) => updateDroneStatus(selectedDrone.id, e.target.value as any)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue bg-white outline-none transition">
                      <option value="active">Online</option>
                      <option value="offline">Offline</option>
                      <option value="charging">Charging</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                  
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                    <i className="fas fa-lightbulb mr-2"></i>
                    Changing the status will update the drone's operational mode immediately.
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button className="flex-1 primary-btn py-2.5 font-semibold" onClick={() => setSelectedDrone(null)}>
                      <i className="fas fa-check mr-2"></i>Confirm
                    </button>
                    <button className="flex-1 secondary-btn py-2.5 font-semibold" onClick={() => setSelectedDrone(null)}>
                      <i className="fas fa-times mr-2"></i>Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default MyDrones;