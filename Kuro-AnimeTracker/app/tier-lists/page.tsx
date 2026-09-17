'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useTracker } from '@/lib/trackerContext';

// ─── Types ────────────────────────────────────────────────────────────────────

type TierId = string;

interface TierConfig {
  id: TierId;
  label: string;
  subLabel: string;
  scoreRange: string;
  rowBg: string;
  labelBg: string;
  labelText: string;
  badgeBg: string;
  badgeText: string;
}

interface TierAnime {
  id: number;
  title: string;
  studio: string;
  year: number;
  cover: string; // fallback; real cover from realCovers state
  score: number;
  tier: TierId;
  notes?: string;
}

type ShelfKey = 'masterpieces' | 'cel90s' | 'iyashikei' | 'thrillers' | 'modern' | 'watchlist';
type SortOrder = 'editorial' | 'score_desc' | 'score_asc' | 'title_az';

// ─── Constants ────────────────────────────────────────────────────────────────

// Removed hardcoded TIERS constant, will be managed in state

const SHELF_OPTIONS: { key: ShelfKey; label: string }[] = [
  { key: 'masterpieces', label: 'All-Time Masterpieces' },
  { key: 'cel90s', label: '90s Cel & Cyberpunk' },
  { key: 'iyashikei', label: 'Contemplative Iyashikei' },
  { key: 'thrillers', label: 'Psychological Thrillers' },
  { key: 'modern', label: 'Modern Auteur (2020+)' },
  { key: 'watchlist', label: 'My Watchlist Roster' },
];

const SORT_OPTIONS: { key: SortOrder; label: string; icon: string }[] = [
  { key: 'editorial', label: 'Editorial Order', icon: 'drag_indicator' },
  { key: 'score_desc', label: 'Score ↓', icon: 'arrow_downward' },
  { key: 'score_asc', label: 'Score ↑', icon: 'arrow_upward' },
  { key: 'title_az', label: 'Title A–Z', icon: 'sort_by_alpha' },
];

const SHELF_DATA: Record<ShelfKey, TierAnime[]> = {
  masterpieces: [],
  cel90s: [],
  iyashikei: [],
  thrillers: [],
  modern: [],
  watchlist: [],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getNextTierColor = (index: number) => {
  const colors = [
    { rowBg: 'bg-[#141417]', labelBg: 'bg-[#141417]', labelText: 'text-amber-400', badgeBg: 'bg-amber-400', badgeText: 'text-black' },
    { rowBg: 'bg-surface-container-high', labelBg: 'bg-surface-container-highest', labelText: 'text-primary', badgeBg: 'bg-primary', badgeText: 'text-on-primary' },
    { rowBg: 'bg-surface-container', labelBg: 'bg-surface-container-high', labelText: 'text-secondary', badgeBg: 'bg-secondary', badgeText: 'text-on-secondary' },
    { rowBg: 'bg-surface-container-low', labelBg: 'bg-surface-container', labelText: 'text-on-surface', badgeBg: 'bg-surface-container-highest', badgeText: 'text-on-surface' },
    { rowBg: 'bg-surface-container-lowest', labelBg: 'bg-surface-container-low', labelText: 'text-on-surface-variant', badgeBg: 'bg-surface-container-low', badgeText: 'text-on-surface-variant' },
  ];
  return colors[index % colors.length];
};

function scoreToTier(score: number | null): TierId {
  if (!score) return 'C';
  if (score >= 9.6) return 'S+';
  if (score >= 9.0) return 'S';
  if (score >= 8.5) return 'A';
  if (score >= 8.0) return 'B';
  return 'C';
}

async function searchAniList(query: string) {
  const res = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      query: `query ($search: String) {
        Page(page: 1, perPage: 6) {
          media(search: $search, type: ANIME, isAdult: false) {
            id title { romaji english }
            coverImage { large extraLarge }
            averageScore
            studios(isMain: true) { nodes { name } }
            seasonYear
          }
        }
      }`,
      variables: { search: query },
    }),
  });
  const data = await res.json();
  return data?.data?.Page?.media || [];
}

async function fetchCoversForIds(ids: number[]): Promise<Record<number, string>> {
  if (ids.length === 0) return {};
  const res = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      query: `query ($ids: [Int]) {
        Page(page: 1, perPage: 50) {
          media(id_in: $ids, type: ANIME) {
            id coverImage { extraLarge large }
          }
        }
      }`,
      variables: { ids },
    }),
  });
  const data = await res.json();
  const covers: Record<number, string> = {};
  (data?.data?.Page?.media || []).forEach((m: any) => {
    covers[m.id] = m.coverImage?.extraLarge || m.coverImage?.large || '';
  });
  return covers;
}

// ─── Add Anime Modal ─────────────────────────────────────────────────────────

