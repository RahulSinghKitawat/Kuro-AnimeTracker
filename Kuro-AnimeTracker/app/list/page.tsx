'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useTracker, TrackerEntry, TrackerStatus } from '@/lib/trackerContext';

const STATUS_TABS: Array<{ key: 'all' | TrackerStatus; label: string }> = [
  { key: 'all', label: 'All Archive' },
  { key: 'watching', label: 'Watching' },
  { key: 'completed', label: 'Completed' },
  { key: 'plan', label: 'Plan to Watch' },
  { key: 'hold', label: 'On Hold' },
  { key: 'dropped', label: 'Dropped' },
];

const STATUS_BADGES: Record<
  TrackerStatus,
  { label: string; dotColor: string; badgeClass: string }
> = {
  watching: {
    label: 'Watching',
    dotColor: 'bg-secondary',
    badgeClass: 'bg-secondary/10 text-secondary border border-secondary/20 dark:bg-secondary/20 dark:text-secondary dark:border-secondary/30',
  },
  completed: {
    label: 'Completed',
    dotColor: 'bg-emerald-500',
    badgeClass: 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800',
  },
  plan: {
    label: 'Plan to Watch',
    dotColor: 'bg-slate-400',
    badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  },
  hold: {
    label: 'On Hold',
    dotColor: 'bg-amber-500',
    badgeClass: 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-800',
  },
  dropped: {
    label: 'Dropped',
    dotColor: 'bg-rose-500',
    badgeClass: 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-900/40 dark:text-rose-400 dark:border-rose-800',
  },
};

