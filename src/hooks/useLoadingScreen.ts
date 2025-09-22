'use client';

import { useState, useEffect } from 'react';

export function useLoadingScreen(initialLoading: boolean = true) {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    // Check if this is the first visit
    const hasVisited = sessionStorage.getItem('ematrimonial-visited');
    
    if (!hasVisited) {
      // First visit - show loading screen
      setIsLoading(true);
      setHasLoaded(false);
      
      // Mark as visited
      sessionStorage.setItem('ematrimonial-visited', 'true');
    } else {
      // Returning visitor - skip loading screen
      setIsLoading(false);
      setHasLoaded(true);
    }
  }, []);

  const completeLoading = () => {
    setIsLoading(false);
    setHasLoaded(true);
  };

  const resetLoading = () => {
    setIsLoading(true);
    setHasLoaded(false);
  };

  return {
    isLoading,
    hasLoaded,
    completeLoading,
    resetLoading
  };
}
