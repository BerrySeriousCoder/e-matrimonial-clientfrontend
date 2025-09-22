'use client';

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
  exitAnimation = 'slide-left'
}: LoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [textAnimation, setTextAnimation] = useState('animate-in');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Start text animation immediately
    setTextAnimation('animate-in');

    // Start exit animation before the duration ends
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, duration - 2000); // Start exit 2s before duration ends for ultra-smooth transition

    // Complete loading after duration
    const completeTimer = setTimeout(() => {
      setIsVisible(false);
      onLoadingComplete?.();
    }, duration);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onLoadingComplete]);

  if (!isVisible) return null;

  const getExitAnimationClass = () => {
    if (!isExiting) return '';
    switch (exitAnimation) {
      case 'slide-left': return 'loading-screen-slide-left-exit';
      case 'slide-right': return 'loading-screen-slide-right-exit';
      case 'slide-up': return 'loading-screen-slide-up-exit';
      case 'slide-down': return 'loading-screen-slide-down-exit';
      case 'fade': return 'loading-screen-fade-exit';
      default: return 'loading-screen-slide-left-exit';
    }
  };

  return (
    <div 
      className={`loading-screen-container ${getExitAnimationClass()}`}
      style={{
        background: 'linear-gradient(135deg, #f5f5e6 0%, #f8f8f5 50%, #f5f5e6 100%)',
        backgroundImage: 'url("https://www.transparenttextures.com/patterns/clean-gray-paper.png")',
        backgroundSize: 'auto',
        backgroundRepeat: 'repeat'
      }}
    >
      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 opacity-30">
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
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        
        {/* Image Container */}
        <div className="mb-8 sm:mb-12 lg:mb-16 relative">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 mx-auto">
            <Image
              src="/emtrilodaing.png"
              alt="E-Matrimonial Loading"
              fill
              className="object-contain transition-all duration-1000 ease-out transform scale-100 opacity-100"
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
            className="loading-screen-text font-bold text-gray-800 transition-all duration-1000 ease-out transform translate-y-0 opacity-100"
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
            className="loading-screen-subtitle text-gray-600 transition-all duration-1200 ease-out transform translate-y-0 opacity-100"
            style={{
              fontFamily: 'Georgia, Times New Roman, Times, serif',
              letterSpacing: '0.5px'
            }}
          >
            E-Matrimonial helps you find your GEM from the crowd—effortlessly.
          </p>

          {/* Loading Dots Animation */}
          <div className="flex justify-center space-x-2 transition-all duration-1400 ease-out transform translate-y-0 opacity-100">
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

      {/* CSS for floating animation */}
      <style jsx>{`
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
