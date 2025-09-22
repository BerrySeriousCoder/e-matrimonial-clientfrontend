import React from 'react';
import { useUITexts } from '../hooks/useUITexts';

export default function NewspaperCard({
  content,
  selected,
  onSelect,
  onEmail,
  fontSize = 'default',
  bgColor = '#ffffff',
}: {
  content: string;
  selected: boolean;
  onSelect: () => void;
  onEmail: () => void;
  fontSize?: 'default' | 'medium' | 'large';
  bgColor?: string;
}) {
  const { texts } = useUITexts();

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'medium': return 'text-sm sm:text-[1.15rem]';
      case 'large': return 'text-sm sm:text-[1.25rem]';
      default: return 'text-sm sm:text-[1.05rem]';
    }
  };

  const cardStyle = {
    backgroundColor: bgColor,
    backgroundImage: 'url("/clean-gray-paper.png")',
    backgroundBlendMode: 'multiply',
  };

  return (
    <div 
      className="newspaper-card bg-white border-b border-red-800 p-2 sm:p-3 transition-colors duration-200 relative h-full flex flex-col justify-between"
      style={cardStyle}
    >
      <div className={`font-serif leading-relaxed text-justify hyphens-auto tracking-wide mb-3 sm:mb-4 ${getFontSizeClass()} break-words overflow-wrap-anywhere`}>
        {content}
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0 mt-auto pt-2 sm:pt-3 border-t border-gray-200">
        <button
          className={`newspaper-btn text-xs sm:text-sm flex-1 sm:flex-none ${selected ? 'newspaper-btn-primary' : 'newspaper-btn-secondary'}`}
          onClick={onSelect}
        >
          {selected ? texts.unselect : texts.select}
        </button>
        <button
          className="newspaper-btn newspaper-btn-secondary text-xs sm:text-sm border-red-600 text-red-600 hover:bg-red-600 hover:text-white flex-1 sm:flex-none"
          onClick={onEmail}
        >
          {texts.email}
        </button>
      </div>
    </div>
  );
} 