/* eslint-disable */
import Link from 'next/link';
import Header from '@/components/Header';
import { fetchAniList } from '@/lib/anilist';
import SearchClient from './SearchClient';

const QUERY_SEARCH = `
query ($search: String) {
  Page(page: 1, perPage: 24) {
    media(search: $search, type: ANIME, sort: POPULARITY_DESC, isAdult: false) {
      id
      title { romaji english native }
      coverImage { large extraLarge }
      format
      status
      episodes
      seasonYear
      averageScore
      genres
      studios(isMain: true) { nodes { name } }
    }
  }
}
`;

const QUERY_TRENDING = `
query {
  Page(page: 1, perPage: 24) {
    media(type: ANIME, sort: TRENDING_DESC, isAdult: false) {
      id
      title { romaji english native }
      coverImage { large extraLarge }
      format
      status
      episodes
      seasonYear
      averageScore
      genres
      studios(isMain: true) { nodes { name } }
    }
  }
}
`;

export default async function SearchQuickCommandOverlay({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const searchStr = q ? q.trim() : '';

  let animeList = [];
  try {
    if (searchStr) {
      const data = await fetchAniList(QUERY_SEARCH, { search: searchStr });
      animeList = data?.Page?.media || [];
    } else {
      const data = await fetchAniList(QUERY_TRENDING);
      animeList = data?.Page?.media || [];
    }
  } catch (err) {
    console.error('Failed to search anime:', err);
  }

  return (
    <>
      <Header activePage="search" />

      <main className="w-full pt-16 min-h-screen bg-background relative">
        {/* Background Shelf Layer (Kuro aesthetic blur) */}
        <div className="w-full max-w-[1280px] mx-auto px-margin-mobile lg:px-margin py-space-lg pointer-events-none select-none opacity-20 filter blur-[3px]">
          <div className="flex items-center justify-between pb-space-md mb-space-lg">
            <div className="flex items-center gap-space-sm">
              <span className="font-label-mono text-caption text-outline uppercase tracking-wider">ARCHIVE // INDEX 04</span>
              <span className="text-outline">/</span>
              <span className="font-headline-sm text-headline-sm text-on-surface">Curated Shelf</span>
            </div>
            <div className="h-6 w-32 bg-surface-container rounded"></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-gutter">
            <div className="h-64 bg-surface-container rounded-lg"></div>
            <div className="h-64 bg-surface-container rounded-lg"></div>
            <div className="h-64 bg-surface-container rounded-lg"></div>
            <div className="h-64 bg-surface-container rounded-lg"></div>
            <div className="h-64 bg-surface-container rounded-lg"></div>
            <div className="h-64 bg-surface-container rounded-lg"></div>
          </div>
        </div>

        {/* Interactive Search Client Overlay */}
        <SearchClient initialQuery={searchStr} initialResults={animeList} />
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
    </>
  );
}