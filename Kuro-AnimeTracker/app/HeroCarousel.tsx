'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';

interface TrendingAnime {
  id: number;
  title: { romaji: string; english?: string | null };
  coverImage: { large: string; extraLarge: string };
  bannerImage?: string | null;
  averageScore?: number | null;
  episodes?: number | null;
  seasonYear?: number | null;
  genres?: string[];
  studios?: { nodes: { name: string }[] };
  description?: string | null;
}

interface HeroCarouselProps {
  items: TrendingAnime[];
}

export default function HeroCarousel({ items }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const goTo = useCallback((idx: number) => {
    setActiveIndex(((idx % items.length) + items.length) % items.length);
  }, [items.length]);

  const prev = () => goTo(activeIndex - 1);
  const next = () => goTo(activeIndex + 1);

  // Auto-advance every 8 seconds
  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => goTo(activeIndex + 1), 8000);
    return () => clearInterval(timer);
  }, [activeIndex, goTo, items.length]);

  if (!items || items.length === 0) return null;

  const hero = items[activeIndex];

  return (
    <section className="w-full max-w-[1280px] mx-auto px-margin-mobile lg:px-margin py-space-md">
      <div className="relative w-full rounded-xl overflow-hidden bg-surface-container-high shadow-md group">

        {/* Background */}
        <div
          className="bg-cover bg-center absolute inset-0 w-full h-full transform scale-105 transition-all duration-700"
          style={{ backgroundImage: `url('${hero.bannerImage || hero.coverImage.extraLarge}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-container via-primary-container/80 to-transparent" />

        {/* Content */}
        <div className="relative z-10 p-space-md md:p-space-lg lg:p-space-xl flex flex-col justify-between min-h-[300px] md:min-h-[380px] max-w-2xl text-on-primary">
          <div className="space-y-space-xs">
            <div className="flex items-center gap-space-xs">
              <span className="px-2 py-0.5 rounded bg-tertiary-container/80 text-on-tertiary-container font-label-mono text-caption tracking-wider uppercase font-semibold">
                Trending #{activeIndex + 1}
              </span>
            </div>
            <div className="pt-space-xs">
              <span className="font-headline-sm text-[10px] md:text-caption text-on-primary-container dark:text-zinc-400 tracking-widest block pb-0.5">
                {hero.title.english || hero.title.romaji}
              </span>
              <h2 className="font-headline-sm text-headline-sm md:font-headline-xl md:text-headline-xl text-on-primary dark:text-white font-bold tracking-tight line-clamp-2">
                {hero.title.romaji}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-space-sm md:gap-space-md pt-1 font-label-mono text-[10px] md:text-caption text-on-primary-container dark:text-zinc-400">
              <span>{hero.studios?.nodes?.[0]?.name || 'Unknown Studio'}</span>
              <span>•</span>
              <span>{hero.episodes ? `${hero.episodes} Episodes` : 'Ongoing'}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">star</span>
                <span>{hero.averageScore ? (hero.averageScore / 10).toFixed(1) : 'N/A'}</span>
              </div>
            </div>
            <p
              className="font-body-sm text-body-sm md:font-body-md md:text-body-md text-on-primary-container/90 dark:text-zinc-300 max-w-md pt-space-xs md:pt-space-sm line-clamp-2 md:line-clamp-3"
              dangerouslySetInnerHTML={{ __html: hero.description || '' }}
            />
          </div>

          <div className="flex items-center gap-space-sm pt-space-md md:pt-space-lg">
            <Link
              href={`/anime/${hero.id}`}
              className="px-space-sm md:px-space-md py-2 md:py-2.5 bg-primary text-on-primary dark:text-zinc-900 font-label-sm md:font-label-md text-label-sm md:text-label-md rounded-lg shadow-sm hover:opacity-90 transition-opacity flex items-center gap-1 md:gap-2"
            >
              <span className="material-symbols-outlined text-[16px] md:text-[18px]">play_arrow</span>
              <span>View Details</span>
            </Link>
          </div>
        </div>

        {/* Left Arrow */}
        <button
          onClick={prev}
          aria-label="Previous trending anime"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-surface-container-lowest/10 hover:bg-surface-container-lowest/40 backdrop-blur-sm flex items-center justify-center text-on-surface shadow-sm transition-all opacity-0 group-hover:opacity-20 hover:!opacity-70 focus:opacity-70"
        >
          <span className="material-symbols-outlined text-[22px]">chevron_left</span>
        </button>

        {/* Right Arrow */}
        <button
          onClick={next}
          aria-label="Next trending anime"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-surface-container-lowest/10 hover:bg-surface-container-lowest/40 backdrop-blur-sm flex items-center justify-center text-on-surface shadow-sm transition-all opacity-0 group-hover:opacity-20 hover:!opacity-70 focus:opacity-70"
        >
          <span className="material-symbols-outlined text-[22px]">chevron_right</span>
        </button>

        {/* Dot Indicators */}
        <div className="absolute bottom-4 right-space-md z-20 flex items-center gap-1.5">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              aria-label={`Go to trending #${idx + 1}`}
              className={`rounded-full transition-all duration-300 ${
                idx === activeIndex
                  ? 'w-5 h-2 bg-on-primary'
                  : 'w-2 h-2 bg-on-primary/40 hover:bg-on-primary/70'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
