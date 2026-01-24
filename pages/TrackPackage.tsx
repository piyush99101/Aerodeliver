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

  // SVG refs and plane position
  const pathRef = useRef<SVGPathElement | null>(null);
  const [planePoint, setPlanePoint] = useState({ x: 50, y: 50 });

  const handleSnapshot = useCallback(() => {
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

  // update plane position along SVG path
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
  const totalDurationMinutes = (order as any).durationMinutes ?? (order as any).estimatedDurationMinutes ?? 30;

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

  const getPathData = () => "M 50 50 Q 125 100 200 150 L 200 150 Q 275 150 350 150";

  const safeDate = (dateStr: string | undefined) => {
    try {
      if (!dateStr) return '—';
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
    } catch (e) { return '—'; }
  };

  const safeTime = (dateStr: string | undefined) => {
    try {
      if (!dateStr) return '—';
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? '—' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) { return '—'; }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 space-y-4 sm:space-y-6">
      <div className="bg-gradient-to-r from-indigo-600/20 to-brand-blue/10 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-white/10 mx-2 sm:mx-4 md:mx-6 mt-4 sm:mt-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1">Mission Control • Tracking</h1>
            <p className="text-gray-300 text-xs sm:text-sm truncate">Order #{order.id} • Placed {safeDate(order.date)}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full lg:w-auto">
            <div className="glass-card p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/24 shadow-lg w-full sm:w-auto sm:min-w-fit">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl relative flex items-center justify-center shadow-lg flex-shrink-0">
                  <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 opacity-95" />
                  <div className="relative text-white"><i className="fas fa-clock text-base sm:text-lg"></i></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] sm:text-xs text-gray-300 uppercase tracking-wider font-bold">Estimated Arrival</div>
                  <div className="text-lg sm:text-xl md:text-2xl font-extrabold text-white truncate">{order.status === 'delivered' ? 'ARRIVED' : order.eta}</div>
                  <div className="text-[10px] sm:text-xs text-emerald-400 font-semibold flex items-center gap-1 mt-1">Progress • {Math.round(progress)}%</div>
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
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="glass-card rounded-xl sm:rounded-2xl overflow-hidden relative h-[300px] sm:h-[400px] md:h-[500px] border border-white/8 transition-all bg-white/5">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:48px_48px] opacity-40"></div>
            
            {isLive && (
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 z-10 w-40 sm:w-48 md:w-52 h-24 sm:h-28 md:h-32 bg-black/50 border border-white/12 rounded-lg overflow-hidden hidden md:block transition-all">
                <div className="absolute top-1.5 left-2 sm:top-2 sm:left-3 text-[9px] sm:text-[10px] text-red-400">● REC</div>
                <div ref={camRef} className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex items-center gap-1.5 sm:gap-2 opacity-90">
                  <button onClick={handleSnapshot} className="w-6 h-6 sm:w-7 sm:h-7 bg-white/6 hover:bg-white/12 rounded-md flex items-center justify-center text-white text-[10px] sm:text-xs transition"><i className="fas fa-camera"></i></button>
                  <button onClick={toggleFullscreen} className="w-6 h-6 sm:w-7 sm:h-7 bg-white/6 hover:bg-white/12 rounded-md flex items-center justify-center text-white text-[10px] sm:text-xs transition"><i className="fas fa-expand"></i></button>
                </div>
                <div className="w-full h-full bg-gray-900 flex items-center justify-center relative">
                  <img src="https://images.pexels.com/photos/8783188/pexels-photo-8783188.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" className="w-full h-full object-cover opacity-72" alt="Drone Cam" />
                  <div className="absolute left-1.5 sm:left-2 bottom-6 sm:bottom-8 bg-black/45 px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[11px] text-white font-mono flex items-center gap-1.5 sm:gap-2">
                    <i className="fas fa-bolt text-yellow-300"></i><span>{telemetry.battery.toFixed(0)}%</span>
                    <i className="fas fa-arrow-up text-cyan-300"></i><span>{telemetry.alt.toFixed(0)}m</span>
                  </div>
                </div>
              </div>
            )}

            <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12">
              <svg className="w-full h-full" viewBox="0 0 400 220" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>

                <path d={getPathData()} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" strokeDasharray="8 8" />

                {/* FIXED LINE BELOW: Added curly braces to ref callback to ensure it returns void */}
                <path
                  ref={(el) => { pathRef.current = el as SVGPathElement; }}
                  d={getPathData()}
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeOpacity={0.9}
                  style={{ strokeDasharray: 1000, strokeDashoffset: 1000 - (progress / 100) * 1000 }}
                />

                <circle cx="50" cy="50" r="7" fill="#8B5CF6" stroke="#A78BFA" strokeWidth="2" />
                <text x="50" y="30" textAnchor="middle" fill="#C4B5FD" fontSize="10" fontFamily="monospace" fontWeight="bold">BASE</text>

                <circle cx="200" cy="150" r="7" fill={currentPhase === 'to-pickup' && progress < 50 ? '#EC4899' : '#10B981'} stroke={currentPhase === 'to-pickup' && progress < 50 ? '#F472B6' : '#6EE7B7'} strokeWidth="2" />
                <text x="200" y="175" textAnchor="middle" fill={currentPhase === 'to-pickup' && progress < 50 ? '#F9A8D4' : '#6EE7B7'} fontSize="10" fontFamily="monospace" fontWeight="bold">PICKUP</text>

                <circle cx="350" cy="150" r="7" fill={order.status === 'delivered' ? '#10B981' : '#EC4899'} stroke={order.status === 'delivered' ? '#6EE7B7' : '#F472B6'} strokeWidth="2" />
                <text x="350" y="175" textAnchor="middle" fill={order.status === 'delivered' ? '#6EE7B7' : '#F9A8D4'} fontSize="10" fontFamily="monospace" fontWeight="bold">DROP</text>

                <g transform={`translate(${planePoint.x}, ${planePoint.y})`}>
                  <circle r="9" fill="#0A74DA" stroke="#ffffff" strokeOpacity="0.08" />
                  <text x="0" y="24" textAnchor="middle" fontSize="9" fill="#E6EEF8" fontFamily="monospace">{order.status === 'delivered' ? 'Delivered' : `${Math.round(telemetry.speed)} km/h`}</text>
                </g>
              </svg>

              <div className="absolute left-4 right-4 sm:left-8 sm:right-8 md:left-12 md:right-12 bottom-4 sm:bottom-6 h-2 sm:h-3 bg-white/6 rounded-full overflow-hidden border border-white/8">
                <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all" style={{ width: Math.min(100, Math.max(0, progress)) + '%' }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <StatCard icon="fa-arrow-up" colorFrom="from-sky-400" colorTo="to-cyan-400" value={`${telemetry.alt.toFixed(1)} m`} label="Altitude" />
            <StatCard icon="fa-tachometer-alt" colorFrom="from-emerald-400" colorTo="to-emerald-600" value={`${telemetry.speed.toFixed(0)} km/h`} label="Speed" />
            <StatCard icon="fa-battery-three-quarters" colorFrom="from-amber-400" colorTo="to-orange-500" value={`${Math.round(telemetry.battery)}%`} label="Battery" trend={telemetry.battery < 30 ? '- Low' : undefined} />
            <StatCard icon="fa-signal" colorFrom="from-purple-400" colorTo="to-purple-600" value="Strong" label="Signal" />
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="glass-card rounded-xl sm:rounded-2xl border border-white/20 p-4 sm:p-6 transition-all">
            <h3 className="text-base sm:text-lg font-bold text-white mb-4">Delivery Details</h3>
            <div className="space-y-3">
               <div className="p-3 bg-white/[0.03] rounded-lg border border-white/8">
                  <div className="text-[10px] text-gray-300 uppercase">Package</div>
                  <div className="font-semibold text-white text-sm">{order.item}</div>
               </div>
               <div className="p-3 bg-white/[0.03] rounded-lg border border-white/8">
                  <div className="text-[10px] text-gray-300 uppercase">From</div>
                  <div className="font-semibold text-white text-sm">{order.pickup}</div>
               </div>
               <div className="p-3 bg-white/[0.03] rounded-lg border border-white/8">
                  <div className="text-[10px] text-gray-300 uppercase">To</div>
                  <div className="font-semibold text-white text-sm">{order.delivery}</div>
               </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TrackPackage;
