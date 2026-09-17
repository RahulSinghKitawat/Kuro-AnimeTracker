/* eslint-disable */
import Link from 'next/link';
import Header from '@/components/Header';

import { fetchAniList } from '@/lib/anilist';
import AnimeDetailTabs from './AnimeDetailTabs';
import AnimeActionBar from './AnimeActionBar';
import PersonalStatusCard from './PersonalStatusCard';

const QUERY = `
query ($id: Int) {
  Media(id: $id, type: ANIME) {
    id
    title { romaji english native }
    coverImage { large extraLarge }
    bannerImage
    description
    episodes
    duration
    status
    season
    seasonYear
    averageScore
    popularity
    format
    source
    genres
    rankings {
      id
      rank
      type
      format
      year
      season
      allTime
      context
    }
    studios {
      edges {
        isMain
        node { id name }
      }
    }
    nextAiringEpisode { airingAt timeUntilAiring episode }
    externalLinks {
      url
      site
      type
      icon
      language
    }
    streamingEpisodes {
      title
      thumbnail
      url
      site
    }
    characters(sort: [ROLE, RELEVANCE], perPage: 25) {
      edges {
        role
        node {
          id
          name { full native }
          image { large medium }
        }
        voiceActors(language: JAPANESE) {
          id
          name { full native }
          image { large medium }
          languageV2
        }
      }
    }
    staff(sort: RELEVANCE, perPage: 24) {
      edges {
        role
        node {
          id
          name { full native }
          image { large medium }
        }
      }
    }
  }
}
`;

