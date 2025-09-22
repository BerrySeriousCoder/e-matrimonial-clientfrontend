"use client";
import React, { useEffect, useState } from 'react';

interface ComicAlertProps {
  children: React.ReactNode;
  targetRef: React.RefObject<HTMLElement | null>;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  show: boolean;
  onDismiss?: () => void;
  autoDismiss?: boolean;
  dismissDelay?: number;
}

export default function ComicAlert({
  children,
  targetRef,
  position = 'top',
  className = '',
  show,
  onDismiss,
  autoDismiss = true,
  dismissDelay = 10000,
}: ComicAlertProps) {
  const [alertPosition, setAlertPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show && targetRef.current) {
      // Small delay to ensure DOM is fully rendered
      const timer = setTimeout(() => {
        if (!targetRef.current) return;
        
        const targetRect = targetRef.current.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          // Position above the target element, centered horizontally
          top = targetRect.top + scrollTop - 80; // Increased offset to avoid covering
          left = targetRect.left + scrollLeft + (targetRect.width / 2);
          break;
        case 'bottom':
          // Position below the target element, centered horizontally
          top = targetRect.bottom + scrollTop + 20;
          left = targetRect.left + scrollLeft + (targetRect.width / 2);
          break;
        case 'left':
          // Position to the left of the target element, centered vertically
          top = targetRect.top + scrollTop + (targetRect.height / 2);
          left = targetRect.left + scrollLeft - 20;
          break;
        case 'right':
          // Position to the right of the target element, centered vertically
          top = targetRect.top + scrollTop + (targetRect.height / 2);
          left = targetRect.right + scrollLeft + 20;
          break;
      }

      // Ensure alert stays within viewport bounds
      const alertWidth = 280; // max-width from CSS
      const alertHeight = 120; // estimated height including padding and tail
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const margin = 20;

      // Adjust horizontal position if alert would go off-screen
      if (left - alertWidth / 2 < margin) {
        left = alertWidth / 2 + margin;
      } else if (left + alertWidth / 2 > viewportWidth - margin) {
        left = viewportWidth - alertWidth / 2 - margin;
      }

      // Adjust vertical position if alert would go off-screen
      if (top - alertHeight / 2 < margin) {
        top = alertHeight / 2 + margin;
      } else if (top + alertHeight / 2 > viewportHeight - margin) {
        top = viewportHeight - alertHeight / 2 - margin;
      }

        setAlertPosition({ top, left });
        setIsVisible(true);

        if (autoDismiss) {
          const dismissTimer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => onDismiss?.(), 300);
          }, dismissDelay);

          return () => clearTimeout(dismissTimer);
        }
      }, 50); // 50ms delay for DOM rendering

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [show, targetRef, position, autoDismiss, dismissDelay, onDismiss]);

  if (!show || !isVisible) return null;

  const getTailClass = () => {
    switch (position) {
      case 'top': return 'newspaper-tail-bottom';
      case 'bottom': return 'newspaper-tail-top';
      case 'left': return 'newspaper-tail-right';
      case 'right': return 'newspaper-tail-left';
      default: return 'newspaper-tail-bottom';
    }
  };

  return (
    <div
      className={`fixed z-50 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      } ${className}`}
      style={{
        top: alertPosition.top,
        left: alertPosition.left,
      }}
    >
      <div className={`newspaper-alert newspaper-alert-attention ${getTailClass()}`}>
        {children}
      </div>
    </div>
  );
}
