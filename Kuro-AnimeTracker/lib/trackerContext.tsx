'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useAuth } from '@/lib/auth';

export type TrackerStatus = 'watching' | 'completed' | 'plan' | 'hold' | 'dropped';

export interface TrackerEntry {
  id: number;
  title: {
    romaji: string;
    english?: string;
    native?: string;
  };
  coverImage: {
    large: string;
    extraLarge?: string;
  };
  format?: string;
  status: TrackerStatus;
  progress: number;
  totalEpisodes: number | null;
  score: number | null;
  rewatches?: number;
  isFavorite?: boolean;
  alertsEnabled?: boolean;
  notes?: string;
  tags?: string[];
  startedDate?: string;
  finishedDate?: string;
  studio?: string;
  year?: number;
  updatedAt: string;
}

interface TrackerContextType {
  entries: TrackerEntry[];
  getEntry: (id: number) => TrackerEntry | undefined;
  updateStatus: (
    id: number,
    status: TrackerStatus,
    animeFallback?: Partial<TrackerEntry>
  ) => void;
  updateProgress: (id: number, progress: number) => void;
  updateScore: (id: number, score: number) => void;
  toggleFavorite: (id: number) => void;
  toggleAlerts: (id: number) => void;
  incrementRewatch: (id: number) => void;
  addOrUpdateEntry: (entry: Partial<TrackerEntry> & { id: number; title: { romaji: string } }) => void;
  removeEntry: (id: number) => void;
  markCompleted: (id: number) => void;
  forceSync: () => Promise<void>;
}

const LOCAL_STORAGE_KEY = 'kuro_tracker_entries_v2';

const INITIAL_ENTRIES: TrackerEntry[] = [
  {
    id: 154587,
    title: {
      romaji: 'Sousou no Frieren',
      english: "Frieren: Beyond Journey's End",
      native: '葬送のフリーレン',
    },
    coverImage: {
      large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-Ypv2mng8Xdqf.jpg',
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-Ypv2mng8Xdqf.jpg',
    },
    format: 'TV',
    status: 'watching',
    progress: 24,
    totalEpisodes: 28,
    score: 9.8,
    rewatches: 1,
    isFavorite: true,
    studio: 'Madhouse',
    year: 2023,
    tags: ['Masterpiece', 'High Fantasy', 'Philosophical'],
    notes: 'Episode 24 of Frieren explored time perception across mortal spans. Truly singular pacing.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 21,
    title: {
      romaji: 'ONE PIECE',
      english: 'One Piece',
      native: 'ONE PIECE',
    },
    coverImage: {
      large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/nx21-tXMN3Y20PIL9.jpg',
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/nx21-tXMN3Y20PIL9.jpg',
    },
    format: 'TV',
    status: 'watching',
    progress: 1120,
    totalEpisodes: 1178,
    score: 9.5,
    rewatches: 0,
    isFavorite: true,
    studio: 'Toei Animation',
    year: 1999,
    tags: ['Epic', 'Adventure'],
    notes: 'Egghead island arc animation quality has been unprecedented.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 19,
    title: {
      romaji: 'Monster',
      english: 'Monster',
      native: 'MONSTER',
    },
    coverImage: {
      large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx19-VKhjFuwEYJf0.jpg',
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx19-VKhjFuwEYJf0.jpg',
    },
    format: 'TV',
    status: 'completed',
    progress: 74,
    totalEpisodes: 74,
    score: 9.8,
    rewatches: 2,
    isFavorite: true,
    studio: 'Madhouse',
    year: 2004,
    tags: ['Psychological', 'Masterpiece', 'Noir'],
    notes: 'Johan Liebert remains the definitive antagonist in speculative fiction.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 30,
    title: {
      romaji: 'Shin Seiki Evangelion',
      english: 'Neon Genesis Evangelion',
      native: '新世紀エヴァンゲリオン',
    },
    coverImage: {
      large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx30-Ozf9jYYcN9gS.png',
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx30-Ozf9jYYcN9gS.png',
    },
    format: 'TV',
    status: 'completed',
    progress: 26,
    totalEpisodes: 26,
    score: 9.8,
    rewatches: 3,
    isFavorite: true,
    studio: 'Gainax',
    year: 1995,
    tags: ['Existential', '90s Cel', 'Psychological'],
    notes: 'Editorial pacing and sound design in episodes 25-26 are timeless avant-garde.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 144548,
    title: {
      romaji: 'Bocchi the Rock!',
      english: 'Bocchi the Rock!',
      native: 'ぼっち・ざ・ろっく！',
    },
    coverImage: {
      large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx144548-iB23d4WQFLFW.jpg',
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx144548-iB23d4WQFLFW.jpg',
    },
    format: 'TV',
    status: 'completed',
    progress: 12,
    totalEpisodes: 12,
    score: 8.8,
    rewatches: 1,
    isFavorite: true,
    studio: 'CloverWorks',
    year: 2022,
    tags: ['Music', 'Comedy', 'Creative Direction'],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 153518,
    title: {
      romaji: 'Dungeon Meshi',
      english: 'Delicious in Dungeon',
      native: 'ダンジョン飯',
    },
    coverImage: {
      large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx153518-qHcRPAOK49sj.jpg',
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx153518-qHcRPAOK49sj.jpg',
    },
    format: 'TV',
    status: 'plan',
    progress: 0,
    totalEpisodes: 24,
    score: null,
    rewatches: 0,
    isFavorite: false,
    studio: 'Trigger',
    year: 2024,
    tags: ['Fantasy', 'Culinary'],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 127230,
    title: {
      romaji: 'Chainsaw Man',
      english: 'Chainsaw Man',
      native: 'チェンソーマン',
    },
    coverImage: {
      large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx127230-FlochcFsyoF0.jpg',
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx127230-FlochcFsyoF0.jpg',
    },
    format: 'TV',
    status: 'hold',
    progress: 6,
    totalEpisodes: 12,
    score: 8.4,
    rewatches: 0,
    isFavorite: false,
    studio: 'MAPPA',
    year: 2022,
    tags: ['Action', 'Supernatural'],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 178550,
    title: {
      romaji: 'Ranma 1/2 (2024)',
      english: 'Ranma 1/2',
      native: 'らんま1/2',
    },
    coverImage: {
      large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx178550-8AONHBnAGpxf.jpg',
      extraLarge: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx178550-8AONHBnAGpxf.jpg',
    },
    format: 'TV',
    status: 'dropped',
    progress: 2,
    totalEpisodes: 12,
    score: 7.1,
    rewatches: 0,
    isFavorite: false,
    studio: 'MAPPA',
    year: 2024,
    tags: ['Comedy', 'Martial Arts'],
    updatedAt: new Date().toISOString(),
  },
];

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

