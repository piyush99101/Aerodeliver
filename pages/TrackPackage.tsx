import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useData } from '../services/DataContext';
import { supabase } from '../services/supabase';
import { Order } from '../types';
import Footer from '../components/Footer';

const TrackPackage: React.FC = () => {
  const { orderId } = useParams();
  const { orders, loading } = useData();
  const contextOrder = orders.find(o => o.id === orderId);
  const [liveOrder, setLiveOrder] = useState<Partial<Order> | null>(null);

  // Merge context order with live updates
  // Merge context order with live updates safely
  const order = contextOrder ? (liveOrder ? { ...contextOrder, ...liveOrder } : contextOrder) : (liveOrder as Order);

  console.log('TrackPackage - Order Status:', order?.status);

  const [telemetry, setTelemetry] = useState({ alt: 120, speed: 0, battery: 100 });
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<'to-pickup' | 'to-drop'>('to-pickup');

  useEffect(() => {
    if (!orderId) return;

    const channel = supabase
      .channel(`order-tracking-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          console.log('Real-time payload arrived:', payload);
          const newData = payload.new;
          const mappedUpdate = {
            status: newData.status,
            eta: newData.eta,
            pickup: newData.pickup,
            delivery: newData.delivery,
            ownerId: newData.owner_id,
            ownerName: newData.owner_name,
            ownerEmail: newData.owner_email,
          };
          console.log('Applying mapped update:', mappedUpdate);
          setLiveOrder(prev => ({ ...prev, ...mappedUpdate }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  // Status-driven progress and telemetry
  useEffect(() => {
    if (!order) return;
    console.log('Animation Triggered - New Status:', order.status);

    if (order.status === 'delivered') {
      setProgress(100);
      setTelemetry({ alt: 0, speed: 0, battery: 45 });
      setCurrentPhase('to-drop');
    } else if (order.status === 'picked-up') {
      setProgress(50);
      setTelemetry({ alt: 120, speed: 45, battery: 85 });
      setCurrentPhase('to-drop');
    } else if (order.status === 'in-transit') {
      setProgress(5);
      setTelemetry({ alt: 120, speed: 45, battery: 100 });
      setCurrentPhase('to-pickup');
    } else {
      setProgress(0);
      setTelemetry({ alt: 0, speed: 0, battery: 100 });
      setCurrentPhase('to-pickup');
    }
  }, [order?.status]);

  const [miniMapZoom, setMiniMapZoom] = useState(1);
  const pathRef = useRef<SVGPathElement | null>(null);
  const [planePoint, setPlanePoint] = useState({ x: 50, y: 50 });

  const zoomInMap = () => setMiniMapZoom(z => Math.min(2, +(z + 0.25).toFixed(2)));
  const zoomOutMap = () => setMiniMapZoom(z => Math.max(0.5, +(z - 0.25).toFixed(2)));

  // update plane position along SVG path when progress changes
  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    try {
      const len = path.getTotalLength();
      const pct = Math.min(100, Math.max(0, progress)) / 100;
      const pt = path.getPointAtLength(pct * len);
      setPlanePoint({ x: pt.x, y: pt.y });
    } catch (e) {
      // ignore
    }
  }, [progress]);

  if (loading && !order) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <i className="fas fa-circle-notch fa-spin text-4xl text-brand-blue"></i>
          <p>Locating satellite signal...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4 sm:p-6">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-full flex items-center justify-center mb-4 sm:mb-6 animate-pulse border border-red-500/30">
          <i className="fas fa-satellite-dish text-red-400 text-3xl sm:text-4xl"></i>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">Signal Lost</h2>
        <p className="text-gray-300 mb-6 sm:mb-8 text-base sm:text-lg max-w-md px-4">We couldn't locate order #{orderId}. It may have been completed or the ID is incorrect.</p>
        <Link to="/customer/dashboard" className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg sm:rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all shadow-md shadow-blue-500/30 transform hover:scale-105 text-sm sm:text-base">Return to Dashboard</Link>
      </div>
    );
  }

  const isLive = order.status === 'in-transit' || order.status === 'picked-up';

  // Estimate remaining time (minutes) based on a total duration field when available
  const totalDurationMinutes = (order as any).durationMinutes ?? (order as any).estimatedDurationMinutes ?? 30;
  const minutesLeft = Math.max(0, Math.round(totalDurationMinutes * (1 - progress / 100)));

  // Local StatCard matching OwnerDashboard style
  const StatCard = ({ icon, colorFrom = 'from-blue-400', colorTo = 'to-blue-600', value, label, trend }: any) => (
    <div className="glass-card p-5 sm:p-6 rounded-[32px] border border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-[0_0_20px_rgba(0,0,0,0.3)] transition-all hover:border-blue-500/30 group overflow-hidden relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-2xl -mr-12 -mt-12 rounded-full"></div>
      <div className="w-14 h-14 rounded-2xl relative flex items-center justify-center mb-4 mx-auto transform group-hover:rotate-12 group-hover:scale-110 transition-all">
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${colorFrom} ${colorTo} opacity-90 shadow-lg shadow-blue-500/20`} />
        <div className="relative text-white text-xl">
          <i className={`fas ${icon}`} />
        </div>
      </div>
      <div className="text-center relative z-10">
        <div className="text-[10px] text-blue-300 font-black tracking-[0.2em] uppercase mb-1">{label}</div>
        <div className="text-2xl font-black text-white italic tracking-tight">{value}</div>
        {trend && (
          <div className="mt-2 text-[9px] font-bold uppercase tracking-widest text-emerald-400 flex items-center justify-center gap-1">
            <i className="fas fa-arrow-trend-up"></i> {trend}
          </div>
        )}
      </div>
    </div>
  );

  // Pills used for distance / fee / weight (rounded, gradient, glassy)
  const MetricPill = ({ icon, label, value, gradientFrom = 'from-blue-500', gradientTo = 'to-cyan-500' }: any) => (
    <div className="relative overflow-hidden rounded-[24px] sm:rounded-[32px] border border-white/15 bg-slate-900/40 backdrop-blur-xl shadow-xl transition-all hover:bg-slate-900/60 group">
      <div className="relative flex flex-col items-center gap-2 py-4 sm:py-5 px-3 text-white">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl relative flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
          <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${gradientFrom} ${gradientTo} opacity-80`} />
          <div className="relative text-white text-base sm:text-lg">
            <i className={`fas ${icon}`} />
          </div>
        </div>
        <div className="text-[9px] sm:text-[10px] tracking-widest uppercase font-bold text-blue-300/80 text-center">{label}</div>
        <div className="text-xl sm:text-2xl font-black leading-tight text-center break-words group-hover:text-cyan-200 transition-colors uppercase italic">{value}</div>
      </div>
    </div>
  );



  // Calculate path segments for two-phase journey
  const getPathData = () => {
    // Segment 1: Warehouse (50, 110) to Pickup (200, 110)
    // Segment 2: Pickup (200, 110) to Drop (350, 110)
    return "M 50 110 L 200 110 L 350 110";
  };

  // Helper for safe date parsing
  const safeDate = (dateStr: string | undefined) => {
    try {
      if (!dateStr) return '—';
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
    } catch (e) {
      return '—';
    }
  };
  const safeTime = (dateStr: string | undefined) => {
    try {
      if (!dateStr) return '—';
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? '—' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '—';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 space-y-4 sm:space-y-6">
      {/* Header (OwnerDashboard style) */}
      <div className="bg-gradient-to-r from-indigo-600/20 to-brand-blue/10 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-white/10 mx-2 sm:mx-4 md:mx-6 mt-4 sm:mt-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1">Mission Control • Tracking</h1>
            <p className="text-gray-300 text-xs sm:text-sm truncate">Order #{order.id} • Placed {safeDate(order.date)}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full lg:w-auto">
            {/* Small ETA/Progress Card */}
            <div className="glass-card p-4 rounded-[20px] border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-md shadow-xl w-full sm:w-auto sm:min-w-fit">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl relative flex items-center justify-center shadow-lg flex-shrink-0">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 opacity-90" />
                  <div className="relative text-white"><i className="fas fa-clock text-lg"></i></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Estimated Arrival</div>
                  <div className="text-xl sm:text-2xl font-black text-white truncate">{order.status === 'delivered' ? 'ARRIVED' : order.eta}</div>
                  <div className="text-[10px] text-emerald-400 font-black flex items-center gap-1 mt-0.5 tracking-widest uppercase">
                    <span className="animate-pulse">●</span> LIVE PROGRESS • {Math.min(100, Math.max(0, Math.round(progress)))}%
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <Link to="/customer/dashboard" className="text-gray-300 hover:text-white font-medium transition text-sm sm:text-base whitespace-nowrap">Close</Link>
              <Link to="/contact" state={{ orderId: order.id }} className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium hover:opacity-95 transition shadow-md text-sm sm:text-base whitespace-nowrap">Contact</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column: Map & Visuals */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">

          {/* Main Visualizer */}
          <div className="glass-card rounded-xl sm:rounded-2xl overflow-hidden relative h-[300px] sm:h-[400px] md:h-[500px] border border-white/8 transition-all bg-gradient-to-b from-slate-950 via-blue-950/20 to-slate-950">
            {/* Pulsating Glow Effect behind mission area */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-blue-500/5 blur-[120px] rounded-full animate-pulse-slow"></div>

            {/* Subtle Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40"></div>

            {/* SVG Flight Path Map */}
            <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12">
              <svg className="w-full h-full" viewBox="0 0 400 220" preserveAspectRatio="xMidYMid meet">
                {/* Define Gradients */}
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Flight Path Base Line */}
                <path
                  d={getPathData()}
                  fill="none"
                  stroke="rgba(255,255,255,0.03)"
                  strokeWidth="6"
                  strokeLinecap="round"
                />

                {/* Progress Outer Glow */}
                <path
                  d={getPathData()}
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeOpacity={0.15}
                  filter="blur(4px)"
                  className="transition-all duration-1000 ease-in-out"
                  style={{
                    strokeDasharray: pathRef.current?.getTotalLength() || 1000,
                    strokeDashoffset: (pathRef.current?.getTotalLength() || 1000) * (1 - progress / 100)
                  }}
                />

                {/* Main Progress Line */}
                <path
                  ref={el => { pathRef.current = el; }}
                  d={getPathData()}
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  filter="url(#glow)"
                  className="transition-all duration-1000 ease-in-out"
                  style={{
                    strokeDasharray: pathRef.current?.getTotalLength() || 1000,
                    strokeDashoffset: (pathRef.current?.getTotalLength() || 1000) * (1 - progress / 100)
                  }}
                />

                {/* Markers with improved positioning and visuals */}
                {/* BASE */}
                <g transform="translate(50, 110)">
                  <circle r="12" fill="rgba(139, 92, 246, 0.1)" />
                  <circle r="6" fill="#8B5CF6" stroke="#fff" strokeOpacity="0.5" strokeWidth="2" filter="url(#glow)" />
                  <g transform="translate(0, -25)">
                    <rect x="-25" y="-8" width="50" height="16" rx="8" fill="rgba(0,0,0,0.6)" stroke="#8B5CF6" strokeOpacity="0.4" />
                    <text textAnchor="middle" dy="4" fill="#C4B5FD" fontSize="9" fontFamily="monospace" fontWeight="black" letterSpacing="1">BASE</text>
                  </g>
                </g>

                {/* PICKUP */}
                <g transform="translate(200, 110)">
                  <circle r="12" fill={currentPhase === 'to-pickup' && progress < 50 ? 'rgba(236, 72, 153, 0.1)' : 'rgba(16, 185, 129, 0.1)'} />
                  <circle r="6" fill={currentPhase === 'to-pickup' && progress < 50 ? '#EC4899' : '#10B981'} stroke="#fff" strokeOpacity="0.5" strokeWidth="2" filter="url(#glow)" />
                  <g transform="translate(0, 25)">
                    <rect x="-35" y="-8" width="70" height="16" rx="8" fill="rgba(0,0,0,0.6)" stroke={currentPhase === 'to-pickup' && progress < 50 ? '#EC4899' : '#10B981'} strokeOpacity="0.4" />
                    <text textAnchor="middle" dy="4" fill="#fff" fontSize="9" fontFamily="monospace" fontWeight="black" letterSpacing="1">PICKUP</text>
                  </g>
                </g>

                {/* DROP */}
                <g transform="translate(350, 110)">
                  <circle r="12" fill={order.status === 'delivered' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(236, 72, 153, 0.1)'} />
                  <circle r="6" fill={order.status === 'delivered' ? '#10B981' : '#EC4899'} stroke="#fff" strokeOpacity="0.5" strokeWidth="2" filter="url(#glow)" />
                  <g transform="translate(0, 25)">
                    <rect x="-30" y="-8" width="60" height="16" rx="8" fill="rgba(0,0,0,0.6)" stroke={order.status === 'delivered' ? '#10B981' : '#EC4899'} strokeOpacity="0.4" />
                    <text textAnchor="middle" dy="4" fill="#fff" fontSize="9" fontFamily="monospace" fontWeight="black" letterSpacing="1">DROP</text>
                  </g>
                </g>

                {/* Drone marker with pulsating beacon */}
                <g className="transition-all duration-1000 ease-in-out" transform={`translate(${planePoint.x}, ${planePoint.y})`}>
                  <circle r="20" fill="rgba(59, 130, 246, 0.1)" className="animate-pulse" />
                  <circle r="12" fill="rgba(59, 130, 246, 0.2)" />
                  <circle r="6" fill="#3b82f6" stroke="#fff" strokeWidth="2" filter="url(#glow)" />

                  {/* Status Capsule */}
                  <g transform="translate(0, -22)">
                    <rect x="-45" y="-9" width="90" height="18" rx="9" fill="rgba(59, 130, 246, 0.9)" className="shadow-lg" />
                    <text textAnchor="middle" dy="4" fontSize="8" fill="#fff" fontFamily="monospace" fontWeight="bold">
                      {order.status === 'delivered' ? 'ARRIVED' : order.status === 'picked-up' ? 'LOADING...' : `${Math.round(telemetry.speed)} KM/H`}
                    </text>
                  </g>
                </g>
              </svg>

              {/* Progress Bar — Visual progress under map (responsive) */}
              <div className="absolute left-4 right-4 sm:left-8 sm:right-8 md:left-12 md:right-12 bottom-4 sm:bottom-6 h-2 sm:h-3 bg-white/6 rounded-full overflow-hidden border border-white/8">
                <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-1000 ease-in-out" style={{ width: Math.min(100, Math.max(0, progress)) + '%' }} />
              </div>
            </div>
          </div>

          {/* Tactical Route Overview */}
          <div className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-[32px] border border-white/10 shadow-2xl bg-slate-900/20 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 blur-[100px] -mr-20 -mt-20 rounded-full"></div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                <div>
                  <div className="text-[10px] text-blue-300 font-black tracking-widest uppercase mb-0.5">Tactical Display</div>
                  <div className="text-xs font-black text-white italic uppercase">Route Navigation</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Active Link</span>
                </div>
                <div className="text-[10px] text-blue-400 font-mono hidden md:block tracking-widest italic">Z-COORD: 45.2 • SCANNING...</div>
              </div>
            </div>

            <div className="w-full h-32 sm:h-40 md:h-48 rounded-xl border border-white/10 overflow-hidden relative bg-black/40 ring-1 ring-blue-500/20">
              {/* Tactical Brackets */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-blue-500/50 rounded-tl"></div>
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-blue-500/50 rounded-tr"></div>
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-blue-500/50 rounded-bl"></div>
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-blue-500/50 rounded-br"></div>

              {/* Holographic Scanning Line */}
              <div className="absolute inset-0 bg-blue-500/5 pointer-events-none"></div>
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-b from-blue-500/20 to-transparent animate-scan z-20 pointer-events-none shadow-[0_0_15px_rgba(59,130,246,0.3)]"></div>

              <div className="absolute inset-0 flex items-center justify-center transition-all duration-700">
                <div
                  className="w-full h-full bg-[url('https://img.freepik.com/premium-vector/city-navigation-perspective-map-with-two-point-directional-pin_150101-8356.jpg?w=2000')] bg-cover bg-center filter grayscale contrast-125 brightness-75 opacity-60 mix-blend-screen"
                  style={{ transform: `scale(${miniMapZoom})` }}
                />
              </div>

              {/* Data Overlay */}
              <div className="absolute left-4 top-4 z-30 pointer-events-none">
                <div className="text-[9px] font-mono text-blue-400 bg-blue-950/80 px-2 py-1 rounded border border-blue-500/30 backdrop-blur-sm tracking-widest">MAP•SAT•INTEL</div>
              </div>

              <div className="absolute right-3 top-3 flex flex-col gap-2 z-30">
                <button onClick={zoomInMap} className="w-8 h-8 rounded-lg bg-slate-900/80 hover:bg-blue-600 border border-white/10 text-white flex items-center justify-center transition-all shadow-xl backdrop-blur-md group">
                  <i className="fas fa-plus text-xs group-hover:scale-125 transition-transform"></i>
                </button>
                <button onClick={zoomOutMap} className="w-8 h-8 rounded-lg bg-slate-900/80 hover:bg-blue-600 border border-white/10 text-white flex items-center justify-center transition-all shadow-xl backdrop-blur-md group">
                  <i className="fas fa-minus text-xs group-hover:scale-125 transition-transform"></i>
                </button>
              </div>

              <div className="absolute right-4 bottom-4 z-30 pointer-events-none">
                <div className="text-[9px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-1 rounded border border-emerald-500/30 backdrop-blur-sm tracking-widest uppercase">Target Locked</div>
              </div>
            </div>
          </div>

          {/* Tactical Telemetry Cards */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              icon="fa-signal"
              colorFrom="from-blue-500"
              colorTo="to-cyan-600"
              value="STABLE"
              label="Sync Status"
              trend="98% SIGNAL"
            />
            <StatCard
              icon="fa-bolt"
              colorFrom="from-amber-400"
              colorTo="to-orange-600"
              value={`${Math.round(telemetry.battery)}%`}
              label="Energy"
              trend="OPTIMAL"
            />
          </div>
        </div>

        {/* Right Column: Details & Timeline */}
        <div className="space-y-4 sm:space-y-6">

          {/* Order Summary */}
          <div className="glass-card rounded-xl sm:rounded-2xl border border-white/20 p-4 sm:p-6 hover:border-white/40 transition-all">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="w-1 h-5 sm:h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
              <h3 className="text-base sm:text-lg font-bold text-white">Delivery Details</h3>
            </div>

            <div className="space-y-4 sm:space-y-5">
              <div className="flex gap-4 p-4 bg-slate-900/40 hover:bg-slate-900/60 rounded-2xl border border-white/10 hover:border-blue-500/30 transition-all group backdrop-blur-xl">
                <div className="w-12 h-12 rounded-xl relative flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0 group-hover:scale-110 transition-transform">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 opacity-90" />
                  <div className="relative text-white text-xl"><i className="fas fa-box"></i></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-blue-300 font-black tracking-[0.2em] uppercase">Package</div>
                  <div className="font-black text-white text-base mt-1 break-words italic uppercase tracking-tight">{order.item}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-[10px] text-amber-400 font-bold uppercase tracking-wider">Fragile</span>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Small</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-slate-900/40 hover:bg-slate-900/60 rounded-2xl border border-white/10 hover:border-blue-500/30 transition-all group backdrop-blur-xl">
                <div className="w-12 h-12 rounded-xl relative flex items-center justify-center shadow-lg shadow-red-500/20 flex-shrink-0 group-hover:scale-110 transition-transform">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-rose-400 via-red-500 to-pink-600 opacity-90" />
                  <div className="relative text-white text-xl"><i className="fas fa-map-marker-alt"></i></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-rose-300 font-black tracking-[0.2em] uppercase">From</div>
                  <div className="font-black text-white text-base mt-1 truncate italic uppercase tracking-tight">{order.pickup}</div>
                  <div className="mt-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                    <i className="fas fa-clock text-amber-400 animate-pulse"></i>
                    <span className="text-gray-300">Pickup @</span>
                    <span className="text-amber-400">{safeTime(order.date)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-slate-900/40 hover:bg-slate-900/60 rounded-2xl border border-white/10 hover:border-blue-500/30 transition-all group backdrop-blur-xl">
                <div className="w-12 h-12 rounded-xl relative flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0 group-hover:scale-110 transition-transform">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 opacity-90" />
                  <div className="relative text-white text-xl"><i className="fas fa-flag-checkered"></i></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-emerald-300 font-black tracking-[0.2em] uppercase">To</div>
                  <div className="font-black text-white text-base mt-1 truncate italic uppercase tracking-tight">{order.delivery}</div>
                  <div className="mt-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                    <i className="fas fa-location-dot text-emerald-400 animate-bounce-slow"></i>
                    <span className="text-gray-300">Delivery By</span>
                    <span className="text-emerald-400">{order.status === 'delivered' ? 'COMPLETED' : order.eta}</span>
                  </div>
                </div>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-4">
                <MetricPill icon="fa-road" label="Distance" value={order.distance ?? '12.4 km'} gradientFrom="from-blue-600/40" gradientTo="to-cyan-600/40" />
                <MetricPill icon="fa-box" label="Weight" value={order.weight ?? '0.8 kg'} gradientFrom="from-blue-600/40" gradientTo="to-cyan-600/40" />
              </div>
            </div>
          </div>

          {/* Premium Status Timeline */}
          <div className="glass-card rounded-2xl sm:rounded-[32px] border border-white/10 p-6 sm:p-8 hover:border-white/20 transition-all bg-slate-900/20 backdrop-blur-xl group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 blur-[100px] -mr-20 -mt-20 rounded-full animate-pulse-slow"></div>

            <div className="flex items-center gap-3 mb-8">
              <div className="w-1.5 h-6 bg-gradient-to-b from-emerald-400 to-green-600 rounded-full shadow-[0_0_12px_rgba(52,211,153,0.5)]"></div>
              <h3 className="text-lg font-black text-white tracking-widest uppercase italic">Mission Timeline</h3>
            </div>

            <div className="relative">
              {/* Glowing Vertical Connector */}
              <div className="absolute top-6 bottom-6 left-6 sm:left-7 w-[2px] bg-gradient-to-b from-emerald-500/50 via-blue-500/30 to-slate-800 shadow-[0_0_8px_rgba(59,130,246,0.2)]"></div>

              {/* Timeline Items */}
              <div className="space-y-8 sm:space-y-10">

                {/* Step 1: CONFIRMED */}
                <div className="relative flex items-start gap-5 group/item">
                  <div className="z-10 flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)] group-hover/item:shadow-[0_0_25px_rgba(16,185,129,0.2)] transition-all">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-inner">
                      <i className="fas fa-check text-white text-sm"></i>
                    </div>
                  </div>
                  <div className="pt-2 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-black text-white italic uppercase tracking-tighter">Order Confirmed</h4>
                      <div className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] font-mono text-gray-400 uppercase">{safeTime(order.date)}</div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 font-medium tracking-tight">Logistic sequence initiated successfully.</p>
                  </div>
                </div>

                {/* Step 2: PILOT ASSIGNED */}
                <div className="relative flex items-start gap-5 group/item">
                  <div className={`z-10 flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border transition-all ${order.status !== 'pending' ? 'bg-blue-500/10 border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'bg-slate-800/50 border-white/5'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-inner ${order.status !== 'pending' ? 'bg-gradient-to-br from-cyan-400 to-blue-600' : 'bg-slate-700'}`}>
                      <i className={`fas fa-user-astronaut text-sm ${order.status !== 'pending' ? 'text-white' : 'text-slate-500'}`}></i>
                    </div>
                  </div>
                  <div className="pt-2 flex-1 min-w-0">
                    <h4 className={`text-sm font-black italic uppercase tracking-tighter transition-colors ${order.status !== 'pending' ? 'text-white' : 'text-slate-500'}`}>Pilot Assigned</h4>
                    <p className={`text-xs mt-1 font-medium tracking-tight ${order.status !== 'pending' ? 'text-gray-400' : 'text-slate-600'}`}>Elite captain synchronized for this mission.</p>
                  </div>
                </div>

                {/* Step 3: PICKED UP */}
                <div className="relative flex items-start gap-5 group/item">
                  <div className={`z-10 flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border transition-all ${order.status === 'picked-up' || order.status === 'delivered' ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_20px_rgba(52,211,153,0.1)]' : order.status === 'in-transit' ? 'bg-blue-500/10 border-blue-500/30 animate-pulse shadow-[0_0_25px_rgba(59,130,246,0.2)]' : 'bg-slate-800/50 border-white/5'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-inner ${order.status === 'picked-up' || order.status === 'delivered' ? 'bg-gradient-to-br from-emerald-400 to-green-600' : order.status === 'in-transit' ? 'bg-gradient-to-br from-cyan-400 to-blue-600' : 'bg-slate-700'}`}>
                      <i className={`fas fa-box-open text-sm ${order.status !== 'pending' ? 'text-white' : 'text-slate-500'}`}></i>
                    </div>
                  </div>
                  <div className="pt-2 flex-1 min-w-0">
                    <h4 className={`text-sm font-black italic uppercase tracking-tighter transition-colors ${order.status === 'picked-up' || order.status === 'delivered' || order.status === 'in-transit' ? 'text-white' : 'text-slate-500'}`}>Package Secured</h4>
                    <p className={`text-xs mt-1 font-medium tracking-tight ${order.status === 'picked-up' || order.status === 'delivered' || order.status === 'in-transit' ? 'text-gray-400' : 'text-slate-600'}`}>
                      {order.status === 'picked-up' || order.status === 'delivered' ? 'Package loaded and confirmed.' : 'Drone navigating to warehouse.'}
                    </p>
                  </div>
                </div>

                {/* Step 4: IN TRANSIT */}
                <div className="relative flex items-start gap-5 group/item">
                  <div className={`z-10 flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border transition-all ${order.status === 'delivered' ? 'bg-emerald-500/10 border-emerald-500/30' : order.status === 'picked-up' ? 'bg-blue-500/10 border-blue-500/30 animate-pulse-slow' : 'bg-slate-800/50 border-white/5'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-inner ${order.status === 'delivered' ? 'bg-gradient-to-br from-emerald-400 to-green-600' : order.status === 'picked-up' ? 'bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-slate-700'}`}>
                      <i className={`fas fa-paper-plane text-sm ${order.status === 'picked-up' || order.status === 'delivered' ? 'text-white' : 'text-slate-500'}`}></i>
                    </div>
                  </div>
                  <div className="pt-2 flex-1 min-w-0">
                    <h4 className={`text-sm font-black italic uppercase tracking-tighter transition-colors ${order.status === 'picked-up' || order.status === 'delivered' ? 'text-white' : 'text-slate-500'}`}>Global Transit</h4>
                    <p className={`text-xs mt-1 font-medium tracking-tight ${order.status === 'picked-up' || order.status === 'delivered' ? 'text-gray-400' : 'text-slate-600'}`}>Cruising to delivery coordinates.</p>
                  </div>
                </div>

                {/* Step 5: DELIVERED */}
                <div className="relative flex items-start gap-5 group/item">
                  <div className={`z-10 flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border transition-all ${order.status === 'delivered' ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'bg-slate-800/50 border-white/5'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-inner ${order.status === 'delivered' ? 'bg-gradient-to-br from-emerald-400 to-green-600' : 'bg-slate-700'}`}>
                      <i className={`fas fa-home text-sm ${order.status === 'delivered' ? 'text-white' : 'text-slate-500'}`}></i>
                    </div>
                  </div>
                  <div className="pt-2 flex-1 min-w-0">
                    <h4 className={`text-sm font-black italic uppercase tracking-tighter transition-colors ${order.status === 'delivered' ? 'text-white' : 'text-slate-500'}`}>Mission Success</h4>
                    <p className={`text-xs mt-1 font-medium tracking-tight ${order.status === 'delivered' ? 'text-gray-400' : 'text-slate-600'}`}>Package safely established at base.</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Pilot Info */}
          {order.status !== 'pending' && (
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-[24px] sm:rounded-[32px] p-5 sm:p-6 text-white shadow-2xl border border-white/10 hover:border-white/20 transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -mr-16 -mt-16 rounded-full"></div>
              <div className="flex items-center gap-4 sm:gap-5 relative z-10">
                <div className="relative flex-shrink-0">
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(order.ownerName || 'Drone Pilot')}&background=3b82f6&color=fff`} className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-white/20 group-hover:border-blue-400/50 transition-colors shadow-lg shadow-blue-500/20" alt="Pilot" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full shadow-lg animate-pulse"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-lg sm:text-xl group-hover:text-blue-300 transition-colors truncate tracking-tight uppercase">
                    {order.ownerName ? `CAPTAIN ${order.ownerName.split(' ')[0]}` : (order.status === 'delivered' ? 'MISSION COMPLETED' : 'AWAITING ASSIGNMENT')}
                  </div>
                  <div className="text-blue-400 text-[10px] sm:text-xs truncate font-bold tracking-[0.15em] uppercase mt-1">
                    {order.ownerName ? 'ELITE DRONE PILOT • GRADE A' : (order.status === 'delivered' ? 'PACKAGE SECURED' : 'PENDING ACCEPTANCE')}
                  </div>
                </div>
                <Link to="/contact" state={{ orderId: order.id }} className="w-12 h-12 bg-white/5 hover:bg-blue-500/20 rounded-2xl flex items-center justify-center transition-all transform hover:scale-105 border border-white/10 text-blue-400 group-hover:text-blue-200">
                  <i className="fas fa-comment-dots text-lg"></i>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackPackage;
