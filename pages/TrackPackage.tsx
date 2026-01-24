
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
  const order = liveOrder ? { ...contextOrder, ...liveOrder } as Order : contextOrder;

  // Debug logging
  console.log('TrackPackage - Order data:', {
    orderId,
    ownerName: order?.ownerName,
    ownerId: order?.ownerId,
    status: order?.status
  });

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
          const newData = payload.new;
          console.log('Real-time update received:', newData);
          // Map DB columns to App model
          const mappedUpdate: Partial<Order> = {
            status: newData.status,
            eta: newData.eta,
            pickup: newData.pickup,
            delivery: newData.delivery,
            ownerId: newData.owner_id,
            ownerName: newData.owner_name,
            ownerEmail: newData.owner_email,
          };
          console.log('Mapped update:', mappedUpdate);
          setLiveOrder(mappedUpdate);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  // Simulate telemetry and progress
  useEffect(() => {
    if (order?.status === 'in-transit') {
      const interval = setInterval(() => {
        setTelemetry(prev => ({
          alt: 120 + Math.random() * 5 - 2.5,
          speed: 45 + Math.random() * 2,
          battery: Math.max(0, prev.battery - 0.05)
        }));

        // Progress through two phases: 0-50% to pickup, 50-100% to drop
        setProgress(p => {
          if (p >= 100) return 0;
          const newProgress = p + 0.5;
          // Update phase when crossing 50%
          if (p < 50 && newProgress >= 50) {
            setCurrentPhase('to-drop');
          }
          return newProgress;
        });
      }, 100);
      return () => clearInterval(interval);
    } else if (order?.status === 'delivered') {
      setTelemetry({ alt: 0, speed: 0, battery: 45 });
      setProgress(100);
      setCurrentPhase('to-drop');
    } else {
      setProgress(5);
      setCurrentPhase('to-pickup');
    }
  }, [order?.status]);

  // UI handlers and refs
  const camRef = useRef<HTMLDivElement | null>(null);
  const [miniMapZoom, setMiniMapZoom] = useState(1);

  // SVG refs and plane position (for precise placement along the bezier path)
  const pathRef = useRef<SVGPathElement | null>(null);
  const [planePoint, setPlanePoint] = useState({ x: 50, y: 50 });

  const handleSnapshot = useCallback(() => {
    // Try to draw the current <img> into a canvas and download — requires CORS-enabled images
    const imgEl: HTMLImageElement | null = camRef.current?.querySelector('img') ?? null;
    if (!imgEl) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = imgEl.naturalWidth || imgEl.width;
      canvas.height = imgEl.naturalHeight || imgEl.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('no-canvas');
      ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `snapshot_${order?.id || 'order'}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      });
    } catch (err) {
      // Fallback: download image URL directly (may be blocked by CORS)
      const imgUrl = imgEl.src;
      const a = document.createElement('a');
      a.href = imgUrl;
      a.download = `snapshot_${order?.id || 'order'}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  }, [order?.id]);

  const toggleFullscreen = useCallback(() => {
    const el = camRef.current as any;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (el.requestFullscreen) {
      el.requestFullscreen();
    }
  }, []);

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

  const isLive = order.status === 'in-transit';

  // Estimate remaining time (minutes) based on a total duration field when available
  const totalDurationMinutes = (order as any).durationMinutes ?? (order as any).estimatedDurationMinutes ?? 30;
  const minutesLeft = Math.max(0, Math.round(totalDurationMinutes * (1 - progress / 100)));

  // Local StatCard matching OwnerDashboard style
  const StatCard = ({ icon, colorFrom = 'from-blue-400', colorTo = 'to-blue-600', value, label, trend }: any) => (
    <div className="glass-card p-3 sm:p-4 md:p-6 rounded-2xl sm:rounded-3xl border border-white/24">
      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl relative flex items-center justify-center shadow-lg mb-2 sm:mb-3 md:mb-4 mx-auto">
        <div className={`absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br ${colorFrom} ${colorTo}`} />
        <div className="relative text-white text-lg sm:text-xl md:text-2xl">
          <i className={`fas ${icon}`} />
        </div>
      </div>
      <div className="text-center">
        <div className="text-[10px] sm:text-xs text-gray-300 uppercase font-bold tracking-wider sm:tracking-widest mb-1.5 sm:mb-2 md:mb-3">{label}</div>
        <div className="text-xl sm:text-2xl md:text-3xl font-black text-white break-words">{value}</div>
        {trend && <div className="text-[10px] sm:text-xs text-emerald-400 font-semibold mt-1 sm:mt-2 flex items-center justify-center gap-1"><i className="fas fa-arrow-up"></i>{trend}</div>}
      </div>
    </div>
  );

  // Pills used for distance / fee / weight (rounded, gradient, glassy)
  const MetricPill = ({ icon, label, value, gradientFrom = 'from-blue-500', gradientTo = 'to-cyan-500' }: any) => (
    <div className="relative overflow-hidden rounded-[20px] sm:rounded-[26px] border border-white/30 bg-gradient-to-b from-white/15 via-white/5 to-white/0 backdrop-blur-xl shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
      <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-white/5 to-transparent pointer-events-none" />
      <div className="relative flex flex-col items-center gap-2 sm:gap-3 py-3 sm:py-4 md:py-5 px-3 sm:px-4 text-white">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl relative flex items-center justify-center shadow-lg">
          <div className={`absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br ${gradientFrom} ${gradientTo}`} />
          <div className="relative text-white text-base sm:text-lg md:text-xl">
            <i className={`fas ${icon}`} />
          </div>
        </div>
        <div className="text-[9px] sm:text-[10px] md:text-[11px] tracking-[0.2em] sm:tracking-[0.24em] uppercase font-semibold text-white/80 text-center">{label}</div>
        <div className="text-xl sm:text-2xl md:text-3xl font-black leading-tight text-center break-words">{value}</div>
      </div>
    </div>
  );



  // Calculate path segments for two-phase journey
  const getPathData = () => {
    // Segment 1: Warehouse (50, 50) to Pickup (200, 150)
    // Segment 2: Pickup (200, 150) to Drop (350, 150)
    return "M 50 50 Q 125 100 200 150 L 200 150 Q 275 150 350 150";
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
            <div className="glass-card p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/24 shadow-lg w-full sm:w-auto sm:min-w-fit">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl relative flex items-center justify-center shadow-lg flex-shrink-0">
                  <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 opacity-95" />
                  <div className="relative text-white"><i className="fas fa-clock text-base sm:text-lg"></i></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] sm:text-xs text-gray-300 uppercase tracking-wider font-bold">Estimated Arrival</div>
                  <div className="text-lg sm:text-xl md:text-2xl font-extrabold text-white truncate">{order.status === 'delivered' ? 'ARRIVED' : order.eta}</div>
                  <div className="text-[10px] sm:text-xs text-emerald-400 font-semibold flex items-center gap-1 mt-1">Progress • {Math.min(100, Math.max(0, Math.round(progress)))}%</div>
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
          <div className="glass-card rounded-xl sm:rounded-2xl overflow-hidden relative h-[300px] sm:h-[400px] md:h-[500px] border border-white/8 transition-all bg-white/5">
            {/* Subtle Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:48px_48px] opacity-40"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-transparent pointer-events-none"></div>

            {/* Drone Cam View (simplified) */}
            {isLive && (
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 z-10 w-40 sm:w-48 md:w-52 h-24 sm:h-28 md:h-32 bg-black/50 border border-white/12 rounded-lg overflow-hidden hidden md:block transition-all">
                <div className="absolute top-1.5 left-2 sm:top-2 sm:left-3 text-[9px] sm:text-[10px] text-red-400">● REC</div>
                <div ref={camRef} className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex items-center gap-1.5 sm:gap-2 opacity-90">
                  <button onClick={handleSnapshot} className="w-6 h-6 sm:w-7 sm:h-7 bg-white/6 hover:bg-white/12 rounded-md flex items-center justify-center text-white text-[10px] sm:text-xs transition" title="Snapshot">
                    <i className="fas fa-camera"></i>
                  </button>
                  <button onClick={toggleFullscreen} className="w-6 h-6 sm:w-7 sm:h-7 bg-white/6 hover:bg-white/12 rounded-md flex items-center justify-center text-white text-[10px] sm:text-xs transition" title="Fullscreen">
                    <i className="fas fa-expand"></i>
                  </button>
                </div>
                <div className="w-full h-full bg-gray-900 flex items-center justify-center relative">
                  <img src="https://images.pexels.com/photos/8783188/pexels-photo-8783188.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" className="w-full h-full object-cover opacity-72" alt="Drone Cam" />
                  <div className="absolute left-1.5 sm:left-2 bottom-6 sm:bottom-8 bg-black/45 px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[11px] text-white font-mono flex items-center gap-1.5 sm:gap-2">
                    <i className="fas fa-bolt text-yellow-300"></i>
                    <span>{telemetry.battery.toFixed(0)}%</span>
                    <span className="mx-1 sm:mx-2">•</span>
                    <i className="fas fa-arrow-up text-cyan-300"></i>
                    <span>{telemetry.alt.toFixed(0)}m</span>
                  </div>
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-black/35 p-0.5 sm:p-1 text-[9px] sm:text-[11px] text-white font-mono text-center">
                  DRONE-CAM • HEX-404
                </div>
              </div>
            )}

            {/* SVG Flight Path Map */}
            <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12">
              <svg className="w-full h-full" viewBox="0 0 400 220" preserveAspectRatio="xMidYMid meet">
                {/* Define Gradients */}
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#30363D" />
                    <stop offset="50%" stopColor="#0A74DA" />
                    <stop offset="100%" stopColor="#30363D" />
                  </linearGradient>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>

                {/* Flight Path Line (Dashed) - Two segments: Warehouse to Pickup, then Pickup to Drop */}
                <path
                  d={getPathData()}
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="4"
                  strokeDasharray="8 8"
                />

                {/* Progress shadow line (subtle) */}
                <path
                  ref={el => (pathRef.current = el)}
                  d={getPathData()}
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeOpacity={0.9}
                  style={{ strokeDasharray: 1000, strokeDashoffset: 1000 - (progress / 100) * 1000 }}
                />

                {/* Warehouse/Base Point (Starting Point) */}
                <circle cx="50" cy="50" r="7" fill="#8B5CF6" stroke="#A78BFA" strokeWidth="2" />
                <circle cx="50" cy="50" r="7" fill="none" stroke="#A78BFA" strokeWidth="1" opacity="0.5" style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                <text x="50" y="30" textAnchor="middle" fill="#C4B5FD" fontSize="10" fontFamily="monospace" fontWeight="bold">BASE</text>

                {/* Pickup Point */}
                <circle cx="200" cy="150" r="7" fill={currentPhase === 'to-pickup' && progress < 50 ? '#EC4899' : '#10B981'} stroke={currentPhase === 'to-pickup' && progress < 50 ? '#F472B6' : '#6EE7B7'} strokeWidth="2" />
                <circle cx="200" cy="150" r="7" fill="none" stroke={currentPhase === 'to-pickup' && progress < 50 ? '#F472B6' : '#6EE7B7'} strokeWidth="1" opacity="0.5" style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                <text x="200" y="175" textAnchor="middle" fill={currentPhase === 'to-pickup' && progress < 50 ? '#F9A8D4' : '#6EE7B7'} fontSize="10" fontFamily="monospace" fontWeight="bold">PICKUP</text>

                {/* Drop Point */}
                <circle cx="350" cy="150" r="7" fill={order.status === 'delivered' ? '#10B981' : '#EC4899'} stroke={order.status === 'delivered' ? '#6EE7B7' : '#F472B6'} strokeWidth="2" />
                <circle cx="350" cy="150" r="7" fill="none" stroke={order.status === 'delivered' ? '#6EE7B7' : '#F472B6'} strokeWidth="1" opacity="0.5" style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                <text x="350" y="175" textAnchor="middle" fill={order.status === 'delivered' ? '#6EE7B7' : '#F9A8D4'} fontSize="10" fontFamily="monospace" fontWeight="bold">DROP</text>

                {/* Drone marker positioned by SVG path */}
                <g transform={`translate(${planePoint.x}, ${planePoint.y})`}>
                  <circle r="16" fill="rgba(255,255,255,0.03)" />
                  <circle r="9" fill="#0A74DA" stroke="#ffffff" strokeOpacity="0.08" />
                  <text x="0" y="24" textAnchor="middle" fontSize="9" fill="#E6EEF8" fontFamily="monospace">{order.status === 'delivered' ? 'Delivered' : `${Math.round(telemetry.speed)} km/h`}</text>
                </g>
              </svg>

              {/* Progress Bar — Visual progress under map (responsive) */}
              <div className="absolute left-4 right-4 sm:left-8 sm:right-8 md:left-12 md:right-12 bottom-4 sm:bottom-6 h-2 sm:h-3 bg-white/6 rounded-full overflow-hidden border border-white/8">
                <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all" style={{ width: Math.min(100, Math.max(0, progress)) + '%' }} />
              </div>
            </div>
          </div>

          {/* Mini Map Placeholder */}
          <div className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-white/20 shadow-lg mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[10px] sm:text-xs text-gray-300 uppercase tracking-wider">Live Map</div>
                <div className="text-xs sm:text-sm font-semibold text-white">Route Overview</div>
              </div>
              <div className="text-[10px] sm:text-[12px] text-gray-300 font-mono hidden sm:block">Zoom • Pan</div>
            </div>
            <div className="w-full h-28 sm:h-32 md:h-36 rounded-lg border border-white/8 overflow-hidden relative bg-black/20">
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-full h-full bg-[url('https://img.freepik.com/premium-vector/city-navigation-perspective-map-with-two-point-directional-pin_150101-8356.jpg?w=2000')] bg-cover bg-center filter brightness-95"
                  style={{ transform: `scale(${miniMapZoom})` }}
                />
              </div>
              <div className="absolute left-2 top-2 sm:left-3 sm:top-3 bg-white/6 text-[9px] sm:text-xs text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">Map • Demo</div>
              <div className="absolute right-2 bottom-2 sm:right-3 sm:bottom-3 bg-black/40 text-[9px] sm:text-xs text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">Approx</div>
              <div className="absolute right-2 top-2 sm:right-3 sm:top-3 flex flex-col gap-1.5 sm:gap-2">
                <button onClick={zoomInMap} className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-gradient-to-br from-indigo-500 to-cyan-500 text-white flex items-center justify-center shadow-lg ring-1 ring-white/10 text-sm sm:text-base">+</button>
                <button onClick={zoomOutMap} className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-gradient-to-br from-indigo-500 to-cyan-500 text-white flex items-center justify-center shadow-lg ring-1 ring-white/10 text-sm sm:text-base">−</button>
              </div>
            </div>
          </div>

          {/* Telemetry Data Cards (OwnerDashboard StatCard style) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <StatCard icon="fa-arrow-up" colorFrom="from-sky-400" colorTo="to-cyan-400" value={`${telemetry.alt.toFixed(1)} m`} label="Altitude" />
            <StatCard icon="fa-tachometer-alt" colorFrom="from-emerald-400" colorTo="to-emerald-600" value={`${telemetry.speed.toFixed(0)} km/h`} label="Speed" />
            <StatCard icon="fa-battery-three-quarters" colorFrom="from-amber-400" colorTo="to-orange-500" value={`${Math.round(telemetry.battery)}%`} label="Battery" trend={telemetry.battery < 30 ? '- Low' : undefined} />
            <StatCard icon="fa-signal" colorFrom="from-purple-400" colorTo="to-purple-600" value="Strong" label="Signal" />
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

            <div className="space-y-3 sm:space-y-4">
              <div className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-white/[0.03] hover:bg-white/[0.06] rounded-lg border border-white/8 hover:border-white/16 transition-all group cursor-pointer">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg relative flex items-center justify-center shadow-lg flex-shrink-0">
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600" />
                  <div className="relative text-white text-base sm:text-lg"><i className="fas fa-box"></i></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] sm:text-xs text-gray-300 uppercase font-semibold tracking-wide">Package</div>
                  <div className="font-semibold text-white text-sm sm:text-base mt-1 break-words">{order.item}</div>
                  <div className="text-[11px] sm:text-[12px] text-gray-400 mt-1.5 sm:mt-2 flex flex-wrap items-center gap-1.5 sm:gap-2"><i className="fas fa-shield text-amber-400 text-[10px] sm:text-xs"></i><span className="text-amber-300 font-medium">Fragile</span> • <span className="text-cyan-300">Small Package</span></div>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-white/[0.03] hover:bg-white/[0.06] rounded-lg border border-white/8 hover:border-white/16 transition-all group cursor-pointer">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg relative flex items-center justify-center shadow-lg flex-shrink-0">
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-red-500 to-pink-500" />
                  <div className="relative text-white text-base sm:text-lg"><i className="fas fa-map-marker-alt"></i></div>
                </div>
                <div className="overflow-hidden flex-1 min-w-0">
                  <div className="text-[10px] sm:text-xs text-gray-300 uppercase font-semibold tracking-wide">From</div>
                  <div className="font-semibold text-white text-sm sm:text-base mt-1 truncate">{order.pickup}</div>
                  <div className="text-[11px] sm:text-[12px] text-gray-400 mt-1.5 sm:mt-2 flex flex-wrap items-center gap-1.5 sm:gap-2"><i className="fas fa-clock text-orange-400 text-[10px] sm:text-xs"></i><span className="text-amber-300 font-medium">Pickup</span> <span className="text-cyan-300">at {safeTime(order.date)}</span></div>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-white/[0.03] hover:bg-white/[0.06] rounded-lg border border-white/8 hover:border-white/16 transition-all group cursor-pointer">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg relative flex items-center justify-center shadow-lg flex-shrink-0">
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600" />
                  <div className="relative text-white text-base sm:text-lg"><i className="fas fa-flag-checkered"></i></div>
                </div>
                <div className="overflow-hidden flex-1 min-w-0">
                  <div className="text-[10px] sm:text-xs text-gray-300 uppercase font-semibold tracking-wide">To</div>
                  <div className="font-semibold text-white text-sm sm:text-base mt-1 truncate">{order.delivery}</div>
                  <div className="text-[11px] sm:text-[12px] text-gray-400 mt-1.5 sm:mt-2 flex flex-wrap items-center gap-1.5 sm:gap-2"><i className="fas fa-location-dot text-emerald-400 text-[10px] sm:text-xs"></i><span className="text-emerald-300 font-medium">Delivery</span> <span className="text-cyan-300">by {order.eta}</span></div>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 rounded-2xl sm:rounded-3xl p-3 sm:p-4 bg-gradient-to-br from-blue-600/30 via-blue-500/25 to-cyan-500/30 border border-white/15 shadow-inner shadow-blue-900/30">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <MetricPill icon="fa-road" label="Distance" value={order.distance ?? '12.4 km'} gradientFrom="from-indigo-500" gradientTo="to-indigo-600" />
                  <MetricPill icon="fa-rupee-sign" label="Fee" value={order.fee ?? '—'} gradientFrom="from-amber-400" gradientTo="to-orange-500" />
                  <MetricPill icon="fa-box" label="Weight" value={order.weight ?? '0.8 kg'} gradientFrom="from-pink-500" gradientTo="to-fuchsia-600" />
                </div>
              </div>
            </div>
          </div>

          {/* New Timeline - Better Design */}
          <div className="glass-card rounded-xl sm:rounded-2xl border border-white/20 p-4 sm:p-6 hover:border-white/40 transition-all">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="w-1 h-5 sm:h-6 bg-gradient-to-b from-emerald-500 to-green-500 rounded-full"></div>
              <h3 className="text-base sm:text-lg font-bold text-white">Status Timeline</h3>
            </div>

            <div className="relative">
              {/* Vertical Line Background */}
              <div className="absolute top-3 bottom-3 sm:top-4 sm:bottom-4 left-5 sm:left-6 w-0.5 bg-gradient-to-b from-white/30 via-white/10 to-transparent"></div>

              {/* Timeline Items */}
              <div className="space-y-4 sm:space-y-6">

                {/* Item 1 */}
                <div className="relative flex items-start gap-3 sm:gap-4 group">
                  <div className="z-10 flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center border-2 sm:border-4 border-brand-dark shadow-lg shadow-emerald-500/50">
                    <i className="fas fa-check text-white text-sm sm:text-lg"></i>
                  </div>
                  <div className="pt-1.5 sm:pt-2 flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">Order Confirmed</h4>
                    <p className="text-[10px] sm:text-xs text-gray-300 mt-0.5 sm:mt-1">Order received successfully</p>
                    <span className="text-[9px] sm:text-[10px] text-gray-500 font-mono block mt-1.5 sm:mt-2">{safeTime(order.date)}</span>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="relative flex items-start gap-3 sm:gap-4 group">
                  <div className={`z-10 flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 sm:border-4 border-brand-dark shadow-lg transition-all ${order.status !== 'pending' ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-blue-500/50' : 'bg-gray-700/50 text-gray-500'}`}>
                    <i className="fas fa-user-astronaut text-sm sm:text-lg"></i>
                  </div>
                  <div className="pt-1.5 sm:pt-2 flex-1 min-w-0">
                    <h4 className={`text-xs sm:text-sm font-bold transition-colors ${order.status !== 'pending' ? 'text-white group-hover:text-blue-300' : 'text-gray-500'}`}>Pilot Assigned</h4>
                    <p className="text-[10px] sm:text-xs text-gray-300 mt-0.5 sm:mt-1">Captain assigned to mission</p>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="relative flex items-start gap-3 sm:gap-4 group">
                  <div className={`z-10 flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 sm:border-4 border-brand-dark shadow-lg transition-all ${order.status === 'in-transit' ? 'bg-gradient-to-br from-brand-blue to-cyan-500 text-white animate-pulse shadow-blue-500/50 ring-2 ring-blue-400/50' :
                    order.status === 'delivered' ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-emerald-500/50' : 'bg-gray-700/50 text-gray-500'
                    }`}>
                    <i className="fas fa-paper-plane text-sm sm:text-lg"></i>
                  </div>
                  <div className="pt-1.5 sm:pt-2 flex-1 min-w-0">
                    <h4 className={`text-xs sm:text-sm font-bold transition-colors ${order.status === 'in-transit' || order.status === 'delivered' ? 'text-white group-hover:text-cyan-300' : 'text-gray-500'}`}>In Transit</h4>
                    <p className="text-[10px] sm:text-xs text-gray-300 mt-0.5 sm:mt-1">Package is flying to destination</p>
                  </div>
                </div>

                {/* Item 4 */}
                <div className="relative flex items-start gap-3 sm:gap-4 group">
                  <div className={`z-10 flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 sm:border-4 border-brand-dark shadow-lg transition-all ${order.status === 'delivered' ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-emerald-500/50' : 'bg-gray-700/50 text-gray-500'}`}>
                    <i className="fas fa-home text-sm sm:text-lg"></i>
                  </div>
                  <div className="pt-1.5 sm:pt-2 flex-1 min-w-0">
                    <h4 className={`text-xs sm:text-sm font-bold transition-colors ${order.status === 'delivered' ? 'text-white group-hover:text-emerald-300' : 'text-gray-500'}`}>Delivered</h4>
                    <p className="text-[10px] sm:text-xs text-gray-300 mt-0.5 sm:mt-1">Package arrived safely</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Pilot Info */}
          {order.status !== 'pending' && (
            <div className="bg-gradient-to-r from-brand-dark/80 via-blue-900/40 to-cyan-900/40 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg border border-white/10 hover:border-white/20 transition-all group">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative flex-shrink-0">
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(order.ownerName || 'Drone Pilot')}&background=3b82f6&color=fff`} className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-white/40 group-hover:border-white/50 transition-colors shadow-lg shadow-blue-500/30" alt="Pilot" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 bg-emerald-500 border-2 border-brand-dark rounded-full shadow-lg shadow-emerald-500/50 animate-pulse"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-base sm:text-lg group-hover:text-blue-200 transition-colors truncate">
                    {order.ownerName ? `Capt. ${order.ownerName}` : (order.status === 'delivered' ? 'Mission Completed' : 'Awaiting Assignment')}
                  </div>
                  <div className="text-blue-200 text-xs sm:text-sm truncate">
                    {order.ownerName ? 'Pro Pilot • ⭐ Flights' : (order.status === 'delivered' ? 'Package Delivered' : 'Pending Acceptance')}
                  </div>
                </div>
                <Link to="/contact" state={{ orderId: order.id }} className="w-9 h-9 sm:w-10 sm:h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all transform hover:scale-110 text-blue-300 hover:text-blue-200 flex-shrink-0">
                  <i className="fas fa-comment-dots text-sm sm:text-base"></i>
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
