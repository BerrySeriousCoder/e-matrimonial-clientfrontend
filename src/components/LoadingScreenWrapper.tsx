'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useLoadingScreen } from '../hooks/useLoadingScreen';
import LoadingScreen from './LoadingScreen';

interface LoadingScreenWrapperProps {
  children: ReactNode;
  exitAnimation?: 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down' | 'fade' | 'random';
}

export default function LoadingScreenWrapper({ 
  children, 
  exitAnimation = 'slide-left' 
}: LoadingScreenWrapperProps) {
  const { isLoading, completeLoading } = useLoadingScreen();
  const [randomExitAnimation, setRandomExitAnimation] = useState<'slide-left' | 'slide-right' | 'slide-up' | 'slide-down' | 'fade'>('slide-left');

  useEffect(() => {
    // Randomly select an exit animation for variety
    const animations: Array<'slide-left' | 'slide-right' | 'slide-up' | 'slide-down' | 'fade'> = [
      'slide-left', 'slide-right', 'slide-up', 'slide-down', 'fade'
    ];
    const randomIndex = Math.floor(Math.random() * animations.length);
    setRandomExitAnimation(animations[randomIndex]);
  }, []);

  return (
    <>
      {isLoading && (
        <LoadingScreen 
          onLoadingComplete={completeLoading}
          duration={3500} // 3.5 seconds total
          exitAnimation={exitAnimation === 'random' ? randomExitAnimation : exitAnimation}
        />
      )}
      <div className={isLoading ? 'opacity-0 pointer-events-none' : 'opacity-100 transition-opacity duration-1000'}>
        {children}
      </div>
    </>
  );
}
