'use client';

import React, { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface MediaItem {
  id: number;
  title: {
    romaji?: string;
    english?: string;
    native?: string;
  };
  coverImage?: {
    large?: string;
    extraLarge?: string;
  };
  format?: string;
  status?: string;
  episodes?: number | null;
  seasonYear?: number | null;
  averageScore?: number | null;
  genres?: string[];
  studios?: {
    nodes?: Array<{ name: string }>;
  };
}

interface SearchClientProps {
  initialQuery: string;
  initialResults: MediaItem[];
}

export default function SearchClient({ initialQuery, initialResults }: SearchClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'TV' | 'MOVIE' | 'SPECIAL'>('ALL');
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      router.push('/search');
      return;
    }
    startTransition(() => {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    });
  };

  const handleClear = () => {
    setSearchTerm('');
    router.push('/search');
  };

  // Filter results client-side by format
  const filteredResults = initialResults.filter(item => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'TV') return item.format === 'TV' || item.format === 'TV_SHORT';
    if (activeFilter === 'MOVIE') return item.format === 'MOVIE';
    if (activeFilter === 'SPECIAL') return item.format === 'OVA' || item.format === 'ONA' || item.format === 'SPECIAL';
    return true;
  });

  const tvCount = initialResults.filter(item => item.format === 'TV' || item.format === 'TV_SHORT').length;
  const movieCount = initialResults.filter(item => item.format === 'MOVIE').length;
  const specialCount = initialResults.filter(item => item.format === 'OVA' || item.format === 'ONA' || item.format === 'SPECIAL').length;

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center pt-8 md:pt-16 px-space-md bg-inverse-surface/30 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-4xl bg-surface-container-lowest rounded-xl shadow-2xl flex flex-col mb-16 overflow-hidden border border-surface-variant">
        
        {/* Search Header & Input */}
        <div className="p-space-lg pb-space-md bg-surface-container-lowest border-b border-surface-variant">
          <div className="flex items-center gap-space-md pb-space-sm">
            <span className="material-symbols-outlined text-secondary text-2xl">
              {isPending ? 'sync' : 'search'}
            </span>
            
            <form onSubmit={handleSearch} className="flex-1 flex items-center relative">
              <input
                name="q"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search any anime title across AniList API..."
                className="w-full bg-transparent font-headline-md text-headline-md text-on-surface focus:outline-none placeholder:text-outline tracking-tight pr-16"
                autoFocus
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-outline hover:text-on-surface transition-colors p-1 rounded mr-8"
                  title="Clear search"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              )}
              <button
                type="submit"
                className="text-primary hover:text-secondary transition-colors p-1.5 rounded bg-surface-container hover:bg-surface-container-high"
                title="Execute search"
              >
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </form>

            <Link
              href="/"
              className="hidden sm:flex items-center gap-space-xs font-label-mono text-caption text-outline hover:text-on-surface transition-colors"
            >
              <kbd className="px-2 py-0.5 bg-surface-container-low rounded text-on-surface-variant font-label-mono">ESC</kbd>
              <span>to exit</span>
            </Link>
          </div>

          {/* Format Filter Tabs */}
          <div className="flex items-center gap-space-xs pt-space-md overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveFilter('ALL')}
              className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeFilter === 'ALL'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'
              }`}
            >
              <span>All Results</span>
              <span className="font-label-mono text-caption opacity-80">{initialResults.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('TV')}
              className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeFilter === 'TV'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'
              }`}
            >
              <span>TV Series</span>
              <span className="font-label-mono text-caption opacity-80">{tvCount}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('MOVIE')}
              className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeFilter === 'MOVIE'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'
              }`}
            >
              <span>Movies</span>
              <span className="font-label-mono text-caption opacity-80">{movieCount}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('SPECIAL')}
              className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeFilter === 'SPECIAL'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'
              }`}
            >
              <span>OVAs &amp; Specials</span>
              <span className="font-label-mono text-caption opacity-80">{specialCount}</span>
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="flex flex-col max-h-[640px] overflow-y-auto bg-surface-container-lowest custom-scrollbar">
          <section className="p-space-lg space-y-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="font-label-mono text-caption text-outline tracking-wider uppercase">
                  {initialQuery ? `RESULTS FOR "${initialQuery.toUpperCase()}"` : 'TRENDING & POPULAR TITLES'}
                </span>
                <span className="text-secondary font-label-mono text-caption font-semibold">
                  • {filteredResults.length.toString().padStart(2, '0')} MATCHES
                </span>
              </div>
              <span className="font-label-mono text-caption text-outline hidden sm:inline">CLICK TO VIEW</span>
            </div>

            {filteredResults.length > 0 ? (
              <div className="space-y-space-sm">
                {filteredResults.map((anime) => {
                  const displayTitle = anime.title.english || anime.title.romaji || 'Unknown Title';
                  const studioName = anime.studios?.nodes?.[0]?.name || 'Unknown Studio';
                  const formatLabel = anime.format?.replace(/_/g, ' ') || 'ANIME';
                  const scoreLabel = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : '—';

                  return (
                    <Link
                      key={anime.id}
                      href={`/anime/${anime.id}`}
                      className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all border border-surface-container hover:border-outline-variant"
                    >
                      <div className="flex items-start sm:items-center gap-space-md w-full sm:w-auto">
                        <div className="w-16 h-22 sm:w-14 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden relative shadow-xs bg-surface-container">
                          <img
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            alt={displayTitle}
                            src={anime.coverImage?.large || anime.coverImage?.extraLarge || 'https://via.placeholder.com/150'}
                          />
                          <span className="absolute top-1 left-1 px-1 bg-primary/90 text-on-primary font-label-mono text-[9px] rounded uppercase">
                            {formatLabel}
                          </span>
                        </div>

                        <div className="flex flex-col min-w-0 pr-space-sm">
                          <div className="flex items-center gap-space-sm flex-wrap">
                            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold group-hover:text-secondary transition-colors truncate">
                              {displayTitle}
                            </h3>
                            {anime.title.native && (
                              <span className="font-caption text-caption text-outline truncate hidden sm:inline">
                                {anime.title.native}
                              </span>
                            )}
                          </div>

                          <p className="font-label-mono text-caption text-on-surface-variant mt-0.5">
                            {studioName} • {anime.seasonYear || 'N/A'} • {anime.episodes ? `${anime.episodes} Episodes` : (anime.status === 'RELEASING' ? 'Ongoing' : 'Special')} • {anime.status || 'Finished'}
                          </p>

                          <div className="flex items-center gap-space-sm mt-2 flex-wrap">
                            <span className="inline-flex items-center gap-1 font-label-mono text-caption bg-surface-container px-2 py-0.5 rounded text-on-surface font-medium">
                              <span className="material-symbols-outlined text-[13px] text-secondary">star</span>
                              <span>{scoreLabel}</span>
                            </span>

                            {anime.genres?.slice(0, 3).map((g) => (
                              <span
                                key={g}
                                className="font-label-mono text-[10px] px-1.5 py-0.5 bg-surface-container-high rounded text-on-surface-variant"
                              >
                                {g}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-space-xs mt-space-md sm:mt-0 self-end sm:self-center">
                        <span className="px-3 py-1.5 rounded-lg bg-surface-container-lowest group-hover:bg-primary group-hover:text-on-primary text-on-surface font-label-md text-label-md transition-colors flex items-center gap-1.5 shadow-xs">
                          <span>Inspect Archive</span>
                          <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="p-space-xl text-center flex flex-col items-center justify-center bg-surface-container-low rounded-xl border border-surface-container">
                <span className="material-symbols-outlined text-4xl text-outline mb-2">search_off</span>
                <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1">
                  No matches found on AniList
                </h4>
                <p className="font-body-sm text-on-surface-variant max-w-sm mb-space-md">
                  We couldn't find any anime matching "{initialQuery}". Try searching with alternate Romanized spelling or English title.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['One Piece', 'Naruto', 'Bleach', 'Frieren', 'Jujutsu Kaisen'].map((sample) => (
                    <button
                      key={sample}
                      type="button"
                      onClick={() => {
                        setSearchTerm(sample);
                        router.push(`/search?q=${encodeURIComponent(sample)}`);
                      }}
                      className="px-3 py-1 bg-surface-container hover:bg-surface-container-high rounded-full font-label-mono text-caption text-on-surface transition-colors"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Quick Suggestions / Shortcuts */}
          <section className="p-space-lg bg-surface-container-low/50 border-t border-surface-variant">
            <div className="flex items-center justify-between pb-2">
              <span className="font-label-mono text-caption text-outline tracking-wider uppercase">
                POPULAR FRANCHISES
              </span>
              <span className="font-label-mono text-caption text-outline">QUICK JUMP</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
              {[
                { title: 'One Piece', id: 21 },
                { title: 'Naruto', id: 20 },
                { title: 'Bleach', id: 269 },
                { title: 'Frieren', id: 154587 }
              ].map((item) => (
                <Link
                  key={item.id}
                  href={`/anime/${item.id}`}
                  className="p-space-sm rounded-lg bg-surface-container-lowest hover:bg-surface-container border border-surface-container text-on-surface font-body-sm transition-colors flex items-center justify-between"
                >
                  <span className="truncate">{item.title}</span>
                  <span className="material-symbols-outlined text-[14px] text-outline">open_in_new</span>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Footer info */}
        <div className="px-space-lg py-space-sm bg-surface-container-low flex flex-wrap items-center justify-between text-outline font-label-mono text-caption gap-space-sm border-t border-surface-variant">
          <div className="flex items-center gap-space-md">
            <span>Powered by AniList GraphQL API</span>
          </div>
          <div className="flex items-center gap-space-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
            <span>LIVE CATALOG SEARCH</span>
          </div>
        </div>

      </div>
    </div>
  );
}
