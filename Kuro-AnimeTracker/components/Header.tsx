'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/themeContext';

interface HeaderProps {
  activePage?:
    | 'tracker'
    | 'tier-list'
    | 'discover'
    | 'seasonal'
    | 'stats'
    | 'notifications'
    | 'profile'
    | 'search'
    | 'login'
    | 'register';
}

export default function Header({ activePage }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProtectedClick = (
    e: React.MouseEvent,
    targetPath: string
  ) => {
    if (!isAuthenticated) {
      e.preventDefault();
      router.push(`/login?redirect=${encodeURIComponent(targetPath)}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/90 backdrop-blur-md border-b border-surface-variant">
      <div className="h-16 max-w-[1280px] mx-auto px-margin-mobile lg:px-margin flex items-center justify-between gap-gutter">
        {/* Brand Logo & Nav */}
        <div className="flex items-center gap-space-xl">
          <Link
            className="flex items-center gap-space-sm group focus:outline-none"
            href="/"
          >
            <img
              alt="Kuro Anime Log"
              className="h-8 w-auto object-contain"
              src="/logo.svg"
            />
            <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight">
              Kuro
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-space-lg h-16">
            {/* My Tracker (Protected) */}
            <Link
              href="/list"
              onClick={(e) => handleProtectedClick(e, '/list')}
              className={`h-full flex items-center transition-colors font-body-md text-body-md ${
                activePage === 'tracker'
                  ? 'text-on-surface font-headline-sm border-b-2 border-primary dark:border-white'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              My Tracker
            </Link>

            {/* Discover & Catalog (Public) */}
            <Link
              href="/"
              className={`h-full flex items-center transition-colors font-body-md text-body-md ${
                activePage === 'discover'
                  ? 'text-on-surface font-headline-sm border-b-2 border-primary dark:border-white'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Discover &amp; Catalog
            </Link>

            {/* Seasonal (Public) */}
            <Link
              href="/seasonal"
              className={`h-full flex items-center transition-colors font-body-md text-body-md ${
                activePage === 'seasonal'
                  ? 'text-on-surface font-headline-sm border-b-2 border-primary dark:border-white'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Seasonal
            </Link>

            {/* Stats (Protected) */}
            <Link
              href="/statistics"
              onClick={(e) => handleProtectedClick(e, '/statistics')}
              className={`h-full flex items-center transition-colors font-body-md text-body-md ${
                activePage === 'stats'
                  ? 'text-on-surface font-headline-sm border-b-2 border-primary dark:border-white'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Stats
            </Link>
          </nav>
        </div>

        {/* Right Search & Profile Actions */}
        <div className="flex items-center gap-space-md">
          {/* Global Search */}
          <form
            action="/search"
            method="GET"
            className="hidden sm:flex items-center gap-space-xs bg-surface-container px-space-sm py-1 rounded border border-surface-variant text-on-surface-variant hover:border-outline transition-colors"
          >
            <span className="material-symbols-outlined text-sm text-outline">
              search
            </span>
            <input
              name="q"
              placeholder="Search titles, studios..."
              className="bg-transparent font-body-sm text-body-sm text-on-surface focus:outline-none placeholder:text-outline w-44 sm:w-56"
            />
            <kbd className="font-label-mono text-caption px-1.5 py-0.5 bg-surface-container-lowest text-on-surface-variant rounded border border-surface-variant">
              ↵
            </kbd>
          </form>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-1.5 transition-colors rounded text-on-surface-variant hover:text-on-surface focus:outline-none"
          >
            <span className="material-symbols-outlined text-headline-sm">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* Notifications Icon (Protected) */}
          <Link
            href="/notifications"
            onClick={(e) => handleProtectedClick(e, '/notifications')}
            aria-label="Notifications"
            className={`p-1.5 transition-colors rounded focus:outline-none relative group ${
              activePage === 'notifications'
                ? 'text-on-surface'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-headline-sm">
              notifications
            </span>
            {isAuthenticated && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-secondary"></span>
            )}
          </Link>

          {/* Account / Profile Icon (Protected) */}
          <div
            className="relative flex items-center gap-space-xs pl-space-xs border-l border-surface-variant"
            ref={dropdownRef}
          >
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  aria-label="User menu"
                  className="flex items-center gap-2 focus:outline-none rounded-full ring-1 ring-surface-variant hover:ring-outline transition-all p-0.5"
                >
                  {user.avatar ? (
                    <img
                      alt={user.name || user.handle}
                      className="w-8 h-8 rounded-full object-cover bg-surface-container"
                      src={user.avatar}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-outline">
                      <span className="material-symbols-outlined text-lg">person</span>
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest border border-surface-variant rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-surface-variant">
                      <p className="font-headline-sm text-body-sm text-on-surface font-semibold truncate">
                        {user.name}
                      </p>
                      <p className="font-label-mono text-caption text-on-surface-variant truncate">
                        @{user.handle}
                      </p>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-body-sm text-on-surface hover:bg-surface-container transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px] text-outline">
                        account_circle
                      </span>
                      <span>Archivist Profile</span>
                    </Link>

                    <Link
                      href="/profile/edit"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-body-sm text-on-surface hover:bg-surface-container transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px] text-outline">
                        tune
                      </span>
                      <span>Preferences</span>
                    </Link>

                    <div className="border-t border-surface-variant my-1"></div>

                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-body-sm text-error hover:bg-error-container/20 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        logout
                      </span>
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login?redirect=/profile"
                  onClick={(e) => handleProtectedClick(e, '/profile')}
                  className="flex items-center gap-1.5 focus:outline-none rounded-full ring-1 ring-surface-variant hover:ring-outline transition-all p-0.5"
                  aria-label="Account Login"
                >
                  <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-outline">
                    <span className="material-symbols-outlined text-lg">
                      person
                    </span>
                  </div>
                </Link>
                <Link
                  href="/login"
                  className="hidden sm:inline-flex items-center px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-caption transition-colors border border-surface-variant"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile Hamburger Menu */}
          <button 
            type="button"
            className="md:hidden p-1.5 ml-1 text-on-surface-variant hover:text-on-surface focus:outline-none rounded"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="material-symbols-outlined text-headline-sm">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-surface-container-lowest border-b border-surface-variant shadow-lg py-2 flex flex-col items-start px-4 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
          <Link href="/list" onClick={(e) => { setMobileMenuOpen(false); handleProtectedClick(e, '/list'); }} className="py-3 w-full border-b border-surface-container font-body-md text-on-surface">My Tracker</Link>
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="py-3 w-full border-b border-surface-container font-body-md text-on-surface">Discover &amp; Catalog</Link>
          <Link href="/seasonal" onClick={() => setMobileMenuOpen(false)} className="py-3 w-full border-b border-surface-container font-body-md text-on-surface">Seasonal</Link>
          <Link href="/statistics" onClick={(e) => { setMobileMenuOpen(false); handleProtectedClick(e, '/statistics'); }} className="py-3 w-full font-body-md text-on-surface">Stats</Link>
        </div>
      )}
    </header>
  );
}