export default async function AnimeDetailEpisodeTracker({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let data;
  try {
    data = await fetchAniList(QUERY, { id: parseInt(id) });
  } catch(e) {
    return <div>Error loading anime</div>;
  }
  const anime = data?.Media;
  if (!anime) return <div>Anime not found</div>;

  return (
    <>
<Header activePage="discover" /><main className="w-full pt-16 min-h-screen bg-background"><div className="flex flex-col w-full">

<div className="max-w-[1280px] w-full mx-auto px-margin-mobile lg:px-margin pt-space-lg pb-space-sm">
  <AnimeActionBar anime={anime} />
</div>

<section className="max-w-[1280px] w-full mx-auto px-margin-mobile lg:px-margin py-space-md">
<div className="relative w-full rounded-xl overflow-hidden bg-surface-container-highest shadow-sm">

<div className="h-64 sm:h-80 md:h-[340px] w-full bg-cover bg-center relative" data-alt="Panoramic peaceful fantasy landscape featuring a vast grassy meadow under a serene pale blue twilight sky, ancient stone ruins overgrown with gentle green moss and blue flowers, anime cinematic art style inspired by studio Madhouse, quiet melancholic atmosphere with soft diffused sunset lighting and distant mountain peaks." style={{backgroundImage: `url('${anime.bannerImage || anime.coverImage.extraLarge}')`}}>
<div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
<div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent"></div>

{(() => {
  // Find the best ranking: prefer allTime RATED rank first, then POPULAR, then seasonal
  const allTimeRated = anime.rankings?.find((r: any) => r.allTime && r.type === 'RATED');
  const allTimePopular = anime.rankings?.find((r: any) => r.allTime && r.type === 'POPULAR');
  const bestRank = allTimeRated || allTimePopular || anime.rankings?.[0];
  if (!bestRank) return null;
  const label = bestRank.allTime
    ? `#${bestRank.rank} ${bestRank.type === 'RATED' ? 'ALL TIME RATED' : 'ALL TIME POPULAR'}`
    : `#${bestRank.rank} ${bestRank.context || bestRank.type}`;
  return (
    <div className="absolute top-space-md right-space-md flex items-center gap-space-xs bg-surface-container-lowest/90 backdrop-blur-sm px-space-sm py-1 rounded shadow-sm">
      <span className="material-symbols-outlined text-secondary text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>trophy</span>
      <span className="font-label-mono text-caption text-on-surface font-semibold tracking-wide uppercase">{label}</span>
    </div>
  );
})()}
</div>

<div className="px-space-md sm:px-space-lg pb-space-lg -mt-24 sm:-mt-28 relative z-10">
<div className="flex flex-col lg:flex-row gap-space-lg items-start">

<div className="w-36 sm:w-48 lg:w-56 shrink-0 aspect-[3/4] rounded-lg overflow-hidden bg-surface-container-low shadow-md relative group">
<Link href="/anime/1" className="block w-full h-full"><img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" alt={anime.title.romaji} src={anime.coverImage.extraLarge || anime.coverImage.large} /></Link>
<div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
<span className="material-symbols-outlined text-on-primary text-headline-md">zoom_in</span>
</div>
</div>

<div className="flex-1 min-w-0 flex flex-col justify-end pt-2 sm:pt-6">
<div className="flex flex-wrap items-baseline gap-space-sm mb-1">
<h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-semibold">
                {anime.title.english || anime.title.romaji}
              </h1>
<span className="font-headline-md text-headline-md text-on-surface-variant opacity-75 font-normal">
                {anime.title.native || anime.title.romaji}
              </span>
</div>

<div className="flex flex-wrap items-center gap-x-space-md gap-y-1 py-2 font-label-mono text-caption text-on-surface-variant">
<span>Studio: <strong className="text-on-surface font-medium">{anime.studios?.edges?.find((e: any) => e.isMain)?.node?.name || anime.studios?.edges?.[0]?.node?.name || 'Unknown'}</strong></span>
<span className="text-outline-variant">•</span>
<span>Aired: <strong className="text-on-surface font-medium">{anime.season ? anime.season.charAt(0) + anime.season.slice(1).toLowerCase() : ''} {anime.seasonYear}</strong></span>
<span className="text-outline-variant">•</span>
<span>{anime.episodes || (anime.nextAiringEpisode?.episode ? anime.nextAiringEpisode.episode - 1 : '?')} Episodes ({anime.duration || '?'}m)</span>
<span className="text-outline-variant">•</span>
<span>Source: <strong className="text-on-surface font-medium">{anime.source || 'Original'}</strong></span>
</div>


<div className="flex flex-wrap gap-1.5 mt-1 mb-space-md">
  {anime.genres?.map((g: string) => (
    <span key={g} className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-mono text-caption">{g}</span>
  ))}
</div>


<p className="font-body-md text-body-md text-on-surface-variant max-w-3xl leading-relaxed" dangerouslySetInnerHTML={{ __html: anime.description || 'No description available.' }}></p>

<div className="grid grid-cols-3 sm:grid-cols-4 gap-space-sm mt-space-md pt-space-sm">
<div className="bg-surface-container p-space-sm rounded">
<span className="font-label-mono text-caption text-on-surface-variant block uppercase">Community Score</span>
<div className="flex items-baseline gap-1 mt-0.5">
<span className="font-headline-sm text-headline-sm font-semibold text-on-surface">{anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 'N/A'}</span>
<span className="font-label-mono text-caption text-outline">/ 10</span>
</div>
</div>
<div className="bg-surface-container p-space-sm rounded">
<span className="font-label-mono text-caption text-on-surface-variant block uppercase">Watchers</span>
<div className="flex items-baseline gap-1 mt-0.5">
<span className="font-headline-sm text-headline-sm font-semibold text-on-surface">{anime.popularity ? (anime.popularity / 1000).toFixed(1) + 'k' : 'N/A'}</span>
</div>
</div>
<PersonalStatusCard animeId={anime.id} totalEpisodes={anime.episodes || (anime.nextAiringEpisode?.episode ? anime.nextAiringEpisode.episode - 1 : null)} />
<div className="hidden sm:block bg-surface-container p-space-sm rounded">
<span className="font-label-mono text-caption text-on-surface-variant block uppercase">Format</span>
<div className="flex items-baseline gap-1 mt-0.5">
<span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
  {anime.format ? anime.format.replace(/_/g, ' ') : 'TV'}
</span>
</div>
<span className="font-label-mono text-[10px] text-on-surface-variant mt-0.5 block">
  {anime.status === 'FINISHED' ? 'Finished Airing'
    : anime.status === 'RELEASING' ? 'Currently Airing'
    : anime.status === 'NOT_YET_RELEASED' ? 'Not Yet Released'
    : anime.status === 'CANCELLED' ? 'Cancelled'
    : anime.status || ''}
</span>
</div>
</div>
</div>
</div>
</div>
</div>
</section>

<div className="max-w-[1280px] w-full mx-auto px-margin-mobile lg:px-margin py-space-sm grid grid-cols-1 lg:grid-cols-12 gap-space-lg">

<div className="lg:col-span-8 flex flex-col gap-space-md">
  <AnimeDetailTabs anime={anime} />
</div>
<div className="lg:col-span-4 flex flex-col gap-space-md">




<div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm">
<div className="flex items-center justify-between mb-space-sm">
<span className="font-headline-sm text-headline-sm text-on-surface">Score Distribution</span>
<span className="font-label-mono text-caption text-on-surface font-semibold">9.38 Avg</span>
</div>

<div className="space-y-1.5 font-label-mono text-caption">
<div className="flex items-center gap-2">
<span className="w-5 text-right text-outline">10</span>
<div className="flex-1 h-3 bg-surface-container rounded-sm overflow-hidden">
<div className="h-full bg-secondary rounded-sm" style={{"width":"72%"}}></div>
</div>
<span className="w-8 text-right text-on-surface-variant">72%</span>
</div>
<div className="flex items-center gap-2">
<span className="w-5 text-right text-outline">9</span>
<div className="flex-1 h-3 bg-surface-container rounded-sm overflow-hidden">
<div className="h-full bg-secondary/80 rounded-sm" style={{"width":"20%"}}></div>
</div>
<span className="w-8 text-right text-on-surface-variant">20%</span>
</div>
<div className="flex items-center gap-2">
<span className="w-5 text-right text-outline">8</span>
<div className="flex-1 h-3 bg-surface-container rounded-sm overflow-hidden">
<div className="h-full bg-secondary/60 rounded-sm" style={{"width":"5%"}}></div>
</div>
<span className="w-8 text-right text-on-surface-variant">5%</span>
</div>
<div className="flex items-center gap-2">
<span className="w-5 text-right text-outline">7</span>
<div className="flex-1 h-3 bg-surface-container rounded-sm overflow-hidden">
<div className="h-full bg-secondary/40 rounded-sm" style={{"width":"2%"}}></div>
</div>
<span className="w-8 text-right text-on-surface-variant">2%</span>
</div>
<div className="flex items-center gap-2">
<span className="w-5 text-right text-outline">&lt;6</span>
<div className="flex-1 h-3 bg-surface-container rounded-sm overflow-hidden">
<div className="h-full bg-secondary/20 rounded-sm" style={{"width":"1%"}}></div>
</div>
<span className="w-8 text-right text-on-surface-variant">1%</span>
</div>
</div>
</div>

<div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm">
<span className="font-headline-sm text-headline-sm text-on-surface block mb-space-sm">Official Streaming</span>
<div className="flex flex-col gap-space-xs font-body-sm text-body-sm">
  {(() => {
    const streamingLinks = anime.externalLinks?.filter((link: any) => link.type === 'STREAMING') || [];
    
    if (streamingLinks.length === 0) {
      return <span className="text-on-surface-variant font-label-mono text-caption italic">No official streaming links available.</span>;
    }

    return streamingLinks.map((link: any, idx: number) => (
      <a 
        key={`${link.site}-${idx}`}
        className="flex items-center justify-between p-2 rounded hover:bg-surface-container-low transition-colors group" 
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className="flex items-center gap-2">
          {link.icon ? (
            <div className="w-6 h-6 flex items-center justify-center rounded-md p-0.5 shrink-0">
              <img src={link.icon} alt={link.site} className="w-full h-full object-contain drop-shadow-sm" />
            </div>
          ) : (
            <div className="w-6 h-6 flex items-center justify-center bg-surface-container-high rounded-md shrink-0">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
            </div>
          )}
          <span className="text-on-surface font-medium">{link.site}</span>
          {link.language && (
            <span className="font-label-mono text-[10px] text-outline px-1.5 py-0.5 rounded bg-surface-container uppercase">
              {link.language}
            </span>
          )}
        </div>
        <span className="material-symbols-outlined text-[16px] text-outline group-hover:text-primary transition-colors">arrow_outward</span>
      </a>
    ));
  })()}
</div>
</div>

<div className="p-space-md bg-surface-container rounded-lg font-label-mono text-caption text-on-surface-variant flex items-center justify-between">
<div>
<span className="block text-outline">ARCHIVAL REGISTRY</span>
<span className="font-semibold text-on-surface">JP-MDH-2023-FRN</span>
</div>
<span className="material-symbols-outlined text-outline">verified</span>
</div>
</div>
</div></div></main><footer className="w-full bg-surface-container-lowest border-t border-surface-variant mt-space-xl"><div className="max-w-[1280px] mx-auto px-margin-mobile lg:px-margin py-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-md"><div className="flex items-center gap-space-sm text-on-surface-variant font-label-mono text-caption"><span>KURO ANIME LOG</span><span>•</span><span>MINIMALIST CATALOG ARCHIVE</span></div><div className="text-on-surface-variant font-caption text-caption">© 2025 Kuro. Architectural tracking for disciplined media consumption.</div></div></footer>
    </>
  );
}