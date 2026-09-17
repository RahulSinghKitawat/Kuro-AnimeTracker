'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTracker } from '@/lib/trackerContext';

interface AnimeDetailTabsProps {
  anime: {
    id: number;
    status?: string | null;
    title: {
      romaji?: string;
      english?: string;
      native?: string;
    };
    coverImage?: {
      large: string;
      extraLarge?: string;
    };
    episodes?: number | null;
    duration?: number | null;
    nextAiringEpisode?: {
      episode: number;
      airingAt: number;
      timeUntilAiring?: number;
    } | null;
    streamingEpisodes?: Array<{
      title?: string;
      thumbnail?: string;
      url?: string;
      site?: string;
    }>;
    characters?: {
      edges?: Array<{
        role: string;
        node: {
          id: number;
          name: { full: string; native?: string };
          image: { large: string; medium?: string };
        };
        voiceActors?: Array<{
          id: number;
          name: { full: string; native?: string };
          image: { large: string; medium?: string };
          languageV2?: string;
        }>;
      }>;
    };
    staff?: {
      edges?: Array<{
        role: string;
        node: {
          id: number;
          name: { full: string; native?: string };
          image: { large: string; medium?: string };
        };
      }>;
    };
    studios?: {
      edges?: Array<{
        isMain: boolean;
        node: {
          id: number;
          name: string;
        };
      }>;
    };
  };
}

