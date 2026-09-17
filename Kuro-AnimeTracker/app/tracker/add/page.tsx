'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useTracker, TrackerStatus } from '@/lib/trackerContext';

interface SearchResult {
  id: number;
  title: {
    romaji: string;
    english?: string;
    native?: string;
  };
  coverImage: {
    large: string;
    extraLarge?: string;
  };
  averageScore?: number;
  episodes?: number;
  format?: string;
  status?: string;
  genres?: string[];
  studios?: {
    nodes?: Array<{ name: string }>;
  };
  season?: string;
  seasonYear?: number;
  nextAiringEpisode?: { episode: number } | null;
}



function AddToTrackerContent() {
  const router = useRouter();
  const { addOrUpdateEntry } = useTracker();

  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isFetchingTrending, setIsFetchingTrending] = useState(true);

  const [watchStatus, setWatchStatus] = useState<TrackerStatus>('watching');
  const [progress, setProgress] = useState(0);
  const [userScore, setUserScore] = useState<number>(0);
  const [isSaved, setIsSaved] = useState(false);

  // Fetch trending anime from AniList on mount
  useEffect(() => {
    setIsFetchingTrending(true);
    fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        query: `query {
          Page(page: 1, perPage: 10) {
            media(sort: TRENDING_DESC, type: ANIME, isAdult: false) {
              id
              title { romaji english native }
              coverImage { large extraLarge }
              averageScore episodes format status genres season seasonYear
              studios(isMain: true) { nodes { name } }
              nextAiringEpisode { episode }
            }
          }
        }`,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        const found: SearchResult[] = data?.data?.Page?.media || [];
        setResults(found);
      })
      .catch(console.error)
      .finally(() => setIsFetchingTrending(false));
  }, []);

  // Handle real-time AniList search
  useEffect(() => {
    if (!searchQuery.trim()) {
      // Re-fetch trending when query is cleared
      setIsFetchingTrending(true);
      fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          query: `query {
            Page(page: 1, perPage: 10) {
              media(sort: TRENDING_DESC, type: ANIME, isAdult: false) {
                id
                title { romaji english native }
                coverImage { large extraLarge }
                averageScore episodes format status genres season seasonYear
                studios(isMain: true) { nodes { name } }
                nextAiringEpisode { episode }
              }
            }
          }`,
        }),
      })
        .then((r) => r.json())
        .then((data) => setResults(data?.data?.Page?.media || []))
        .catch(console.error)
        .finally(() => setIsFetchingTrending(false));
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch('https://graphql.anilist.co', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            query: `
              query ($search: String) {
                Page(page: 1, perPage: 8) {
                  media(search: $search, type: ANIME, isAdult: false) {
                    id
                    title { romaji english native }
                    coverImage { large extraLarge }
                    averageScore
                    episodes
                    format
                    status
                    genres
                    season
                    seasonYear
                    studios(isMain: true) { nodes { name } }
                    nextAiringEpisode { episode }
                  }
                }
              }
            `,
            variables: { search: searchQuery },
          }),
        });
        const data = await res.json();
        const found = data?.data?.Page?.media || [];
        if (found.length > 0) {
          setResults(found);
        }
      } catch (err) {
        console.error('AniList search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const maxEps = selectedAnime?.episodes || (selectedAnime?.nextAiringEpisode ? selectedAnime.nextAiringEpisode.episode - 1 : 9999);

  const handleSelectAnime = (anime: SearchResult) => {
    setSelectedAnime(anime);
    const eps = anime.episodes || (anime.nextAiringEpisode ? anime.nextAiringEpisode.episode - 1 : 9999);
    setProgress(Math.min(progress, eps));
  };

  const handleSetAllCompleted = () => {
    setProgress(maxEps);
    setWatchStatus('completed');
  };

  const handleSave = () => {
    if (!selectedAnime) return; // guard
    addOrUpdateEntry({
      id: selectedAnime.id,
      title: selectedAnime.title,
      coverImage: selectedAnime.coverImage,
      format: selectedAnime.format || 'TV',
      status: watchStatus,
      progress,
      totalEpisodes: selectedAnime.episodes || null,
      score: userScore > 0 ? userScore : null,
      studio: selectedAnime.studios?.nodes?.[0]?.name || '',
      year: selectedAnime.seasonYear || new Date().getFullYear(),
      tags: selectedAnime.genres || [],
      updatedAt: new Date().toISOString(),
    });

    setIsSaved(true);
    setTimeout(() => {
      router.push('/list');
    }, 600);
  };



  return (
    <div className="w-full max-w-[1280px] mx-auto px-margin-mobile lg:px-margin py-space-md lg:py-space-lg flex flex-col gap-space-lg">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pb-space-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-space-xs font-label-mono text-caption text-outline tracking-wider uppercase">
            <Link href="/list" className="hover:text-on-surface transition-colors">
              My Tracker
            </Link>
            <span className="text-outline-variant">/</span>
            <span className="text-primary font-medium">New Entry</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight pt-1">
            Add Entry
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Search and catalog a series to update your personal archive.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0">
          <Link
            href="/list"
            className="px-3 py-1.5 rounded text-body-sm font-label-md text-on-surface-variant hover:text-on-surface bg-surface-container transition-colors"
          >
            ← Back to Watchlist
          </Link>
        </div>
      </div>

      {/* Main Archivist Workspace Layout (55% / 45%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left Column: Search & Catalog Discovery (7 Cols ~ 58%) */}
        <section className="lg:col-span-7 flex flex-col gap-space-md">
          {/* Search Bar Component */}
          <div className="relative flex items-center bg-surface-container-lowest rounded border border-surface-variant focus-within:border-outline transition-colors">
            <span className="material-symbols-outlined absolute left-space-sm text-outline pointer-events-none text-lg">
              {isSearching ? 'sync' : 'search'}
            </span>
            <input
              id="anime-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, studio, or genre..."
              className="w-full pl-10 pr-16 py-3 bg-transparent text-on-surface font-body-md text-body-md rounded focus:outline-none placeholder:text-outline"
              type="text"
            />
            {searchQuery && (
              <button
                aria-label="Clear input"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 p-1 text-outline hover:text-on-surface transition-colors rounded"
                type="button"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>

          {/* Search Results Stream */}
          <div className="flex flex-col gap-space-sm" id="search-results-list">
            {(isFetchingTrending && results.length === 0) && (
              <div className="flex items-center gap-2 py-4 px-2 text-outline font-label-mono text-caption">
                <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                <span>Loading trending anime from AniList...</span>
              </div>
            )}
            {!searchQuery && !isFetchingTrending && results.length > 0 && (
              <div className="flex items-center gap-2 py-1 px-1 text-outline font-label-mono text-caption">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span>TRENDING NOW ON ANILIST</span>
              </div>
            )}
            {results.map((anime) => {
              const isSelected = selectedAnime?.id === anime.id;
              const studio = anime.studios?.nodes?.[0]?.name || 'Studio';
              const rating = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : '8.5';
              const seasonYear = anime.seasonYear || anime.season || '2024';

              return (
                <article
                  key={anime.id}
                  onClick={() => handleSelectAnime(anime)}
                  className={`catalog-card relative bg-surface-container-lowest p-space-md rounded border transition-all cursor-pointer flex gap-space-md items-start ${
                    isSelected
                      ? 'border-primary shadow-sm ring-1 ring-primary'
                      : 'border-surface-variant hover:border-outline opacity-85 hover:opacity-100'
                  }`}
                >
                  <div className="relative w-20 sm:w-24 aspect-[3/4] shrink-0 overflow-hidden rounded bg-surface-container-high">
                    <img
                      className="w-full h-full object-cover"
                      alt={anime.title.english || anime.title.romaji}
                      src={anime.coverImage.large}
                    />
                    <span className="absolute top-1 left-1 font-label-mono text-caption bg-primary text-on-primary px-1.5 py-0.5 rounded">
                      {anime.format || 'TV'}
                    </span>
                  </div>

                  <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-space-xs">
                        <span
                          className={`font-label-mono text-caption uppercase tracking-wider font-medium ${
                            isSelected ? 'text-secondary' : 'text-outline'
                          }`}
                        >
                          {isSelected ? 'Active Selection' : studio}
                        </span>
                        <div className="flex items-center gap-1 font-label-mono text-caption text-on-surface font-medium">
                          <span className="text-amber-500 text-xs">★</span>
                          <span>{rating}</span>
                        </div>
                      </div>

                      <h3 className="font-headline-sm text-headline-sm text-on-surface leading-tight truncate">
                        {anime.title.english || anime.title.romaji}
                      </h3>
                      <p className="font-caption text-caption text-outline truncate">
                        {anime.title.native || anime.title.romaji} • {studio} • {seasonYear}
                      </p>
                      <p className="font-label-mono text-caption text-on-surface-variant pt-1">
                        {anime.episodes ? `${anime.episodes} Episodes` : 'Ongoing'} •{' '}
                        {anime.genres?.slice(0, 2).join(' / ') || 'Animation'}
                      </p>
                    </div>

                    <div className="mt-space-md flex items-center justify-between border-t border-surface-variant pt-space-xs">
                      <span className="font-caption text-caption text-outline">
                        {anime.status ? anime.status.replace('_', ' ') : 'Airing'}
                      </span>
                      <span
                        className={`font-label-mono text-caption flex items-center gap-1 font-medium ${
                          isSelected ? 'text-primary' : 'text-outline hover:text-primary'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            Selected for logging{' '}
                            <span className="material-symbols-outlined text-xs">
                              check
                            </span>
                          </>
                        ) : (
                          <>
                            Select series{' '}
                            <span className="material-symbols-outlined text-xs">
                              chevron_right
                            </span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {results.length === 0 && !isFetchingTrending && searchQuery && (
            <div className="py-6 text-center text-outline font-label-mono text-caption">
              No anime found for "{searchQuery}"
            </div>
          )}
        </section>

        {/* Right Column: Entry Configuration & Tagging Drawer (5 Cols ~ 42%) */}
        <section className="lg:col-span-5 flex flex-col gap-space-md sticky top-20">
          {!selectedAnime ? (
            <div className="bg-surface-container-lowest rounded shadow-md p-space-xl border border-surface-variant flex flex-col items-center justify-center gap-3 text-center min-h-[400px]">
              <span className="material-symbols-outlined text-5xl text-outline">library_add</span>
              <h3 className="font-headline-sm text-on-surface">Select an Anime</h3>
              <p className="font-body-sm text-on-surface-variant max-w-xs">
                Search and click any result on the left to configure your tracker entry.
              </p>
            </div>
          ) : (
          <div className="bg-surface-container-lowest rounded shadow-md p-space-md md:p-space-lg flex flex-col gap-space-md border border-surface-variant">
            {/* Header info */}
            <div className="pb-space-sm border-b border-surface-variant">
              <div className="flex items-center justify-between text-outline font-label-mono text-caption mb-1">
                <span className="uppercase">
                  {selectedAnime.studios?.nodes?.[0]?.name || 'STUDIO'} •{' '}
                  {selectedAnime.episodes || '??'} EPS
                </span>
                <span className="text-primary font-medium">
                  #AL-{selectedAnime.id}
                </span>
              </div>
              <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight">
                {selectedAnime.title.english || selectedAnime.title.romaji}
              </h2>
            </div>

            {/* Watch Status Selector */}
            <div className="space-y-space-xs">
              <div className="flex items-center justify-between">
                <label className="font-label-md text-label-md text-on-surface font-medium">
                  Watch Status
                </label>
              </div>
              <div className="grid grid-cols-5 gap-1.5" id="status-button-group">
                {(
                  [
                    { key: 'watching', label: 'Watching' },
                    { key: 'completed', label: 'Completed' },
                    { key: 'plan', label: 'Plan' },
                    { key: 'hold', label: 'On Hold' },
                    { key: 'dropped', label: 'Dropped' },
                  ] as const
                ).map((st) => (
                  <button
                    key={st.key}
                    type="button"
                    onClick={() => setWatchStatus(st.key)}
                    className={`py-2 rounded font-label-mono text-caption text-center transition-all ${
                      watchStatus === st.key
                        ? 'bg-primary text-on-primary font-medium shadow-xs'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Episode Progress Stepper */}
            <div className="space-y-space-xs pt-space-xs">
              <div className="flex items-center justify-between">
                <label className="font-label-md text-label-md text-on-surface font-medium">
                  Episode Progress
                </label>
                <button
                  onClick={handleSetAllCompleted}
                  className="font-label-mono text-caption text-outline hover:text-primary transition-colors cursor-pointer"
                  type="button"
                >
                  All Completed
                </button>
              </div>
              <div className="flex items-center justify-between p-space-sm bg-surface-container-low rounded">
                <div className="flex items-center gap-space-md">
                  <button
                    aria-label="Decrease episode"
                    onClick={() => setProgress(Math.max(0, progress - 1))}
                    className="w-8 h-8 rounded bg-surface-container-lowest text-on-surface hover:bg-surface-container flex items-center justify-center shadow-xs transition-colors"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-sm">remove</span>
                  </button>
                  <div className="flex items-baseline gap-1 font-label-mono">
                    <span className="text-headline-md font-semibold text-primary">
                      {progress}
                    </span>
                    <span className="text-body-sm text-outline">/ {maxEps}</span>
                  </div>
                  <button
                    aria-label="Increase episode"
                    onClick={() => setProgress(Math.min(maxEps, progress + 1))}
                    className="w-8 h-8 rounded bg-surface-container-lowest text-on-surface hover:bg-surface-container flex items-center justify-center shadow-xs transition-colors"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                  </button>
                </div>
                <span className="font-label-mono text-caption text-outline">
                  {Math.round((progress / maxEps) * 100)}% complete
                </span>
              </div>
            </div>

            {/* Score Selector */}
            <div className="space-y-space-xs pt-space-xs">
              <div className="flex items-center justify-between">
                <label className="font-label-md text-label-md text-on-surface font-medium">
                  Your Score
                </label>
              </div>
              <div className="flex items-center justify-between p-space-sm bg-surface-container-low rounded">
                <div className="flex items-center gap-space-md">
                  <button
                    aria-label="Decrease score"
                    onClick={() => setUserScore(Math.max(0, userScore - 0.5))}
                    className="w-8 h-8 rounded bg-surface-container-lowest text-on-surface hover:bg-surface-container flex items-center justify-center shadow-xs transition-colors"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-sm">remove</span>
                  </button>
                  <div className="flex items-baseline gap-1 font-label-mono">
                    <span className="text-amber-500 text-sm">★</span>
                    <span className="text-headline-md font-semibold text-primary">
                      {userScore > 0 ? userScore.toFixed(1) : '—'}
                    </span>
                    <span className="text-body-sm text-outline">/ 10</span>
                  </div>
                  <button
                    aria-label="Increase score"
                    onClick={() => setUserScore(Math.min(10, userScore + 0.5))}
                    className="w-8 h-8 rounded bg-surface-container-lowest text-on-surface hover:bg-surface-container flex items-center justify-center shadow-xs transition-colors"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                  </button>
                </div>
              </div>
            </div>



            {/* Submit & Cancel Actions */}
            <div className="pt-space-sm flex items-center gap-space-md">
              <button
                onClick={handleSave}
                disabled={isSaved || !selectedAnime}
                className={`flex-1 py-3 px-space-md rounded font-headline-sm text-headline-sm flex items-center justify-center gap-space-xs shadow-xs transition-all ${
                  !selectedAnime
                    ? 'bg-surface-container text-outline cursor-not-allowed'
                    : isSaved
                    ? 'bg-secondary text-on-secondary'
                    : 'bg-primary text-on-primary hover:opacity-90 active:scale-[0.99]'
                }`}
                type="button"
              >
                {isSaved ? (
                  <>
                    <span className="material-symbols-outlined text-sm">done</span>
                    <span>Logged to Archive!</span>
                  </>
                ) : (
                  <>
                    <span>Save to Tracker</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </>
                )}
              </button>

              <Link
                href="/list"
                className="py-3 px-space-md text-outline hover:text-on-surface font-label-mono text-caption transition-colors"
              >
                Cancel
              </Link>
            </div>
          </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function AddToTrackerPage() {
  return (
    <ProtectedRoute redirectPath="/tracker/add">
      <Header activePage="tracker" />
      <main className="w-full pt-16 min-h-screen bg-background">
        <Suspense fallback={<div className="p-8 text-center">Loading entry form...</div>}>
          <AddToTrackerContent />
        </Suspense>
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
