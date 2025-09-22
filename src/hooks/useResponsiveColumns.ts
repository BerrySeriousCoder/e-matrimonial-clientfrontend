import { useState, useEffect } from 'react';

export function useResponsiveColumns() {
  const [columnCount, setColumnCount] = useState(1);
  const [columnGap, setColumnGap] = useState(12);

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      
      // Calculate optimal column count based on available width
      // Each column should be at least 250px wide (reduced from 280px for better fit)
      const minColumnWidth = 250;
      const baseGap = 12;
      
      // Calculate how many columns can fit
      let columns = Math.floor((width + baseGap) / (minColumnWidth + baseGap));
      columns = Math.max(1, Math.min(columns, 6)); // Cap between 1 and 6 columns
      
      // Calculate actual column gap based on available space
      const availableWidth = width - (columns * minColumnWidth);
      const actualGap = Math.max(8, Math.min(24, availableWidth / (columns - 1)));
      
      setColumnCount(columns);
      setColumnGap(actualGap);
    };

    // Initial calculation
    updateColumns();

    // Add resize listener with throttling for better performance
    let timeoutId: NodeJS.Timeout;
    const throttledUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateColumns, 16); // ~60fps
    };

    window.addEventListener('resize', throttledUpdate);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', throttledUpdate);
      clearTimeout(timeoutId);
    };
  }, []);

  return { columnCount, columnGap };
}
