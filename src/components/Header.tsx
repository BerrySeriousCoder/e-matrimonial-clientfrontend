import React, { useEffect, useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useUITexts } from '../hooks/useUITexts';
import SearchFilters from './SearchFilters';

export default function Header({
  onPostAd,
  filter,
  setFilter,
  search,
  setSearch,
  isSearching,
  selectedFilters,
  onFiltersChange,
  right,
  page = 1,
  profilesDropdownRef,
}: {
  onPostAd: () => void;
  filter: 'selected' | 'bride' | 'groom';
  setFilter: (f: 'selected' | 'bride' | 'groom') => void;
  search: string;
  setSearch: (s: string) => void;
  isSearching?: boolean;
  selectedFilters: number[];
  onFiltersChange: (filters: number[]) => void;
  right?: React.ReactNode;
  page?: number;
  profilesDropdownRef?: React.RefObject<HTMLSelectElement | null>;
}) {
  const { texts } = useUITexts();
  const [dateString, setDateString] = useState('');

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      setDateString(
        now.toLocaleDateString(undefined, {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        }) + ' ' + now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateDate();
    const interval = setInterval(updateDate, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="px-2 sm:px-3 md:px-4 lg:px-6 container-responsive">
      {/* Newspaper Title - Much smaller on mobile */}
      <div className="w-full text-center mb-1">
        <h1 className="font-serif text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold tracking-wide sm:tracking-widest leading-tight select-none" style={{ letterSpacing: '0.03em' }}>
          E-MATRIMONIAL
        </h1>
      </div>
      
      {/* Single thin line separator */}
      <div className="border-b border-gray-800 mb-1 sm:mb-2"></div>
      
      {/* Newspaper Top Bar - Hidden on mobile to save space */}
      <div className="hidden sm:flex flex-row items-center justify-between pb-1 text-sm font-serif tracking-wide uppercase text-gray-700 mb-3 md:mb-4 lg:mb-5">
        <div className="text-left">VERSION. I, NO. {page}</div>
        <div className="text-center flex-1 font-normal">{dateString}</div>
        <div className="text-right whitespace-nowrap">SINGLE AD 5000</div>
      </div>

        {/* Controls Row - Much more compact and inline on mobile */}
        <div className="border-t border-b border-gray-300 py-1.5 sm:py-2 md:py-3 container-responsive">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 flex-responsive">
            {/* Left group: Post Ad + Profile Dropdown */}
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 order-2 lg:order-1 min-w-0">
            <button
                className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-transparent text-black font-medium hover:bg-gray-100/50 transition-colors text-xs sm:text-sm whitespace-nowrap border border-gray-300 hover:border-gray-400 min-w-0 flex-shrink-0"
              onClick={onPostAd}
            >
              + {texts.postAd}
            </button>

               {/* Filter Dropdown - Inline label and dropdown */}
               <div className="relative flex-1 min-w-0 flex items-center">
                  <label htmlFor="profile-filter" className="mr-1 sm:mr-2 font-bold text-xs sm:text-sm uppercase tracking-wide whitespace-nowrap">Profiles</label>
                  <select
                    ref={profilesDropdownRef}
                    id="profile-filter"
                    value={filter}
                    onChange={e => setFilter(e.target.value as 'selected' | 'bride' | 'groom')}
                    className="flex-1 newspaper-search px-2 sm:px-3 py-1 sm:py-1.5 md:py-2 text-xs sm:text-sm min-w-0"
                  >
                  <option value="bride">{texts.filterBride}</option>
                  <option value="groom">{texts.filterGroom}</option>
                  <option value="selected">{texts.filterSelected}</option>
                </select>
              </div>
            </div>
          
          {/* Right group: Search Bar, Filter, and Login */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 order-1 lg:order-2 w-full sm:w-auto min-w-0">
            {/* Search Bar */}
            <div className="relative flex-1 min-w-0">
              <MagnifyingGlassIcon className={`h-3.5 sm:h-4 md:h-5 w-3.5 sm:w-4 md:w-5 absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 pointer-events-none ${isSearching ? 'text-red-600 animate-pulse' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Search by content..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full min-w-0 max-w-full newspaper-search-input bg-white border border-gray-300 rounded-none py-1.5 sm:py-2 md:py-3 px-2 sm:px-3 md:px-4 pl-8 sm:pl-10 md:pl-12 font-serif text-xs sm:text-sm md:text-base focus:outline-none focus:border-red-800 focus:shadow-[0_0_0_2px_rgba(139,0,0,0.1)]"
                style={{ fontFamily: 'var(--font-serif)' }}
              />
              {isSearching && (
                <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-3 sm:h-4 w-3 sm:w-4 border-b-2 border-red-600"></div>
                </div>
              )}
            </div>

            {/* Filter and Login - Corner positioning on mobile, inline on desktop */}
            <div className="flex flex-row sm:flex-row items-center justify-between sm:justify-end gap-2 sm:gap-2 md:gap-3 lg:gap-4 w-full sm:w-auto">
              {/* Filter button - Left on mobile, inline on desktop */}
              <div className="flex-shrink-0">
              <SearchFilters
                selectedFilters={selectedFilters}
                onFiltersChange={onFiltersChange}
              />
            </div>
              
              {/* Login - Right on mobile, inline on desktop */}
              {right && (
                <div className="flex-shrink-0">
                  {right}
              </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 