export default function AnimeDetailTabs({ anime }: AnimeDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<'episodes' | 'characters' | 'staff'>('episodes');
  
  // Calculate true total episodes based on status:
  // - NOT_YET_RELEASED: 0 (no episodes aired yet)
  // - RELEASING: cap to episodes actually aired (nextAiringEpisode.episode - 1)
  //   even if the season has a known total count (e.g. 10 eps total, only 8 aired)
  // - FINISHED/other: use anime.episodes (the full count)
  // Fallback chain for edge cases: streamingEpisodes.length
  const totalEpisodes = useMemo(() => {
    const status = anime.status;

    // Not yet released — no episodes exist yet
    if (status === 'NOT_YET_RELEASED') return 0;

    // Currently airing — only show episodes that have actually aired
    if (status === 'RELEASING') {
      if (anime.nextAiringEpisode?.episode && anime.nextAiringEpisode.episode > 1) {
        return anime.nextAiringEpisode.episode - 1;
      }
      // Airing but episode 1 not yet out (rare edge case)
      return 0;
    }

    // Finished airing or unknown — use the declared total
    if (anime.episodes && anime.episodes > 0) return anime.episodes;
    if (anime.streamingEpisodes && anime.streamingEpisodes.length > 0) {
      return anime.streamingEpisodes.length;
    }
    return 1;
  }, [anime.status, anime.episodes, anime.nextAiringEpisode, anime.streamingEpisodes]);
  
  // Chunking and Episode Filter state for anime with many episodes (e.g. 100+)
  const CHUNK_SIZE = 50;
  const totalChunks = Math.ceil(totalEpisodes / CHUNK_SIZE);
  const [selectedChunk, setSelectedChunk] = useState<number>(0);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [jumpInput, setJumpInput] = useState<string>('');

  const { getEntry, addOrUpdateEntry, updateProgress } = useTracker();
  const entry = getEntry(anime.id);



  // Persist watched state via Tracker
  const toggleEpisode = (epNum: number) => {
    if (!entry) {
      addOrUpdateEntry({
        id: anime.id,
        title: {
          romaji: anime.title.romaji || anime.title.english || anime.title.native || 'Unknown',
          english: anime.title.english,
          native: anime.title.native
        },
        coverImage: (anime.coverImage as any) || { large: '' },
        status: 'watching',
        progress: epNum
      });
    } else {
      if (epNum <= entry.progress) {
        updateProgress(anime.id, epNum - 1);
      } else {
        updateProgress(anime.id, epNum);
      }
    }
  };

  const logNextEpisode = () => {
    const nextEp = (entry?.progress || 0) + 1;
    if (nextEp <= totalEpisodes) {
      if (!entry) {
        addOrUpdateEntry({
          id: anime.id,
          title: {
            romaji: anime.title.romaji || anime.title.english || anime.title.native || 'Unknown',
            english: anime.title.english,
            native: anime.title.native
          },
          coverImage: (anime.coverImage as any) || { large: '' },
          status: 'watching',
          progress: nextEp
        });
      } else {
        updateProgress(anime.id, nextEp);
      }
    }
  };



  // Jump to specific episode logic
  const handleJumpToEpisode = (e: React.FormEvent) => {
    e.preventDefault();
    const ep = parseInt(jumpInput);
    if (!isNaN(ep) && ep >= 1 && ep <= totalEpisodes) {
      const targetChunk = Math.floor((ep - 1) / CHUNK_SIZE);
      setSelectedChunk(targetChunk);
      setJumpInput('');
    }
  };

  const watchedCount = entry?.progress || 0;
  const progressPercent = totalEpisodes > 0 ? Math.min(100, Math.round((watchedCount / totalEpisodes) * 100)) : 0;
  const nextUnwatchedEp = watchedCount < totalEpisodes ? watchedCount + 1 : totalEpisodes;

  const charactersList = anime.characters?.edges || [];
  const staffList = anime.staff?.edges || [];
  const studiosList = anime.studios?.edges || [];
  const streamingList = anime.streamingEpisodes || [];

  // Key characters preview (up to 4)
  const keyCharacters = charactersList.slice(0, 4);

  // Compute episodes to display in current chunk
  const currentChunkStart = selectedChunk * CHUNK_SIZE + 1;
  const currentChunkEnd = Math.min(totalEpisodes, (selectedChunk + 1) * CHUNK_SIZE);

  const displayedEpisodes = useMemo(() => {
    const eps: number[] = [];
    if (totalEpisodes <= CHUNK_SIZE) {
      for (let i = 1; i <= totalEpisodes; i++) eps.push(i);
    } else {
      for (let i = currentChunkStart; i <= currentChunkEnd; i++) eps.push(i);
    }
    return sortOrder === 'desc' ? eps.reverse() : eps;
  }, [totalEpisodes, currentChunkStart, currentChunkEnd, sortOrder]);

  return (
    <div className="flex flex-col gap-space-md">
      {/* Progress Bar & Quick Log Action */}
      <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-headline-sm text-headline-sm text-on-surface">Personal Log Progress</span>
            <span className="font-label-mono text-caption text-on-surface font-semibold" id="tracker-fraction">
              {watchedCount.toLocaleString()} / {totalEpisodes.toLocaleString()} Completed ({progressPercent}%)
            </span>
          </div>

          <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary transition-all duration-300 ease-out"
              id="progress-bar-fill"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        <button
          onClick={logNextEpisode}
          className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-container text-on-primary dark:text-zinc-900 font-label-mono text-caption rounded-md transition-colors shadow-sm focus:outline-none"
          id="log-next-btn"
        >
          <span className="material-symbols-outlined text-[16px]">add_task</span>
          <span>{watchedCount < totalEpisodes ? `+1 Log Ep ${nextUnwatchedEp}` : 'All Episodes Logged'}</span>
        </button>
      </div>

      {/* Content Navigation Tabs */}
      <div className="flex items-center gap-space-md border-b border-surface-variant overflow-x-auto pb-1 custom-scrollbar">
        <button
          onClick={() => setActiveTab('episodes')}
          className={`font-label-mono text-body-md pb-2 whitespace-nowrap transition-all focus:outline-none ${
            activeTab === 'episodes'
              ? 'font-headline-sm text-headline-sm text-on-surface border-b-2 border-primary dark:border-white'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Episodes ({totalEpisodes.toLocaleString()})
        </button>
        <button
          onClick={() => setActiveTab('characters')}
          className={`font-label-mono text-body-md pb-2 whitespace-nowrap transition-all focus:outline-none ${
            activeTab === 'characters'
              ? 'font-headline-sm text-headline-sm text-on-surface border-b-2 border-primary dark:border-white'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Characters &amp; Voice Cast {charactersList.length > 0 && `(${charactersList.length})`}
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`font-label-mono text-body-md pb-2 whitespace-nowrap transition-all focus:outline-none ${
            activeTab === 'staff'
              ? 'font-headline-sm text-headline-sm text-on-surface border-b-2 border-primary dark:border-white'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Staff &amp; Production {staffList.length > 0 && `(${staffList.length})`}
        </button>
      </div>

      {/* TAB 1: EPISODES */}
      {activeTab === 'episodes' && (
        <div className="flex flex-col gap-space-md">

          {/* NOT YET RELEASED — Coming Soon Panel */}
          {(anime.status === 'NOT_YET_RELEASED' || totalEpisodes === 0) ? (
            <div className="bg-surface-container-lowest rounded-lg border border-surface-container shadow-sm flex flex-col items-center justify-center py-16 gap-space-md text-center px-space-lg">
              <span className="material-symbols-outlined text-5xl text-outline" style={{ fontVariationSettings: "'FILL' 0" }}>schedule</span>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-1">
                  {anime.status === 'NOT_YET_RELEASED' ? 'Not Yet Released' : 'No Episodes Available Yet'}
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">
                  {anime.status === 'NOT_YET_RELEASED'
                    ? 'This anime has not started airing yet. Episodes will appear here once they begin broadcasting.'
                    : 'Episodes for this title are not yet available in our data source.'}
                </p>
              </div>
              {anime.nextAiringEpisode && (
                <div className="bg-surface-container px-space-md py-space-sm rounded-lg border border-surface-variant text-left w-full max-w-xs">
                  <span className="font-label-mono text-caption text-outline block uppercase mb-1">First Episode</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-semibold block">
                    Episode {anime.nextAiringEpisode.episode}
                  </span>
                  <span className="font-label-mono text-caption text-secondary">
                    {new Date(anime.nextAiringEpisode.airingAt * 1000).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>
          ) : (
          <>

          {/* Controls Bar for Anime with > 50 Episodes */}
          {totalEpisodes > CHUNK_SIZE && (
            <div className="bg-surface-container-lowest p-space-sm rounded-lg border border-surface-container flex flex-wrap items-center justify-between gap-space-sm">
              <div className="flex items-center gap-2">
                <span className="font-label-mono text-caption text-outline">Range:</span>
                <select
                  value={selectedChunk}
                  onChange={(e) => setSelectedChunk(parseInt(e.target.value))}
                  className="bg-surface-container px-2 py-1 rounded font-label-mono text-caption text-on-surface border border-surface-variant focus:outline-none focus:border-secondary"
                >
                  {Array.from({ length: totalChunks }).map((_, idx) => {
                    const start = idx * CHUNK_SIZE + 1;
                    const end = Math.min(totalEpisodes, (idx + 1) * CHUNK_SIZE);
                    return (
                      <option key={idx} value={idx}>
                        Ep {start} - {end} {idx === totalChunks - 1 ? '(Latest)' : ''}
                      </option>
                    );
                  })}
                </select>
                <span className="font-label-mono text-caption text-outline-variant">
                  ({displayedEpisodes.length} showing)
                </span>
              </div>

              <div className="flex items-center gap-space-sm">
                {/* Jump to Episode Form */}
                <form onSubmit={handleJumpToEpisode} className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    max={totalEpisodes}
                    placeholder="Jump to Ep #"
                    value={jumpInput}
                    onChange={(e) => setJumpInput(e.target.value)}
                    className="w-28 px-2 py-1 bg-surface-container-low rounded border border-surface-variant font-label-mono text-caption text-on-surface focus:outline-none focus:border-secondary placeholder:text-outline"
                  />
                  <button
                    type="submit"
                    className="px-2 py-1 bg-surface-container hover:bg-surface-container-high rounded font-label-mono text-caption text-on-surface"
                  >
                    Go
                  </button>
                </form>

                {/* Sort Toggle */}
                <button
                  onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                  className="flex items-center gap-1 px-2.5 py-1 bg-surface-container hover:bg-surface-container-high rounded font-label-mono text-caption text-on-surface transition-colors"
                  title="Toggle Episode Sort Order"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {sortOrder === 'desc' ? 'arrow_downward' : 'arrow_upward'}
                  </span>
                  <span>{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Scrollable Episodes Table Card */}
          <div className="bg-surface-container-lowest rounded-lg shadow-sm overflow-hidden border border-surface-container">
            {/* Sticky Table Header */}
            <div className="grid grid-cols-12 px-space-md py-space-sm bg-surface-container-low font-label-mono text-caption text-on-surface-variant sticky top-0 z-10 border-b border-surface-container">
              <div className="col-span-1 text-center font-semibold">EP</div>
              <div className="col-span-6 sm:col-span-7 pl-space-xs font-semibold">TITLE &amp; BROADCAST</div>
              <div className="col-span-3 sm:col-span-2 text-right font-semibold">TIME</div>
              <div className="col-span-2 text-right pr-space-xs font-semibold">STATUS</div>
            </div>

            {/* Scrollable Rows Container */}
            <div className="max-h-[480px] overflow-y-auto custom-scrollbar divide-y divide-surface-container">
              {displayedEpisodes.map((epNum) => {
                const isWatched = epNum <= watchedCount;
                
                // Match streaming episode info if available
                const streamEp = streamingList.find(se => {
                  if (!se?.title) return false;
                  const match = se.title.match(/Episode\s+(\d+)/i);
                  return match && parseInt(match[1]) === epNum;
                }) || (streamingList.length >= epNum ? streamingList[epNum - 1] : null);

                const epTitle = streamEp?.title || `Episode ${epNum}`;

                return (
                  <div
                    key={epNum}
                    onClick={() => toggleEpisode(epNum)}
                    className={`grid grid-cols-12 items-center px-space-md py-3 hover:bg-surface-container-low transition-colors group cursor-pointer ${
                      isWatched ? 'bg-surface-container-lowest' : 'bg-surface-container-lowest/50'
                    }`}
                  >
                    <div className="col-span-1 text-center font-label-mono text-caption text-outline font-semibold">
                      {epNum}
                    </div>
                    
                    <div className="col-span-6 sm:col-span-7 flex items-center gap-space-sm min-w-0 pl-space-xs">
                      {streamEp?.thumbnail && (
                        <img
                          src={streamEp.thumbnail}
                          alt={epTitle}
                          className="w-12 h-7 rounded object-cover shrink-0 hidden sm:block border border-surface-variant"
                        />
                      )}
                      <div className="min-w-0">
                        <p className={`font-body-md text-body-md truncate group-hover:text-secondary transition-colors ${
                          isWatched ? 'text-on-surface font-medium' : 'text-on-surface-variant'
                        }`}>
                          {epTitle}
                        </p>
                        {streamEp?.site && (
                          <span className="font-label-mono text-[11px] text-outline flex items-center gap-1">
                            <span>{streamEp.site}</span>
                            <span className="material-symbols-outlined text-[11px]">open_in_new</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="col-span-3 sm:col-span-2 text-right font-label-mono text-caption text-outline">
                      {anime.duration || 24}m
                    </div>

                    <div className="col-span-2 flex justify-end pr-space-xs">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleEpisode(epNum);
                        }}
                        aria-label={`Mark episode ${epNum} as ${isWatched ? 'unwatched' : 'watched'}`}
                        className={`ep-check-btn w-6 h-6 rounded flex items-center justify-center transition-all ${
                          isWatched
                            ? 'bg-secondary text-on-secondary shadow-xs'
                            : 'bg-surface-container hover:bg-surface-container-high text-outline-variant'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Characters & Seiyuu Preview Section */}
          <div className="mt-space-sm">
            <div className="flex items-center justify-between mb-space-sm">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Key Characters &amp; Seiyuu</h2>
              <button
                onClick={() => setActiveTab('characters')}
                className="font-label-mono text-caption text-secondary hover:underline focus:outline-none flex items-center gap-1"
              >
                <span>View All {charactersList.length || 18} Cast</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
              {keyCharacters.map((edge: any) => {
                const char = edge.node;
                const va = edge.voiceActors?.[0];
                return (
                  <div
                    key={char.id}
                    className="bg-surface-container-lowest p-space-sm rounded-lg shadow-sm border border-surface-container flex items-center gap-space-sm hover:border-surface-variant transition-colors"
                  >
                    <img
                      className="w-12 h-12 rounded-full object-cover shrink-0 border border-surface-variant"
                      alt={char.name.full}
                      src={char.image.large || char.image.medium}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-1">
                        <span className="font-body-md text-body-md font-semibold text-on-surface truncate">
                          {char.name.full}
                        </span>
                        <span className="font-label-mono text-caption px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant uppercase text-[10px] shrink-0">
                          {edge.role || 'Main'}
                        </span>
                      </div>
                      <p className="font-label-mono text-caption text-on-surface-variant truncate mt-0.5">
                        {va?.name?.full || 'Voice actor unlisted'}
                        {va?.name?.native && <span className="text-outline ml-1">({va.name.native})</span>}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* End of episodes content — close the conditional render */}
          </>
          )}
        </div>
      )}

      {/* TAB 2: CHARACTERS & VOICE CAST */}
      {activeTab === 'characters' && (
        <div className="flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <span className="font-headline-sm text-headline-sm text-on-surface">
              Characters &amp; Voice Actors ({charactersList.length})
            </span>
            <span className="font-label-mono text-caption text-outline">Japanese Audio Cast</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
            {charactersList.map((edge: any) => {
              const char = edge.node;
              const va = edge.voiceActors?.[0];
              return (
                <div
                  key={char.id}
                  className="bg-surface-container-lowest p-space-sm rounded-lg shadow-sm border border-surface-container flex items-center justify-between gap-space-sm hover:border-outline transition-colors"
                >
                  <div className="flex items-center gap-space-sm min-w-0 flex-1">
                    <img
                      className="w-12 h-12 rounded-full object-cover shrink-0 border border-surface-variant"
                      alt={char.name.full}
                      src={char.image.large || char.image.medium}
                    />
                    <div className="min-w-0">
                      <span className="font-body-md text-body-md font-semibold text-on-surface block truncate">
                        {char.name.full}
                      </span>
                      <span className="font-label-mono text-[11px] text-outline block truncate">
                        {char.name.native || ''}
                      </span>
                      <span className="inline-block mt-0.5 font-label-mono text-[10px] px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant uppercase">
                        {edge.role}
                      </span>
                    </div>
                  </div>

                  {va ? (
                    <div className="flex items-center gap-space-xs text-right min-w-0 shrink-0 max-w-[45%]">
                      <div className="min-w-0">
                        <span className="font-body-md text-body-md font-medium text-on-surface block truncate">
                          {va.name.full}
                        </span>
                        <span className="font-label-mono text-[11px] text-outline block truncate">
                          {va.name.native || 'Japanese'}
                        </span>
                      </div>
                      {va.image?.large ? (
                        <img
                          className="w-10 h-10 rounded-full object-cover shrink-0 border border-surface-variant"
                          alt={va.name.full}
                          src={va.image.large || va.image.medium}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shrink-0 text-outline">
                          <span className="material-symbols-outlined text-[16px]">person</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="font-label-mono text-caption text-outline shrink-0">No VA</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: STAFF & PRODUCTION */}
      {activeTab === 'staff' && (
        <div className="flex flex-col gap-space-md">
          {studiosList.length > 0 && (
            <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm border border-surface-container">
              <h3 className="font-label-mono text-caption text-outline uppercase tracking-wider mb-space-sm">
                Studios &amp; Production Companies
              </h3>
              <div className="flex flex-wrap gap-space-sm">
                {studiosList.map((edge: any) => (
                  <div
                    key={edge.node.id}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded border text-caption font-label-mono ${
                      edge.isMain
                        ? 'bg-secondary/10 border-secondary text-secondary font-semibold'
                        : 'bg-surface-container border-surface-variant text-on-surface-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {edge.isMain ? 'stars' : 'business'}
                    </span>
                    <span>{edge.node.name}</span>
                    {edge.isMain && <span className="text-[10px] uppercase font-bold tracking-wider">(Main Studio)</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="font-headline-sm text-headline-sm text-on-surface">
              Production Staff ({staffList.length})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-sm">
            {staffList.map((edge: any, idx: number) => {
              const staff = edge.node;
              return (
                <div
                  key={`${staff.id}-${idx}`}
                  className="bg-surface-container-lowest p-space-sm rounded-lg shadow-sm border border-surface-container flex items-center gap-space-sm hover:border-surface-variant transition-colors"
                >
                  <img
                    className="w-12 h-12 rounded-full object-cover shrink-0 border border-surface-variant"
                    alt={staff.name.full}
                    src={staff.image?.large || staff.image?.medium || 'https://lh3.googleusercontent.com/aida/AEtjO1UAZ3r52hCkxfWDimtyiM-6VWVjl6gKxx9pNh4WudEtHdYi7R9ymR7rzkw-Y1DH5UoeRjbmbUHy9gIn3fHDk96YChhBuh68AbgKYWrFzbknDrP2ve3KDMDn1M-PwLBB0x_WA7Au_9kHYVgyCoDoYz4rmAX3w4C_u99Aukq4SZD3wSuc91o8rvZBqVPisB97knITK4LQ0hl-dPXRb9dZyfZ1dk8qEC5Mja63FcuRGAJLTEMal5CVWKReAXZI'}
                  />
                  <div className="min-w-0 flex-1">
                    <span className="font-body-md text-body-md font-semibold text-on-surface block truncate">
                      {staff.name.full}
                    </span>
                    <span className="font-label-mono text-[11px] text-secondary font-medium block truncate">
                      {edge.role}
                    </span>
                    {staff.name.native && (
                      <span className="font-label-mono text-[10px] text-outline block truncate">
                        {staff.name.native}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
