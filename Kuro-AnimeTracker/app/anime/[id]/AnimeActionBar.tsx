'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useTracker, TrackerStatus } from '@/lib/trackerContext';
import { useNotifications } from '@/lib/notificationContext';
import { useAuth } from '@/lib/auth';

interface AnimeActionBarProps {
  anime: {
    id: number;
    title: { romaji: string; english?: string; native?: string };
    coverImage: { large: string; extraLarge?: string };
    bannerImage?: string;
    episodes?: number | null;
    status?: string;
    nextAiringEpisode?: { episode: number } | null;
    averageScore?: number | null;
    format?: string;
    studios?: {
      edges?: Array<{ isMain: boolean; node: { name: string } }>;
      nodes?: Array<{ name: string }>;
    };
    seasonYear?: number;
    genres?: string[];
  };
}

const STATUS_CONFIG: Record<
  TrackerStatus | 'unknown' | 'upcoming',
  { label: string; dotClass: string; textClass: string; bgClass: string }
> = {
  watching: {
    label: 'Watching',
    dotClass: 'bg-secondary',
    textClass: 'text-on-surface',
    bgClass: 'bg-surface-container-low hover:bg-surface-container',
  },
  completed: {
    label: 'Completed',
    dotClass: 'bg-emerald-500',
    textClass: 'text-emerald-900',
    bgClass: 'bg-emerald-50 hover:bg-emerald-100 border border-emerald-200',
  },
  plan: {
    label: 'Plan to Watch',
    dotClass: 'bg-slate-500',
    textClass: 'text-slate-800',
    bgClass: 'bg-slate-100 hover:bg-slate-200 border border-slate-200',
  },
  hold: {
    label: 'On Hold',
    dotClass: 'bg-amber-500',
    textClass: 'text-amber-900',
    bgClass: 'bg-amber-50 hover:bg-amber-100 border border-amber-200',
  },
  dropped: {
    label: 'Dropped',
    dotClass: 'bg-rose-500',
    textClass: 'text-rose-900',
    bgClass: 'bg-rose-50 hover:bg-rose-100 border border-rose-200',
  },
  unknown: {
    label: 'Unknown',
    dotClass: 'bg-outline',
    textClass: 'text-on-surface-variant',
    bgClass: 'bg-surface-container-low hover:bg-surface-container',
  },
  upcoming: {
    label: 'Upcoming',
    dotClass: 'bg-primary',
    textClass: 'text-on-primary',
    bgClass: 'bg-surface-container-low hover:bg-surface-container',
  },
};

