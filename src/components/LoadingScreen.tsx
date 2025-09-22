
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface LoadingScreenProps {
  onLoadingComplete?: () => void;
  duration?: number; // Duration in milliseconds
  exitAnimation?: 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down' | 'fade';
}

export default function LoadingScreen({ 
  onLoadingComplete, 
  duration = 3500,
  exitAnimation = 'fade'
}: LoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isHiding, setIsHiding] = useState(false);
  const [textAnimation, setTextAnimation] = useState('animate-in');
  const [imageError, setImageError] = useState(false);
  const [bgTextureUrl, setBgTextureUrl] = useState<string>('/clean-gray-paper.png');
  const [assetsReady, setAssetsReady] = useState(false);

  useEffect(() => {
    // Prefer local texture from public/ if available to avoid network cost
    const candidateTextures = ['/clean-gray-paper.png'];
    (async () => {
      for (const path of candidateTextures) {
        try {
          // Attempt to load local asset; if it exists, switch background
          await new Promise<void>((resolve, reject) => {
            const img = new window.Image();
            img.onload = () => resolve();
            img.onerror = () => reject(new Error('not found'));
            img.src = path;
          });
          setBgTextureUrl(path);
          break;
        } catch {}
      }

      // Pre-decode main splash image to avoid jank on first paint/exit
      try {
        const splash = new window.Image();
        splash.src = '/emtriloading.png';
        await (splash.decode ? splash.decode() : Promise.resolve());
      } catch {}
      setAssetsReady(true);
    })();

    // Start text animation immediately
    setTextAnimation('animate-in');

  // Begin exit once assets are ready; rely on CSS animationend to unmount
  if (assetsReady && !isHiding) {
    setIsHiding(true);
  }

    return () => {
    // no timers anymore
    };
  }, [duration, onLoadingComplete, assetsReady, isHiding]);

  if (!isVisible) return null;

  const getExitAnimationClass = () => {
    if (!isHiding) return '';
    switch (exitAnimation) {
      case 'slide-right': return 'ls-exit-slide-right';
      case 'slide-up': return 'ls-exit-slide-up';
      case 'slide-down': return 'ls-exit-slide-down';
      case 'fade': return 'ls-exit-fade';
      default: return 'ls-exit-slide-left';
    }
  };

  const exitClass = getExitAnimationClass();

  return (
    <div 
      className={`loading-screen-container ${exitClass}`}
      style={{
        background: 'linear-gradient(135deg, #f5f5e6 0%, #f8f8f5 50%, #f5f5e6 100%)',
        backgroundImage: `url("${bgTextureUrl}")`,
        backgroundSize: 'auto',
        backgroundRepeat: 'repeat',
        willChange: 'opacity, transform',
        transform: 'translateZ(0)'
      }}
      onAnimationEnd={() => { if (isHiding) { setIsVisible(false); onLoadingComplete?.(); } }}
    >
      {/* Background Pattern Overlay */}
      <div className={`absolute inset-0 opacity-30`}>
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: 'linear-gradient(rgba(139, 0, 0, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 0, 0, 0.03) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            backgroundRepeat: 'repeat'
          }}
        />
      </div>

      {/* Main Content Container */}
      <div className={`relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto`}>
        
        {/* Image Container */}
        <div className="mb-8 sm:mb-12 lg:mb-16 relative">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 mx-auto">
            <Image
              src="/emtriloading.png"
              alt="E-Matrimonial Loading"
              fill
              className="object-contain"
              priority
              onError={(e) => {
                console.log('Image failed to load:', e);
                setImageError(true);
              }}
            />
            {/* Fallback text only if image fails to load */}
            {imageError && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
                Loading...
                </div>
            )}
            
            {/* Floating Hearts Animation */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute text-red-400 opacity-60 animate-float"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${30 + (i % 2) * 20}%`,
                    animationDelay: `${i * 0.3}s`,
                    fontSize: `${12 + i * 2}px`
                  }}
                >
                  ♥
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Main Headline */}
          <h1 
            className="loading-screen-text font-bold text-gray-800"
            style={{
              fontFamily: 'Georgia, Times New Roman, Times, serif',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            Let tech do the searching.
            <br />
            <span className="text-red-600 animate-pulse-slow">You focus on the spark.</span>
          </h1>

          {/* Subtitle */}
          <p 
            className="loading-screen-subtitle text-gray-600"
            style={{
              fontFamily: 'Georgia, Times New Roman, Times, serif',
              letterSpacing: '0.5px'
            }}
          >
            E-Matrimonial helps you find your GEM from the crowd—effortlessly.
          </p>

          {/* Loading Dots Animation */}
          <div className="flex justify-center space-x-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-red-500 rounded-full animate-pulse"
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1.5s'
                }}
              />
            ))}
          </div>
        </div>

      </div>

      {/* CSS for animations */}
      <style jsx>{`
        .ls-exit-fade { animation: lsFadeOut ${Math.min(1000, duration + 200)}ms cubic-bezier(0.22, 0.44, 0, 1) forwards; }
        .ls-exit-slide-left { animation: lsSlideLeftOut ${Math.min(1000, duration + 200)}ms cubic-bezier(0.22, 0.44, 0, 1) forwards; }
        .ls-exit-slide-right { animation: lsSlideRightOut ${Math.min(1000, duration + 200)}ms cubic-bezier(0.22, 0.44, 0, 1) forwards; }
        .ls-exit-slide-up { animation: lsSlideUpOut ${Math.min(1000, duration + 200)}ms cubic-bezier(0.22, 0.44, 0, 1) forwards; }
        .ls-exit-slide-down { animation: lsSlideDownOut ${Math.min(1000, duration + 200)}ms cubic-bezier(0.22, 0.44, 0, 1) forwards; }

        /* Force children to ignore their own transitions/animations during exit
           so the root drives a perfectly synchronized fade */
        .loading-screen-container.ls-exit-fade *,
        .loading-screen-container.ls-exit-slide-left *,
        .loading-screen-container.ls-exit-slide-right *,
        .loading-screen-container.ls-exit-slide-up *,
        .loading-screen-container.ls-exit-slide-down * {
          transition: none !important;
          animation: none !important;
          opacity: 1 !important;
        }

        @keyframes lsFadeOut { to { opacity: 0; } }
        @keyframes lsSlideLeftOut { to { transform: translate3d(-1.5%,0,0); opacity: 0; } }
        @keyframes lsSlideRightOut { to { transform: translate3d(1.5%,0,0); opacity: 0; } }
        @keyframes lsSlideUpOut { to { transform: translate3d(0,-1.5%,0); opacity: 0; } }
        @keyframes lsSlideDownOut { to { transform: translate3d(0,1.5%,0); opacity: 0; } }

        @media (prefers-reduced-motion: reduce) {
          .ls-exit-fade,
          .ls-exit-slide-left,
          .ls-exit-slide-right,
          .ls-exit-slide-up,
          .ls-exit-slide-down { animation-duration: 1ms; }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.6;
          }
          25% {
            transform: translateY(-10px) rotate(5deg);
            opacity: 0.8;
          }
          50% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          75% {
            transform: translateY(-10px) rotate(-5deg);
            opacity: 0.8;
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
