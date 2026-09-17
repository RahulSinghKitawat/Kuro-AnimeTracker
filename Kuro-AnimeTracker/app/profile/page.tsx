"use client";
import Link from 'next/link';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth';
import { useTracker } from '@/lib/trackerContext';
import { useMemo } from 'react';

export default function ProfileStatistics() {
  const { user } = useAuth();
  const { entries } = useTracker();

  const stats = useMemo(() => {
    let totalEps = 0;
    let scoreSum = 0;
    let scoreCount = 0;
    const statusCounts = { completed: 0, watching: 0, plan: 0, hold: 0, dropped: 0 };

    entries.forEach(entry => {
      totalEps += entry.progress || 0;
      if (entry.score && entry.score > 0) {
        scoreSum += entry.score;
        scoreCount++;
      }
      statusCounts[entry.status as keyof typeof statusCounts] = (statusCounts[entry.status as keyof typeof statusCounts] || 0) + 1;
    });

    const meanScore = scoreCount > 0 ? (scoreSum / scoreCount).toFixed(2) : "0.00";
    const daysWatched = (totalEps * 24) / (60 * 24); // 24 min per episode average

    return {
      totalEps,
      meanScore,
      daysWatched: daysWatched.toFixed(1),
      statusCounts
    };
  }, [entries]);

  if (!user) return null;

  return (
    <ProtectedRoute redirectPath="/profile">
      <Header activePage="profile" />
      <main className="w-full pt-16 min-h-screen bg-background"><div className="flex flex-col w-full">
<div className="max-w-[1280px] w-full mx-auto px-margin-mobile lg:px-margin py-space-xl space-y-space-xl">

<section className="bg-surface-container-lowest rounded-xl p-space-lg lg:p-space-xl shadow-sm relative overflow-hidden">
<div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-secondary/5 via-transparent to-transparent pointer-events-none rounded-full blur-3xl -mr-20 -mt-20"></div>
<div className="flex flex-col md:flex-row md:items-center justify-between gap-space-lg relative z-10">
<div className="flex flex-col sm:flex-row items-start sm:items-center gap-space-lg">
<div className="relative group">
<div className="w-24 h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden bg-surface-container shadow-sm ring-4 ring-surface-container-lowest flex items-center justify-center text-4xl text-on-surface-variant">
{user.avatar ? (
  <img alt={`${user.name} Profile Avatar`} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" src={user.avatar} />
) : (
  <span className="material-symbols-outlined text-4xl">person</span>
)}
</div>
<div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-sm">
<span className="w-3.5 h-3.5 rounded-full bg-secondary"></span>
</div>
</div>
<div className="space-y-space-xs">
<div className="flex flex-wrap items-center gap-space-xs">
<span className="font-label-mono text-caption text-secondary uppercase tracking-widest bg-secondary-fixed/50 px-2 py-0.5 rounded">Archivist Record #{user.id.substring(4, 8).toUpperCase()}</span>
{user.location && (
  <>
    <span className="text-outline-variant font-label-mono text-caption">•</span>
    <span className="font-label-mono text-caption text-on-surface-variant">{user.location}</span>
  </>
)}
</div>
<h1 className="font-headline-xl text-headline-xl-mobile lg:text-headline-xl text-on-surface tracking-tight">
              {user.name || user.handle}
            </h1>
<p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
              {user.bio || "No curation manifesto provided yet. Head to Edit Profile to add your statement."}
            </p>
<div className="flex items-center gap-space-sm pt-space-xs font-label-mono text-caption text-outline">
<span className="flex items-center gap-1">
<span className="material-symbols-outlined text-[15px] text-outline">history</span>
                Member since Nov 2021
              </span>
<span>•</span>
<span className="flex items-center gap-1">
<span className="material-symbols-outlined text-[15px] text-outline">sync</span>
                Synced 14m ago
              </span>
</div>
</div>
</div>

<div className="flex flex-wrap sm:flex-nowrap items-center gap-space-xs self-start md:self-center">
<Link href="/profile/edit" className="px-space-md py-2 bg-primary text-on-primary font-label-md text-label-md rounded hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm"><span className="material-symbols-outlined text-[16px]">edit_note</span><span>Edit Profile</span></Link>
<button className="px-space-md py-2 bg-surface-container-low text-on-surface font-label-md text-label-md rounded hover:bg-surface-variant transition-colors flex items-center gap-1.5">
<span className="material-symbols-outlined text-[16px]">share</span>
<span>Share</span>
</button>
<button className="px-2.5 py-2 bg-surface-container-low text-on-surface-variant hover:text-on-surface font-label-md text-label-md rounded hover:bg-surface-variant transition-colors flex items-center justify-center" title="Export Data">
<span className="material-symbols-outlined text-[18px]">download</span>
</button>
</div>
</div>
</section>

<section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-space-sm">
<div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm flex flex-col justify-between">
<span className="font-label-mono text-caption text-outline uppercase tracking-wider">Days Watched</span>
<div className="my-space-xs">
<span className="font-headline-lg text-headline-lg text-on-surface tracking-tight">{stats.daysWatched}</span>
<span className="font-label-mono text-caption text-on-surface-variant ml-1">days</span>
</div>
<div className="w-full bg-surface-container h-1 rounded-full overflow-hidden">
<div className="bg-primary h-full rounded-full" style={{"width": `${Math.min(100, (parseFloat(stats.daysWatched) / 365) * 100)}%`}}></div>
</div>
</div>
<div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm flex flex-col justify-between">
<span className="font-label-mono text-caption text-outline uppercase tracking-wider">Total Episodes</span>
<div className="my-space-xs">
<span className="font-headline-lg text-headline-lg text-on-surface tracking-tight">{stats.totalEps}</span>
<span className="font-label-mono text-caption text-on-surface-variant ml-1">logged</span>
</div>
<div className="w-full bg-surface-container h-1 rounded-full overflow-hidden">
<div className="bg-secondary h-full rounded-full" style={{"width": `${Math.min(100, (stats.totalEps / 5000) * 100)}%`}}></div>
</div>
</div>
<div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm flex flex-col justify-between">
<span className="font-label-mono text-caption text-outline uppercase tracking-wider">Mean Score</span>
<div className="my-space-xs flex items-baseline gap-1">
<span className="font-headline-lg text-headline-lg text-on-surface tracking-tight">{stats.meanScore}</span>
<span className="font-label-mono text-caption text-on-tertiary-container font-medium">★</span>
</div>
<div className="w-full bg-surface-container h-1 rounded-full overflow-hidden">
<div className="bg-primary h-full rounded-full" style={{"width": `${(parseFloat(stats.meanScore) / 10) * 100}%`}}></div>
</div>
</div>
<div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm flex flex-col justify-between">
<span className="font-label-mono text-caption text-outline uppercase tracking-wider">Unique Titles</span>
<div className="my-space-xs">
<span className="font-headline-lg text-headline-lg text-on-surface tracking-tight">{entries.length}</span>
<span className="font-label-mono text-caption text-on-surface-variant ml-1">canon titles</span>
</div>
<div className="w-full bg-surface-container h-1 rounded-full overflow-hidden">
<div className="bg-outline h-full rounded-full" style={{"width": `${Math.min(100, (entries.length / 1000) * 100)}%`}}></div>
</div>
</div>
<div className="col-span-2 md:col-span-4 lg:col-span-1 bg-surface-container-low p-space-md rounded-lg shadow-sm flex flex-col justify-between">
<span className="font-label-mono text-caption text-outline uppercase tracking-wider">Archive Status</span>
<div className="grid grid-cols-3 gap-1 py-1 text-center font-label-mono">
<div className="bg-surface-container-lowest rounded py-1 px-1.5">
<span className="text-caption text-outline block">CPL</span>
<span className="font-bold text-on-surface text-label-md">{stats.statusCounts.completed || 0}</span>
</div>
<div className="bg-surface-container-lowest rounded py-1 px-1.5">
<span className="text-caption text-outline block">CUR</span>
<span className="font-bold text-secondary text-label-md">{stats.statusCounts.watching || 0}</span>
</div>
<div className="bg-surface-container-lowest rounded py-1 px-1.5">
<span className="text-caption text-outline block">PLN</span>
<span className="font-bold text-on-surface text-label-md">{stats.statusCounts.plan || 0}</span>
</div>
</div>
<div className="flex items-center justify-between text-caption font-label-mono text-outline pt-1">
<span>Hold: {stats.statusCounts.hold || 0}</span>
<span>•</span>
<span>Drop: {stats.statusCounts.dropped || 0}</span>
</div>
</div>
</section>

</div>
</div></main><footer className="w-full bg-surface-container-lowest border-t border-surface-variant mt-space-xl"><div className="max-w-[1280px] mx-auto px-margin-mobile lg:px-margin py-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-md"><div className="flex items-center gap-space-sm text-on-surface-variant font-label-mono text-caption"><span>KURO ANIME LOG</span><span>•</span><span>MINIMALIST CATALOG ARCHIVE</span></div><div className="text-on-surface-variant font-caption text-caption">© 2025 Kuro. Architectural tracking for disciplined media consumption.</div></div></footer>
    </ProtectedRoute>
  );
}