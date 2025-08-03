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
      case 'medium': return 'text-[1.15rem]';
      case 'large': return 'text-[1.25rem]';
      default: return 'text-[1.05rem]';
    }
  };

  const cardStyle = {
    backgroundColor: bgColor,
    backgroundImage: 'url("https://www.transparenttextures.com/patterns/clean-gray-paper.png")',
    backgroundBlendMode: 'multiply',
  };

  return (
    <div 
      className="bg-white border-b border-red-800 p-3 transition-colors duration-200 relative h-full flex flex-col justify-between"
      style={cardStyle}
    >
      <div className={`font-serif leading-relaxed text-justify hyphens-auto tracking-wide mb-4 ${getFontSizeClass()}`}>
        {content}
      </div>
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-200">
        <button
          className={`newspaper-btn text-sm ${selected ? 'newspaper-btn-primary' : 'newspaper-btn-secondary'}`}
          onClick={onSelect}
        >
          {selected ? texts.unselect : texts.select}
        </button>
        <button
          className="newspaper-btn newspaper-btn-secondary text-sm border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
          onClick={onEmail}
        >
          {texts.email}
        </button>
      </div>
    </div>
  );
} 