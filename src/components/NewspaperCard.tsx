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
    backgroundImage: bgColor === '#ffffff' 
      ? 'url("https://www.transparenttextures.com/patterns/clean-gray-paper.png")'
      : 'none',
  };

  return (
    <div 
      className="newspaper-card flex flex-col justify-between min-h-[180px]"
      style={cardStyle}
    >
      <div className={`whitespace-pre-line mb-4 leading-relaxed ${getFontSizeClass()}`}>
        {content}
      </div>
      <div className="flex items-center justify-between mt-auto">
        <button
          className={`ui-font px-3 py-1 rounded border text-sm font-medium transition ${selected ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-800 border-gray-400 hover:bg-gray-100'}`}
          onClick={onSelect}
        >
          {selected ? texts.unselect : texts.select}
        </button>
        <button
          className="ui-font px-3 py-1 rounded border border-blue-600 text-blue-700 bg-white hover:bg-blue-50 text-sm font-medium transition"
          onClick={onEmail}
        >
          {texts.email}
        </button>
      </div>
    </div>
  );
} 