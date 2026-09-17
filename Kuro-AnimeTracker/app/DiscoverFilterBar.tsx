'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface DiscoverFilterBarProps {
  activeTag?: string;
  activeSeason?: string;
  activeYear?: string;
  activeFormat?: string;
  activeStatus?: string;
  activeSort?: string;
}

const INDEX_TAGS = [
  { label: 'Cyberpunk', value: 'Cyberpunk', type: 'tag' },
  { label: 'Slice of Life', value: 'Slice of Life', type: 'genre' },
  { label: 'Psychological', value: 'Psychological', type: 'genre' },
  { label: 'Sci-Fi', value: 'Sci-Fi', type: 'genre' },
  { label: 'Action', value: 'Action', type: 'genre' },
  { label: 'Fantasy', value: 'Fantasy', type: 'genre' },
  { label: 'Romance', value: 'Romance', type: 'genre' },
  { label: 'Drama', value: 'Drama', type: 'genre' },
  { label: 'Mystery', value: 'Mystery', type: 'genre' },
  { label: 'Supernatural', value: 'Supernatural', type: 'genre' },
];

const SEASON_OPTIONS = [
  { label: 'All Seasons', season: '', year: '' },
  { label: 'Winter 2025', season: 'WINTER', year: '2025' },
  { label: 'Fall 2024', season: 'FALL', year: '2024' },
  { label: 'Summer 2024', season: 'SUMMER', year: '2024' },
  { label: 'Spring 2024', season: 'SPRING', year: '2024' },
  { label: 'Winter 2024', season: 'WINTER', year: '2024' },
  { label: 'Year 2024', season: '', year: '2024' },
  { label: 'Year 2023', season: '', year: '2023' },
];

const FORMAT_OPTIONS = [
  { label: 'All Formats', value: '' },
  { label: 'TV Series', value: 'TV' },
  { label: 'Movie', value: 'MOVIE' },
  { label: 'OVA', value: 'OVA' },
  { label: 'ONA (Web)', value: 'ONA' },
  { label: 'Special', value: 'SPECIAL' },
];

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: '' },
  { label: 'Currently Airing', value: 'RELEASING' },
  { label: 'Finished Airing', value: 'FINISHED' },
  { label: 'Not Yet Aired', value: 'NOT_YET_RELEASED' },
];

const SORT_OPTIONS = [
  { label: 'Highest Rated', value: 'SCORE_DESC' },
  { label: 'Most Popular', value: 'POPULARITY_DESC' },
  { label: 'Trending Now', value: 'TRENDING_DESC' },
  { label: 'Newest First', value: 'START_DATE_DESC' },
  { label: 'Most Favorited', value: 'FAVOURITES_DESC' },
];

export default function DiscoverFilterBar({
  activeTag = '',
  activeSeason = '',
  activeYear = '',
  activeFormat = '',
  activeStatus = '',
  activeSort = 'POPULARITY_DESC'
}: DiscoverFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === '') {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });

    const queryStr = params.toString();
    router.push(queryStr ? `/?${queryStr}` : '/');
  };

  const handleTagClick = (tagLabel: string) => {
    if (activeTag === tagLabel) {
      updateFilters({ tag: null });
    } else {
      updateFilters({ tag: tagLabel });
    }
  };

  const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) {
      updateFilters({ season: null, year: null });
    } else {
      const [s, y] = val.split('_');
      updateFilters({ season: s || null, year: y || null });
    }
  };

  const currentSeasonValue = activeSeason && activeYear 
    ? `${activeSeason}_${activeYear}` 
    : (activeYear ? `_${activeYear}` : (activeSeason ? `${activeSeason}_` : ''));

  const hasActiveFilters = Boolean(
    activeTag || 
    activeSeason || 
    activeYear || 
    activeFormat || 
    activeStatus || 
    (activeSort && activeSort !== 'POPULARITY_DESC')
  );

  const clearAllFilters = () => {
    router.push('/');
  };

  return (
    <div className="flex flex-col gap-space-sm pb-space-md">
      {/* Index Tags */}
      <div className="flex flex-wrap items-center gap-space-xs">
        <span className="font-label-mono text-caption text-outline uppercase tracking-wider pr-1">Index Tags:</span>
        <button
          type="button"
          onClick={() => updateFilters({ tag: null })}
          className={`px-2.5 py-1 rounded-lg font-label-mono text-caption transition-colors ${
            !activeTag 
              ? 'bg-primary text-on-primary font-semibold shadow-xs' 
              : 'bg-surface-container text-on-surface hover:bg-surface-variant'
          }`}
        >
          All
        </button>
        {INDEX_TAGS.map((tag) => {
          const isSelected = activeTag === tag.label;
          return (
            <button
              key={tag.label}
              type="button"
              onClick={() => handleTagClick(tag.label)}
              className={`px-2.5 py-1 rounded-lg font-label-mono text-caption transition-all ${
                isSelected
                  ? 'bg-primary text-on-primary font-semibold shadow-xs'
                  : 'bg-surface-container text-on-surface hover:bg-surface-variant'
              }`}
            >
              {tag.label}
            </button>
          );
        })}
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-space-sm py-space-sm bg-surface-container-low px-space-md rounded-lg border border-surface-variant/40">
        <div className="flex flex-wrap items-center gap-space-sm">
          {/* Season Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-surface-container-lowest px-2.5 py-1.5 rounded-lg border border-surface-variant/50 shadow-xs">
            <span className="text-outline font-label-mono text-caption">Season:</span>
            <select
              value={currentSeasonValue}
              onChange={handleSeasonChange}
              className="bg-transparent font-label-mono text-caption text-on-surface font-medium focus:outline-none cursor-pointer pr-1"
            >
              {SEASON_OPTIONS.map((opt, i) => {
                const optVal = opt.season && opt.year 
                  ? `${opt.season}_${opt.year}` 
                  : (opt.year ? `_${opt.year}` : (opt.season ? `${opt.season}_` : ''));
                return (
                  <option key={i} value={optVal}>
                    {opt.label}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Format Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-surface-container-lowest px-2.5 py-1.5 rounded-lg border border-surface-variant/50 shadow-xs">
            <span className="text-outline font-label-mono text-caption">Format:</span>
            <select
              value={activeFormat}
              onChange={(e) => updateFilters({ format: e.target.value || null })}
              className="bg-transparent font-label-mono text-caption text-on-surface font-medium focus:outline-none cursor-pointer pr-1"
            >
              {FORMAT_OPTIONS.map((opt) => (
                <option key={opt.label} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-surface-container-lowest px-2.5 py-1.5 rounded-lg border border-surface-variant/50 shadow-xs">
            <span className="text-outline font-label-mono text-caption">Status:</span>
            <select
              value={activeStatus}
              onChange={(e) => updateFilters({ status: e.target.value || null })}
              className="bg-transparent font-label-mono text-caption text-on-surface font-medium focus:outline-none cursor-pointer pr-1"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.label} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="flex items-center gap-1 px-2.5 py-1 text-secondary hover:text-primary font-label-mono text-caption rounded transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-1.5 bg-surface-container-lowest px-2.5 py-1.5 rounded-lg border border-surface-variant/50 shadow-xs">
          <span className="text-outline font-label-mono text-caption">Sort:</span>
          <select
            value={activeSort}
            onChange={(e) => updateFilters({ sort: e.target.value || null })}
            className="bg-transparent font-label-mono text-caption text-on-surface font-medium focus:outline-none cursor-pointer pr-1"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.label} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
