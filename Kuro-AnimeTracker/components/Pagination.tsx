import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  hasNextPage: boolean;
  lastPage: number;
  basePath: string;
  queryParams: Record<string, string | number>;
}

export default function Pagination({ currentPage, hasNextPage, lastPage, basePath, queryParams }: PaginationProps) {
  const getUrl = (page: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== null && key !== 'page') {
        params.append(key, value.toString());
      }
    }
    params.append('page', page.toString());
    return `${basePath}?${params.toString()}`;
  };

  // If there's only 1 page, don't show pagination
  if (lastPage <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-space-xl pt-space-lg border-t border-surface-variant">
      {currentPage > 1 ? (
        <Link href={getUrl(currentPage - 1)} className="px-4 py-2 bg-surface-container border border-surface-variant rounded-md text-on-surface font-label-mono text-caption hover:bg-surface-container-high transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          <span>Prev</span>
        </Link>
      ) : (
        <button disabled className="px-4 py-2 bg-surface-container-lowest border border-surface-variant rounded-md text-outline font-label-mono text-caption opacity-50 cursor-not-allowed flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          <span>Prev</span>
        </button>
      )}

      <span className="font-label-mono text-caption text-on-surface-variant mx-4">
        Page <span className="font-semibold text-on-surface">{currentPage}</span> of {lastPage || '?'}
      </span>

      {hasNextPage ? (
        <Link href={getUrl(currentPage + 1)} className="px-4 py-2 bg-surface-container border border-surface-variant rounded-md text-on-surface font-label-mono text-caption hover:bg-surface-container-high transition-colors flex items-center gap-1">
          <span>Next</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </Link>
      ) : (
        <button disabled className="px-4 py-2 bg-surface-container-lowest border border-surface-variant rounded-md text-outline font-label-mono text-caption opacity-50 cursor-not-allowed flex items-center gap-1">
          <span>Next</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
      )}
    </div>
  );
}
