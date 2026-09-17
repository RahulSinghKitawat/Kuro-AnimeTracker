'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useNotifications, NotificationCategory } from '@/lib/notificationContext';

export default function NotificationsBroadcastScheduleAlerts() {
  const { notifications, markAsRead, markAllAsRead, removeNotification, unreadCount, settings, toggleSetting } = useNotifications();
  const [activeFilter, setActiveFilter] = useState<'all' | NotificationCategory>('all');
  const [clock, setClock] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const jstDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
      const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const str = `${days[jstDate.getDay()]} ${jstDate.getHours().toString().padStart(2, '0')}:${jstDate.getMinutes().toString().padStart(2, '0')}:${jstDate.getSeconds().toString().padStart(2, '0')} JST`;
      setClock(str);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredNotifications = notifications.filter(n => activeFilter === 'all' || n.category === activeFilter);
  const animeAlerts = filteredNotifications.filter(n => ['today', 'weekly'].includes(n.category));
  const systemAlerts = filteredNotifications.filter(n => ['sync', 'system'].includes(n.category));

  const formatTimeAgo = (dateStr: string) => {
    const ms = Date.now() - new Date(dateStr).getTime();
    if (ms < 60000) return 'Just now';
    if (ms < 3600000) return `${Math.floor(ms / 60000)}m ago`;
    if (ms < 86400000) return `${Math.floor(ms / 3600000)}h ago`;
    return `${Math.floor(ms / 86400000)}d ago`;
  };

  return (
    <ProtectedRoute redirectPath="/notifications">
      <Header activePage="notifications" />
      <main className="w-full pt-16 min-h-screen bg-background">
        <div className="flex flex-col w-full">
          <div className="relative w-full max-w-[1280px] mx-auto px-4 lg:px-8 py-8">
            {/* Background elements */}
            <div className="absolute top-12 right-24 w-96 h-96 rounded-full bg-secondary/5 blur-3xl pointer-events-none -z-10"></div>
            <div className="absolute top-80 left-10 w-72 h-72 rounded-full bg-tertiary-fixed/10 blur-3xl pointer-events-none -z-10"></div>

            <div className="flex flex-col gap-4 mb-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2 font-label-mono text-caption text-on-surface-variant tracking-wider uppercase">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  <span>System Dispatch</span>
                  <span className="text-outline-variant">/</span>
                  <span>Broadcast Alerts &amp; Activity</span>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                    className="px-3 py-1.5 text-on-surface bg-surface-container hover:bg-surface-variant disabled:opacity-50 transition-colors rounded font-label-md text-label-md flex items-center gap-1 focus:outline-none shadow-sm"
                  >
                    <span className="material-symbols-outlined text-sm">done_all</span>
                    <span>Mark all as read</span>
                  </button>
                  <button className="px-3 py-1.5 text-on-surface-variant hover:text-on-surface bg-surface-container-low hover:bg-surface-container transition-colors rounded font-label-md text-label-md flex items-center gap-1 focus:outline-none">
                    <span className="material-symbols-outlined text-sm">tune</span>
                    <span>Settings</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                  <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">Schedule Dispatches &amp; Alerts</h1>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-2xl">
                    Episode premiere countdowns, automated AniList sync updates, and weekly release alerts curated for your archive.
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-surface-container-lowest px-4 py-2 rounded shadow-sm self-start lg:self-auto">
                  <span className="material-symbols-outlined text-secondary text-base animate-pulse">radar</span>
                  <div className="flex flex-col">
                    <span className="font-label-mono text-caption text-on-surface-variant">TOKYO BROADCAST RADAR</span>
                    <span className="font-label-mono text-label-md text-on-surface font-semibold">{clock || '...'}</span>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-6 mt-6 overflow-x-auto pb-1 no-scrollbar border-b border-surface-variant">
                {[
                  { id: 'all', label: 'All Alerts', count: notifications.length },
                  { id: 'today', label: 'Airing Today', count: notifications.filter(n => n.category === 'today').length },
                  { id: 'weekly', label: 'Weekly Releases', count: notifications.filter(n => n.category === 'weekly').length },
                  { id: 'sync', label: 'Account & Sync', count: notifications.filter(n => n.category === 'sync' || n.category === 'system').length },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id as 'all' | NotificationCategory)}
                    className={`font-label-md text-label-md pb-2 flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 ${activeFilter === tab.id ? 'text-primary border-primary font-bold' : 'text-on-surface-variant border-transparent hover:text-on-surface hover:border-outline-variant'}`}
                  >
                    <span>{tab.label}</span>
                    <span className={`${activeFilter === tab.id ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'} font-label-mono text-caption px-1.5 py-0.5 rounded-full`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column (Main Feed) */}
              <div className="lg:col-span-8 flex flex-col gap-8">
                
                {filteredNotifications.length === 0 ? (
                  <div className="p-12 text-center bg-surface-container-lowest rounded border border-surface-variant">
                    <span className="material-symbols-outlined text-4xl text-outline mb-2">notifications_paused</span>
                    <h3 className="font-headline-sm text-on-surface">No alerts</h3>
                    <p className="font-body-sm text-on-surface-variant">You're all caught up.</p>
                  </div>
                ) : (
                  <>
                    {/* Imminent Transmissions (Anime Alerts) */}
                    {animeAlerts.length > 0 && (
                      <section className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-label-mono text-caption text-on-surface-variant tracking-wider uppercase">01 // IMMINENT TRANSMISSIONS</span>
                            <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
                          </div>
                        </div>

                        {animeAlerts.map(notif => (
                          <div key={notif.id} className={`bg-surface-container-lowest p-4 lg:p-6 rounded shadow-sm relative overflow-hidden transition-all ${notif.read ? 'opacity-80' : 'ring-1 ring-secondary/30'}`}>
                            {!notif.read && <div className="absolute top-0 left-0 bottom-0 w-1 bg-secondary"></div>}
                            <div className="absolute top-2 right-2 flex items-center gap-1">
                              {!notif.read && (
                                <button onClick={() => markAsRead(notif.id)} className="p-1 hover:bg-surface-container text-outline hover:text-on-surface rounded transition-colors" title="Mark as read">
                                  <span className="material-symbols-outlined text-[16px]">check</span>
                                </button>
                              )}
                              <button onClick={() => removeNotification(notif.id)} className="p-1 hover:bg-error-container text-outline hover:text-error rounded transition-colors" title="Dismiss">
                                <span className="material-symbols-outlined text-[16px]">close</span>
                              </button>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-6 items-start mt-2">
                              {notif.coverImage && (
                                <Link href={`/anime/${notif.animeId}`}>
                                  <div className="w-24 sm:w-28 h-32 sm:h-36 shrink-0 rounded overflow-hidden relative shadow-sm hover:opacity-90 transition-opacity">
                                    <img className="w-full h-full object-cover" src={notif.coverImage} alt={notif.title} crossOrigin="anonymous"/>
                                    {notif.episode && (
                                      <div className="absolute top-1.5 left-1.5 bg-primary/80 backdrop-blur-sm text-on-primary font-label-mono text-caption px-1 rounded">
                                        EP {notif.episode.toString().padStart(2, '0')}
                                      </div>
                                    )}
                                  </div>
                                </Link>
                              )}

                              <div className="flex flex-col flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                                  <div className="flex items-center gap-2">
                                    {notif.badge && (
                                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-label-mono text-caption font-medium ${notif.category === 'today' ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-surface-container-high text-on-surface'}`}>
                                        {notif.category === 'today' && <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>}
                                        {notif.badge}
                                      </span>
                                    )}
                                    {notif.network && <span className="font-label-mono text-caption text-on-surface-variant">{notif.network}</span>}
                                  </div>
                                  <span className="font-label-mono text-caption text-on-surface-variant">{formatTimeAgo(notif.date)}</span>
                                </div>
                                
                                <Link href={`/anime/${notif.animeId}`}>
                                  <h2 className="font-headline-md text-headline-md text-on-surface truncate hover:text-secondary transition-colors">{notif.title}</h2>
                                </Link>
                                <p className="font-body-md text-body-md text-on-surface-variant mt-0.5 italic">{notif.message}</p>

                                <div className="flex items-center gap-2 flex-wrap mt-4">
                                  {notif.animeId && (
                                    <Link href={`/anime/${notif.animeId}`} className="px-3 py-1 bg-primary text-on-primary font-label-md text-label-md rounded flex items-center gap-1 hover:opacity-90 transition-opacity">
                                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                                      <span>View Anime</span>
                                    </Link>
                                  )}
                                  <button onClick={() => markAsRead(notif.id)} className="px-3 py-1 bg-surface-container text-on-surface font-label-md text-label-md rounded flex items-center gap-1 hover:bg-surface-variant transition-colors">
                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                    <span>Mark Watched</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </section>
                    )}

                    {/* Activity Ledger (System Alerts) */}
                    {systemAlerts.length > 0 && (
                      <section className="flex flex-col gap-4 mt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-label-mono text-caption text-on-surface-variant tracking-wider uppercase">02 // ACTIVITY &amp; ARCHIVE LEDGER</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
                          </div>
                        </div>
                        
                        <div className="bg-surface-container-lowest rounded shadow-sm divide-y divide-surface-container">
                          {systemAlerts.map(notif => (
                            <div key={notif.id} className={`p-4 flex items-start gap-4 transition-colors relative ${notif.read ? 'hover:bg-surface-container-low' : 'bg-surface-container-low/50'}`}>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${notif.category === 'sync' ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-surface-container-high text-on-surface'}`}>
                                <span className="material-symbols-outlined text-base">
                                  {notif.category === 'sync' ? 'sync' : 'verified'}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span className={`font-headline-sm text-headline-sm ${notif.read ? 'text-on-surface' : 'text-primary font-bold'}`}>{notif.title}</span>
                                  <span className="font-label-mono text-caption text-on-surface-variant whitespace-nowrap">{formatTimeAgo(notif.date)}</span>
                                </div>
                                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{notif.message}</p>
                              </div>

                              {/* Actions menu */}
                              <div className="flex items-center gap-1 ml-4 self-center">
                                {!notif.read && (
                                  <button onClick={() => markAsRead(notif.id)} className="p-1 hover:bg-surface-container text-outline hover:text-on-surface rounded transition-colors" title="Mark as read">
                                    <span className="material-symbols-outlined text-[16px]">check</span>
                                  </button>
                                )}
                                <button onClick={() => removeNotification(notif.id)} className="p-1 hover:bg-error-container text-outline hover:text-error rounded transition-colors" title="Dismiss">
                                  <span className="material-symbols-outlined text-[16px]">close</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                  </>
                )}
              </div>

              {/* Right Column (Sidebar) */}
              <aside className="lg:col-span-4 flex flex-col gap-6">
                
                {/* Dispatch Channels */}
                <div className="bg-surface-container-lowest p-4 rounded shadow-sm border border-surface-variant">
                  <div className="flex items-center justify-between pb-3 border-b border-surface-container">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-on-surface text-lg">tune</span>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface">Dispatch Channels</h3>
                    </div>
                    <span className="font-label-mono text-caption text-on-surface-variant">Active</span>
                  </div>
                  <div className="flex flex-col gap-4 mt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-on-surface-variant">notifications_active</span>
                        <div>
                          <div className="font-body-md text-body-md text-on-surface font-medium">Browser Web Push</div>
                          <div className="font-caption text-caption text-on-surface-variant">Instant desktop chime</div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={settings.browserPush}
                          onChange={() => {
                            toggleSetting('browserPush');
                            alert(settings.browserPush ? 'Browser Push Notifications disabled.' : 'Browser Push Notifications enabled.');
                          }}
                        />
                        <div className="w-9 h-5 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-primary after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-on-surface-variant">mail</span>
                        <div>
                          <div className="font-body-md text-body-md text-on-surface font-medium">Weekly Digest</div>
                          <div className="font-caption text-caption text-on-surface-variant">Sunday 08:00 AM summary</div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={settings.weeklyDigest}
                          onChange={() => {
                            toggleSetting('weeklyDigest');
                            alert(settings.weeklyDigest ? 'Weekly Digest disabled.' : 'Weekly Digest enabled.');
                          }}
                        />
                        <div className="w-9 h-5 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-primary after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-low p-4 rounded border-0">
                  <div className="flex items-center gap-1.5 text-on-surface-variant mb-1">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    <span className="font-label-mono text-caption uppercase tracking-wider">Archive Philosophy</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant italic">
                    “Treating broadcast reception as a deliberate appointment transforms transient streaming into lasting literary engagement.”
                  </p>
                  <div className="mt-2 text-right font-label-mono text-caption text-on-surface-variant">
                    — Kuro Catalog Log
                  </div>
                </div>
              </aside>

            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}