function AddAnimeModal({
  targetTier,
  onClose,
  onAdd,
}: {
  targetTier: TierId;
  onClose: () => void;
  onAdd: (anime: TierAnime) => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try { setResults(await searchAniList(query)); }
      finally { setLoading(false); }
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface-container-lowest rounded-xl shadow-2xl border border-surface-variant w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-variant">
          <div>
            <h3 className="font-headline-sm text-on-surface">Assign to Tier <span className="text-primary font-bold">{targetTier}</span></h3>
            <p className="font-label-mono text-caption text-outline mt-0.5">Search AniList to add anime</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-outline hover:text-on-surface rounded transition-colors">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
        <div className="px-5 py-3">
          <div className="flex items-center gap-2 bg-surface-container rounded-lg px-3 py-2 border border-surface-variant focus-within:border-outline transition-colors">
            <span className="material-symbols-outlined text-outline text-lg">search</span>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search anime title..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-on-surface font-body-sm text-body-sm focus:outline-none placeholder:text-outline"
            />
            {loading && <span className="material-symbols-outlined text-outline text-sm animate-spin">progress_activity</span>}
          </div>
        </div>
        <div className="px-5 pb-5 min-h-[160px] max-h-[360px] overflow-y-auto">
          {results.length === 0 && !loading && query && <div className="text-center py-8 text-outline font-body-sm">No results found</div>}
          {results.length === 0 && !query && <div className="text-center py-8 text-outline font-label-mono text-caption">Start typing to search AniList...</div>}
          <div className="flex flex-col gap-2">
            {results.map((r: any) => (
              <button
                key={r.id}
                onClick={() => {
                  onAdd({
                    id: r.id,
                    title: r.title?.english || r.title?.romaji || 'Unknown',
                    studio: r.studios?.nodes?.[0]?.name || '—',
                    year: r.seasonYear || new Date().getFullYear(),
                    cover: r.coverImage?.extraLarge || r.coverImage?.large || '',
                    score: r.averageScore ? r.averageScore / 10 : 8.0,
                    tier: targetTier,
                  });
                  onClose();
                }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-container transition-colors text-left group"
              >
                <div className="w-10 h-14 rounded overflow-hidden shrink-0 bg-surface-container">
                  <img src={r.coverImage?.extraLarge || r.coverImage?.large} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-headline-sm text-body-sm text-on-surface truncate group-hover:text-secondary transition-colors">{r.title?.english || r.title?.romaji}</p>
                  <p className="font-label-mono text-caption text-outline">{r.studios?.nodes?.[0]?.name || '—'} • {r.seasonYear || '—'}</p>
                </div>
                {r.averageScore && <span className="font-label-mono text-caption text-on-surface shrink-0">★ {(r.averageScore / 10).toFixed(1)}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Anime Card ───────────────────────────────────────────────────────────────

function AnimeCard({
  anime,
  coverUrl,
  index,
  tierItems,
  tiers,
  onChangeTier,
  onRemove,
  onMoveUp,
  onMoveDown,
  showRank,
  reorderMode,
}: {
  anime: TierAnime;
  coverUrl: string;
  index: number;
  tierItems: TierAnime[];
  tiers: TierConfig[];
  onChangeTier: (id: number, tier: TierId) => void;
  onRemove: (id: number) => void;
  onMoveUp: (id: number, tier: TierId) => void;
  onMoveDown: (id: number, tier: TierId) => void;
  showRank?: boolean;
  reorderMode: boolean;
}) {
  const [tierMenuOpen, setTierMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setTierMenuOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const isFirst = index === 0;
  const isLast = index === tierItems.length - 1;
  const imgSrc = coverUrl || `https://placehold.co/200x267/1b1b1e/858387?text=${encodeURIComponent(anime.title.substring(0, 8))}`;

  return (
    <div className="group relative flex flex-col bg-surface-container-lowest hover:bg-surface-container-low rounded p-2 transition-all shadow-sm">
      <div className="aspect-[3/4] w-full overflow-hidden rounded relative mb-2 bg-surface-container">
        <Link href={`/anime/${anime.id}`}>
          <img
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            src={`/api/proxy-image?url=${encodeURIComponent(imgSrc)}`}
            alt={anime.title}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = `https://placehold.co/200x267/1b1b1e/858387?text=${encodeURIComponent(anime.title.substring(0, 6))}`; }}
          />
        </Link>
        {/* Score badge */}
        <div className="absolute top-1.5 right-1.5 bg-black/80 backdrop-blur-sm text-amber-400 px-1.5 py-0.5 rounded font-label-mono text-[10px] font-bold">
          ★ {anime.score.toFixed(1)}
        </div>
        {showRank && (
          <div className="absolute bottom-1.5 left-1.5 bg-black/70 text-white px-1.5 py-0.5 rounded font-label-mono text-[10px]">
            #{String(index + 1).padStart(2, '0')}
          </div>
        )}

        {/* Tier change + remove buttons */}
        {!reorderMode && (
          <div className="absolute top-1.5 left-1.5 flex flex-col gap-1" ref={menuRef}>
            {/* Swap tier button */}
            <button
              onClick={(e) => { e.preventDefault(); setTierMenuOpen(!tierMenuOpen); }}
              className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 backdrop-blur-sm text-white p-0.5 rounded"
              title="Change tier"
            >
              <span className="material-symbols-outlined text-sm leading-none">swap_vert</span>
            </button>
            {/* Remove button */}
            <button
              onClick={(e) => { e.preventDefault(); onRemove(anime.id); }}
              className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600/90 backdrop-blur-sm text-white p-0.5 rounded"
              title="Remove from shelf"
            >
              <span className="material-symbols-outlined text-sm leading-none">close</span>
            </button>
            {tierMenuOpen && (
              <div className="absolute left-0 top-7 z-50 bg-surface-container-lowest border border-surface-variant rounded shadow-xl py-1 w-32">
                {tiers.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { onChangeTier(anime.id, t.id); setTierMenuOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-caption font-label-mono hover:bg-surface-container transition-colors flex items-center gap-2 ${anime.tier === t.id ? 'bg-surface-container text-on-surface font-semibold' : 'text-on-surface-variant'}`}
                  >
                    <span className="font-bold w-5">{t.id}</span>
                    <span>{t.subLabel}</span>
                  </button>
                ))}
                <div className="border-t border-surface-variant my-1" />
                <button
                  onClick={() => { onRemove(anime.id); setTierMenuOpen(false); }}
                  className="w-full text-left px-3 py-1.5 text-caption font-label-mono text-error hover:bg-error-container/20 transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm leading-none">delete</span>
                  Remove
                </button>
              </div>
            )}
          </div>
        )}

        {/* Reorder arrows */}
        {reorderMode && (
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center gap-1">
            <button
              onClick={() => onMoveUp(anime.id, anime.tier)}
              disabled={isFirst}
              className="bg-surface-container-lowest/90 rounded p-0.5 disabled:opacity-30 hover:bg-surface-container transition-colors"
              title="Move left"
            >
              <span className="material-symbols-outlined text-sm text-on-surface">chevron_left</span>
            </button>
            <button
              onClick={() => onMoveDown(anime.id, anime.tier)}
              disabled={isLast}
              className="bg-surface-container-lowest/90 rounded p-0.5 disabled:opacity-30 hover:bg-surface-container transition-colors"
              title="Move right"
            >
              <span className="material-symbols-outlined text-sm text-on-surface">chevron_right</span>
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col min-w-0">
        <Link href={`/anime/${anime.id}`}>
          <h4 className="font-headline-sm text-body-sm truncate text-on-surface hover:text-secondary transition-colors leading-tight">{anime.title}</h4>
        </Link>
        <span className="font-label-mono text-[10px] text-outline truncate">{anime.studio} • {anime.year}</span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CuratedCanonShelfTierRoster() {
  const { entries } = useTracker();

  const [activeShelf, setActiveShelf] = useState<ShelfKey>('masterpieces');
  const [viewMode, setViewMode] = useState<'matrix' | 'gallery'>('matrix');
  const [sortOrder, setSortOrder] = useState<SortOrder>('editorial');
  const [reorderMode, setReorderMode] = useState(false);

  const [tiers, setTiers] = useState<TierConfig[]>([]);
  const [addTierModalOpen, setAddTierModalOpen] = useState(false);
  const [newTierName, setNewTierName] = useState('');
  const [newTierSubLabel, setNewTierSubLabel] = useState('');

  // Real AniList covers, keyed by anime ID
  const [realCovers, setRealCovers] = useState<Record<number, string>>({});

  const [shelfData, setShelfData] = useState<Record<ShelfKey, TierAnime[]>>({
    ...SHELF_DATA,
    watchlist: entries
      .filter((e) => e.score !== null)
      .map((e) => ({
        id: e.id,
        title: e.title.english || e.title.romaji,
        studio: e.studio || '—',
        year: e.year || new Date().getFullYear(),
        cover: '',
        score: e.score || 8.0,
        tier: scoreToTier(e.score),
      }))
      .sort((a, b) => b.score - a.score),
  });

  const [addModal, setAddModal] = useState<{ open: boolean; tier: TierId }>({ open: false, tier: 'S' });
  const [exportToast, setExportToast] = useState(false);

  // Keep watchlist synced with tracker
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShelfData((prev) => ({
      ...prev,
      watchlist: entries
        .filter((e) => e.score !== null)
        .map((e) => ({
          id: e.id,
          title: e.title.english || e.title.romaji,
          studio: e.studio || '—',
          year: e.year || new Date().getFullYear(),
          cover: '',
          score: e.score || 8.0,
          tier: scoreToTier(e.score),
        }))
        .sort((a, b) => b.score - a.score),
    }));
  }, [entries]);

  // Fetch real AniList covers for active shelf
  useEffect(() => {
    const currentList = shelfData[activeShelf];
    const ids = currentList.map((a) => a.id).filter((id) => !realCovers[id]);
    if (ids.length === 0) return;
    fetchCoversForIds(ids).then((covers) => {
      setRealCovers((prev) => ({ ...prev, ...covers }));
    }).catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeShelf, shelfData[activeShelf].length]);

  const currentAnime = shelfData[activeShelf];

  const tieredAnime = useMemo(() => {
    const map: Record<TierId, TierAnime[]> = {};
    tiers.forEach((t) => { map[t.id] = []; });
    currentAnime.forEach((a) => {
      if (!map[a.tier]) map[a.tier] = [];
      map[a.tier].push(a);
    });
    if (sortOrder === 'score_desc') {
      Object.keys(map).forEach((t) => map[t].sort((a, b) => b.score - a.score));
    } else if (sortOrder === 'score_asc') {
      Object.keys(map).forEach((t) => map[t].sort((a, b) => a.score - b.score));
    } else if (sortOrder === 'title_az') {
      Object.keys(map).forEach((t) => map[t].sort((a, b) => a.title.localeCompare(b.title)));
    }
    return map;
  }, [currentAnime, sortOrder, tiers]);

  const galleryAnime = useMemo(() => [...currentAnime].sort((a, b) => b.score - a.score), [currentAnime]);

  const stats = useMemo(() => {
    if (currentAnime.length === 0) {
      const counts: Record<TierId, number> = {};
      tiers.forEach((t) => { counts[t.id] = 0; });
      return { mean: 0, counts, total: 0 };
    }
    const total = currentAnime.length;
    const sum = currentAnime.reduce((acc, a) => acc + a.score, 0);
    const counts: Record<TierId, number> = {};
    tiers.forEach((t) => { counts[t.id] = 0; });
    currentAnime.forEach((a) => {
      if (counts[a.tier] !== undefined) counts[a.tier]++;
      else counts[a.tier] = 1;
    });
    return { mean: sum / total, counts, total };
  }, [currentAnime, tiers]);

  const shelfCounts: Record<ShelfKey, number> = {
    masterpieces: shelfData.masterpieces.length,
    cel90s: shelfData.cel90s.length,
    iyashikei: shelfData.iyashikei.length,
    thrillers: shelfData.thrillers.length,
    modern: shelfData.modern.length,
    watchlist: shelfData.watchlist.length,
  };

  const handleChangeTier = (id: number, tier: TierId) => {
    setShelfData((prev) => ({
      ...prev,
      [activeShelf]: prev[activeShelf].map((a) => a.id === id ? { ...a, tier } : a),
    }));
  };

  const handleRemove = (id: number) => {
    setShelfData((prev) => ({
      ...prev,
      [activeShelf]: prev[activeShelf].filter((a) => a.id !== id),
    }));
  };

  const handleMoveWithinTier = (id: number, tier: TierId, direction: 1 | -1) => {
    setShelfData((prev) => {
      const list = [...prev[activeShelf]];
      const tierItems = list.filter((a) => a.tier === tier);
      const tierIdx = tierItems.findIndex((a) => a.id === id);
      const targetTierIdx = tierIdx + direction;
      if (targetTierIdx < 0 || targetTierIdx >= tierItems.length) return prev;
      const globalIdxCurr = list.findIndex((a) => a.id === id);
      const globalIdxTarget = list.findIndex((a) => a.id === tierItems[targetTierIdx].id);
      [list[globalIdxCurr], list[globalIdxTarget]] = [list[globalIdxTarget], list[globalIdxCurr]];
      return { ...prev, [activeShelf]: list };
    });
  };

  const handleAddAnime = (anime: TierAnime) => {
    // Store real cover from search result
    if (anime.cover) {
      setRealCovers((prev) => ({ ...prev, [anime.id]: anime.cover }));
    }
    setShelfData((prev) => {
      const existing = prev[activeShelf].find((a) => a.id === anime.id);
      if (existing) {
        return { ...prev, [activeShelf]: prev[activeShelf].map((a) => a.id === anime.id ? { ...a, tier: anime.tier } : a) };
      }
      return { ...prev, [activeShelf]: [...prev[activeShelf], anime] };
    });
  };

  const handleDeleteTier = (tierId: TierId) => {
    setTiers((prev) => prev.filter((t) => t.id !== tierId));
    setShelfData((prev) => ({
      ...prev,
      [activeShelf]: prev[activeShelf].filter((a) => a.tier !== tierId)
    }));
  };

  const handleExport = async () => {
    const shelfLabel = SHELF_OPTIONS.find((s) => s.key === activeShelf)?.label || 'Tier_Roster';
    const dateStr = new Date().toISOString().split('T')[0];

    const element = document.getElementById('tier-list-board');
    if (!element) return;

    try {
      // Dynamic import to avoid SSR issues
      const { toJpeg } = await import('html-to-image');
      
      const filter = (node: any) => {
        // Exclude external stylesheets (like Google Fonts) to prevent cssRules SecurityError
        if (node.tagName === 'LINK' && node.rel === 'stylesheet') return false;
        return true;
      };

      const imgData = await toJpeg(element, {
        quality: 0.9,
        backgroundColor: '#0f0f11', // Match theme background
        pixelRatio: 2, // Better resolution
        filter: filter,
      });
      
      const a = document.createElement('a');
      a.href = imgData;
      a.download = `tier-roster-${shelfLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${dateStr}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setExportToast(true);
      setTimeout(() => setExportToast(false), 3000);
    } catch (err) {
      console.error('Export failed', err);
      alert('Failed to generate image. Please try again.');
    }
  };


  const cycleSortOrder = () => {
    const orders: SortOrder[] = ['editorial', 'score_desc', 'score_asc', 'title_az'];
    const next = orders[(orders.indexOf(sortOrder) + 1) % orders.length];
    setSortOrder(next);
    setReorderMode(false); // disable reorder when sorting
  };

  const currentSortOption = SORT_OPTIONS.find((o) => o.key === sortOrder)!;

  return (
    <ProtectedRoute redirectPath="/tier-lists">
      <Header activePage="tier-list" />

      {addModal.open && (
        <AddAnimeModal
          targetTier={addModal.tier}
          onClose={() => setAddModal({ open: false, tier: 'S' })}
          onAdd={handleAddAnime}
        />
      )}

      {addTierModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => { setAddTierModalOpen(false); setNewTierName(''); setNewTierSubLabel(''); }}>
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl border border-surface-variant w-full max-w-sm overflow-hidden p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-headline-sm text-on-surface mb-4">Add New Tier</h3>
            <input
              type="text"
              placeholder="Tier Name (e.g., S, A, God Tier)"
              value={newTierName}
              onChange={(e) => setNewTierName(e.target.value)}
              className="w-full bg-surface-container border border-surface-variant rounded px-3 py-2 text-on-surface mb-3 focus:outline-none focus:border-primary"
              autoFocus
            />
            <input
              type="text"
              placeholder="Description (e.g., Masterpiece, Good)"
              value={newTierSubLabel}
              onChange={(e) => setNewTierSubLabel(e.target.value)}
              className="w-full bg-surface-container border border-surface-variant rounded px-3 py-2 text-on-surface mb-4 focus:outline-none focus:border-primary"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => { setAddTierModalOpen(false); setNewTierName(''); setNewTierSubLabel(''); }} className="px-4 py-2 text-on-surface-variant hover:text-on-surface">Cancel</button>
              <button
                onClick={() => {
                  if (newTierName.trim()) {
                    const color = getNextTierColor(tiers.length);
                    setTiers([...tiers, {
                      id: newTierName.trim(),
                      label: newTierName.trim(),
                      subLabel: newTierSubLabel.trim() || 'Custom Tier',
                      scoreRange: '',
                      ...color
                    }]);
                    setNewTierName('');
                    setNewTierSubLabel('');
                    setAddTierModalOpen(false);
                  }
                }}
                className="px-4 py-2 bg-primary text-on-primary rounded font-label-md"
              >
                Add Tier
              </button>
            </div>
          </div>
        </div>
      )}

      {exportToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-on-primary px-4 py-3 rounded-xl shadow-xl font-label-md text-body-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">image</span>
          Image downloaded!
        </div>
      )}

      <main className="w-full pt-16 min-h-screen bg-background">
        <div className="flex flex-col w-full">

          {/* ── Hero / Header ──────────────────────────────────────── */}
          <section className="w-full bg-surface-container-lowest border-b border-surface-variant px-4 md:px-8 lg:px-12 py-8">
            <div className="max-w-[1280px] mx-auto">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6">
                <div className="max-w-3xl">
                  <div className="flex items-center gap-2 font-label-mono text-[11px] text-outline tracking-widest uppercase mb-3">
                    <Link href="/list" className="hover:text-on-surface transition-colors">Archive Index</Link>
                    <span className="text-outline-variant">{"//"}</span>
                    <span className="text-primary font-semibold">Canon Shelf #084</span>
                  </div>
                  <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
                    Curated Canon Shelf &amp; Tier Roster
                  </h1>
                  <p className="font-body-lg text-body-lg text-on-surface-variant mt-2 max-w-2xl leading-relaxed">
                    Subjective masterworks and disciplined ranking matrices cataloged across 50+ years of animation.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* View toggle */}
                  <div className="flex items-center bg-surface-container-low p-1 rounded">
                    <button onClick={() => setViewMode('matrix')} className={`px-3 py-1.5 font-label-md text-label-md rounded flex items-center gap-1.5 transition-all ${viewMode === 'matrix' ? 'bg-surface-container-lowest text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`} id="btn-tier-view">
                      <span className="material-symbols-outlined text-sm">reorder</span>Matrix View
                    </button>
                    <button onClick={() => setViewMode('gallery')} className={`px-3 py-1.5 font-label-md text-label-md rounded flex items-center gap-1.5 transition-all ${viewMode === 'gallery' ? 'bg-surface-container-lowest text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`} id="btn-gallery-view">
                      <span className="material-symbols-outlined text-sm">grid_view</span>Gallery View
                    </button>
                  </div>

                  <button onClick={handleExport} className="px-3 py-1.5 font-label-md text-label-md bg-surface-container-low hover:bg-surface-container text-on-surface rounded flex items-center gap-1.5 transition-colors border border-surface-variant">
                    <span className="material-symbols-outlined text-sm">image</span>Export
                  </button>

                  <button
                    onClick={() => setAddModal({ open: true, tier: 'S' })}
                    className="px-3 py-1.5 font-label-md text-label-md bg-primary hover:bg-primary-container text-on-primary rounded flex items-center gap-1.5 transition-all shadow-sm"
                    id="btn-add-anime"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>Add Anime
                  </button>
                </div>
              </div>

              {/* Shelf Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {SHELF_OPTIONS.map((shelf) => (
                  <button
                    key={shelf.key}
                    onClick={() => setActiveShelf(shelf.key)}
                    className={`px-4 py-2 text-left shrink-0 rounded font-body-sm text-body-sm flex items-center gap-2 transition-colors ${activeShelf === shelf.key ? 'bg-primary text-on-primary' : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface'}`}
                  >
                    <span>{shelf.label}</span>
                    <span className={`font-label-mono text-[10px] px-1.5 py-0.5 rounded ${activeShelf === shelf.key ? 'bg-white/20 text-on-primary' : 'bg-surface-variant text-on-surface-variant'}`}>
                      {shelfCounts[shelf.key]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ── Main ──────────────────────────────────────────────── */}
          <div className="max-w-[1280px] mx-auto w-full px-4 md:px-8 lg:px-12 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left: Content */}
            <div id="tier-list-board" className="lg:col-span-9 flex flex-col gap-4 p-2 -m-2 rounded">

              {/* Toolbar */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-surface-container-lowest rounded border border-surface-variant shadow-sm">
                <div className="flex items-center gap-4">
                  {/* Sort button */}
                  <button
                    onClick={cycleSortOrder}
                    className={`flex items-center gap-1.5 text-[11px] font-label-mono uppercase tracking-wider transition-colors ${sortOrder !== 'editorial' ? 'text-primary font-semibold' : 'text-on-surface-variant hover:text-on-surface'}`}
                    title="Click to cycle sort order"
                    id="btn-sort"
                  >
                    <span className="material-symbols-outlined text-sm">{currentSortOption.icon}</span>
                    <span>SORT: {currentSortOption.label}</span>
                  </button>

                  <span className="text-outline-variant">•</span>

                  {/* Reorder toggle */}
                  <button
                    onClick={() => { setReorderMode(!reorderMode); setSortOrder('editorial'); }}
                    className={`flex items-center gap-1.5 text-[11px] font-label-mono uppercase tracking-wider transition-colors ${reorderMode ? 'text-secondary font-semibold' : 'text-on-surface-variant hover:text-on-surface'}`}
                    title="Toggle reorder mode — use ‹ › arrows on cards"
                    id="btn-reorder"
                  >
                    <span className="material-symbols-outlined text-sm">{reorderMode ? 'drag_indicator' : 'open_with'}</span>
                    <span>{reorderMode ? 'REORDER: ON' : 'REORDER'}</span>
                  </button>
                </div>
                <span className="text-[11px] font-label-mono text-outline uppercase">
                  {currentAnime.length} WORKS
                </span>
              </div>

              {tiers.length === 0 ? (
                <div className="p-12 text-center bg-surface-container-lowest rounded-xl border border-surface-variant flex flex-col items-center gap-3">
                  <span className="material-symbols-outlined text-4xl text-outline">playlist_add</span>
                  <h3 className="font-headline-sm text-on-surface">No tiers in this shelf</h3>
                  <p className="font-body-sm text-on-surface-variant max-w-sm">
                    {activeShelf === 'watchlist' ? 'Add a tier to organize your watchlist.' : 'Create your first tier to start adding anime.'}
                  </p>
                  {activeShelf !== 'watchlist' && (
                    <button onClick={() => setAddTierModalOpen(true)} className="mt-2 px-4 py-2 rounded bg-primary text-on-primary font-label-md text-caption flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">add</span>
                      Add Tier
                    </button>
                  )}
                </div>
              ) : viewMode === 'matrix' ? (
                /* ── Matrix ── */
                <div className="flex flex-col gap-3">
                  {tiers.map((tier) => {
                    const animeInTier = tieredAnime[tier.id];
                    if (animeInTier.length === 0 && activeShelf !== 'watchlist') return (
                      <div key={tier.id} className={`${tier.rowBg} rounded overflow-hidden border border-surface-variant opacity-60 relative group`}>
                        <button onClick={() => handleDeleteTier(tier.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600/90 text-white p-1 rounded z-10" title="Delete tier">
                          <span className="material-symbols-outlined text-sm leading-none">delete</span>
                        </button>
                        <div className="flex flex-col md:grid md:grid-cols-12 items-stretch">
                          <div className={`md:col-span-2 ${tier.labelBg} p-4 flex flex-col items-center justify-center text-center`}>
                            <span className={`font-label-mono text-2xl font-bold ${tier.labelText}`}>{tier.label}</span>
                            {tier.subLabel !== 'Custom Tier' && (
                              <span className={`font-label-mono text-[10px] uppercase ${tier.labelText} opacity-70 mt-1 block md:hidden`}>{tier.subLabel}</span>
                            )}
                          </div>
                          <div className="col-span-10 p-3 flex items-center">
                            <button onClick={() => setAddModal({ open: true, tier: tier.id })} className="flex items-center gap-2 text-outline font-label-mono text-[11px] uppercase hover:text-on-surface transition-colors">
                              <span className="material-symbols-outlined text-sm">add_circle_outline</span>
                              Empty — add anime to {tier.label}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                    if (animeInTier.length === 0) return null;
                    return (
                      <div key={tier.id} className={`${tier.rowBg} rounded overflow-hidden border border-surface-variant relative group`}>
                        <button onClick={() => handleDeleteTier(tier.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600/90 text-white p-1 rounded z-10" title="Delete tier">
                          <span className="material-symbols-outlined text-sm leading-none">delete</span>
                        </button>
                        <div className="flex flex-col md:grid md:grid-cols-12 items-stretch">
                          {/* Tier label */}
                          <div className={`md:col-span-2 ${tier.labelBg} p-4 flex flex-row md:flex-col items-center md:justify-center gap-2 md:gap-1 text-center`}>
                            <span className={`font-label-mono text-2xl font-bold ${tier.labelText}`}>{tier.label}</span>
                            <div className="hidden md:block w-8 h-px bg-outline-variant/30 my-1" />
                            <span className={`font-label-mono text-[10px] uppercase ${tier.labelText} opacity-70`}>{tier.subLabel}</span>
                            <span className={`font-label-mono text-[10px] ${tier.labelText} opacity-50 hidden md:block`}>{tier.scoreRange}</span>
                          </div>

                          {/* Cards grid */}
                          <div className="md:col-span-10 p-3 bg-surface-bright/30">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                              {animeInTier.map((anime, idx) => (
                                <AnimeCard
                                  key={`${anime.id}-${tier.id}`}
                                  anime={anime}
                                  coverUrl={realCovers[anime.id] || ''}
                                  index={idx}
                                  tierItems={animeInTier}
                                  tiers={tiers}
                                  onChangeTier={handleChangeTier}
                                  onRemove={handleRemove}
                                  onMoveUp={(id, t) => handleMoveWithinTier(id, t, -1)}
                                  onMoveDown={(id, t) => handleMoveWithinTier(id, t, 1)}
                                  showRank={tier.id === 'S+'}
                                  reorderMode={reorderMode && sortOrder === 'editorial'}
                                />
                              ))}
                              {/* Add button */}
                              {activeShelf !== 'watchlist' && !reorderMode && (
                                <button
                                  onClick={() => setAddModal({ open: true, tier: tier.id })}
                                  className="rounded border border-dashed border-outline-variant/50 bg-surface-container/20 flex flex-col items-center justify-center p-3 text-outline hover:border-outline hover:text-on-surface transition-colors min-h-[140px]"
                                >
                                  <span className="material-symbols-outlined text-2xl mb-1">add_circle_outline</span>
                                  <span className="font-label-mono text-[10px] uppercase text-center">Add to {tier.id}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {activeShelf !== 'watchlist' && !reorderMode && (
                    <button onClick={() => setAddTierModalOpen(true)} className="mt-4 px-4 py-2 rounded bg-surface-container-low hover:bg-surface-container border border-dashed border-outline-variant text-on-surface font-label-md flex items-center justify-center gap-2 transition-colors">
                      <span className="material-symbols-outlined text-sm">add</span>
                      Add Another Tier
                    </button>
                  )}
                </div>
              ) : (
                /* ── Gallery ── */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {galleryAnime.map((anime, idx) => {
                    const tierConfig = tiers.find((t) => t.id === anime.tier) || { badgeBg: 'bg-surface-variant', badgeText: 'text-on-surface' };
                    const coverUrl = realCovers[anime.id] || '';
                    return (
                      <div key={anime.id} className="group relative flex flex-col bg-surface-container-lowest hover:bg-surface-container-low rounded p-2 transition-all shadow-sm">
                        <div className="aspect-[3/4] w-full overflow-hidden rounded relative mb-2 bg-surface-container">
                          <Link href={`/anime/${anime.id}`}>
                            <img
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              src={coverUrl ? `/api/proxy-image?url=${encodeURIComponent(coverUrl)}` : `https://placehold.co/200x267/1b1b1e/858387?text=${encodeURIComponent(anime.title.substring(0, 8))}`}
                              alt={anime.title}
                              onError={(e) => { (e.currentTarget as HTMLImageElement).src = `https://placehold.co/200x267/1b1b1e/858387?text=${encodeURIComponent(anime.title.substring(0, 6))}`; }}
                            />
                          </Link>
                          <div className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded font-label-mono text-[10px] font-bold ${tierConfig.badgeBg} ${tierConfig.badgeText}`}>{anime.tier}</div>
                          <div className="absolute top-1.5 right-1.5 bg-black/80 text-amber-400 px-1.5 py-0.5 rounded font-label-mono text-[10px] font-bold">★ {anime.score.toFixed(1)}</div>
                          <div className="absolute bottom-1.5 left-1.5 bg-black/60 text-white px-1.5 py-0.5 rounded font-label-mono text-[10px]">#{String(idx + 1).padStart(2, '0')}</div>
                          {/* Remove button */}
                          <button
                            onClick={() => handleRemove(anime.id)}
                            className="absolute bottom-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600/90 text-white p-0.5 rounded"
                            title="Remove from shelf"
                          >
                            <span className="material-symbols-outlined text-sm leading-none">close</span>
                          </button>
                        </div>
                        <div className="flex flex-col min-w-0 mt-2">
                          <Link href={`/anime/${anime.id}`}>
                            <h4 className="font-headline-sm text-body-sm truncate text-on-surface hover:text-secondary transition-colors">{anime.title}</h4>
                          </Link>
                          <span className="font-label-mono text-[10px] text-outline truncate">{anime.studio} • {anime.year}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Sidebar */}
            <div className="lg:col-span-3 flex flex-col gap-4">

              {/* Ledger */}
              <div className="bg-surface-container-lowest rounded p-4 shadow-sm border border-surface-variant">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-surface-variant">
                  <h3 className="font-headline-sm text-on-surface">Matrix Ledger</h3>
                  <span className="font-label-mono text-[10px] text-outline uppercase">Live Stats</span>
                </div>

                {stats.total > 0 ? (
                  <>
                    <div className="flex items-baseline justify-between mb-3">
                      <span className="font-label-mono text-[11px] text-on-surface-variant uppercase">Canon Mean</span>
                      <span className="font-label-mono text-headline-sm text-primary font-semibold">{stats.mean.toFixed(2)}</span>
                    </div>

                    {/* Tier bar */}
                    <div className="w-full h-2.5 bg-surface-container-low rounded-full overflow-hidden flex mb-3">
                      {tiers.map((t) => {
                        const pct = stats.total > 0 ? (stats.counts[t.id] / stats.total) * 100 : 0;
                        if (pct === 0) return null;
                        return (
                          <div
                            key={t.id}
                            className={`h-full transition-all ${t.badgeBg}`}
                            style={{ width: `${pct}%` }}
                            title={`${t.subLabel}: ${Math.round(pct)}%`}
                          />
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-1 gap-1 font-label-mono text-[11px]">
                      {tiers.map((t) => {
                        const pct = stats.total > 0 ? Math.round((stats.counts[t.id] / stats.total) * 100) : 0;
                        return (
                          <div key={t.id} className="flex items-center justify-between py-0.5">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${t.badgeBg}`} />
                              <span className="text-on-surface-variant">{t.id}</span>
                              <span className="text-outline">{t.subLabel}</span>
                            </div>
                            <span className="text-on-surface">{stats.counts[t.id]} ({pct}%)</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <p className="text-outline font-label-mono text-[11px] text-center py-4">No entries yet</p>
                )}

                <div className="pt-3 mt-3 border-t border-surface-variant flex flex-col gap-1.5 font-label-mono text-[11px]">
                  <div className="flex justify-between py-0.5">
                    <span className="text-outline">SHELF</span>
                    <span className="text-on-surface truncate max-w-[140px] text-right">{SHELF_OPTIONS.find((s) => s.key === activeShelf)?.label}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-outline">TOTAL WORKS</span>
                    <span className="text-on-surface">{stats.total}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-surface-container-lowest rounded border border-surface-variant p-2 shadow-sm flex flex-col gap-0.5">
                <button onClick={() => setAddModal({ open: true, tier: 'S' })} className="w-full text-left px-3 py-2.5 text-body-sm font-headline-sm text-on-surface hover:bg-surface-container-low rounded flex items-center justify-between transition-colors">
                  <span className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-outline">add_circle</span>Add to Shelf</span>
                  <span className="material-symbols-outlined text-sm text-outline">chevron_right</span>
                </button>
                <button onClick={handleExport} className="w-full text-left px-3 py-2.5 text-body-sm font-headline-sm text-on-surface hover:bg-surface-container-low rounded flex items-center justify-between transition-colors">
                  <span className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-outline">image</span>Export as Image (JPG)</span>
                  <span className="material-symbols-outlined text-sm text-outline">chevron_right</span>
                </button>
                <button onClick={cycleSortOrder} className="w-full text-left px-3 py-2.5 text-body-sm font-headline-sm text-on-surface hover:bg-surface-container-low rounded flex items-center justify-between transition-colors">
                  <span className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-outline">{currentSortOption.icon}</span>{currentSortOption.label}</span>
                  <span className="material-symbols-outlined text-sm text-outline">swap_vert</span>
                </button>
                <Link href="/tracker/add" className="w-full text-left px-3 py-2.5 text-body-sm font-headline-sm text-on-surface hover:bg-surface-container-low rounded flex items-center justify-between transition-colors">
                  <span className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-outline">playlist_add</span>Add to Tracker</span>
                  <span className="material-symbols-outlined text-sm text-outline">chevron_right</span>
                </Link>
              </div>

              {/* Reorder hint */}
              {reorderMode && (
                <div className="bg-secondary-container/30 border border-secondary/20 rounded p-3 text-secondary font-label-mono text-[11px]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-sm">info</span>
                    <span className="font-semibold">REORDER MODE ACTIVE</span>
                  </div>
                  Hover cards and use ‹ › arrows to reorder within each tier row. Sort must be &quot;Editorial Order&quot;.
                </div>
              )}

              {/* Archival thesis */}
              <div className="bg-surface-container-low rounded p-4 text-on-surface-variant font-body-sm text-body-sm leading-relaxed border border-surface-variant">
                <div className="flex items-center gap-2 mb-2 text-primary font-headline-sm text-body-sm">
                  <span className="material-symbols-outlined text-sm">auto_stories</span>
                  <span>Archival Thesis</span>
                </div>
                Entries placed into the Canon Shelf require holistic narrative balance, distinctive visual direction, and emotional permanence over 3+ years of retrospective scrutiny.
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full bg-surface-container-lowest border-t border-surface-variant mt-8">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-on-surface-variant font-label-mono text-[11px]">
            <span>KURO ANIME LOG</span><span>•</span><span>CURATED CANON SHELF</span>
          </div>
          <div className="text-on-surface-variant font-label-mono text-[11px]">
            © 2025 Kuro. Architectural tracking for disciplined media consumption.
          </div>
        </div>
      </footer>
    </ProtectedRoute>
  );
}