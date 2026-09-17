'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import { useAuth } from '@/lib/auth';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/list';
  const { login, loginAsGuest, loginWithGoogle, isAuthenticated } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already authenticated and not loading, redirect to target
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push(redirect);
    }
  }, [isAuthenticated, redirect, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const result = await login(identity, password);

    if (result.success) {
      setAuthSuccess(true);
      setTimeout(() => {
        router.push(redirect);
      }, 800);
    } else {
      setIsSubmitting(false);
      setErrorMessage(result.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleDemoSignIn = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    await loginAsGuest();
    setAuthSuccess(true);
    setTimeout(() => {
      router.push(redirect);
    }, 800);
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-margin-mobile lg:px-margin py-8 md:py-14 flex items-center justify-center">
      {/* Central Editorial Container (Dual-Panel Architectural Frame) */}
      <div className="w-full max-w-5xl bg-surface-container-lowest rounded-xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[680px] border border-surface-variant">
        
        {/* LEFT PANEL: Atmospheric Editorial & Identity Showcase (5 cols) */}
        <div className="lg:col-span-5 bg-primary-container text-on-primary flex flex-col justify-between p-8 md:p-10 relative overflow-hidden">
          {/* Ambient Decorative Scrim & Japanese Vertical Monogram */}
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-secondary/15 blur-3xl pointer-events-none"></div>
          <div className="absolute -left-12 -bottom-12 w-60 h-60 rounded-full bg-tertiary-fixed-dim/10 blur-3xl pointer-events-none"></div>
          
          {/* Architectural Backdrop Anime Vignette */}
          <div
            className="absolute inset-0 opacity-15 mix-blend-luminosity bg-cover bg-center pointer-events-none"
            style={{
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuARSpIUD2kIrsPPhSjDR-FuTEIsvSh0lbn0qNZKTYb92w0UQySBlfxDHtrBzrjfzmQPDYHS15-zXEI4vZYEXt4YAnYOLyaH8zFoplXf6rrZNzkmQ_R8pas3TXnXOg47Xyr2x5eohxb8IvzEfSqC_mXxbrrPCKVykdD1PfX0cV-i0htU2yHDjNglJy4LPuNiW12VTfJt9UV3Hv6Hv2RcTGTPNAE8jOm3H7wt88yn0iG19CrNQO3kKezCwA')`,
            }}
          ></div>

          {/* Vertical Subtitle Accent for Editorial Texture */}
          <div className="hidden lg:block absolute right-6 top-1/2 -translate-y-1/2 [writing-mode:vertical-rl] select-none pointer-events-none text-on-primary-container/40 font-label-mono text-caption tracking-widest uppercase">
            ARCHIVAL LEDGER // VER 2.4.0 — 記録の領域
          </div>

          {/* Left Header: Identity */}
          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface-container-lowest/10 p-2 flex items-center justify-center backdrop-blur-md">
                <svg
                  aria-hidden="true"
                  className="w-full h-full text-surface-container-lowest fill-current"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    fill="currentColor"
                    fillOpacity="0.15"
                    r="44"
                  ></circle>
                  <path d="M38 30 L72 50 L38 70 Z" fill="currentColor"></path>
                  <circle cx="28" cy="74" fill="currentColor" r="5"></circle>
                  <line
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="4"
                    x1="68"
                    x2="82"
                    y1="20"
                    y2="10"
                  ></line>
                  <line
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="4"
                    x1="74"
                    x2="88"
                    y1="28"
                    y2="20"
                  ></line>
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-headline-sm text-headline-sm tracking-tight text-surface-container-lowest">
                    Kuro
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-surface-container-lowest/15 font-label-mono text-[10px] text-surface-container-lowest uppercase tracking-wider">
                    Log
                  </span>
                </div>
                <p className="font-caption text-caption text-on-primary-container tracking-wide">
                  Archival Watchlist System
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="font-label-mono text-caption text-tertiary-fixed tracking-widest uppercase">
                静寂と記録のアーカイブ
              </div>
              <h2 className="font-headline-lg text-headline-lg text-surface-container-lowest tracking-tight leading-snug">
                A disciplined chronicle for contemplative narratives.
              </h2>
              <p className="font-body-sm text-body-sm text-on-primary-container pt-1 leading-relaxed">
                Log completed story arcs, track seasonal transmissions, and archive
                episode notes in a calm, distraction-free sanctuary.
              </p>
            </div>
          </div>

          {/* Left Center: Feature Markers */}
          <div className="relative z-10 my-8 py-5 border-y border-on-primary-container/20 flex flex-col gap-3.5">
            <div className="flex items-center justify-between text-body-sm text-surface-container-lowest/90 font-body-sm">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[17px] text-tertiary-fixed">
                  tune
                </span>
                Tactile Episode Stepper
              </span>
              <span className="font-label-mono text-caption text-on-primary-container">
                0.05s Sync
              </span>
            </div>
            <div className="flex items-center justify-between text-body-sm text-surface-container-lowest/90 font-body-sm">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[17px] text-secondary-fixed">
                  sync_alt
                </span>
                Cloud Sync Architecture
              </span>
              <span className="font-label-mono text-caption text-secondary-fixed">
                Live
              </span>
            </div>
            <div className="flex items-center justify-between text-body-sm text-surface-container-lowest/90 font-body-sm">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[17px] text-on-primary-container">
                  layers
                </span>
                Production Cel Archive
              </span>
              <span className="font-label-mono text-caption text-on-primary-container">
                Hi-Res
              </span>
            </div>
          </div>

          {/* Left Bottom: Public Archive status */}
          <div className="relative z-10 space-y-3">
            <div className="p-3.5 rounded-lg bg-surface-container-lowest/5 backdrop-blur-sm border border-surface-container-lowest/10">
              <div className="flex items-center justify-between text-surface-container-lowest font-label-mono text-caption">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-tertiary-fixed animate-pulse"></span>
                  <span>PUBLIC ARCHIVE: OPEN</span>
                </div>
                <span className="text-[10px] text-tertiary-fixed px-1.5 py-0.5 rounded bg-surface-container-lowest/10">
                  NO LOGIN NEEDED
                </span>
              </div>
              <p className="font-caption text-caption text-on-primary-container mt-1.5 leading-relaxed">
                Discover &amp; Seasonal schedules are freely browsable without an account.
                Sign in is only required to synchronize My Tracker, personal Stats,
                Notifications, and your Archivist Account.
              </p>
            </div>
            <div className="flex items-center justify-between text-on-primary-container/70 font-label-mono text-[10px]">
              <span>LOC: TOKYO / CLOUD</span>
              <span>SECURE BCRYPT VAULT</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Authentication Form & SSO Bridges (7 cols) */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-8 md:p-12 flex flex-col justify-between">
          <div>
            {/* Tab Segment Control (Sign In vs Create Account) */}
            <div className="flex items-center justify-between pb-6">
              <div className="inline-flex p-1 rounded-lg bg-surface-container">
                <button
                  className="px-5 py-1.5 rounded text-body-sm font-label-md transition-all duration-200 bg-surface-container-lowest text-on-surface shadow-sm font-semibold"
                  id="tab-login"
                  type="button"
                >
                  Sign In
                </button>
                <Link
                  href={`/register?redirect=${encodeURIComponent(redirect)}`}
                  className="px-5 py-1.5 rounded text-body-sm font-label-md transition-all duration-200 text-on-surface-variant hover:text-on-surface"
                  id="tab-register"
                >
                  Create Account
                </Link>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-on-surface-variant font-label-mono text-caption">
                <span className="material-symbols-outlined text-[15px] text-secondary">
                  verified_user
                </span>
                <span>BCRYPT ENCRYPTED</span>
              </div>
            </div>

            {/* Dynamic Form Heading */}
            <div className="space-y-1.5 mb-6">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container text-on-surface-variant font-label-mono text-caption mb-1">
                <span className="material-symbols-outlined text-[13px] text-secondary">
                  lock
                </span>
                <span>RESTRICTED LEDGER ACCESS</span>
                <span className="text-outline">•</span>
                <span className="text-on-surface font-medium">
                  Auth required for Tracker, Stats &amp; Alerts
                </span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                Welcome back, archivist.
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Authenticate your credentials to sync personal watch progress, archive notes
                &amp; reflections, and manage notifications.
              </p>
            </div>

            {/* SSO & 1-Click Demo Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-2.5 mb-6">
              <button
                onClick={() => loginWithGoogle()}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors focus:outline-none border border-surface-variant text-on-surface font-label-md text-label-md"
                type="button"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  ></path>
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  ></path>
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  ></path>
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  ></path>
                </svg>
                <span className="font-label-md text-label-md text-on-surface">
                  Continue with Google
                </span>
              </button>
            </div>

            {/* Divider Rule */}
            <div className="relative flex items-center justify-center my-6">
              <div className="w-full h-px bg-surface-variant"></div>
              <span className="absolute bg-surface-container-lowest px-3 font-label-mono text-caption text-outline">
                OR VIA EMAIL &amp; PASSWORD
              </span>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-lg bg-error-container text-on-error-container text-body-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Main Input Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Handle / Email Field */}
              <div className="space-y-1.5">
                <label
                  className="block font-label-md text-label-md text-on-surface"
                  htmlFor="identity-input"
                >
                  Archivist Handle or Email
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-outline text-[18px]">
                    alternate_email
                  </span>
                  <input
                    id="identity-input"
                    value={identity}
                    onChange={(e) => setIdentity(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded bg-surface-container-low text-on-surface placeholder:text-outline/70 font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary border border-transparent focus:border-outline transition-all"
                    placeholder="archivist@kuro.media or ren"
                    required
                    type="text"
                  />
                </div>
              </div>

              {/* Passphrase Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    className="block font-label-md text-label-md text-on-surface"
                    htmlFor="passphrase-input"
                  >
                    Password
                  </label>
                  <span className="font-label-mono text-caption text-on-surface-variant">
                    (default: password123)
                  </span>
                </div>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-outline text-[18px]">
                    lock
                  </span>
                  <input
                    id="passphrase-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 rounded bg-surface-container-low text-on-surface placeholder:text-outline/70 font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary border border-transparent focus:border-outline transition-all"
                    placeholder="••••••••••••"
                    required
                    type={showPassword ? 'text' : 'password'}
                  />
                  <button
                    className="absolute right-3 text-outline hover:text-on-surface focus:outline-none p-0.5"
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                    aria-label="Toggle password visibility"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Utilities: Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 select-none cursor-pointer group">
                  <input
                    defaultChecked
                    className="w-4 h-4 rounded text-primary accent-primary focus:ring-primary"
                    id="remember-me"
                    type="checkbox"
                  />
                  <span className="font-body-sm text-body-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                    Keep session authenticated (7 days)
                  </span>
                </label>
              </div>

              {/* Primary Submit Button */}
              <div className="pt-2">
                <button
                  className={`w-full py-3 px-6 rounded text-on-primary font-headline-sm text-headline-sm flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] transition-all ${
                    authSuccess
                      ? 'bg-secondary'
                      : 'bg-primary hover:bg-primary-container'
                  }`}
                  id="submit-btn"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? (
                    authSuccess ? (
                      <>
                        <span className="material-symbols-outlined text-[18px]">
                          done
                        </span>
                        <span>Ledger Unlocked — Redirecting...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[18px]">
                          sync
                        </span>
                        <span>Verifying Bcrypt Key...</span>
                      </>
                    )
                  ) : (
                    <>
                      <span>Access Watchlist Archive</span>
                      <span className="material-symbols-outlined text-[18px]">
                        arrow_forward
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Backlog Importer Callout Banner */}
            <div className="mt-5 p-3.5 rounded-lg bg-surface-container-low border border-surface-variant flex items-start gap-3">
              <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">
                info
              </span>
              <div className="space-y-0.5">
                <p className="font-label-md text-label-md text-on-surface">
                  First time exploring Kuro?
                </p>
                <p className="font-caption text-caption text-on-surface-variant leading-relaxed">
                  Preview public collections and trending seasonal charts without an
                  account — or{' '}
                  <Link
                    href={`/register?redirect=${encodeURIComponent(redirect)}`}
                    className="underline text-on-surface font-semibold hover:text-secondary"
                  >
                    create an account
                  </Link>{' '}
                  to track episodes, sync watch history, and customize your personal journal.
                </p>
              </div>
            </div>
          </div>

          {/* Right Panel Bottom Security Marginalia */}
          <div className="pt-6 mt-6 border-t border-surface-variant flex flex-col sm:flex-row items-center justify-between gap-3 text-on-surface-variant font-caption text-caption">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[15px] text-tertiary-fixed-dim">
                verified
              </span>
              <span>Zero ad-tracking • Sovereignty focused • Local fallback</span>
            </div>
            <div className="flex items-center gap-3 font-label-mono text-[11px]">
              <span className="text-outline">SECURE BCRYPT HASHING</span>
              <span>•</span>
              <Link href="/" className="hover:text-on-surface transition-colors">
                RETURN TO CATALOG
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <Header activePage="login" />
      <main className="w-full pt-16 min-h-screen bg-background">
        <Suspense
          fallback={
            <div className="min-h-[600px] flex items-center justify-center">
              <span className="material-symbols-outlined text-outline text-2xl animate-spin">
                sync
              </span>
            </div>
          }
        >
          <LoginFormContent />
        </Suspense>
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
