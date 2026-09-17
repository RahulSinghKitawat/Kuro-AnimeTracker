/* eslint-disable */
import Link from 'next/link';
import Header from '@/components/Header';
import UpcomingEpisodes from '@/components/UpcomingEpisodes';
import { fetchAniList } from '@/lib/anilist';
import DiscoverFilterBar from './DiscoverFilterBar';
import HeroCarousel from './HeroCarousel';

const QUERY_DEFAULT = `
query {
  trending: Page(page: 1, perPage: 7) {
    media(sort: TRENDING_DESC, type: ANIME, isAdult: false) {
      id
      title { romaji english }
      coverImage { large extraLarge }
      bannerImage
      averageScore
      episodes
      seasonYear
      genres
      studios(isMain: true) { nodes { name } }
      description
    }
  }
  popular: Page(page: 1, perPage: 6) {
    media(sort: POPULARITY_DESC, type: ANIME, isAdult: false) {
      id
      title { romaji english }
      coverImage { large extraLarge }
      averageScore
      seasonYear
      genres
      studios(isMain: true) { nodes { name } }
    }
  }
}
`;

const QUERY_UPCOMING = `
query ($start: Int, $end: Int) {
  Page(page: 1, perPage: 50) {
    airingSchedules(airingAt_greater: $start, airingAt_lesser: $end, sort: TIME) {
      id
      airingAt
      timeUntilAiring
      episode
      media {
        id
        title { romaji english }
        format
      }
    }
  }
}
`;



const QUERY_FILTERED = `
query (
  $genre: String,
  $tag: String,
  $search: String,
  $season: MediaSeason,
  $seasonYear: Int,
  $format: MediaFormat,
  $status: MediaStatus,
  $sort: [MediaSort]
) {
  Page(page: 1, perPage: 24) {
    media(
      genre: $genre,
      tag: $tag,
      search: $search,
      season: $season,
      seasonYear: $seasonYear,
      format: $format,
      status: $status,
      sort: $sort,
      type: ANIME,
      isAdult: false
    ) {
      id
      title { romaji english native }
      coverImage { large extraLarge }
      bannerImage
      averageScore
      popularity
      episodes
      format
      status
      season
      seasonYear
      genres
      studios(isMain: true) { nodes { name } }
      description
    }
  }
}
`;