export function TrackerProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<TrackerEntry[]>([]);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const forceSync = async () => {
    if (!user?.id) {
      setEntries([]);
      return;
    }
    try {
      const res = await fetch('/api/tracker');
      const data = await res.json();
      if (data.entries && Array.isArray(data.entries)) {
        setEntries(data.entries);
      } else {
        setEntries([]);
      }
    } catch (err) {
      console.error('Could not load tracker entries from DB:', err);
    }
  };

  // Reload from database whenever the logged-in user changes (login / logout / switch)
  useEffect(() => {
    forceSync();
  }, [user?.id]);

  const saveEntries = (updated: TrackerEntry[]) => {
    // 1. Optimistic UI update (instant visual feedback)
    setEntries(updated);
    
    if (!user?.id) return;
    
    // 2. Background sync to MongoDB (debounced to save DB writes)
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    
    syncTimeoutRef.current = setTimeout(() => {
      fetch('/api/tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: updated }),
      }).catch((err) => {
        console.error('Could not persist tracker entries to DB:', err);
      });
    }, 1000); // Wait 1 second after last interaction before syncing
  };

  const getEntry = (id: number) => {
    return entries.find((e) => e.id === Number(id));
  };

  const updateStatus = (
    id: number,
    status: TrackerStatus,
    animeFallback?: Partial<TrackerEntry>
  ) => {
    const numId = Number(id);
    const existingIndex = entries.findIndex((e) => e.id === numId);

    if (existingIndex >= 0) {
      const updated = [...entries];
      const current = updated[existingIndex];
      let newProgress = current.progress;

      // If marked completed and has total episodes, set progress to total
      if (status === 'completed' && current.totalEpisodes) {
        newProgress = current.totalEpisodes;
      } else if (status === 'plan') {
        newProgress = 0;
      }

      updated[existingIndex] = {
        ...current,
        status,
        progress: newProgress,
        updatedAt: new Date().toISOString(),
      };
      saveEntries(updated);
    } else if (animeFallback && animeFallback.title) {
      // Add new entry with this status
      const total = animeFallback.totalEpisodes || null;
      const newEntry: TrackerEntry = {
        id: numId,
        title: animeFallback.title,
        coverImage: animeFallback.coverImage || { large: '' },
        format: animeFallback.format || 'TV',
        status,
        progress: status === 'completed' && total ? total : 0,
        totalEpisodes: total,
        score: animeFallback.score || null,
        rewatches: 0,
        isFavorite: false,
        studio: animeFallback.studio || '',
        year: animeFallback.year || new Date().getFullYear(),
        tags: animeFallback.tags || [],
        notes: animeFallback.notes || '',
        updatedAt: new Date().toISOString(),
      };
      saveEntries([newEntry, ...entries]);
    }
  };

  const updateProgress = (id: number, progress: number) => {
    const numId = Number(id);
    const updated = entries.map((entry) => {
      if (entry.id === numId) {
        const max = entry.totalEpisodes || 9999;
        const validProgress = Math.max(0, Math.min(max, progress));
        const autoCompleted =
          entry.totalEpisodes && validProgress >= entry.totalEpisodes;
        return {
          ...entry,
          progress: validProgress,
          status: autoCompleted ? ('completed' as TrackerStatus) : entry.status,
          updatedAt: new Date().toISOString(),
        };
      }
      return entry;
    });
    saveEntries(updated);
  };

  const updateScore = (id: number, score: number) => {
    const numId = Number(id);
    const updated = entries.map((entry) => {
      if (entry.id === numId) {
        return {
          ...entry,
          score,
          updatedAt: new Date().toISOString(),
        };
      }
      return entry;
    });
    saveEntries(updated);
  };

  const toggleFavorite = (id: number) => {
    const numId = Number(id);
    const updated = entries.map((entry) => {
      if (entry.id === numId) {
        return {
          ...entry,
          isFavorite: !entry.isFavorite,
          updatedAt: new Date().toISOString(),
        };
      }
      return entry;
    });
    saveEntries(updated);
  };

  const toggleAlerts = (id: number) => {
    const numId = Number(id);
    const updated = entries.map((entry) => {
      if (entry.id === numId) {
        return {
          ...entry,
          alertsEnabled: !entry.alertsEnabled,
          updatedAt: new Date().toISOString(),
        };
      }
      return entry;
    });
    saveEntries(updated);
  };

  const incrementRewatch = (id: number) => {
    const numId = Number(id);
    const updated = entries.map((entry) => {
      if (entry.id === numId) {
        return {
          ...entry,
          rewatches: (entry.rewatches || 0) + 1,
          updatedAt: new Date().toISOString(),
        };
      }
      return entry;
    });
    saveEntries(updated);
  };

  const addOrUpdateEntry = (
    data: Partial<TrackerEntry> & { id: number; title: { romaji: string } }
  ) => {
    const numId = Number(data.id);
    const existingIndex = entries.findIndex((e) => e.id === numId);

    if (existingIndex >= 0) {
      const updated = [...entries];
      updated[existingIndex] = {
        ...updated[existingIndex],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      saveEntries(updated);
    } else {
      const newEntry: TrackerEntry = {
        id: numId,
        title: data.title,
        coverImage: data.coverImage || { large: '' },
        format: data.format || 'TV',
        status: data.status || 'watching',
        progress: data.progress || 0,
        totalEpisodes: data.totalEpisodes || null,
        score: data.score || null,
        rewatches: data.rewatches || 0,
        isFavorite: data.isFavorite || false,
        studio: data.studio || '',
        year: data.year || new Date().getFullYear(),
        tags: data.tags || [],
        notes: data.notes || '',
        startedDate: data.startedDate,
        finishedDate: data.finishedDate,
        updatedAt: new Date().toISOString(),
      };
      saveEntries([newEntry, ...entries]);
    }
  };

  const removeEntry = (id: number) => {
    const numId = Number(id);
    saveEntries(entries.filter((e) => e.id !== numId));
  };

  const markCompleted = (id: number) => {
    const numId = Number(id);
    const updated = entries.map((entry) => {
      if (entry.id === numId) {
        return {
          ...entry,
          status: 'completed' as TrackerStatus,
          progress: entry.totalEpisodes || entry.progress,
          updatedAt: new Date().toISOString(),
        };
      }
      return entry;
    });
    saveEntries(updated);
  };

  return (
    <TrackerContext.Provider
      value={{
        entries,
        getEntry,
        updateStatus,
        updateProgress,
        updateScore,
        toggleFavorite,
        toggleAlerts,
        incrementRewatch,
        addOrUpdateEntry,
        removeEntry,
        markCompleted,
        forceSync,
      }}
    >
      {children}
    </TrackerContext.Provider>
  );
}

export function useTracker(): TrackerContextType {
  const context = useContext(TrackerContext);
  if (!context) {
    throw new Error('useTracker must be used within a TrackerProvider');
  }
  return context;
}
