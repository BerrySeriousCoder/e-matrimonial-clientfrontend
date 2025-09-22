"use client";
import React, { useRef, useEffect } from 'react';
import ComicAlert from './ComicAlert';

interface LoginButtonAlertProps {
  show: boolean;
  onDismiss: () => void;
  loginButtonRef: React.RefObject<HTMLButtonElement | null>;
}

export default function LoginButtonAlert({ 
  show, 
  onDismiss, 
  loginButtonRef 
}: LoginButtonAlertProps) {
  return (
    <ComicAlert
      show={show}
      onDismiss={onDismiss}
      targetRef={loginButtonRef}
      position="top"
      className="pointer-events-none"
      autoDismiss={true}
      dismissDelay={10000}
    >
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className="text-2xl flex-shrink-0">💡</div>
          <div className="flex-1">
            <div className="font-bold text-black text-sm uppercase tracking-wide mb-1">
              Save Profiles Permanently!
            </div>
            <div className="text-gray-700 text-xs leading-relaxed">
              Register or Login to save your selected profiles permanently
            </div>
          </div>
        </div>
      </div>
    </ComicAlert>
  );
}
