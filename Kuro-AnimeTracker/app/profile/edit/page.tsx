"use client";
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth';

export default function EditProfilePreferences() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [unsaved, setUnsaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form States
  const [avatarUrl, setAvatarUrl] = useState("");
  const [handle, setHandle] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [bio, setBio] = useState("");
  const [name, setName] = useState("");

  // Sync state with logged in user
  useEffect(() => {
    if (user && !unsaved) {
      setAvatarUrl(user.avatar || "");
      setHandle(user.handle || "");
      setLocation(user.location || "");
      setWebsite(user.website || "");
      setBio(user.bio || "");
      setName(user.name || "");
    }
  }, [user, unsaved]);
  
  // Notifications States
  const [simulcast, setSimulcast] = useState(true);
  const [digest, setDigest] = useState(true);

  // Helper to determine active tab styling
  const getTabClass = (tabId: string, isDanger = false) => {
    if (activeTab === tabId) {
      if (isDanger) return "w-full text-left px-space-md py-space-sm rounded font-headline-sm text-headline-sm flex items-center justify-between bg-error/20 text-error transition-all";
      return "w-full text-left px-space-md py-space-sm rounded font-headline-sm text-headline-sm flex items-center justify-between bg-surface-container text-on-surface transition-all";
    } else {
      if (isDanger) return "w-full text-left px-space-md py-space-sm rounded font-body-md text-body-md flex items-center justify-between text-error hover:bg-error-container/30 transition-all";
      return "w-full text-left px-space-md py-space-sm rounded font-body-md text-body-md flex items-center justify-between text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all";
    }
  };

  const handleAvatarUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File size exceeds 2MB limit. Please choose a smaller image.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
        setUnsaved(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl("");
    setUnsaved(true);
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<any>>) => (e: any) => {
    setter(e.target.type === 'checkbox' ? e.target.checked : e.target.value);
    setUnsaved(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handle,
          name,
          avatar: avatarUrl,
          location,
          website,
          bio
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save profile');
      }

      await refreshUser();
      setUnsaved(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    if (user) {
      setAvatarUrl(user.avatar || "");
      setHandle(user.handle || "");
      setLocation(user.location || "");
      setWebsite(user.website || "");
      setBio(user.bio || "");
      setName(user.name || "");
    }
    setUnsaved(false);
  };

  return (
    <ProtectedRoute redirectPath="/profile/edit">
      <Header activePage="profile" />
      <main className="w-full pt-16 min-h-screen bg-background">
        <div className="flex flex-col w-full">
          <div className="max-w-[1280px] w-full mx-auto px-margin-mobile lg:px-margin py-space-lg">

            <div className="flex items-center justify-between gap-space-sm mb-space-md">
              <div className="flex items-center gap-space-xs font-label-mono text-caption text-on-surface-variant">
                <Link className="hover:text-primary transition-colors" href="#">SETTINGS</Link>
                <span>/</span>
                <Link className="hover:text-primary transition-colors" href="#">ARCHIVIST</Link>
                <span>/</span>
                <span className="text-primary font-semibold">EDIT PROFILE &amp; PREFERENCES</span>
              </div>
              <div className="hidden sm:flex items-center gap-space-xs font-label-mono text-caption text-on-surface-variant bg-surface-container px-space-sm py-1 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                <span>INDEXED ARCHIVE NODE: {user?.id?.substring(0, 8).toUpperCase() || 'UNKNOWN'}</span>
              </div>
            </div>

            <div className="mb-space-xl pb-space-lg bg-surface-container-low p-space-lg lg:p-space-xl rounded-xl relative overflow-hidden">
              <div className="relative z-10 max-w-2xl">
                <span className="font-label-mono text-caption uppercase tracking-wider text-on-surface-variant block mb-1">Curation Ledger // Configuration</span>
                <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight mb-2">Edit Profile &amp; Settings</h1>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Manage your public archivist persona, display identity, list privacy, and notifications.
                </p>
              </div>
              <div className="absolute right-4 -bottom-10 opacity-5 pointer-events-none select-none font-headline-xl text-[160px] text-primary">
                {user?.id?.substring(4, 8).toUpperCase() || '0000'}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">

              <aside className="lg:col-span-3 sticky top-24 space-y-space-sm">
                <div className="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm space-y-1">
                  <button className={getTabClass('profile')} onClick={() => setActiveTab('profile')}>
                    <span className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-[18px]">badge</span>
                      <span>Public Profile</span>
                    </span>
                    <span className="font-label-mono text-caption text-primary opacity-80">01</span>
                  </button>
                  <button className={getTabClass('notifications')} onClick={() => setActiveTab('notifications')}>
                    <span className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-[18px]">notifications_active</span>
                      <span>Notification Matrix</span>
                    </span>
                    <span className="font-label-mono text-caption opacity-40">02</span>
                  </button>
                  <div className="pt-2 my-1">
                    <button className={getTabClass('danger', true)} onClick={() => setActiveTab('danger')}>
                      <span className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-[18px]">warning</span>
                        <span>Danger Zone</span>
                      </span>
                      <span className="font-label-mono text-caption text-error opacity-60">!!</span>
                    </button>
                  </div>
                </div>

              </aside>

              <div className="lg:col-span-9 space-y-space-lg">

                {activeTab === 'profile' && (
                  <section className="bg-surface-container-lowest p-space-lg lg:p-space-xl rounded-xl shadow-sm space-y-space-lg">
                    <div className="flex items-center justify-between pb-space-sm bg-surface-container-lowest">
                      <div>
                        <span className="font-label-mono text-caption text-secondary uppercase font-semibold">Ledger Node 01</span>
                        <h2 className="font-headline-lg text-headline-lg text-on-surface">Archivist Persona</h2>
                      </div>
                      <span className="material-symbols-outlined text-outline">fingerprint</span>
                    </div>

                    <div className="p-space-md bg-surface-container-low rounded-xl flex flex-col sm:flex-row items-center gap-space-lg">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-full overflow-hidden shadow-sm bg-surface-variant flex items-center justify-center text-on-surface-variant">
                          {avatarUrl ? (
                            <img alt="Archivist Portrait" className="w-full h-full object-cover" src={avatarUrl} />
                          ) : (
                            <span className="material-symbols-outlined text-4xl">person</span>
                          )}
                        </div>
                        {avatarUrl && (
                          <div className="absolute -bottom-1 -right-1 bg-primary text-on-primary rounded-full p-1 shadow-sm">
                            <span className="material-symbols-outlined text-[14px] block">verified</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-center sm:text-left space-y-2">
                        <div>
                          <h3 className="font-headline-sm text-headline-sm text-on-surface">Portrait Photograph</h3>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">Optimal proportions: 1:1 square. Supports SVG, WEBP, or PNG up to 4MB.</p>
                        </div>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-space-sm pt-1 w-full">
                          <input 
                            className="w-full sm:max-w-[200px] bg-surface-container-lowest border border-surface-variant px-3 py-1.5 rounded font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors" 
                            type="url" 
                            placeholder="Paste image URL..."
                            value={avatarUrl}
                            onChange={(e) => { setAvatarUrl(e.target.value); setUnsaved(true); }}
                          />
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                          />
                          <button onClick={handleAvatarUploadClick} className="px-space-md py-1.5 bg-surface-container-high text-on-surface rounded font-label-md text-label-md hover:bg-surface-variant transition-all flex items-center gap-1 border border-surface-variant" type="button">
                            <span className="material-symbols-outlined text-sm">upload</span>
                            <span>Upload</span>
                          </button>
                          {avatarUrl && (
                            <button onClick={handleRemoveAvatar} className="px-space-md py-1.5 bg-surface-container text-on-surface-variant rounded font-label-md text-label-md hover:bg-surface-variant hover:text-error transition-all" type="button">
                              Clear
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                      <div className="space-y-1">
                        <label className="block font-label-mono text-caption text-on-surface-variant uppercase" htmlFor="name">
                          Display Name <span className="text-error">*</span>
                        </label>
                        <div className="relative">
                          <input 
                            className="w-full bg-surface-container-low px-3 py-2 rounded font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container transition-colors" 
                            id="name" 
                            type="text" 
                            value={name} 
                            onChange={handleInputChange(setName)} 
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block font-label-mono text-caption text-on-surface-variant uppercase" htmlFor="handle">
                          Display Identifier / Handle <span className="text-error">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-label-mono text-on-surface-variant text-body-sm">@</span>
                          <input 
                            className="w-full bg-surface-container-low pl-8 pr-3 py-2 rounded font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container transition-colors" 
                            id="handle" 
                            type="text" 
                            value={handle} 
                            onChange={handleInputChange(setHandle)} 
                          />
                        </div>
                        <span className="block font-caption text-caption text-on-surface-variant">Public slug: kuro.archive/@{handle || 'handle'}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="block font-label-mono text-caption text-on-surface-variant uppercase">Archivist Record ID</label>
                          <span className="font-label-mono text-caption text-secondary">IMMUTABLE</span>
                        </div>
                        <div className="relative">
                          <input className="w-full bg-surface-container px-3 py-2 rounded font-label-mono text-body-sm text-on-surface cursor-not-allowed select-all" readOnly type="text" value={user?.id || ''} />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-sm text-outline">lock</span>
                        </div>
                        <span className="block font-caption text-caption text-on-surface-variant">Canonical serial assigned on genesis registration.</span>
                      </div>

                      <div className="space-y-1">
                        <label className="block font-label-mono text-caption text-on-surface-variant uppercase" htmlFor="location">Station / Node Location</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-body-sm text-on-surface-variant">near_me</span>
                          <input 
                            className="w-full bg-surface-container-low pl-9 pr-3 py-2 rounded font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container transition-colors" 
                            id="location" 
                            type="text" 
                            value={location}
                            onChange={handleInputChange(setLocation)} 
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block font-label-mono text-caption text-on-surface-variant uppercase" htmlFor="website">Index Terminal / Hyperlink</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-body-sm text-on-surface-variant">link</span>
                          <input 
                            className="w-full bg-surface-container-low pl-9 pr-3 py-2 rounded font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container transition-colors" 
                            id="website" 
                            type="url" 
                            value={website}
                            onChange={handleInputChange(setWebsite)} 
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2 space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="block font-label-mono text-caption text-on-surface-variant uppercase" htmlFor="bio">Archival Manifesto &amp; Curator Statement</label>
                          <span className="font-label-mono text-caption text-on-surface-variant" id="char-count">{bio.length} / 300</span>
                        </div>
                        <textarea 
                          className="w-full bg-surface-container-low p-3 rounded font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container transition-colors resize-none leading-relaxed" 
                          id="bio" 
                          maxLength={300} 
                          rows={4} 
                          value={bio}
                          onChange={handleInputChange(setBio)} 
                        />
                        <span className="block font-caption text-caption text-on-surface-variant">Displayed proudly at the zenith of your public ledger and seasonal retrospectives.</span>
                      </div>
                    </div>
                  </section>
                )}

                {activeTab === 'notifications' && (
                  <section className="bg-surface-container-lowest p-space-lg lg:p-space-xl rounded-xl shadow-sm space-y-space-lg">
                    <div className="flex items-center justify-between pb-space-sm bg-surface-container-lowest">
                      <div>
                        <span className="font-label-mono text-caption text-secondary uppercase font-semibold">Ledger Node 02</span>
                        <h2 className="font-headline-lg text-headline-lg text-on-surface">Notification Matrix</h2>
                      </div>
                      <span className="material-symbols-outlined text-outline">notifications</span>
                    </div>
                    <div className="space-y-space-sm">
                      <div className="p-space-md bg-surface-container-low rounded-xl flex items-center justify-between cursor-pointer hover:bg-surface-container transition-colors" onClick={() => { setSimulcast(!simulcast); setUnsaved(true); }}>
                        <div>
                          <span className="font-headline-sm text-headline-sm text-on-surface block">Simulcast Episode Broadcasts</span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">Receive silent push pings when tracked seasonal episodes air in Tokyo.</span>
                        </div>
                        <input checked={simulcast} readOnly className="accent-primary w-4 h-4 pointer-events-none" type="checkbox" />
                      </div>
                      <div className="p-space-md bg-surface-container-low rounded-xl flex items-center justify-between cursor-pointer hover:bg-surface-container transition-colors" onClick={() => { setDigest(!digest); setUnsaved(true); }}>
                        <div>
                          <span className="font-headline-sm text-headline-sm text-on-surface block">Quarterly Retrospective Digest</span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">Seasonal breakdown of completion metrics and hours invested.</span>
                        </div>
                        <input checked={digest} readOnly className="accent-primary w-4 h-4 pointer-events-none" type="checkbox" />
                      </div>
                    </div>
                  </section>
                )}

                {activeTab === 'danger' && (
                  <section className="bg-surface-container-lowest p-space-lg lg:p-space-xl rounded-xl shadow-sm space-y-space-lg">
                    <div className="flex items-center justify-between pb-space-sm bg-surface-container-lowest">
                      <div>
                        <span className="font-label-mono text-caption text-error uppercase font-semibold">Irreversible Operations</span>
                        <h2 className="font-headline-lg text-headline-lg text-error">Danger Zone</h2>
                      </div>
                      <span className="material-symbols-outlined text-error">warning</span>
                    </div>
                    <div className="p-space-md bg-error-container/20 rounded-xl space-y-3">
                      <span className="font-headline-sm text-headline-sm text-on-error-container block">Purge Identity &amp; Erase Ledger Archive</span>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Permanently purges all watch records, custom reviews, ratings, and archivist handle registration. This operation cannot be reversed.
                      </p>
                      <button className="px-space-md py-2 bg-error text-on-error font-label-md text-label-md rounded hover:bg-error/90 transition-all">
                        Initiate Account Decommissioning
                      </button>
                    </div>
                  </section>
                )}

                {unsaved && (
                  <div className="sticky bottom-4 z-40 bg-surface-container-lowest/95 backdrop-blur-md p-space-md rounded-xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-space-md">
                    <div className="flex items-center gap-space-xs font-label-mono text-caption text-on-surface-variant">
                      <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim"></span>
                      <span>UNSAVED CHANGES DETECTED IN NODE 01</span>
                    </div>
                    <div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
                      <button onClick={handleDiscard} className="w-full sm:w-auto px-space-lg py-2.5 rounded bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors focus:outline-none" type="button">
                        Discard Changes
                      </button>
                      <button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto px-space-xl py-2.5 rounded bg-primary text-on-primary font-headline-sm text-headline-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm focus:outline-none disabled:opacity-50" type="button">
                        <span className="material-symbols-outlined text-sm">{isSaving ? 'sync' : 'save'}</span>
                        <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="w-full bg-surface-container-lowest border-t border-surface-variant mt-space-xl">
        <div className="max-w-[1280px] mx-auto px-margin-mobile lg:px-margin py-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm text-on-surface-variant font-label-mono text-caption">
            <span>KURO ANIME LOG</span><span>•</span><span>MINIMALIST CATALOG ARCHIVE</span>
          </div>
          <div className="text-on-surface-variant font-caption text-caption">
            © 2025 Kuro. Architectural tracking for disciplined media consumption.
          </div>
        </div>
      </footer>
    </ProtectedRoute>
  );
}