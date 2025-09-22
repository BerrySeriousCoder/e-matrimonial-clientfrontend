import { useState, useEffect, useRef } from 'react';

export function useFluidResponsive(dependency?: unknown) {
  const [columnCount, setColumnCount] = useState(1);
  const [columnGap, setColumnGap] = useState(12);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateLayout = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const containerWidth = container.offsetWidth;
      
      // Calculate optimal column count based on available width
      const minColumnWidth = 240; // Reduced for better fitting
      const baseGap = 8;
      
      // Calculate how many columns can fit
      let columns = Math.floor((containerWidth + baseGap) / (minColumnWidth + baseGap));
      columns = Math.max(1, Math.min(columns, 6)); // Cap between 1 and 6 columns
      
      // Calculate actual column gap based on available space
      const availableWidth = containerWidth - (columns * minColumnWidth);
      const actualGap = Math.max(6, Math.min(20, availableWidth / Math.max(1, columns - 1)));
      
      setColumnCount(columns);
      setColumnGap(actualGap);
      
      // Check if content is overflowing
      const isOverflow = container.scrollWidth > container.clientWidth;
      setIsOverflowing(isOverflow);
      
      // If overflowing, reduce columns
      if (isOverflow && columns > 1) {
        const newColumns = columns - 1;
        const newGap = Math.max(6, Math.min(20, (containerWidth - (newColumns * minColumnWidth)) / Math.max(1, newColumns - 1)));
        setColumnCount(newColumns);
        setColumnGap(newGap);
      }
    };

    // Initial calculation with a small delay to ensure DOM is updated
    const initialTimeout = setTimeout(updateLayout, 50);

    // Add resize listener with throttling
    let timeoutId: NodeJS.Timeout;
    const throttledUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateLayout, 16); // ~60fps
    };

    window.addEventListener('resize', throttledUpdate);
    
    // Also listen for container size changes
    const resizeObserver = new ResizeObserver(throttledUpdate);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', throttledUpdate);
      clearTimeout(timeoutId);
      clearTimeout(initialTimeout);
      resizeObserver.disconnect();
    };
  }, [dependency]); // Re-run when dependency changes

  return { 
    columnCount, 
    columnGap, 
    isOverflowing, 
    containerRef 
  };
}
