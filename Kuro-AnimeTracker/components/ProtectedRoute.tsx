'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectPath?: string;
}

export default function ProtectedRoute({
  children,
  redirectPath,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const targetRedirect = redirectPath || pathname || '/list';

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(targetRedirect)}`);
    }
  }, [isLoading, isAuthenticated, router, targetRedirect]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center border border-surface-variant shadow-sm">
            <span className="material-symbols-outlined text-outline text-2xl animate-spin">
              sync
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2 font-label-mono text-caption text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping"></span>
              <span>ARCHIVAL GATEKEEPER</span>
            </div>
            <p className="font-headline-sm text-body-md text-on-surface">
              Verifying Ledger Credentials...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-center max-w-sm">
          <div className="w-10 h-10 rounded-lg bg-error/10 text-error flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">lock</span>
          </div>
          <div className="font-label-mono text-caption text-on-surface-variant uppercase tracking-wider">
            RESTRICTED ARCHIVE ACCESS
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Sign in required. Forwarding to authentication ledger...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