export default function MyAnimeListTracker() {
  const {
    entries,
    updateStatus,
    updateProgress,
    updateScore,
    removeEntry,
    markCompleted,
  } = useTracker();

  const [activeTab, setActiveTab] = useState<'all' | TrackerStatus>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchFilter, setSearchFilter] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'progress' | 'title' | 'recent'>('recent');
  const [statusDropdownId, setStatusDropdownId] = useState<number | null>(null);
  const [realCovers, setRealCovers] = useState<Record<number, string>>({});

  // Batch-fetch real AniList cover images for all entries
  useEffect(() => {
    const ids = entries.map((e) => e.id);
    if (ids.length === 0) return;
    fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        query: `query ($ids: [Int]) {
          Page(page: 1, perPage: 50) {
            media(id_in: $ids, type: ANIME) {
              id
              coverImage { extraLarge large }
            }
          }
        }`,
        variables: { ids },
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        const covers: Record<number, string> = {};
        (data?.data?.Page?.media || []).forEach((m: any) => {
          covers[m.id] = m.coverImage?.extraLarge || m.coverImage?.large || '';
        });
        setRealCovers((prev) => ({ ...prev, ...covers }));
      })
      .catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries.length]);

  // Tab counts
  const counts = useMemo(() => {
    return {
      all: entries.length,
      watching: entries.filter((e) => e.status === 'watching').length,
      completed: entries.filter((e) => e.status === 'completed').length,
      plan: entries.filter((e) => e.status === 'plan').length,
      hold: entries.filter((e) => e.status === 'hold').length,
      dropped: entries.filter((e) => e.status === 'dropped').length,
    };
  }, [entries]);

  // Filtered and sorted entries
  const filteredEntries = useMemo(() => {
    let list = entries;

    // Filter by tab
    if (activeTab !== 'all') {
      list = list.filter((e) => e.status === activeTab);
    }

    // Filter by search query
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.romaji.toLowerCase().includes(q) ||
          e.title.english?.toLowerCase().includes(q) ||
          e.studio?.toLowerCase().includes(q) ||
          e.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort
    return [...list].sort((a, b) => {
      if (sortBy === 'score') {
        return (b.score || 0) - (a.score || 0);
      }
      if (sortBy === 'progress') {
        const pctA = a.totalEpisodes ? a.progress / a.totalEpisodes : 0;
        const pctB = b.totalEpisodes ? b.progress / b.totalEpisodes : 0;
        return pctB - pctA;
      }
      if (sortBy === 'title') {
        return a.title.romaji.localeCompare(b.title.romaji);
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [entries, activeTab, searchFilter, sortBy]);

  // Quick stats
  const totalEpisodesWatched = useMemo(() => {
    return entries.reduce((acc, e) => acc + (e.progress || 0), 0);
  }, [entries]);

  const averageScore = useMemo(() => {
    const scored = entries.filter((e) => e.score !== null && e.score > 0);
    if (scored.length === 0) return '—';
    const sum = scored.reduce((acc, e) => acc + (e.score || 0), 0);
    return (sum / scored.length).toFixed(1);
  }, [entries]);

  return (
    <ProtectedRoute redirectPath="/list">
      <Header activePage="tracker" />

      <main className="w-full pt-16 min-h-screen bg-background">
        <div className="flex flex-col w-full">
          <div className="max-w-[1280px] w-full mx-auto px-margin-mobile lg:px-margin py-space-xl flex flex-col gap-space-xl">
            {/* Top Title & Header Section */}
            <section className="flex flex-col gap-space-lg">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
                <div className="flex flex-col gap-space-xs">
                  <div className="flex items-center gap-space-xs">
                    <span className="font-label-mono text-caption text-on-surface-variant uppercase tracking-widest">
                      Archive Index // 2025
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    <span className="font-label-mono text-caption text-on-surface-variant">
                      Synchronized
                    </span>
                  </div>
                  <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
                    Komorebi Watchlist
                  </h1>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
                    A quiet personal chronicle of completed arcs, current transmissions, and
                    contemplative narratives. Cataloged with disciplined restraint.
                  </p>
                </div>

                {/* View Controls, Tier List & "Add Entry" CTA */}
                <div className="flex items-center gap-space-sm flex-wrap">
                  {/* Mode Switcher: Index (Table) vs Plates (Grid) */}
                  <div className="flex items-center gap-space-xs bg-surface-container-lowest p-1 rounded-xl shadow-sm border border-surface-variant">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-label-md text-label-md transition-all ${
                        viewMode === 'list'
                          ? 'text-on-surface bg-surface-container shadow-xs font-semibold'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                      id="view-list-btn"
                    >
                      <span className="material-symbols-outlined text-sm leading-none">
                        format_list_bulleted
                      </span>
                      <span>Index</span>
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-label-md text-label-md transition-all ${
                        viewMode === 'grid'
                          ? 'text-on-surface bg-surface-container shadow-xs font-semibold'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                      id="view-grid-btn"
                    >
                      <span className="material-symbols-outlined text-sm leading-none">
                        grid_view
                      </span>
                      <span>Plates</span>
                    </button>
                  </div>

                  {/* TIER LIST Button */}
                  <Link
                    href="/tier-lists"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container-lowest hover:bg-surface-container text-on-surface font-headline-sm text-body-sm transition-all shadow-sm border border-surface-variant active:scale-95"
                    id="tier-list-btn"
                  >
                    <span className="material-symbols-outlined text-sm">leaderboard</span>
                    <span>Tier List</span>
                  </Link>

                  {/* STITCH FEATURE: Add Entry Button */}
                  <Link
                    href="/tracker/add"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-headline-sm text-body-sm transition-all shadow-sm active:scale-95"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    <span>Add Entry</span>
                  </Link>
                </div>
              </div>

              {/* Minimalist Stats Summary Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-md p-space-md bg-surface-container-low rounded-xl border border-surface-variant">
                <div>
                  <span className="font-label-mono text-caption text-outline uppercase">
                    Titles Tracked
                  </span>
                  <p className="font-headline-md text-headline-md text-on-surface">
                    {entries.length}
                  </p>
                </div>
                <div>
                  <span className="font-label-mono text-caption text-outline uppercase">
                    Episodes Logged
                  </span>
                  <p className="font-headline-md text-headline-md text-on-surface">
                    {totalEpisodesWatched.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="font-label-mono text-caption text-outline uppercase">
                    Completed
                  </span>
                  <p className="font-headline-md text-headline-md text-on-surface text-emerald-700">
                    {counts.completed}
                  </p>
                </div>
                <div>
                  <span className="font-label-mono text-caption text-outline uppercase">
                    Mean Score
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-amber-500 text-sm">★</span>
                    <p className="font-headline-md text-headline-md text-on-surface">
                      {averageScore}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Interactive Filters & Tab Navigation */}
            <section className="flex flex-col gap-space-md">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pb-space-xs border-b border-surface-variant">
                {/* Status Segment Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 custom-scrollbar">
                  {STATUS_TABS.map((tab) => {
                    const isActive = activeTab === tab.key;
                    const count = counts[tab.key];
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-3 py-1.5 rounded-lg text-body-sm font-label-md whitespace-nowrap transition-all flex items-center gap-1.5 ${
                          isActive
                            ? 'bg-primary text-on-primary font-medium shadow-xs'
                            : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded-full font-label-mono text-[11px] ${
                            isActive
                              ? 'bg-surface-container-lowest/20 text-on-primary'
                              : 'bg-surface-container text-on-surface-variant'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Search & Sort Controls */}
                <div className="flex items-center gap-space-sm flex-wrap sm:flex-nowrap">
                  {/* Search within tracker */}
                  <div className="relative flex items-center bg-surface-container-lowest rounded border border-surface-variant focus-within:border-outline transition-colors px-2.5 py-1">
                    <span className="material-symbols-outlined text-outline text-sm mr-1.5">
                      search
                    </span>
                    <input
                      type="text"
                      placeholder="Filter watchlist..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="bg-transparent text-on-surface font-body-sm text-body-sm focus:outline-none w-36 sm:w-44 placeholder:text-outline"
                    />
                    {searchFilter && (
                      <button
                        onClick={() => setSearchFilter('')}
                        className="text-outline hover:text-on-surface ml-1 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Sort selector */}
                  <select
                    value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    className="bg-surface-container-lowest text-on-surface font-body-sm text-body-sm rounded border border-surface-variant px-2.5 py-1.5 focus:outline-none focus:border-outline cursor-pointer"
                  >
                    <option value="recent">Recently Updated</option>
                    <option value="score">Score (High to Low)</option>
                    <option value="progress">Progress %</option>
                    <option value="title">Title (A-Z)</option>
                  </select>
                </div>
              </div>

              {/* Main List / Grid Display */}
              {filteredEntries.length === 0 ? (
                <div className="p-12 text-center bg-surface-container-lowest rounded-xl border border-surface-variant flex flex-col items-center gap-3">
                  <span className="material-symbols-outlined text-4xl text-outline">
                    inbox
                  </span>
                  <h3 className="font-headline-sm text-on-surface">No entries found</h3>
                  <p className="font-body-sm text-on-surface-variant max-w-sm">
                    {searchFilter
                      ? 'No titles match your search criteria.'
                      : `No anime currently cataloged under "${
                          STATUS_TABS.find((t) => t.key === activeTab)?.label
                        }".`}
                  </p>
                  <Link
                    href="/tracker/add"
                    className="mt-2 px-4 py-2 rounded bg-primary text-on-primary font-label-md text-caption"
                  >
                    Add Anime to Tracker
                  </Link>
                </div>
              ) : viewMode === 'list' ? (
                /* TABLE / INDEX VIEW */
                <div className="bg-surface-container-lowest rounded-xl border border-surface-variant overflow-hidden shadow-xs">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full min-w-[800px] text-left border-collapse">
                      <thead className="hidden md:table-header-group">
                        <tr className="border-b border-surface-variant text-outline dark:text-zinc-300 font-label-mono text-caption uppercase bg-surface-container-low/50 dark:bg-zinc-800/40">
                          <th className="py-3 px-4 font-normal">#</th>
                          <th className="py-3 px-4 font-normal">Title &amp; Format</th>
                          <th className="py-3 px-4 font-normal">Watch Status</th>
                          <th className="py-3 px-4 font-normal">Progress</th>
                          <th className="py-3 px-4 font-normal">Score</th>
                          <th className="py-3 px-4 font-normal text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-variant">
                        {filteredEntries.map((item, idx) => {
                          const badge = STATUS_BADGES[item.status];
                          const total = item.totalEpisodes || '?';
                          const pct = item.totalEpisodes
                            ? Math.round((item.progress / item.totalEpisodes) * 100)
                            : 0;

                          return (
                            <tr
                              key={item.id}
                              className="hover:bg-surface-container-low/40 transition-colors group"
                            >
                              {/* Index */}
                              <td className="py-3 px-4 font-label-mono text-caption text-outline">
                                {String(idx + 1).padStart(2, '0')}
                              </td>

                              {/* Title & Cover */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <Link
                                    href={`/anime/${item.id}`}
                                    className="w-10 h-14 rounded overflow-hidden bg-surface-container shrink-0 block hover:opacity-85 transition-opacity"
                                  >
                                    <img
                                      src={realCovers[item.id] || item.coverImage.large}
                                      alt={item.title.romaji}
                                      className="w-full h-full object-cover"
                                    />
                                  </Link>
                                  <div className="flex flex-col min-w-0 max-w-xs sm:max-w-sm md:max-w-md">
                                    <Link
                                      href={`/anime/${item.id}`}
                                      className="font-headline-sm text-body-md text-on-surface hover:text-secondary transition-colors font-medium truncate block"
                                    >
                                      {item.title.english || item.title.romaji}
                                    </Link>
                                    <div className="flex items-center gap-2 font-label-mono text-caption text-outline truncate">
                                      <span>{item.format || 'TV'}</span>
                                      {item.studio && (
                                        <>
                                          <span>•</span>
                                          <span>{item.studio}</span>
                                        </>
                                      )}
                                      {item.year && (
                                        <>
                                          <span>•</span>
                                          <span>{item.year}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* INTERACTIVE STATUS DROPDOWN */}
                              <td className="py-3 px-4 relative">
                                <div className="relative inline-block">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setStatusDropdownId(
                                        statusDropdownId === item.id ? null : item.id
                                      )
                                    }
                                    className={`px-2.5 py-1 rounded-full text-caption font-label-mono flex items-center gap-1.5 transition-all ${badge.badgeClass}`}
                                  >
                                    <span
                                      className={`w-2 h-2 rounded-full ${badge.dotColor}`}
                                    ></span>
                                    <span>{badge.label}</span>
                                    <span className="material-symbols-outlined text-xs">
                                      expand_more
                                    </span>
                                  </button>

                                  {/* Dropdown Options */}
                                  {statusDropdownId === item.id && (
                                    <div className="absolute left-0 mt-1 w-44 bg-surface-container-lowest border border-surface-variant rounded-xl shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                                      {(
                                        Object.keys(STATUS_BADGES) as TrackerStatus[]
                                      ).map((st) => (
                                        <button
                                          key={st}
                                          type="button"
                                          onClick={() => {
                                            updateStatus(item.id, st);
                                            setStatusDropdownId(null);
                                          }}
                                          className={`w-full text-left px-3 py-1.5 flex items-center gap-2 font-label-mono text-caption transition-colors ${
                                            item.status === st
                                              ? 'bg-surface-container font-semibold text-on-surface'
                                              : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                                          }`}
                                        >
                                          <span
                                            className={`w-2 h-2 rounded-full ${STATUS_BADGES[st].dotColor}`}
                                          ></span>
                                          <span>{STATUS_BADGES[st].label}</span>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* INTERACTIVE EPISODE STEPPER */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2 font-label-mono text-body-sm">
                                  <button
                                    aria-label="Decrease episode"
                                    onClick={() =>
                                      updateProgress(item.id, item.progress - 1)
                                    }
                                    className="w-6 h-6 rounded bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface text-xs transition-colors"
                                  >
                                    -
                                  </button>
                                  <span className="font-semibold text-on-surface min-w-[24px] text-center">
                                    {item.progress}
                                  </span>
                                  <span className="text-outline">/ {total}</span>
                                  <button
                                    aria-label="Increase episode"
                                    onClick={() =>
                                      updateProgress(item.id, item.progress + 1)
                                    }
                                    className="w-6 h-6 rounded bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface text-xs transition-colors"
                                  >
                                    +
                                  </button>
                                </div>
                                {item.totalEpisodes && (
                                  <div className="w-24 h-1 bg-surface-variant rounded-full mt-1.5 overflow-hidden">
                                    <div
                                      className="h-full bg-secondary transition-all"
                                      style={{ width: `${pct}%` }}
                                    ></div>
                                  </div>
                                )}
                              </td>

                              {/* Score */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-1 font-label-mono text-body-sm">
                                  <span className="text-amber-500 text-xs">★</span>
                                  <select
                                    value={item.score || 0}
                                    onChange={(e) => updateScore(item.id, Number(e.target.value))}
                                    className="bg-transparent font-medium text-on-surface focus:outline-none cursor-pointer appearance-none text-center"
                                  >
                                    <option value={0}>—</option>
                                    {[...Array(20)].map((_, i) => {
                                      const scoreVal = (i + 1) / 2;
                                      return (
                                        <option key={scoreVal} value={scoreVal}>
                                          {scoreVal.toFixed(1)}
                                        </option>
                                      );
                                    })}
                                  </select>
                                </div>
                              </td>

                              {/* Actions */}
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  {/* Quick Mark Complete */}
                                  {item.status !== 'completed' && (
                                    <button
                                      onClick={() => markCompleted(item.id)}
                                      title="Mark Complete"
                                      className="p-1 text-outline hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                                    >
                                      <span className="material-symbols-outlined text-sm">
                                        done_all
                                      </span>
                                    </button>
                                  )}
                                  {/* Delete */}
                                  <button
                                    onClick={() => removeEntry(item.id)}
                                    title="Remove from Tracker"
                                    className="p-1 text-outline hover:text-error hover:bg-error-container/20 rounded transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-sm">
                                      delete
                                    </span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* GRID / PLATES VIEW */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-space-md">
                  {filteredEntries.map((item) => {
                    const badge = STATUS_BADGES[item.status];
                    const total = item.totalEpisodes || '?';

                    return (
                      <div
                        key={item.id}
                        className="bg-surface-container-lowest rounded-xl border border-surface-variant overflow-hidden shadow-xs hover:border-outline transition-all flex flex-col group"
                      >
                        {/* Poster */}
                        <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface-container">
                          <img
                            src={realCovers[item.id] || item.coverImage.large}
                            alt={item.title.romaji}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 left-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-label-mono ${badge.badgeClass} bg-surface-container-lowest/90 backdrop-blur-sm`}
                            >
                              {badge.label}
                            </span>
                          </div>
                          <div className="absolute top-2 right-2 bg-surface-container-lowest/90 backdrop-blur-sm px-1.5 py-0.5 rounded font-label-mono text-[11px] flex items-center gap-0.5 text-on-surface hover:bg-surface-container-lowest transition-colors">
                            <span className="text-amber-500 text-[10px]">★</span>
                            <select
                               value={item.score || 0}
                               onChange={(e) => updateScore(item.id, Number(e.target.value))}
                               className="bg-transparent text-on-surface focus:outline-none cursor-pointer appearance-none pl-0.5"
                             >
                               <option value={0}>—</option>
                               {[...Array(20)].map((_, i) => {
                                 const scoreVal = (i + 1) / 2;
                                 return (
                                   <option key={scoreVal} value={scoreVal}>
                                     {scoreVal.toFixed(1)}
                                   </option>
                                 );
                               })}
                             </select>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-3 flex flex-col justify-between flex-1 gap-2">
                          <div>
                            <Link
                              href={`/anime/${item.id}`}
                              className="font-headline-sm text-body-sm text-on-surface hover:text-secondary line-clamp-1 block"
                            >
                              {item.title.english || item.title.romaji}
                            </Link>
                            <p className="font-label-mono text-caption text-outline truncate">
                              {item.studio || item.format || 'TV'}
                            </p>
                          </div>

                          {/* Quick Stepper */}
                          <div className="flex items-center justify-between pt-2 border-t border-surface-variant font-label-mono text-caption">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() =>
                                  updateProgress(item.id, item.progress - 1)
                                }
                                className="w-5 h-5 rounded bg-surface-container flex items-center justify-center text-xs hover:bg-surface-container-high"
                              >
                                -
                              </button>
                              <span className="font-medium text-on-surface">
                                {item.progress}/{total}
                              </span>
                              <button
                                onClick={() =>
                                  updateProgress(item.id, item.progress + 1)
                                }
                                className="w-5 h-5 rounded bg-surface-container flex items-center justify-center text-xs hover:bg-surface-container-high"
                              >
                                +
                              </button>
                            </div>

                            {/* Mark Complete */}
                            {item.status !== 'completed' && (
                              <button
                                onClick={() => markCompleted(item.id)}
                                title="Mark Complete"
                                className="text-outline hover:text-emerald-700"
                              >
                                <span className="material-symbols-outlined text-sm">
                                  check
                                </span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <footer className="w-full bg-surface-container-lowest border-t border-surface-variant mt-space-xl">
        <div className="max-w-[1280px] mx-auto px-margin-mobile lg:px-margin py-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm text-on-surface-variant font-label-mono text-caption">
            <span>KURO ANIME LOG</span>
            <span>•</span>
            <span>MINIMALIST CATALOG ARCHIVE</span>
          </div>
          <div className="text-on-surface-variant font-caption text-caption">
            © 2025 Kuro. Architectural tracking for disciplined media consumption.
          </div>
        </div>
      </footer>
    </ProtectedRoute>
  );
}