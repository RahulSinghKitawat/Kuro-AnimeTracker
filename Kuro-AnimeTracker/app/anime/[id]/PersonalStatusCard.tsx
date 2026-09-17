'use client';

import { useTracker } from '@/lib/trackerContext';

interface PersonalStatusCardProps {
  animeId: number;
  totalEpisodes: number | null | undefined;
}

export default function PersonalStatusCard({ animeId, totalEpisodes }: PersonalStatusCardProps) {
  const { getEntry } = useTracker();
  const entry = getEntry(animeId);
  
  const watchedCount = entry ? entry.progress : 0;
  const isTracked = !!entry;

  const total = totalEpisodes ?? '?';
  const percent =
    typeof total === 'number' && total > 0 && isTracked
      ? Math.round((watchedCount / total) * 100)
      : null;

  return (
    <div className="bg-surface-container p-space-sm rounded">
      <span className="font-label-mono text-caption text-on-surface-variant block uppercase">
        Personal Status
      </span>
      <div className="flex items-baseline gap-1 mt-0.5">
        {!isTracked ? (
          <span className="font-headline-sm text-headline-sm font-semibold text-outline">
            Not Tracked
          </span>
        ) : (
          <>
            <span className="font-headline-sm text-headline-sm font-semibold text-secondary">
              {watchedCount} / {total}
            </span>
            {percent !== null && (
              <span className="font-label-mono text-caption text-on-surface-variant">
                ({percent}%)
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
