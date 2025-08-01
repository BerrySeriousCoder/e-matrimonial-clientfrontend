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
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-transparent text-black font-medium hover:bg-gray-100/50 transition-colors flex items-center space-x-2"
        disabled={isLoading}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
        </svg>
        <span>Filters</span>
        {getSelectedCount() > 0 && (
          <span className="bg-red-600 text-white text-xs px-2 py-1 min-w-[20px] text-center font-bold">
            {getSelectedCount()}
          </span>
        )}
        {isLoading && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
        )}
      </button>

      {/* Filter Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-3 w-[450px] bg-white border border-gray-300 shadow-2xl z-50 max-h-[500px] overflow-hidden">
            {/* Header - Newspaper Style */}
            <div className="bg-gray-900 text-white px-5 py-4 border-b-4 border-red-600">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold tracking-wide uppercase">Search Filters</h3>
                    <p className="text-xs text-gray-300 uppercase tracking-wider">Refine your matrimonial search</p>
                  </div>
                </div>
                <button
                  onClick={handleClearFilters}
                  className="flex items-center space-x-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-gray-800 rounded transition-colors font-medium text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Clear All</span>
                </button>
              </div>
            </div>

            {/* Selected filters summary - Newspaper Highlight Box */}
            {getSelectedCount() > 0 && (
              <div className="mx-5 mt-4 p-4 bg-red-50 border-l-4 border-red-600">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-red-900 mb-1 text-sm uppercase tracking-wide">
                      {getSelectedCount()} filter{getSelectedCount() !== 1 ? 's' : ''} selected
                    </div>
                    <div className="text-red-700 text-sm font-medium">
                      {getSelectedOptionsText()}
                    </div>
                  </div>
                  <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Filter Sections - Newspaper Columns */}
            <div className="p-5 max-h-[350px] overflow-y-auto bg-gray-50">
              <div className="space-y-4">
                {sections.map((section: SearchFilterSection) => (
                  <div key={section.id} className="bg-white border border-gray-300 shadow-sm">
                    {/* Section Header - Newspaper Column Header */}
                    <div className="bg-gray-100 border-b border-gray-300 px-4 py-3">
                      <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                        {section.displayName}
                      </h4>
                      {section.description && (
                        <p className="text-xs text-gray-600 mt-1 italic">{section.description}</p>
                      )}
                    </div>
                    
                    {/* Section Options - Newspaper Classified Style */}
                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-2">
                        {section.options.map((option: SearchFilterOption) => (
                          <label 
                            key={option.id} 
                            className={`
                              flex items-center space-x-2 cursor-pointer p-2 rounded border transition-all duration-200
                              ${localFilters.includes(option.id) 
                                ? 'bg-red-50 border-red-300 shadow-sm' 
                                : 'bg-white border-gray-200 hover:border-red-200 hover:bg-red-50'
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
                                w-4 h-4 border-2 flex items-center justify-center transition-all duration-200
                                ${localFilters.includes(option.id) 
                                  ? 'bg-red-600 border-red-600' 
                                  : 'border-gray-400 bg-white'
                                }
                              `}>
                                {localFilters.includes(option.id) && (
                                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                            </div>
                            <span className={`text-sm font-medium ${localFilters.includes(option.id) ? 'text-red-800' : 'text-gray-700'}`}>
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

            {/* Footer Actions - Newspaper Footer */}
            <div className="bg-gray-100 px-5 py-4 border-t border-gray-300">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium rounded border border-gray-300 hover:bg-gray-200 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold transition-colors text-sm shadow-sm"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 