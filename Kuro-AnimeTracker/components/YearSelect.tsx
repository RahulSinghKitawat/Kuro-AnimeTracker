'use client';

import { useRouter } from 'next/navigation';

interface YearSelectProps {
  currentSeason: string;
  currentYear: number;
}

export default function YearSelect({ currentSeason, currentYear }: YearSelectProps) {
  const router = useRouter();
  
  // Generate older years from 2020 down to 1953
  const olderYears = Array.from({ length: 2020 - 1953 + 1 }, (_, i) => 2020 - i);
  
  // Is the current year in the older list?
  const isOlderYearActive = currentYear <= 2020;

  return (
    <select
      value={isOlderYearActive ? currentYear.toString() : 'older'}
      onChange={(e) => {
        if (e.target.value !== 'older') {
          router.push(`/seasonal?season=${currentSeason}&year=${e.target.value}`);
        }
      }}
      className={`px-3 py-1 rounded-md font-label-mono text-caption transition-all border border-surface-variant outline-none cursor-pointer ${
        isOlderYearActive 
          ? 'bg-primary text-on-primary font-semibold shadow-xs' 
          : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container'
      }`}
    >
      {!isOlderYearActive && <option value="older">Older...</option>}
      {olderYears.map((y) => (
        <option key={y} value={y.toString()}>{y}</option>
      ))}
    </select>
  );
}
