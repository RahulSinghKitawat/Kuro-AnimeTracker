'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import { useAuth } from '@/lib/auth';

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/list';
  const { register, loginWithGoogle, isAuthenticated } = useAuth();

  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push(redirect);
    }
  }, [isAuthenticated, redirect, router]);

  // Password strength calculation
  const getStrength = () => {
    if (password.length === 0) return { level: 0, text: 'Min. 8 chars' };
    if (password.length < 6) return { level: 1, text: 'Weak' };
    if (password.length < 10) return { level: 2, text: 'Medium' };
    return { level: 3, text: 'Robust' };
  };

  const strength = getStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);

    const result = await register(handle, email, password);

    if (result.success) {
      setAuthSuccess(true);
      setTimeout(() => {
        router.push(redirect);
      }, 800);
    } else {
      setIsSubmitting(false);
      setErrorMessage(result.error || 'Registration failed. Please check inputs.');
    }
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-margin-mobile lg:px-margin py-8 md:py-14">
      {/* Breadcrumb / Utility Status Bar */}
      <div className="flex items-center justify-between mb-space-md">
        <div className="flex items-center gap-space-xs text-on-surface-variant font-label-mono text-caption">
          <span className="text-on-surface font-label-md">ARCHIVE SYSTEM</span>
          <span className="text-outline">/</span>
          <span>ACCESS CONTROL</span>
          <span className="text-outline">/</span>
          <span className="text-secondary font-label-md">REGISTER NEW PROFILE</span>
        </div>
        <div className="hidden sm:flex items-center gap-space-sm font-label-mono text-caption text-on-surface-variant bg-surface-container px-space-sm py-1 rounded">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
          <span>PROTOCOL BCRYPT ENCRYPTION v4.2 • ACTIVE</span>
        </div>
      </div>

      {/* Main Dual-Panel Architecture Card */}
      <div className="w-full bg-surface-container-lowest rounded-xl shadow-xl overflow-hidden flex flex-col lg:flex-row border border-surface-variant">
        
        {/* Left Atmospheric Architectural Panel (45%) */}
        <div className="w-full lg:w-[45%] bg-primary-container text-surface p-space-lg lg:p-space-xl flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Ambient Vignette */}
          <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -left-12 -top-12 w-64 h-64 bg-tertiary-fixed-dim/5 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col">
            {/* Japanese Typographic Monogram & Accent */}
            <div className="flex items-center justify-between mb-space-lg">
              <div className="flex items-center gap-space-sm">
                <span className="w-2.5 h-2.5 bg-secondary-container rounded-sm"></span>
                <span className="font-label-mono text-caption tracking-widest uppercase text-surface-variant">
                  Archival Watchlist System
                </span>
              </div>
              <span className="font-caption text-caption text-on-primary-container tracking-wider">
                静寂と記録のアーカイブ
              </span>
            </div>

            {/* Hero Editorial Statement */}
            <h1 className="font-headline-xl text-headline-xl text-surface-container-lowest font-headline-xl tracking-tight mb-space-sm">
              Begin your personal chronicle.
            </h1>
            <p className="font-body-md text-body-md text-surface-variant leading-relaxed mb-space-xl">
              A disciplined, ad-free haven for cataloging anime, organizing seasonal
              queues, and capturing thoughtful reflections without commercial distortion.
            </p>

            {/* Core Feature Architecture Grid */}
            <div className="space-y-space-md mb-space-xl">
              {/* Feature 1 */}
              <div className="flex items-start gap-space-md p-space-md bg-surface-container-highest/10 rounded-lg backdrop-blur-sm transition-colors hover:bg-surface-container-highest/20">
                <div className="w-9 h-9 rounded bg-surface-container-lowest/10 flex items-center justify-center text-surface shrink-0">
                  <span className="material-symbols-outlined text-body-lg text-tertiary-fixed">
                    tune
                  </span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="font-headline-sm text-headline-sm text-surface">
                      Tactile Episode Stepper
                    </span>
                    <span className="font-label-mono text-caption px-1.5 py-0.5 rounded bg-surface-container-lowest/15 text-tertiary-fixed font-label-md">
                      0.05s Sync
                    </span>
                  </div>
                  <span className="font-body-sm text-body-sm text-surface-variant mt-0.5">
                    Physical micro-actions with local offline cache and instantaneous
                    optimistic updates.
                  </span>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-space-md p-space-md bg-surface-container-highest/10 rounded-lg backdrop-blur-sm transition-colors hover:bg-surface-container-highest/20">
                <div className="w-9 h-9 rounded bg-surface-container-lowest/10 flex items-center justify-center text-surface shrink-0">
                  <span className="material-symbols-outlined text-body-lg text-secondary-fixed">
                    sync_alt
                  </span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="font-headline-sm text-headline-sm text-surface">
                      Cloud Sync Architecture
                    </span>
                    <span className="font-label-mono text-caption px-1.5 py-0.5 rounded bg-surface-container-lowest/15 text-surface-variant">
                      Always Saved
                    </span>
                  </div>
                  <span className="font-body-sm text-body-sm text-surface-variant mt-0.5">
                    Your watchlist and configurations are securely synchronized across devices.
                  </span>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start gap-space-md p-space-md bg-surface-container-highest/10 rounded-lg backdrop-blur-sm transition-colors hover:bg-surface-container-highest/20">
                <div className="w-9 h-9 rounded bg-surface-container-lowest/10 flex items-center justify-center text-surface shrink-0">
                  <span className="material-symbols-outlined text-body-lg text-surface-variant">
                    security
                  </span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="font-headline-sm text-headline-sm text-surface">
                      Ad-Free &amp; Privacy First
                    </span>
                    <span className="font-label-mono text-caption px-1.5 py-0.5 rounded bg-surface-container-lowest/15 text-surface-variant">
                      Zero Telemetry
                    </span>
                  </div>
                  <span className="font-body-sm text-body-sm text-surface-variant mt-0.5">
                    No tracking pixels, no retail popups, no algorithmic distractions. Complete
                    sovereignty.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Left Panel Footer Accent Card */}
          <div className="relative z-10 pt-space-lg mt-auto">
            <div className="p-space-md rounded bg-surface-container-highest/10 backdrop-blur-sm border border-surface-container-lowest/10">
              <div className="flex items-center gap-space-xs text-tertiary-fixed font-label-mono text-caption mb-1">
                <span className="material-symbols-outlined text-body-sm">lock_open</span>
                <span>PUBLIC PREVIEWS: ALWAYS ACCESSIBLE</span>
              </div>
              <p className="font-body-sm text-body-sm text-surface-variant">
                Browse trending seasons, staff directories, and character databases freely. An
                archivist account preserves your personal watchlist, scores, and review journal.
              </p>
            </div>
            <div className="flex items-center justify-between mt-space-md text-surface-dim font-label-mono text-caption">
              <span>LOC: TOKYO / CLOUD</span>
              <span>SECURE BCRYPT VAULT • EST. 2025</span>
            </div>
          </div>
        </div>

        {/* Right Form Processing Panel (55%) */}
        <div className="w-full lg:w-[55%] p-space-lg lg:p-space-xl flex flex-col justify-between bg-surface-container-lowest">
          <div>
            {/* Header Bar: Switcher & Security Status */}
            <div className="flex flex-wrap items-center justify-between gap-space-md mb-space-lg pb-space-md bg-surface-container-lowest">
              {/* Segmented Mode Switcher */}
              <div className="flex items-center bg-surface-container p-1 rounded">
                <Link
                  className="px-space-md py-1 rounded font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors"
                  href={`/login?redirect=${encodeURIComponent(redirect)}`}
                >
                  Sign In
                </Link>
                <span className="px-space-md py-1 rounded bg-surface-container-lowest font-headline-sm text-body-sm text-on-surface shadow-sm font-semibold">
                  Create Account
                </span>
              </div>
              <div className="flex items-center gap-space-xs">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                <span className="font-label-mono text-caption text-secondary font-label-md">
                  BCRYPT ENCRYPTED
                </span>
              </div>
            </div>

            {/* Section Headings */}
            <div className="mb-space-lg">
              <div className="flex items-center gap-space-xs font-label-mono text-caption text-outline mb-1">
                <span>NEW ARCHIVIST REGISTRATION</span>
                <span>•</span>
                <span className="text-tertiary-container bg-tertiary-fixed px-1.5 py-0.2 rounded font-label-md text-caption">
                  Free Forever
                </span>
              </div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                Create your account
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                Start tracking your anime journey with zero ads and pure archival taxonomy.
              </p>
            </div>

            {/* Static Google SSO */}
            <div className="mb-space-lg">
              <button
                onClick={() => loginWithGoogle()}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-space-sm py-2.5 px-space-md bg-surface-container-low hover:bg-surface-container transition-colors rounded text-on-surface font-headline-sm text-body-md border border-surface-variant"
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
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center mb-space-lg">
              <div className="w-full h-px bg-surface-variant"></div>
              <span className="absolute bg-surface-container-lowest px-space-md font-label-mono text-caption text-outline uppercase tracking-wider">
                or register with email
              </span>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-lg bg-error-container text-on-error-container text-body-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Registration Form */}
            <form className="space-y-space-md" onSubmit={handleSubmit}>
              {/* Archivist Handle */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    className="font-headline-sm text-body-sm text-on-surface"
                    htmlFor="handle"
                  >
                    Archivist Handle
                  </label>
                  <span className="font-caption text-caption text-outline">
                    Unique public identifier
                  </span>
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-3 font-label-mono text-body-md text-outline">
                    @
                  </span>
                  <input
                    id="handle"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-label-mono text-body-md rounded focus:outline-none focus:ring-1 focus:ring-primary border border-transparent focus:border-outline transition-all placeholder:text-outline/60"
                    placeholder="chihaya_ayase"
                    required
                    type="text"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label
                  className="block font-headline-sm text-body-sm text-on-surface mb-1"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-space-md py-2 bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded focus:outline-none focus:ring-1 focus:ring-primary border border-transparent focus:border-outline transition-all placeholder:text-outline/60"
                  placeholder="archivist@kuro-media.org"
                  required
                  type="email"
                />
              </div>

              {/* Password Fields: Side by Side on Desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      className="font-headline-sm text-body-sm text-on-surface"
                      htmlFor="password"
                    >
                      Password
                    </label>
                    <span className="font-label-mono text-caption text-outline">
                      {strength.text}
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-space-md py-2 pr-10 bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-label-mono text-body-md rounded focus:outline-none focus:ring-1 focus:ring-primary border border-transparent focus:border-outline transition-all"
                      placeholder="••••••••••••"
                      required
                      type={showPassword ? 'text' : 'password'}
                    />
                    <button
                      aria-label="Toggle password visibility"
                      className="absolute right-2.5 text-outline hover:text-on-surface focus:outline-none"
                      onClick={() => setShowPassword(!showPassword)}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-body-md">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                  {/* Strength Meter Micro-Bar */}
                  <div className="flex gap-1 mt-1.5 h-1 w-full bg-surface-variant rounded-full overflow-hidden">
                    <div
                      className={`h-full w-1/3 transition-all ${
                        strength.level >= 1
                          ? strength.level === 1
                            ? 'bg-error'
                            : 'bg-secondary'
                          : 'bg-surface-variant'
                      }`}
                    ></div>
                    <div
                      className={`h-full w-1/3 transition-all ${
                        strength.level >= 2
                          ? 'bg-secondary-fixed'
                          : 'bg-surface-variant'
                      }`}
                    ></div>
                    <div
                      className={`h-full w-1/3 transition-all ${
                        strength.level >= 3
                          ? 'bg-on-tertiary-container'
                          : 'bg-surface-variant'
                      }`}
                    ></div>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    className="block font-headline-sm text-body-sm text-on-surface mb-1"
                    htmlFor="confirm-password"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-space-md py-2 bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-label-mono text-body-md rounded focus:outline-none focus:ring-1 focus:ring-primary border border-transparent focus:border-outline transition-all"
                    placeholder="••••••••••••"
                    required
                    type="password"
                  />
                </div>
              </div>

              {/* Checkbox Protocols */}
              <div className="space-y-space-xs pt-space-xs">
                <label className="flex items-start gap-space-sm cursor-pointer select-none">
                  <input
                    className="mt-1 rounded text-primary focus:ring-0 cursor-pointer"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    required
                    type="checkbox"
                  />
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    I agree to the{' '}
                    <span className="text-on-surface underline">
                      Terms of Service
                    </span>{' '}
                    and{' '}
                    <span className="text-on-surface underline">
                      Privacy Protocol
                    </span>
                    , and accept zero ad-tracking.
                  </span>
                </label>

              </div>

              {/* Primary Submission CTA */}
              <button
                className={`w-full mt-space-md py-3 px-space-md text-on-primary font-headline-sm text-body-md rounded transition-all flex items-center justify-center gap-space-sm shadow-sm ${
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
                      <span className="material-symbols-outlined text-body-md">
                        done
                      </span>
                      <span>Account Created — Forwarding...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined animate-spin text-body-md">
                        sync
                      </span>
                      <span>Hashing Password with Bcrypt...</span>
                    </>
                  )
                ) : (
                  <>
                    <span>Create Archivist Account</span>
                    <span className="material-symbols-outlined text-body-md group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Account Existence Switcher & Security Baseline */}
          <div className="mt-space-lg pt-space-md bg-surface-container-lowest">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm text-body-sm">
              <span className="text-on-surface-variant font-body-sm">
                Already have an archivist account?
              </span>
              <Link
                className="font-headline-sm text-on-surface hover:text-secondary flex items-center gap-1 transition-colors"
                href={`/login?redirect=${encodeURIComponent(redirect)}`}
              >
                <span>Sign In instead</span>
                <span className="material-symbols-outlined text-body-sm">
                  arrow_outward
                </span>
              </Link>
            </div>
            <div className="mt-space-md p-space-sm bg-surface-container rounded flex items-center justify-between font-label-mono text-caption text-outline">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-body-sm text-secondary">
                  verified_user
                </span>
                <span>Zero ad-tracking • Sovereignty focused • Bcrypt Secured</span>
              </div>
              <div className="hidden sm:flex items-center gap-space-xs">
                <span className="text-outline">SECURE VAULT</span>
                <span>•</span>
                <Link href="/" className="hover:text-on-surface transition-colors">
                  HOME
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <>
      <Header activePage="register" />
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
          <RegisterFormContent />
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
