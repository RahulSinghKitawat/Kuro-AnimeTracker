/* eslint-disable */
import Link from 'next/link';
import Header from '@/components/Header';
import Pagination from '@/components/Pagination';
import YearSelect from '@/components/YearSelect';
import { fetchAniList } from '@/lib/anilist';

const QUERY = `
query ($season: MediaSeason, $year: Int, $page: Int) {
  Page(page: $page, perPage: 48) {
    pageInfo {
      currentPage
      lastPage
      hasNextPage
    }
    media(season: $season, seasonYear: $year, type: ANIME, sort: POPULARITY_DESC, isAdult: false) {
      id
      title { romaji english native }
      coverImage { large extraLarge }
      averageScore
      season
      seasonYear
      episodes
      format
      genres
      studios(isMain: true) { nodes { name } }
    }
  }
}
`;

const SEASONS = [
  { key: 'WINTER', label: 'Winter', icon: 'ac_unit' },
  { key: 'SPRING', label: 'Spring', icon: 'local_florist' },
  { key: 'SUMMER', label: 'Summer', icon: 'wb_sunny' },
  { key: 'FALL', label: 'Fall', icon: 'eco' }
] as const;

const YEARS = [2026, 2025, 2024, 2023, 2022, 2021];

export default async function SeasonalAnimeArchive({
  searchParams
}: {
  searchParams: Promise<{ season?: string; year?: string; page?: string }>;
}) {
  const resolvedParams = await searchParams;
  
  // Default to current season & year if not provided in search params
  const now = new Date();
  const month = now.getMonth(); // 0-11
  const defaultYear = now.getFullYear();
  let defaultSeason = 'WINTER';
  if (month >= 2 && month <= 4) defaultSeason = 'SPRING';
  else if (month >= 5 && month <= 7) defaultSeason = 'SUMMER';
  else if (month >= 8 && month <= 10) defaultSeason = 'FALL';

  // Validate or fallback
  const validSeasonKeys = ['WINTER', 'SPRING', 'SUMMER', 'FALL'];
  const reqSeason = resolvedParams.season?.toUpperCase() || '';
  const currentSeason = validSeasonKeys.includes(reqSeason) ? reqSeason : defaultSeason;
  const currentYear = parseInt(resolvedParams.year || '') || defaultYear;
  const currentPageParam = parseInt(resolvedParams.page || '1') || 1;

  let data;
  try {
    data = await fetchAniList(QUERY, { season: currentSeason, year: currentYear, page: currentPageParam });
  } catch (err) {
    console.error('Failed to fetch seasonal anime:', err);
  }

  const animeList = data?.Page?.media || [];
  const currentSeasonObj = SEASONS.find(s => s.key === currentSeason) || SEASONS[0];

  return (
    <>
      <Header activePage="seasonal" />

      <main className="w-full pt-16 min-h-screen bg-background">
        <div className="flex flex-col w-full max-w-[1280px] mx-auto px-margin-mobile lg:px-margin py-space-xl">
          
          {/* Header & Controls */}
          <div className="flex flex-col gap-space-md mb-space-xl">
            {/* Title & Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
              <div className="flex items-center gap-space-sm">
                <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-semibold">
                  {currentSeasonObj.label} {currentYear} Anime
                </h1>
              </div>
              <span className="px-3 py-1 bg-surface-container-high rounded-full font-label-mono text-caption text-on-surface-variant self-start sm:self-auto">
                {animeList.length} Shows Found
              </span>
            </div>

            {/* Interactive Filters: Year Pills & Season Tabs */}
            <div className="bg-surface-container-lowest p-space-md rounded-xl border border-surface-container shadow-xs flex flex-col gap-space-md">
              {/* Year Selector */}
              <div className="flex items-center gap-space-xs flex-wrap">
                <span className="font-label-mono text-caption text-outline mr-2">Year:</span>
                {YEARS.map((y) => (
                  <Link
                    key={y}
                    href={`/seasonal?season=${currentSeason}&year=${y}`}
                    className={`px-3 py-1 rounded-md font-label-mono text-caption transition-all ${
                      y === currentYear
                        ? 'bg-primary text-on-primary font-semibold shadow-xs'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                    }`}
                  >
                    {y}
                  </Link>
                ))}
                <YearSelect currentSeason={currentSeason} currentYear={currentYear} />
              </div>

              {/* Season Tabs */}
              <div className="flex items-center gap-space-sm border-t border-surface-variant pt-space-sm overflow-x-auto">
                <span className="font-label-mono text-caption text-outline mr-2 hidden sm:inline">Season:</span>
                {SEASONS.map((s) => {
                  const isActive = s.key === currentSeason;
                  return (
                    <Link
                      key={s.key}
                      href={`/seasonal?season=${s.key}&year=${currentYear}`}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-label-mono text-caption transition-all whitespace-nowrap ${
                        isActive
                          ? 'bg-secondary text-on-secondary font-semibold shadow-xs'
                          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">{s.icon}</span>
                      <span>{s.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Anime Grid */}
          {animeList.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-space-sm gap-y-space-lg">
              {animeList.map((anime: any) => (
                <article
                  key={anime.id}
                  className="group flex flex-col bg-surface-container-lowest rounded-lg overflow-hidden shadow-xs hover:shadow-md border border-surface-container transition-all"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-surface-container">
                    <Link href={`/anime/${anime.id}`} className="block w-full h-full">
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        alt={anime.title.romaji}
                        src={anime.coverImage.large || anime.coverImage.extraLarge}
                      />
                    </Link>
                    <div className="absolute top-2 right-2 bg-surface-container-lowest/90 backdrop-blur-sm px-2 py-0.5 rounded font-label-mono text-caption font-semibold text-on-surface shadow-xs">
                      ★ {anime.averageScore ? (anime.averageScore / 10).toFixed(1) : '—'}
                    </div>
                    {anime.format && (
                      <div className="absolute bottom-2 left-2 bg-inverse-surface/80 text-inverse-on-surface backdrop-blur-xs px-1.5 py-0.5 rounded font-label-mono text-[10px] uppercase">
                        {anime.format} {anime.episodes ? `• ${anime.episodes} eps` : ''}
                      </div>
                    )}
                  </div>
                  <div className="p-space-sm flex flex-col flex-grow">
                    <Link href={`/anime/${anime.id}`}>
                      <h3 className="font-headline-sm text-body-lg text-on-surface font-medium line-clamp-1 group-hover:text-secondary transition-colors">
                        {anime.title.english || anime.title.romaji}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-1.5 font-label-mono text-caption text-on-surface-variant pt-1 truncate">
                      <span>{anime.studios?.nodes?.[0]?.name || 'Studio Unlisted'}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-space-sm">
                      {anime.genres?.slice(0, 2).map((g: string) => (
                        <span
                          key={g}
                          className="px-1.5 py-0.5 bg-surface-container rounded font-label-mono text-[10px] text-on-surface-variant"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {data?.Page?.pageInfo && (
              <Pagination
                currentPage={data.Page.pageInfo.currentPage}
                hasNextPage={data.Page.pageInfo.hasNextPage}
                lastPage={data.Page.pageInfo.lastPage}
                basePath="/seasonal"
                queryParams={{ season: currentSeason, year: currentYear }}
              />
            )}
            </>
          ) : (
            <div className="bg-surface-container-lowest rounded-xl p-space-xl text-center border border-surface-container shadow-xs flex flex-col items-center justify-center py-16">
              <span className="material-symbols-outlined text-5xl text-outline mb-space-sm">archive</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">
                No Anime Found for {currentSeasonObj.label} {currentYear}
              </h3>
              <p className="font-body-md text-on-surface-variant max-w-md mb-space-lg">
                Shows for this specific season may not be announced or archived yet. Try browsing active seasons:
              </p>
              <div className="flex flex-wrap gap-space-sm justify-center">
                <Link
                  href="/seasonal?season=WINTER&year=2025"
                  className="px-4 py-2 bg-primary text-on-primary font-label-mono text-caption rounded-md hover:bg-primary-container transition-colors"
                >
                  Winter 2025
                </Link>
                <Link
                  href="/seasonal?season=FALL&year=2024"
                  className="px-4 py-2 bg-surface-container text-on-surface font-label-mono text-caption rounded-md hover:bg-surface-container-high transition-colors"
                >
                  Fall 2024
                </Link>
                <Link
                  href="/seasonal?season=SPRING&year=2024"
                  className="px-4 py-2 bg-surface-container text-on-surface font-label-mono text-caption rounded-md hover:bg-surface-container-high transition-colors"
                >
                  Spring 2024
                </Link>
              </div>
            </div>
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