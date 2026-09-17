'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/lib/auth';

export type NotificationCategory = 'today' | 'weekly' | 'sync' | 'system';

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  date: string; // ISO string
  read: boolean;
  
  // For Anime/Alert specific notifications
  animeId?: number;
  coverImage?: string;
  episode?: number;
  airingAt?: string; // Broadcast time
  network?: string;
  badge?: string; // e.g. "AIRING IN 18 HOURS"
}

interface NotificationContextType {
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'date' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  unreadCount: number;
  settings: {
    browserPush: boolean;
    weeklyDigest: boolean;
  };
  toggleSetting: (setting: 'browserPush' | 'weeklyDigest') => void;
}

const LOCAL_STORAGE_KEY = 'kuro_notifications_v1';

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    category: 'today',
    title: 'Sousou no Frieren Season 2',
    message: 'Episode 09: “The Height of Magic”',
    date: new Date().toISOString(),
    read: false,
    animeId: 154587,
    coverImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-Ypv2mng8Xdqf.jpg',
    episode: 9,
    airingAt: '23:00 JST',
    network: 'NTV',
    badge: 'AIRING IN 18 HOURS',
  },
  {
    id: 'notif_2',
    category: 'weekly',
    title: 'Dandadan — Episode 05',
    message: 'Chapter 14 Adaption: “Where’s the Granny?” Special sound design by Kensuke Ushio.',
    date: new Date(Date.now() - 86400000).toISOString(),
    read: false,
    animeId: 171018,
    coverImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171018-f02MhU9m50f3.jpg',
    episode: 5,
    airingAt: '00:26 JST',
    network: 'MBS / TBS',
    badge: 'AIRS TONIGHT 00:26 JST',
  },
  {
    id: 'notif_3',
    category: 'sync',
    title: 'AniList Ingest Successful',
    message: 'Synchronized 142 titles and 1,380 episodes from account @Aoi_Chrono with 0 conflict flags.',
    date: new Date(Date.now() - 7200000).toISOString(),
    read: false,
  },
  {
    id: 'notif_4',
    category: 'system',
    title: 'Season Archive Milestone Reached',
    message: 'You completed 86% of your Fall 2024 Watchlist! 24 episodes logged this month across 6 ongoing serials.',
    date: new Date(Date.now() - 172800000).toISOString(),
    read: true,
  },
];

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  // Each user gets their own notification bucket
  const storageKey = user?.id ? `kuro_notifications_${user.id}_v1` : null;
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [settings, setSettings] = useState({
    browserPush: true,
    weeklyDigest: true,
  });

  // Reload when the logged-in user changes
  useEffect(() => {
    Promise.resolve().then(() => {
      if (!storageKey) {
        setNotifications([]);
        return;
      }
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          setNotifications(JSON.parse(stored));
        } else {
          setNotifications([]); // New user — no notifications yet
        }
      } catch (e) {
        console.warn('Could not load notifications from storage:', e);
      }
    });
  }, [storageKey]);

  const saveNotifications = (updated: AppNotification[]) => {
    setNotifications(updated);
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not persist notifications:', e);
    }
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'date' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toISOString(),
      read: false,
    };
    saveNotifications([newNotif, ...notifications]);
  };

  const markAsRead = (id: string) => {
    saveNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    saveNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    saveNotifications(notifications.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleSetting = (setting: 'browserPush' | 'weeklyDigest') => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    // We don't persist settings to localStorage for now to keep it simple, 
    // but in a real app this would sync to backend/storage.
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        unreadCount,
        settings,
        toggleSetting,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
