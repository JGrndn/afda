import type { SeasonStatus } from '@/lib/schemas/enums';
import {
  translateSeasonStatus
} from '@/lib/i18n/translations';

type StatusType = SeasonStatus | string;

interface StatusBadgeProps {
  status: StatusType;
  type?: 'season' | 'generic';
  className?: string;
}

const COLOR_CLASSES:any = {
  yellow: 'bg-yellow-100 text-yellow-800',
  green: 'bg-green-100 text-green-800',
  red: 'bg-red-100 text-red-800',
  gray: 'bg-gray-100 text-gray-800',
} as const;

export const SEASON_STATUS_COLORS: Record<SeasonStatus, string> = {
  inactive: 'red',
  active: 'green',
};

export function StatusBadge({ 
  status, 
  type = 'generic',
  className = '' 
}: StatusBadgeProps) {
  let label = status;
  let colorClass = 'gray';
  
  // Traduire selon le type
  if (type === 'season') {
    label = translateSeasonStatus(status as SeasonStatus);
    colorClass = SEASON_STATUS_COLORS[status as SeasonStatus] || colorClass;
  }
  colorClass = COLOR_CLASSES[colorClass];
  
  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colorClass} ${className}`}>
      {label}
    </span>
  );
}