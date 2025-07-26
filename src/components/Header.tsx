import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useUITexts } from '../hooks/useUITexts';

export default function Header({
  onPostAd,
  filter,
  setFilter,
  search,
  setSearch,
  isSearching,
  right,
}: {
  onPostAd: () => void;
  filter: 'all' | 'selected' | 'bride' | 'groom';
  setFilter: (f: 'all' | 'selected' | 'bride' | 'groom') => void;
  search: string;
  setSearch: (s: string) => void;
  isSearching?: boolean;
  right?: React.ReactNode;
}) {
  const { texts } = useUITexts();

  return (
    <header className="flex items-center justify-between mb-6">
      <button
        className="ui-font bg-black text-white px-4 py-2 rounded shadow hover:bg-gray-800 transition"
        onClick={onPostAd}
      >
        + {texts.postAd}
      </button>
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="ui-font relative">
          <MagnifyingGlassIcon className={`h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 ${isSearching ? 'text-indigo-500 animate-pulse' : 'text-gray-400'}`} />
          <input
            type="text"
            placeholder="Search by email or content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-600 text-black"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
            </div>
          )}
        </div>
        
        {/* Filter Dropdown */}
        <div className="ui-font relative">
          <label htmlFor="profile-filter" className="mr-2 font-medium">Profiles</label>
          <select
            id="profile-filter"
            value={filter}
            onChange={e => setFilter(e.target.value as 'all' | 'selected' | 'bride' | 'groom')}
            className="border border-gray-300 rounded px-2 py-1 bg-white"
          >
            <option value="all">{texts.filterAll}</option>
            <option value="bride">{texts.filterBride}</option>
            <option value="groom">{texts.filterGroom}</option>
            <option value="selected">{texts.filterSelected}</option>
          </select>
        </div>
        {right}
      </div>
    </header>
  );
} 