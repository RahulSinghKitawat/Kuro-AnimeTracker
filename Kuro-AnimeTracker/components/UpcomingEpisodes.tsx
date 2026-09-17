'use client';

import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';

interface UpcomingEpisode {
  id: number;
  airingAt: number;
  timeUntilAiring: number;
  episode: number;
  media: {
    id: number;
    title: {
      romaji: string;
      english: string;
    };
    format: string;
  };
}

interface UpcomingEpisodesProps {
  initialEpisodes: UpcomingEpisode[];
}

export default function UpcomingEpisodes({ initialEpisodes }: UpcomingEpisodesProps) {
  // Generate the next 7 days for the tabs
  const days = useMemo(() => {
    const arr = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      
      let label = '';
      if (i === 0) {
        label = `Today, ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      } else if (i === 1) {
        label = `Tomorrow, ${d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`;
      } else {
        label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      }

      arr.push({
        date: d,
        label,
        key: d.toISOString().split('T')[0] // YYYY-MM-DD
      });
    }
    return arr;
  }, []);

  const [activeTab, setActiveTab] = useState(days[0].key);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  const formatTimeUntil = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    
    if (d > 0) return `Air in ${d}d ${h}h`;
    if (h > 0) return `AIR IN ${h}H ${m}M`;
    return `AIR IN ${m}M`;
  };

  const isVerySoon = (seconds: number) => {
    return seconds < 24 * 3600; // Less than 24 hours
  };

  const filteredEpisodes = useMemo(() => {
    return initialEpisodes.filter((ep) => {
      const epDate = new Date(ep.airingAt * 1000);
      return epDate.toISOString().split('T')[0] === activeTab;
    });
  }, [initialEpisodes, activeTab]);

  return (
    <section className="w-full max-w-[1280px] mx-auto px-margin-mobile lg:px-margin pt-space-xl pb-space-lg">
      <div className="flex flex-col gap-2 pb-6 border-b border-surface-variant/50 mb-6">
        <div className="flex items-center gap-2 font-label-mono text-[10px] uppercase tracking-widest text-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
          <span>Broadcast Timetable - Simulcast & Air Dates</span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-4xl font-bold text-on-surface mb-1">Upcoming Episodes</h2>
            <p className="font-body-sm text-on-surface-variant max-w-2xl">
              Live countdowns and broadcast releases indexed by day, date, and local air time.
            </p>
          </div>
          
          <div className="flex items-center gap-1 font-label-mono text-[11px] text-outline whitespace-nowrap">
            <span className="material-symbols-outlined text-[14px]">schedule</span>
            <span>Timezone: Local • Sync Local</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto" style={{ scrollbarWidth: 'none' }}>
          {days.map((day, i) => (
            <button
              key={day.key}
              onClick={() => setActiveTab(day.key)}
              className={`px-4 py-1.5 rounded-md font-label-mono text-[12px] whitespace-nowrap flex items-center gap-2 transition-colors border ${
                activeTab === day.key
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-surface-container-lowest border-surface-variant text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {day.label}
              {i === 1 && activeTab !== day.key && <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>}
            </button>
          ))}
        </div>

      </div>

      <div className="relative group">
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 z-10 w-10 h-10 rounded-full bg-surface-container-high border border-surface-variant flex items-center justify-center text-on-surface hover:bg-surface-container-highest hover:scale-105 transition-all shadow-sm opacity-0 group-hover:opacity-100 disabled:opacity-0"
        >
          <span className="material-symbols-outlined text-lg">chevron_left</span>
        </button>

        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none' }}
        >
        {filteredEpisodes.length > 0 ? (
          filteredEpisodes.map((ep) => {
            const soon = isVerySoon(ep.timeUntilAiring);
            const date = new Date(ep.airingAt * 1000);
            const formattedDate = date.toLocaleString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div key={ep.id} className="min-w-[280px] w-[85vw] md:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)] flex-none snap-start bg-surface-container-lowest border border-surface-variant rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow h-48">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 font-label-mono text-[10px] uppercase font-bold rounded-sm ${
                      soon ? 'bg-[#002113] text-[#6ffbbe]' : 'bg-surface-container text-on-surface'
                    }`}>
                      {formatTimeUntil(ep.timeUntilAiring)}
                    </span>
                    <span className="font-label-mono text-[11px] text-outline">{ep.media.format || 'Simulcast'}</span>
                  </div>
                  <button className="text-outline hover:text-on-surface transition-colors" title="Enable notifications">
                    <span className="material-symbols-outlined text-[18px]">notifications_active</span>
                  </button>
                </div>

                <div className="my-3">
                  <div className="flex items-center gap-2 font-label-mono text-[11px] mb-1">
                    <span className="text-secondary font-medium">Episode {ep.episode}</span>
                    <span className="text-outline-variant">•</span>
                    <span className="text-on-surface-variant truncate">"Upcoming Broadcast"</span>
                  </div>
                  <Link href={`/anime/${ep.media.id}`}>
                    <h3 className="font-serif text-lg font-bold text-on-surface line-clamp-1 hover:text-secondary transition-colors">
                      {ep.media.title.english || ep.media.title.romaji}
                    </h3>
                  </Link>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-surface-variant mt-auto">
                  <div className="flex items-center gap-1.5 font-label-mono text-[11px] text-on-surface-variant truncate pr-2">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                    <span className="truncate">{formattedDate}</span>
                  </div>

                </div>
              </div>
            );
          })
        ) : (
          <div className="w-full py-12 flex flex-col items-center justify-center text-center bg-surface-container-lowest border border-surface-variant rounded-xl border-dashed">
            <span className="material-symbols-outlined text-3xl text-outline mb-2">event_busy</span>
            <p className="font-body-sm text-on-surface-variant">No episodes broadcasting on this date.</p>
          </div>
        )}
        </div>

        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 z-10 w-10 h-10 rounded-full bg-surface-container-high border border-surface-variant flex items-center justify-center text-on-surface hover:bg-surface-container-highest hover:scale-105 transition-all shadow-sm opacity-0 group-hover:opacity-100 disabled:opacity-0"
        >
          <span className="material-symbols-outlined text-lg">chevron_right</span>
        </button>
      </div>
    </section>
  );
}
