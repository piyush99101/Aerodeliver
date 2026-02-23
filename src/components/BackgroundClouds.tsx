import React from 'react';

const BackgroundClouds: React.FC = () => {
    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-transparent">
            {/* Simplified static cloud filter */}
            <svg width="0" height="0" className="absolute">
                <defs>
                    <filter id="master-cloud-filter">
                        <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="15" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="55" />
                        <feGaussianBlur stdDeviation="3.5" />
                    </filter>
                </defs>
            </svg>

            {/* Depth Planes - Simplified */}
            <div className="absolute inset-0 z-[-15]">
                {/* Background Deep Glow */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-[15%] left-[10%] w-[1200px] h-[600px] bg-sky-100/30 blur-[180px] rounded-full" />
                </div>

                {/* Far Mist */}
                <div className="absolute inset-0 opacity-40">
                    <div className="absolute top-[5%] right-[-10%] w-[800px] h-[400px] bg-white/20 blur-[140px] rounded-full" />
                    <div className="absolute top-[50%] left-[-15%] w-[1200px] h-[200px] bg-white/10 blur-[110px] rounded-full" />
                </div>

                {/* Mid-Far - Realistic Clusters */}
                <div className="absolute inset-0">
                    <div className="absolute top-[10%] left-[5%] opacity-60">
                        <div className="absolute -inset-24 bg-white/40 blur-[110px] rounded-full" />
                        <svg width="450" height="220" viewBox="0 0 450 220" style={{ filter: 'url(#master-cloud-filter)' }} className="relative z-10">
                            <circle cx="100" cy="110" r="75" fill="#f8fafc" />
                            <circle cx="210" cy="90" r="100" fill="white" />
                            <circle cx="340" cy="120" r="80" fill="#f1f5f9" />
                            <circle cx="210" cy="80" r="50" fill="white" opacity="0.5" />
                        </svg>
                    </div>
                </div>

                {/* Primary Framing Clouds */}
                <div className="absolute inset-0">
                    <div className="absolute bottom-[8%] right-[8%] opacity-75">
                        <div className="absolute -inset-28 bg-white/60 blur-[140px] rounded-full" />
                        <div className="absolute -bottom-16 right-0 w-[500px] h-[250px] bg-blue-100/15 blur-[90px] rounded-full" />

                        <svg width="550" height="280" viewBox="0 0 550 280" style={{ filter: 'url(#master-cloud-filter)' }} className="relative z-10">
                            <circle cx="140" cy="150" r="100" fill="#f1f5f9" />
                            <circle cx="300" cy="130" r="125" fill="white" />
                            <circle cx="450" cy="160" r="95" fill="#f8fafc" />
                            <ellipse cx="300" cy="80" rx="110" ry="45" fill="white" opacity="0.7" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Near-Field Wisps */}
            <div className="absolute inset-0 z-[10] opacity-35">
                <div className="absolute bottom-[20%] left-[5%] w-[450px] h-[180px] bg-white/30 blur-[90px] rounded-full" />
                <div className="absolute top-[15%] right-[15%] w-[350px] h-[120px] bg-white/20 blur-[75px] rounded-full" />
            </div>

            {/* Volumetric Horizon Lighting */}
            <div className="absolute bottom-0 left-0 right-0 h-[40vh] bg-gradient-to-t from-white/50 via-white/10 to-transparent z-[-5]">
                <div className="absolute bottom-[-15%] left-1/2 -translate-x-1/2 w-full h-full opacity-40 bg-[radial-gradient(ellipse_at_bottom,_white_0%,_transparent_70%)] blur-[70px]" />
            </div>

            {/* Master Edge Bloom */}
            <div className="absolute inset-0 pointer-events-none opacity-25 z-[20]"
                style={{ background: 'radial-gradient(circle at center, transparent 70%, rgba(180,210,255,0.4) 100%)' }} />
        </div>
    );
};

export default React.memo(BackgroundClouds);
