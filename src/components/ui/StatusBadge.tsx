import { SeasonStatus } from '@/lib/domain/season.status';
import {
  translateSeasonStatus
} from '@/lib/i18n/translations';

type StatusBadgeProps = 
  | { type: 'generic'; status: string; className?: string; }
  | { type: 'season'; status: SeasonStatus; className?: string; };

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

export function StatusBadge(props: StatusBadgeProps) {
  const { className = ''} = props;
  let label = '';
  let color = '';

  switch (props.type){
    case 'season':
      label = translateSeasonStatus(props.status);
      color = SEASON_STATUS_COLORS[props.status];
      break;
    default:
      label = props.status;
      color = 'gray';
      break;
  }
  const colorClass = COLOR_CLASSES[color];

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colorClass} ${className}`}>
      {label}
    </span>
  );
}