export default async function DiscoverCatalogMinimalist({
  searchParams
}: {
  searchParams: Promise<{
    tag?: string;
    season?: string;
    year?: string;
    format?: string;
    status?: string;
    sort?: string;
  }>;
}) {
  const resolvedParams = await searchParams;
  const { tag, season, year, format, status, sort } = resolvedParams;

  const hasFilter = Boolean(
    tag ||
    season ||
    year ||
    format ||
    status ||
    (sort && sort !== 'POPULARITY_DESC')
  );

  let defaultData: any = null;
  let filteredMedia: any[] = [];

  if (hasFilter) {
    const variables: Record<string, any> = {
      sort: sort ? [sort] : ['POPULARITY_DESC']
    };

    if (format) variables.format = format;
    if (status) variables.status = status;
    if (season) variables.season = season;
    if (year) variables.seasonYear = parseInt(year);

    if (tag) {
      if (['Action', 'Slice of Life', 'Psychological', 'Sci-Fi', 'Fantasy', 'Romance', 'Drama', 'Mystery', 'Supernatural'].includes(tag)) {
        variables.genre = tag;
      } else if (tag === 'Cyberpunk') {
        variables.tag = 'Cyberpunk';
      } else if (tag === 'Fall 2024') {
        variables.season = 'FALL';
        variables.seasonYear = 2024;
      } else if (tag === 'MAPPA' || tag === 'Madhouse') {
        variables.search = tag;
      } else {
        variables.genre = tag;
      }
    }

    try {
      const res = await fetchAniList(QUERY_FILTERED, variables);
      filteredMedia = res?.Page?.media || [];
    } catch (err) {
      console.error('Failed to fetch filtered catalog anime:', err);
    }
  } else {
    try {
      defaultData = await fetchAniList(QUERY_DEFAULT);
    } catch (err) {
      console.error('Failed to fetch default discover anime:', err);
    }
  }

  let upcomingEpisodes: any[] = [];
  if (!hasFilter) {
    try {
      const now = Math.floor(Date.now() / 1000);
      const nextWeek = now + 7 * 24 * 60 * 60;
      const upcomingData = await fetchAniList(QUERY_UPCOMING, { start: now, end: nextWeek });
      upcomingEpisodes = upcomingData?.Page?.airingSchedules || [];
    } catch (err) {
      console.error('Failed to fetch upcoming episodes:', err);
    }
  }

  const allTrendingAnime = defaultData?.trending?.media || [];
  const trendingAnime = allTrendingAnime.slice(1) || [];
  const popularAnime = defaultData?.popular?.media || [];


  return (
    <>
      <Header activePage="discover" />

      <main className="w-full pt-16 min-h-screen bg-background">
        <div className="flex flex-col w-full">
          
          {/* Top Title & Filters Section */}
          <section className="w-full max-w-[1280px] mx-auto px-margin-mobile lg:px-margin pt-space-lg pb-space-md">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pb-space-lg">
              <div className="space-y-space-xs">
                <div className="flex items-center gap-space-xs text-on-surface-variant font-label-mono text-caption uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  <span>Archive Issue № 48</span>
                  <span className="text-outline-variant">•</span>
                  <span>Curated Catalogue</span>
                </div>
                <h1 className="font-headline-xl text-headline-xl text-on-surface font-semibold tracking-tight">
                  Discover &amp; Catalog
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
                  Curated seasonal releases, timeless masterpieces, and community favorites logged for contemplative viewing.
                </p>
              </div>

              {/* In-page quick search bar */}
              <div className="w-full md:w-80 flex flex-col gap-space-xs">
                <form action="/search" method="GET" className="relative flex items-center bg-surface-container-lowest rounded-lg shadow-sm border border-surface-variant focus-within:border-outline">
                  <span className="material-symbols-outlined absolute left-3 text-outline text-body-lg">search</span>
                  <input
                    name="q"
                    type="text"
                    placeholder="Search series, directors, studios..."
                    className="w-full pl-10 pr-12 py-2 bg-transparent font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none"
                  />
                  <button type="submit" className="absolute right-2 text-outline hover:text-on-surface transition-colors p-1 rounded font-label-mono text-caption">
                    ↵
                  </button>
                </form>
              </div>
            </div>

            {/* Interactive Filter Bar: Index Tags + Season, Format, Status, Sort Dropdowns */}
            <DiscoverFilterBar
              activeTag={tag}
              activeSeason={season}
              activeYear={year}
              activeFormat={format}
              activeStatus={status}
              activeSort={sort || 'POPULARITY_DESC'}
            />
          </section>

          {/* If filters are applied, show the Filtered Catalog Grid */}
          {hasFilter ? (
            <section className="w-full max-w-[1280px] mx-auto px-margin-mobile lg:px-margin py-space-md">
              <div className="flex items-center justify-between pb-space-md">
                <div className="flex items-center gap-2">
                  <h3 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight">
                    Filtered Catalogue
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary font-label-mono text-caption font-semibold">
                    {filteredMedia.length} Titles Found
                  </span>
                </div>
                <Link
                  href="/"
                  className="font-label-mono text-caption text-secondary hover:underline flex items-center gap-1"
                >
                  <span>Reset to Highlights</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
              </div>

              {filteredMedia.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-gutter">
                  {filteredMedia.map((anime: any) => (
                    <article
                      key={anime.id}
                      className="group flex flex-col bg-surface-container-lowest rounded-lg overflow-hidden shadow-xs hover:shadow-md border border-surface-container transition-all"
                    >
                      <div className="relative aspect-[3/4] overflow-hidden bg-surface-container">
                        <Link href={`/anime/${anime.id}`} className="block w-full h-full">
                          <img
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            alt={anime.title.romaji}
                            src={anime.coverImage?.large || anime.coverImage?.extraLarge}
                          />
                        </Link>
                        <div className="absolute top-1.5 right-1.5 bg-surface-container-lowest/90 backdrop-blur-sm px-1.5 py-0.5 rounded font-label-mono text-caption font-semibold text-on-surface shadow-xs">
                          ★ {anime.averageScore ? (anime.averageScore / 10).toFixed(1) : '—'}
                        </div>
                        {anime.format && (
                          <div className="absolute bottom-1.5 left-1.5 bg-inverse-surface/80 text-inverse-on-surface backdrop-blur-xs px-1.5 py-0.5 rounded font-label-mono text-[9px] uppercase">
                            {anime.format} {anime.episodes ? `• ${anime.episodes} eps` : ''}
                          </div>
                        )}
                      </div>
                      <div className="p-space-sm flex flex-col flex-grow">
                        <Link href={`/anime/${anime.id}`}>
                          <h4 className="font-headline-sm text-body-md text-on-surface font-medium line-clamp-1 group-hover:text-secondary transition-colors">
                            {anime.title.english || anime.title.romaji}
                          </h4>
                        </Link>
                        <span className="font-label-mono text-caption text-on-surface-variant truncate pt-0.5">
                          {anime.studios?.nodes?.[0]?.name || 'Studio Unlisted'} • {anime.seasonYear || 'N/A'}
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {anime.genres?.slice(0, 2).map((g: string) => (
                            <span key={g} className="px-1.5 py-0.5 rounded bg-surface-container font-label-mono text-[10px] text-on-surface-variant">
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="p-space-xl text-center bg-surface-container-lowest rounded-xl border border-surface-container flex flex-col items-center justify-center py-16">
                  <span className="material-symbols-outlined text-4xl text-outline mb-2">filter_alt_off</span>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1">
                    No anime match this filter combination
                  </h4>
                  <p className="font-body-sm text-on-surface-variant max-w-sm mb-space-md">
                    Try loosening filter parameters or selecting a broader tag.
                  </p>
                  <Link
                    href="/"
                    className="px-4 py-2 bg-primary text-on-primary font-label-mono text-caption rounded-md hover:bg-primary-container transition-colors"
                  >
                    Clear All Filters
                  </Link>
                </div>
              )}
            </section>
          ) : (
            /* Default Highlights View when no filters are active */
            <>
              {/* Hero Carousel */}
              <HeroCarousel items={allTrendingAnime} />

              {/* Top Airing This Season */}
              <section className="w-full max-w-[1280px] mx-auto px-margin-mobile lg:px-margin pt-space-lg pb-space-sm">
                <div className="flex items-center justify-between pb-space-md">
                  <div>
                    <h3 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight">
                      Top Airing This Season
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Active broadcasts currently indexed in the communal register.
                    </p>
                  </div>
                  <div className="flex items-center gap-space-xs font-label-mono text-caption text-on-surface-variant">
                    <span>01</span>
                    <span className="w-8 h-[1px] bg-surface-variant"></span>
                    <span>05</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-space-md">
                  {trendingAnime.map((anime: any) => (
                    <div
                      key={anime.id}
                      className="group flex flex-col bg-surface-container-lowest rounded-lg overflow-hidden shadow-xs hover:shadow-md border border-surface-container transition-all"
                    >
                      <div className="relative aspect-[3/4] overflow-hidden bg-surface-container">
                        <Link href={`/anime/${anime.id}`} className="block w-full h-full">
                          <img
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            alt={anime.title.romaji}
                            src={anime.coverImage.large}
                          />
                        </Link>
                        <div className="absolute top-2 right-2 bg-surface-container-lowest/90 backdrop-blur-sm px-2 py-0.5 rounded font-label-mono text-caption font-semibold text-on-surface">
                          ★ {anime.averageScore ? (anime.averageScore / 10).toFixed(1) : '?'}
                        </div>
                      </div>
                      <div className="p-space-sm flex flex-col flex-grow">
                        <Link href={`/anime/${anime.id}`}>
                          <h4 className="font-headline-sm text-body-lg text-on-surface font-medium line-clamp-1 group-hover:text-secondary transition-colors">
                            {anime.title.romaji}
                          </h4>
                        </Link>
                        <div className="flex items-center gap-1.5 font-label-mono text-caption text-on-surface-variant pt-1 truncate">
                          <span>{anime.studios?.nodes?.[0]?.name || 'Unknown'}</span>
                          <span>•</span>
                          <span>{anime.episodes ? `${anime.episodes} ep` : 'Ongoing'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <UpcomingEpisodes initialEpisodes={upcomingEpisodes} />

              {/* Timeless Masterpieces */}
              <section className="w-full max-w-[1280px] mx-auto px-margin-mobile lg:px-margin pt-space-xl pb-space-lg">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm pb-space-lg">
                  <div>
                    <div className="flex items-center gap-space-xs text-outline font-label-mono text-caption uppercase tracking-wider pb-1">
                      <span>Permanent Collection</span>
                      <span>•</span>
                      <span>Archival Canon</span>
                    </div>
                    <h3 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight">
                      Timeless Masterpieces
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Foundational works distinguished by structural narrative mastery and timeless visual direction.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-gutter">
                  {popularAnime.map((anime: any) => (
                    <div key={anime.id} className="flex flex-col group">
                      <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-surface-container mb-space-xs shadow-xs group-hover:shadow-md transition-shadow">
                        <Link href={`/anime/${anime.id}`} className="block w-full h-full">
                          <img
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            alt={anime.title.romaji}
                            src={anime.coverImage.large}
                          />
                        </Link>
                        <div className="absolute top-1.5 right-1.5 bg-surface-container-lowest/90 backdrop-blur-sm px-1.5 py-0.5 rounded font-label-mono text-caption font-semibold text-on-surface">
                          ★ {anime.averageScore ? (anime.averageScore / 10).toFixed(1) : '?'}
                        </div>
                      </div>
                      <Link href={`/anime/${anime.id}`}>
                        <h4 className="font-headline-sm text-body-md text-on-surface font-medium truncate pt-1 group-hover:text-secondary transition-colors">
                          {anime.title.english || anime.title.romaji}
                        </h4>
                      </Link>
                      <span className="font-label-mono text-caption text-on-surface-variant">
                        {anime.studios?.nodes?.[0]?.name || 'Unknown'} • {anime.seasonYear || ''}
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {anime.genres?.slice(0, 2).map((g: string) => (
                          <span key={g} className="px-1.5 py-0.5 rounded bg-surface-container font-label-mono text-caption text-on-surface-variant">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Catalog Statistics */}
              <section className="w-full max-w-[1280px] mx-auto px-margin-mobile lg:px-margin pb-space-xl">
                <div className="bg-surface-container-low rounded-xl p-space-lg flex flex-col lg:flex-row items-center justify-between gap-space-lg border border-surface-variant/40">
                  <div className="space-y-space-xs max-w-xl">
                    <span className="font-label-mono text-caption text-secondary uppercase font-semibold tracking-wider">
                      Catalog Statistics
                    </span>
                    <h4 className="font-headline-md text-headline-md text-on-surface font-semibold">
                      Communal Archival Metric
                    </h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Over 14,820 historical entries cataloged across 5 decades of Japanese animation history. Zero algorithmic advertisements, purely user-maintained historical logs.
                    </p>
                  </div>

                  <div className="flex items-center gap-space-lg w-full lg:w-auto justify-between lg:justify-end">
                    <div className="flex flex-col">
                      <span className="font-label-mono text-caption text-outline">Active Trackers</span>
                      <span className="font-headline-lg text-headline-lg font-bold text-on-surface">32.4k</span>
                      <span className="font-label-mono text-caption text-on-tertiary-container">↑ 12% this cycle</span>
                    </div>
                    <div className="h-10 w-[1px] bg-surface-variant"></div>
                    <div className="flex flex-col">
                      <span className="font-label-mono text-caption text-outline">Mean Rating</span>
                      <span className="font-headline-lg text-headline-lg font-bold text-on-surface">7.82</span>
                      <span className="font-label-mono text-caption text-outline">Normal distribution</span>
                    </div>
                    <div className="h-10 w-[1px] bg-surface-variant hidden sm:block"></div>
                    <div className="hidden sm:flex flex-col items-center">
                      <svg className="w-28 h-12 text-secondary" fill="none" viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 38 Q 25 38 40 25 T 60 5 T 80 30 T 100 38" fill="none" stroke="currentColor" strokeWidth="2"></path>
                        <path d="M0 38 Q 25 38 40 25 T 60 5 T 80 30 T 100 38 L 100 40 L 0 40 Z" fill="currentColor" fillOpacity="0.1"></path>
                      </svg>
                      <span className="font-label-mono text-caption text-outline pt-1">Distribution curve</span>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

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
    </>
  );
}