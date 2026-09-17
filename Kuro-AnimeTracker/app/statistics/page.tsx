'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useTracker } from '@/lib/trackerContext';

export default function DetailedStatisticsAnalytics() {
  const { entries, forceSync } = useTracker();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    await forceSync();
    setTimeout(() => setIsSyncing(false), 500);
  };

  // 1. Summary Metrics
  const totalEpisodes = entries.reduce((acc, entry) => acc + (entry.progress || 0) + ((entry.rewatches || 0) * (entry.totalEpisodes || entry.progress || 0)), 0);
  const totalDays = (totalEpisodes * 24) / 60 / 24;
  const scoredEntries = entries.filter(e => e.score !== null);
  const meanScore = scoredEntries.length > 0 ? (scoredEntries.reduce((acc, e) => acc + (e.score as number), 0) / scoredEntries.length) : 0;
  
  const variance = scoredEntries.length > 0 ? scoredEntries.reduce((acc, e) => acc + Math.pow((e.score as number) - meanScore, 2), 0) / scoredEntries.length : 0;
  const stdDev = Math.sqrt(variance);

  const totalRewatches = entries.reduce((acc, entry) => acc + (entry.rewatches || 0), 0);
  const totalCompleted = entries.filter(e => e.status === 'completed').length;
  const completionRate = entries.length > 0 ? (totalCompleted / entries.length) * 100 : 0;
  const droppedCount = entries.filter(e => e.status === 'dropped').length;



  // 3. Genre/Tag Matrix
  const tagCounts: Record<string, number> = {};
  let totalTags = 0;
  entries.forEach(e => {
    e.tags?.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      totalTags++;
    });
  });
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count, percentage: totalTags > 0 ? (count / totalTags) * 100 : 0 }));
  const maxTagCount = topTags.length > 0 ? topTags[0].count : 1;
  const getTagColor = (index: number) => {
    const colors = ['bg-secondary', 'bg-on-surface', 'bg-secondary-container', 'bg-outline', 'bg-surface-variant'];
    return colors[index % colors.length];
  };

  // 4. Studio Loyalty
  const studioStats: Record<string, { count: number, totalScore: number, scoredCount: number }> = {};
  entries.forEach(e => {
    if (e.studio) {
      if (!studioStats[e.studio]) studioStats[e.studio] = { count: 0, totalScore: 0, scoredCount: 0 };
      studioStats[e.studio].count++;
      if (e.score !== null) {
        studioStats[e.studio].totalScore += e.score;
        studioStats[e.studio].scoredCount++;
      }
    }
  });
  const topStudios = Object.entries(studioStats)
    .map(([name, stats]) => ({
      name,
      count: stats.count,
      mean: stats.scoredCount > 0 ? stats.totalScore / stats.scoredCount : 0
    }))
    .filter(s => s.count > 0)
    .sort((a, b) => b.count - a.count || b.mean - a.mean)
    .slice(0, 5);

  // 5. Era Chronology
  const eras = { '2020s': 0, '2010s': 0, '2000s': 0, '1990s': 0, 'Classic': 0 };
  let totalEraEntries = 0;
  entries.forEach(e => {
    if (e.year) {
      if (e.year >= 2020) eras['2020s']++;
      else if (e.year >= 2010) eras['2010s']++;
      else if (e.year >= 2000) eras['2000s']++;
      else if (e.year >= 1990) eras['1990s']++;
      else eras['Classic']++;
      totalEraEntries++;
    }
  });
  const oldestYear = entries.reduce((min, e) => (e.year && e.year < min ? e.year : min), 9999);
  
  // 6. Highest Rated Masterpieces
  const topRated = [...scoredEntries]
    .sort((a, b) => (b.score as number) - (a.score as number))
    .slice(0, 4);

  const currentYear = new Date().getFullYear();

  return (
    <ProtectedRoute redirectPath="/statistics">
      <Header activePage="stats" />
      <main className="w-full pt-16 min-h-screen bg-background">
        <div className="flex flex-col w-full">
          <section className="max-w-[1280px] mx-auto w-full px-4 lg:px-8 py-12">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-mono text-caption uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  <span>Analytical Ledger // Dynamic Sync</span>
                </div>
                <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">Viewing Metrics &amp; Analytics</h1>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Deep historical data, taste spectrums, studio loyalty, and release year distributions across your viewing lifetime.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleSync} disabled={isSyncing} className="p-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant transition-colors flex items-center justify-center">
                  <span className={`material-symbols-outlined text-headline-sm ${isSyncing ? 'animate-spin text-primary' : ''}`}>sync</span>
                </button>
              </div>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
              <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex flex-col justify-between">
                <div className="font-label-mono text-caption text-on-surface-variant uppercase">Total Days</div>
                <div className="my-2">
                  <div className="font-headline-lg text-headline-lg text-on-surface font-semibold">{totalDays.toFixed(1)}<span className="font-body-sm text-body-sm text-on-surface-variant ml-0.5 font-normal">d</span></div>
                </div>
                <div className="font-label-mono text-caption text-secondary">{(totalDays * 24).toFixed(1)} cumulative hrs</div>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex flex-col justify-between">
                <div className="font-label-mono text-caption text-on-surface-variant uppercase">Total Episodes</div>
                <div className="my-2">
                  <div className="font-headline-lg text-headline-lg text-on-surface font-semibold">{totalEpisodes.toLocaleString()}</div>
                </div>
                <div className="font-label-mono text-caption text-on-surface-variant">Across {entries.length} series</div>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex flex-col justify-between">
                <div className="font-label-mono text-caption text-on-surface-variant uppercase">Mean Score</div>
                <div className="my-2">
                  <div className="font-headline-lg text-headline-lg text-on-surface font-semibold">{meanScore > 0 ? meanScore.toFixed(2) : '--'}</div>
                </div>
                <div className="font-label-mono text-caption text-tertiary-fixed-dim">From {scoredEntries.length} ratings</div>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex flex-col justify-between">
                <div className="font-label-mono text-caption text-on-surface-variant uppercase">Std. Deviation</div>
                <div className="my-2">
                  <div className="font-headline-lg text-headline-lg text-on-surface font-semibold">±{stdDev.toFixed(2)}</div>
                </div>
                <div className="font-label-mono text-caption text-on-surface-variant">Gaussian variance</div>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex flex-col justify-between">
                <div className="font-label-mono text-caption text-on-surface-variant uppercase">Rewatches</div>
                <div className="my-2">
                  <div className="font-headline-lg text-headline-lg text-on-surface font-semibold">{totalRewatches}</div>
                </div>
                <div className="font-label-mono text-caption text-secondary">Total replay count</div>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex flex-col justify-between">
                <div className="font-label-mono text-caption text-on-surface-variant uppercase">Completion</div>
                <div className="my-2">
                  <div className="font-headline-lg text-headline-lg text-on-surface font-semibold">{completionRate.toFixed(0)}%</div>
                </div>
                <div className="font-label-mono text-caption text-on-surface-variant">{droppedCount} dropped titles</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
              
              {/* Genre Matrix */}
              <div className="lg:col-span-7 bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Genre Matrix</h2>
                    <span className="font-label-mono text-caption text-on-surface-variant">TIME CONSUMPTION</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                    Concentration of recurring thematic tags across your catalog.
                  </p>
                </div>
                <div className="space-y-4 my-auto">
                  {topTags.length > 0 ? topTags.map((tag, index) => {
                    const widthPercent = (tag.count / maxTagCount) * 100;
                    return (
                      <div key={tag.name}>
                        <div className="flex items-center justify-between text-body-sm font-body-sm mb-1">
                          <span className="font-medium text-on-surface">{tag.name}</span>
                          <span className="font-label-mono text-caption text-on-surface-variant">{tag.count} entries • {tag.percentage.toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${getTagColor(index)}`} style={{ width: `${widthPercent}%` }}></div>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="text-center font-label-mono text-caption text-outline py-8">
                      No tag data available
                    </div>
                  )}
                </div>
              </div>

              {/* Highest Rated Masterpieces */}
              <div className="lg:col-span-5 bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Highest Rated Masterpieces</h2>
                    <span className="font-label-mono text-caption text-on-surface-variant">HALL OF FAME</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                    Your highest scoring archives.
                  </p>
                </div>
                <div className="space-y-3 my-auto">
                  {topRated.length > 0 ? topRated.map((anime) => (
                    <Link key={anime.id} href={`/anime/${anime.id}`}>
                      <div className="p-2 rounded-lg flex items-center justify-between hover:bg-surface-container-low transition-colors group">
                        <div className="flex items-center gap-3">
                          <img 
                            className="w-10 h-10 rounded-full object-cover group-hover:opacity-90 transition-opacity" 
                            src={anime.coverImage?.large} 
                            alt={anime.title.romaji} 
                          />
                          <div>
                            <div className="font-body-sm text-body-sm font-semibold text-on-surface line-clamp-1">{anime.title.romaji}</div>
                            <div className="font-label-mono text-caption text-on-surface-variant">{anime.year || 'N/A'} • {anime.studio || 'Unknown'}</div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-label-mono text-headline-sm text-secondary font-bold">{anime.score?.toFixed(1)}</div>
                        </div>
                      </div>
                    </Link>
                  )) : (
                    <div className="text-center font-label-mono text-caption text-outline py-8">
                      No rated entries yet
                    </div>
                  )}
                </div>
                <div className="pt-3 text-right border-t border-surface-container mt-4">
                  <Link className="font-label-mono text-caption text-secondary hover:underline inline-flex items-center gap-0.5" href="/tracker">
                    <span>View All Completed</span>
                    <span className="material-symbols-outlined text-caption">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
              
              {/* Studio Loyalty */}
              <div className="lg:col-span-8 bg-surface-container-lowest p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Studio Loyalty &amp; Critical Affinity</h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Ranked by aggregate catalog presence.</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-caption font-label-mono text-on-surface-variant uppercase border-b border-surface-container">
                        <th className="pb-3">Studio Name</th>
                        <th className="pb-3">Works</th>
                        <th className="pb-3 text-right">Mean Score</th>
                        <th className="pb-3 pl-6 text-right">Affinity Index</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-transparent font-body-sm text-body-sm">
                      {topStudios.length > 0 ? topStudios.map((studio, index) => {
                        let badgeClass = 'bg-surface-container text-on-surface';
                        let affinityStr = 'Stable';
                        if (studio.mean >= 9) { badgeClass = 'bg-secondary-fixed text-on-secondary-fixed'; affinityStr = 'Exceptional'; }
                        else if (studio.mean >= 8.5) { badgeClass = 'bg-primary text-on-primary'; affinityStr = 'High'; }
                        else if (studio.mean === 0) { badgeClass = 'bg-surface-container-high text-on-surface-variant'; affinityStr = 'Unrated'; }

                        return (
                          <tr key={studio.name} className="group hover:bg-surface-container-low transition-colors">
                            <td className="py-3 font-medium text-on-surface flex items-center gap-3">
                              <span className="w-6 h-6 rounded bg-surface-container flex items-center justify-center font-label-mono text-caption text-on-surface-variant">
                                {(index + 1).toString().padStart(2, '0')}
                              </span>
                              {studio.name}
                            </td>
                            <td className="py-3 font-label-mono text-on-surface-variant">{studio.count} works</td>
                            <td className="py-3 font-label-mono text-right font-medium text-on-surface">{studio.mean > 0 ? studio.mean.toFixed(2) : '--'}</td>
                            <td className="py-3 pl-6 text-right">
                              <span className={`inline-block px-2 py-0.5 rounded font-label-mono text-caption font-medium ${badgeClass}`}>
                                {affinityStr}
                              </span>
                            </td>
                          </tr>
                        );
                      }) : (
                        <tr>
                          <td colSpan={4} className="py-8 text-center font-label-mono text-caption text-outline">No studio data logged</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Era Chronology */}
              <div className="lg:col-span-4 bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Era Chronology</h2>
                    <span className="font-label-mono text-caption text-on-surface-variant">DISTRIBUTION</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                    Broadcast era footprint across contemporary and classical archives.
                  </p>
                </div>
                <div className="space-y-4 my-auto">
                  {[
                    { label: '2020s (Modern Wave)', key: '2020s', color: 'bg-secondary' },
                    { label: '2010s (Golden Digital)', key: '2010s', color: 'bg-primary' },
                    { label: '2000s (Transition Era)', key: '2000s', color: 'bg-outline' },
                    { label: '1990s (Cel Renaissance)', key: '1990s', color: 'bg-outline-variant' },
                    { label: 'Pre-1990s (Classic Era)', key: 'Classic', color: 'bg-surface-dim' }
                  ].map(era => {
                    const count = eras[era.key as keyof typeof eras];
                    const percent = totalEraEntries > 0 ? (count / totalEraEntries) * 100 : 0;
                    return (
                      <div key={era.key}>
                        <div className="flex justify-between font-label-mono text-caption mb-1">
                          <span className="text-on-surface font-medium">{era.label}</span>
                          <span className="text-on-surface-variant">{percent.toFixed(0)}% ({count})</span>
                        </div>
                        <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                          <div className={`h-full ${era.color} rounded-full`} style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="pt-3 font-label-mono text-caption text-on-surface-variant flex justify-between items-center">
                  <span>Oldest Logged: {oldestYear !== 9999 ? oldestYear : 'N/A'}</span>
                  <span>Newest: {currentYear}</span>
                </div>
              </div>
            </div>



            <div className="mt-8 p-4 rounded-xl bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <span className="material-symbols-outlined text-outline">analytics</span>
                <div>
                  <div className="font-body-sm text-body-sm font-medium text-on-surface">Algorithmic Taste Summary</div>
                  <div className="font-caption text-caption text-on-surface-variant">
                    {topTags.length > 0 
                      ? `High affinity for ${topTags[0].name.toLowerCase()}, demonstrating a preference for ${topTags.length > 1 ? topTags[1].name.toLowerCase() : 'this genre'}.`
                      : "Add more entries to generate taste summary."}
                  </div>
                </div>
              </div>
              <div className="font-label-mono text-caption text-on-surface-variant shrink-0 uppercase">
                SYNCED LOG: {entries.length} ENTRIES
              </div>
            </div>
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
}