export default function AnimeActionBar({ anime }: AnimeActionBarProps) {
  const { getEntry, addOrUpdateEntry, updateStatus, updateProgress, updateScore, toggleFavorite, toggleAlerts, removeEntry } = useTracker();
  const { addNotification } = useNotifications();
  const { isAuthenticated } = useAuth();
  const entry = getEntry(anime.id);

  const status = entry?.status || null;
  const progress = entry?.progress || 0;
  const score = entry?.score || null;
  const isFavorite = entry?.isFavorite || false;
  const alertsEnabled = entry?.alertsEnabled || false;

  const currentStatus = status 
    ? status 
    : (anime.status === 'NOT_YET_RELEASED' ? 'upcoming' : 'unknown');
  
  const currentScore = score ?? (anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 9.0);

  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [scoreMenuOpen, setScoreMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const statusRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setStatusMenuOpen(false);
      }
      if (scoreRef.current && !scoreRef.current.contains(event.target as Node)) {
        setScoreMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleStatusChange = (newStatus: TrackerStatus) => {
    updateStatus(anime.id, newStatus, {
      title: anime.title,
      coverImage: anime.coverImage,
      format: anime.format || 'TV',
      totalEpisodes: anime.episodes || null,
      studio: anime.studios?.edges?.find((e: any) => e.isMain)?.node?.name || anime.studios?.edges?.[0]?.node?.name || '',
      year: anime.seasonYear,
      tags: anime.genres || [],
    });
    setStatusMenuOpen(false);
    showToast(`Updated to "${STATUS_CONFIG[newStatus].label}" in My Tracker`);
  };

  const handleRemove = () => {
    removeEntry(anime.id);
    setStatusMenuOpen(false);
    showToast(`Removed from My Tracker`);
  };

  const handleScoreChange = (score: number) => {
    updateScore(anime.id, score);
    setScoreMenuOpen(false);
    showToast(`Rated ${score}/10`);
  };

  const config = STATUS_CONFIG[currentStatus];

  return (
    <div className="relative">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-on-primary px-4 py-2.5 rounded-lg shadow-xl font-label-mono text-body-sm flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="material-symbols-outlined text-secondary-fixed text-lg">
            check_circle
          </span>
          <span>{toastMessage}</span>
          <Link
            href="/list"
            className="ml-2 underline text-secondary-fixed hover:text-white font-medium"
          >
            View Tracker →
          </Link>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-space-xs font-label-mono text-label-md text-on-surface-variant">
          <Link className="hover:text-primary transition-colors" href="/list">
            Archive Index
          </Link>
          <span className="text-outline-variant">/</span>
          <Link className="hover:text-primary transition-colors" href="/seasonal">
            TV Series
          </Link>
          <span className="text-outline-variant">/</span>
          <span className="text-on-surface font-medium truncate max-w-[200px] sm:max-w-none">
            {anime.title.english || anime.title.romaji}
          </span>
        </nav>

        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center gap-space-xs sm:gap-space-sm">
          {/* Airing Status Chip */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-container rounded font-label-mono text-caption text-on-surface-variant">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim animate-pulse"></span>
            <span>
              {anime.status
                ? anime.status.charAt(0) + anime.status.slice(1).toLowerCase()
                : 'Airing'}{' '}
              •{' '}
              {anime.episodes
                ? `${anime.episodes} Episodes`
                : anime.nextAiringEpisode?.episode
                ? `Ep ${anime.nextAiringEpisode.episode - 1} Aired`
                : 'Ongoing'}
            </span>
          </div>

          {/* INTERACTIVE WATCH STATUS DROPDOWN */}
          <div className="relative inline-block text-left" ref={statusRef}>
            <button
              onClick={() => setStatusMenuOpen(!statusMenuOpen)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-on-surface font-label-mono text-caption rounded transition-colors focus:outline-none shadow-xs ${config.bgClass}`}
              id="status-btn"
              type="button"
            >
              <span className={`w-2 h-2 rounded-full ${config.dotClass}`}></span>
              <span id="status-label" className="font-medium">
                {config.label}
              </span>
              <span className="material-symbols-outlined text-[14px] text-on-surface-variant">
                expand_more
              </span>
            </button>

            {/* Status Selection Popover */}
            {statusMenuOpen && (
              <div className="absolute left-0 mt-1.5 w-48 bg-surface-container-lowest border border-surface-variant rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3 py-1 font-label-mono text-[10px] text-outline uppercase tracking-wider">
                  Update Tracker Status
                </div>
                {(Object.keys(STATUS_CONFIG) as Array<TrackerStatus | 'unknown' | 'upcoming'>)
                  .filter(st => st !== 'unknown' && st !== 'upcoming')
                  .filter(st => anime.status === 'NOT_YET_RELEASED' ? st === 'plan' : true)
                  .map((st) => {
                  const itemConfig = STATUS_CONFIG[st];
                  const isSelected = currentStatus === st && Boolean(entry);
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(st as TrackerStatus)}
                      className={`w-full text-left px-3 py-1.5 flex items-center justify-between text-body-sm transition-colors ${
                        isSelected
                          ? 'bg-surface-container font-semibold text-on-surface'
                          : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-label-mono text-caption">
                        <span
                          className={`w-2 h-2 rounded-full ${itemConfig.dotClass}`}
                        ></span>
                        <span>{itemConfig.label}</span>
                      </div>
                      {isSelected && (
                        <span className="material-symbols-outlined text-[14px] text-primary">
                          check
                        </span>
                      )}
                    </button>
                  );
                })}

                {entry && (
                  <>
                    <div className="border-t border-surface-variant my-1"></div>
                    <button
                      type="button"
                      onClick={handleRemove}
                      className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-error font-label-mono text-caption hover:bg-error-container/20 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        delete
                      </span>
                      <span>Remove from Tracker</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* INTERACTIVE SCORE BUTTON */}
          <div className="relative inline-block text-left" ref={scoreRef}>
            <button
              onClick={() => setScoreMenuOpen(!scoreMenuOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-lowest shadow-sm hover:bg-surface-container text-on-surface font-label-mono text-caption rounded transition-colors"
              id="score-btn"
              type="button"
            >
              <span
                className="material-symbols-outlined text-[14px] text-amber-500"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              <span id="personal-score-val" className="font-semibold">
                {currentScore}
              </span>
              <span className="text-outline">/ 10</span>
            </button>

            {/* Score Selector Popover */}
            {scoreMenuOpen && (
              <div className="absolute left-0 mt-1.5 w-44 bg-surface-container-lowest border border-surface-variant rounded-xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-2 py-1 font-label-mono text-[10px] text-outline uppercase tracking-wider">
                  Personal Rating
                </div>
                <div className="grid grid-cols-5 gap-1 pt-1">
                  {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleScoreChange(num)}
                      className={`p-1.5 rounded font-label-mono text-caption flex items-center justify-center transition-colors ${
                        Number(currentScore) === num
                          ? 'bg-primary text-on-primary font-bold'
                          : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* INTERACTIVE ALERTS TOGGLE */}
          {(anime.status === 'RELEASING' || anime.status === 'NOT_YET_RELEASED') && (
            <button
              type="button"
              onClick={() => {
                if (!isAuthenticated) {
                  showToast('Login required to access notification');
                  return;
                }
                
                // If not tracked yet, add it first so alerts have a place to save!
                if (!entry) {
                  addOrUpdateEntry({
                    id: anime.id,
                    title: anime.title,
                    coverImage: anime.coverImage,
                    status: anime.status === 'NOT_YET_RELEASED' ? 'plan' : 'watching',
                    alertsEnabled: true
                  });
                } else {
                  toggleAlerts(anime.id);
                }

                if (!alertsEnabled) {
                  showToast(`Alerts enabled for ${anime.title.romaji}`);
                  addNotification({
                    category: 'today',
                    title: 'Notification Alert Subscribed',
                    message: `You will now receive system dispatches for ${anime.title.romaji}.`,
                    animeId: anime.id,
                    coverImage: anime.coverImage.extraLarge || anime.coverImage.large,
                    badge: anime.nextAiringEpisode ? `Ep ${anime.nextAiringEpisode.episode} Airing Soon` : undefined
                  });
                } else {
                  showToast(`Alerts disabled for ${anime.title.romaji}`);
                }
              }}
              title="Toggle notifications"
              className={`inline-flex items-center gap-1 px-2.5 py-1 shadow-sm font-label-mono text-caption rounded transition-colors cursor-pointer ${alertsEnabled ? 'bg-primary text-on-primary dark:text-zinc-900 hover:bg-primary/90' : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface'}`}
            >
              <span className="material-symbols-outlined text-[13px] text-current">
                {alertsEnabled ? 'notifications_active' : 'notifications'}
              </span>
            </button>
          )}

          {/* INTERACTIVE FAVORITE BUTTON */}
          <button
            aria-label="Add to favorites"
            type="button"
            onClick={() => {
              toggleFavorite(anime.id);
              showToast(isFavorite ? 'Removed from favorites' : 'Added to favorites');
            }}
            className={`p-1 px-2 rounded transition-colors flex items-center justify-center shadow-sm ${
              isFavorite
                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
                : 'bg-surface-container-lowest hover:bg-surface-container text-outline'
            }`}
            id="favorite-btn"
          >
            <span
              className="material-symbols-outlined text-[16px]"
              style={{
                fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              favorite
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
