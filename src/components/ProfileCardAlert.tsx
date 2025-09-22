"use client";
import React, { useRef, useEffect } from 'react';
import ComicAlert from './ComicAlert';

interface ProfileCardAlertProps {
  show: boolean;
  onDismiss: () => void;
  profilesDropdownRef: React.RefObject<HTMLSelectElement | null>;
}

export default function ProfileCardAlert({ 
  show, 
  onDismiss, 
  profilesDropdownRef 
}: ProfileCardAlertProps) {
  return (
    <ComicAlert
      show={show}
      onDismiss={onDismiss}
      targetRef={profilesDropdownRef}
      position="right"
      className="pointer-events-none"
      autoDismiss={true}
      dismissDelay={10000}
    >
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className="text-2xl flex-shrink-0">📍</div>
          <div className="flex-1">
            <div className="font-bold text-black text-sm uppercase tracking-wide mb-1">
              Profile Selected!
            </div>
            <div className="text-gray-700 text-xs leading-relaxed">
              See all your selected profiles in the &quot;Selected&quot; tab
            </div>
          </div>
        </div>
      </div>
    </ComicAlert>
  );
}
