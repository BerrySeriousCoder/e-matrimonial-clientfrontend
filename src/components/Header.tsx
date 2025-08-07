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
}: {
  onPostAd: () => void;
  filter: 'all' | 'selected' | 'bride' | 'groom';
  setFilter: (f: 'all' | 'selected' | 'bride' | 'groom') => void;
  search: string;
  setSearch: (s: string) => void;
  isSearching?: boolean;
  selectedFilters: number[];
  onFiltersChange: (filters: number[]) => void;
  right?: React.ReactNode;
  page?: number;
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
    <header className="">
      {/* Newspaper Title */}
      <div className="w-full text-center mb-2">
        <h1 className="font-serif text-5xl font-bold tracking-widest leading-tight select-none" style={{ letterSpacing: '0.15em' }}>
          E-MATRIMONIAL
        </h1>
      </div>
      {/* Double Line Separator */}
      <div className="border-b-2 border-gray-800 mb-0.5"></div>
      <div className="border-b-2 border-gray-800 mb-2"></div>
      {/* Newspaper Top Bar */}
      <div className="flex items-center justify-between pb-1 text-sm font-serif tracking-wide uppercase text-gray-700 mb-5">
        <div>VOL. I, NO. {page}</div>
        <div className="text-center flex-1 font-normal">{dateString}</div>
        <div className="text-right whitespace-nowrap">SINGLE AD 5000</div>
      </div>
      {/* Controls Row */}
      <div className="border-t  border-b border-gray-300 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left side controls */}
          <div className="flex items-center gap-4">
            <button
              className="px-4 py-2 bg-transparent text-black font-medium hover:bg-gray-100/50 transition-colors"
              onClick={onPostAd}
            >
              + {texts.postAd}
            </button>
            {/* Search Bar */}
            <div className="relative">
              <MagnifyingGlassIcon className={`h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none ${isSearching ? 'text-red-600 animate-pulse' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Search by email or content..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-80 bg-white border-2 border-gray-300 rounded-none py-3 px-4 pl-12 font-serif text-base focus:outline-none focus:border-red-800 focus:shadow-[0_0_0_3px_rgba(139,0,0,0.1)]"
                style={{ fontFamily: 'var(--font-serif)' }}
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                </div>
              )}
            </div>
            {/* Search Filters */}
            <SearchFilters
              selectedFilters={selectedFilters}
              onFiltersChange={onFiltersChange}
            />
          </div>
          {/* Right side controls */}
          <div className="flex items-center gap-4">
            {/* Filter Dropdown */}
            <div className="relative">
              <label htmlFor="profile-filter" className="mr-2 font-bold text-sm uppercase tracking-wide">Profiles</label>
              <select
                id="profile-filter"
                value={filter}
                onChange={e => setFilter(e.target.value as 'all' | 'selected' | 'bride' | 'groom')}
                className="newspaper-search px-3 py-2"
              >
                <option value="all">{texts.filterAll}</option>
                <option value="bride">{texts.filterBride}</option>
                <option value="groom">{texts.filterGroom}</option>
                <option value="selected">{texts.filterSelected}</option>
              </select>
            </div>
            {right}
          </div>
        </div>
      </div>
    </header>
  );
} 