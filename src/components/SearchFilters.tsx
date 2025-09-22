'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface SearchFilterSection {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  order: number;
  isActive: boolean;
  options: SearchFilterOption[];
}

interface SearchFilterOption {
  id: number;
  sectionId: number;
  value: string;
  displayName: string;
  order: number;
  isActive: boolean;
}

interface SearchFiltersProps {
  selectedFilters: number[];
  onFiltersChange: (filters: number[]) => void;
}

export default function SearchFilters({ selectedFilters, onFiltersChange }: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<number[]>(selectedFilters);

  const { data: searchFiltersData, isLoading, error } = useQuery({
    queryKey: ['searchFilters'],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search-filters`);
      if (!response.ok) throw new Error('Failed to fetch search filters');
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });

  const sections = searchFiltersData?.sections || [];

  // Update local filters when prop changes
  useEffect(() => {
    setLocalFilters(selectedFilters);
  }, [selectedFilters]);

  const handleFilterToggle = (optionId: number) => {
    const newFilters = localFilters.includes(optionId)
      ? localFilters.filter(id => id !== optionId)
      : [...localFilters, optionId];
    
    setLocalFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    setLocalFilters([]);
    onFiltersChange([]);
  };

  const getSelectedCount = () => {
    return selectedFilters.length;
  };

  const getSelectedOptionsText = () => {
    if (selectedFilters.length === 0) return '';
    
    const selectedOptions = sections
      .flatMap((section: SearchFilterSection) => section.options)
      .filter((option: SearchFilterOption) => selectedFilters.includes(option.id))
      .map((option: SearchFilterOption) => option.displayName);
    
    if (selectedOptions.length <= 2) {
      return selectedOptions.join(', ');
    }
    return `${selectedOptions.slice(0, 2).join(', ')} +${selectedOptions.length - 2} more`;
  };

  if (error) {
    console.error('Error loading search filters:', error);
    return null; // Don't show anything if filters fail to load
  }

  return (
    <div className="relative">
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="px-1.5 sm:px-2 md:px-3 lg:px-4 py-1 sm:py-1.5 md:py-2 bg-transparent text-black font-medium hover:bg-gray-100/50 transition-colors flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm border border-gray-300 hover:border-gray-400"
        disabled={isLoading}
      >
        <svg className="w-3 sm:w-3.5 md:w-4 h-3 sm:h-3.5 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
        </svg>
        <span className="hidden sm:inline">Filters</span>
        <span className="sm:hidden">Filter</span>
        {getSelectedCount() > 0 && (
          <span className="bg-black text-white text-xs px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1 min-w-[14px] sm:min-w-[16px] md:min-w-[20px] text-center font-bold">
            {getSelectedCount()}
          </span>
        )}
        {isLoading && (
          <div className="animate-spin rounded-full h-2.5 sm:h-3 md:h-4 w-2.5 sm:w-3 md:w-4 border-b-2 border-gray-600"></div>
        )}
      </button>

      {/* Right-side sliding sidebar (mounted, animated open/close) */}
      <div className={`fixed inset-0 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsOpen(false)} />

      <aside
        className={`fixed right-0 top-0 h-full z-50 w-full sm:w-[420px] max-w-[95vw] border-l border-gray-400 transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{
          backgroundColor: 'var(--color-newsprint)',
          backgroundImage: 'url("https://www.transparenttextures.com/patterns/clean-gray-paper.png")',
          backgroundRepeat: 'repeat',
          backgroundSize: 'auto'
        }}
        aria-hidden={!isOpen}
      >
        {/* Layout: header / content / footer */}
        <div className="flex flex-col h-full">
          {/* Header - simple newspaper style */}
          <div className="px-5 py-4 border-b-2" style={{ borderColor: 'var(--color-ink)' }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold uppercase tracking-wide" style={{ color: 'var(--color-headline)', fontFamily: 'var(--font-serif)' }}>Search Filters</h3>
                <p className="text-xs" style={{ color: '#4b5563' }}>Refine your matrimonial search</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearFilters}
                  className="px-3 py-1 text-xs border border-gray-500 hover:bg-gray-200 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1 text-xs border border-gray-500 hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>

          {/* Selected filters summary */}
          {getSelectedCount() > 0 && (
            <div className="px-5 py-3 border-b border-gray-300">
              <div className="text-sm font-bold" style={{ color: 'var(--color-ink)' }}>
                {getSelectedCount()} filter{getSelectedCount() !== 1 ? 's' : ''} selected
              </div>
              <div className="text-sm mt-1" style={{ color: '#374151' }}>
                {getSelectedOptionsText()}
              </div>
            </div>
          )}

          {/* Content - scrollable */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="space-y-4">
              {sections.map((section: SearchFilterSection) => (
                <div key={section.id} className="border border-gray-300">
                  {/* Section Header */}
                  <div className="px-4 py-3 border-b border-gray-300 bg-white/60">
                    <h4 className="font-bold text-sm uppercase tracking-wide" style={{ color: 'var(--color-ink)' }}>
                      {section.displayName}
                    </h4>
                    {section.description && (
                      <p className="text-xs mt-1 italic" style={{ color: '#4b5563' }}>{section.description}</p>
                    )}
                  </div>
                  
                  {/* Options */}
                  <div className="p-4 bg-white/70">
                    <div className="grid grid-cols-2 gap-2">
                      {section.options.map((option: SearchFilterOption) => (
                        <label 
                          key={option.id} 
                          className={`
                            flex items-center space-x-2 cursor-pointer p-2 border transition-colors duration-150
                            ${localFilters.includes(option.id) 
                              ? 'bg-gray-100 border-gray-400' 
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                            }
                          `}
                        >
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={localFilters.includes(option.id)}
                              onChange={() => handleFilterToggle(option.id)}
                              className="sr-only"
                            />
                            <div className={`
                              w-4 h-4 border flex items-center justify-center
                              ${localFilters.includes(option.id) ? 'bg-black border-black' : 'border-gray-500 bg-white'}
                            `}>
                              {localFilters.includes(option.id) && (
                                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </div>
                          <span className={`text-sm font-medium ${localFilters.includes(option.id) ? 'text-black' : 'text-gray-700'}`}>
                            {option.displayName}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-gray-300 bg-white/60">
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm border border-gray-500 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 text-sm border border-black text-white"
                style={{ backgroundColor: 'var(--color-ink)' }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
} 