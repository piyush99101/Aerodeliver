import React, { useState, useRef, useEffect } from 'react';

interface StartupAnimationProps {
    onComplete: () => void;
}

const StartupAnimation: React.FC<StartupAnimationProps> = ({ onComplete }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isZooming, setIsZooming] = useState(false);
    const [showPlayButton, setShowPlayButton] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        // Attempt to autoplay
        if (videoRef.current) {
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    // Auto-play was prevented
                    setShowPlayButton(true);
                });
            }
        }
    }, []);

    const handleStart = () => {
        if (videoRef.current) {
            videoRef.current.play();
            setShowPlayButton(false);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current && videoRef.current.duration) {
            const timeLeft = videoRef.current.duration - videoRef.current.currentTime;
            if (timeLeft <= 1.5 && !isZooming) {
                setIsZooming(true);
            }
        }
    };

    const handleVideoEnd = () => {
        setIsVisible(false);
        setTimeout(onComplete, 500);
    };

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
        >
            <video
                ref={videoRef}
                playsInline
                preload="auto"
                className={`w-full h-full object-cover transition-all duration-[1500ms] ease-out ${isZooming ? 'scale-[2.5] opacity-0' : 'scale-100 opacity-100'
                    }`}
                style={{ willChange: 'transform, opacity' }}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnd}
            >
                <source src="/assets/startup.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>



            {showPlayButton && (
                <button
                    onClick={handleStart}
                    className="absolute z-10 group overflow-hidden px-12 py-5 text-xl font-bold text-white tracking-widest uppercase rounded-[2rem] bg-white/10 backdrop-blur-xl border border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:bg-white/20 hover:border-white/50 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.47)] hover:scale-105 transition-all duration-300"
                >
                    <span className="relative z-10 drop-shadow-lg">Enter Site</span>
                    <div className="absolute inset-0 -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
                </button>
            )}
        </div>
    );
};

export default StartupAnimation;
