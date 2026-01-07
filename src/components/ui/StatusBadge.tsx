import { SeasonStatus } from '@/lib/domain/season.enum';
import { WorkshopStatus } from '@/lib/domain/workshop.enum';
import { MembershipStatus

 } from '@/lib/domain/membership.enum';
import {
  translateMembershipStatus,
  translateSeasonStatus,
  translateWorkshopStatus,
  translatePaymentStatus
} from '@/lib/i18n/translations';
import { PaymentStatus } from '@/lib/domain/payment.enum';

type StatusBadgeProps = 
  | { type: 'generic', status: string, className?: string, }
  | { type: 'season', status: SeasonStatus, className?: string, }
  | { type: 'workshop', status: WorkshopStatus, className?: string }
  | { type: 'membership', status: MembershipStatus, className?: string}
  | { type: 'payment', status: PaymentStatus, className?: string };

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
export const WORKSHOP_STATUS_COLORS: Record<WorkshopStatus, string> = {
  inactive: 'red',
  active:'green',
}
export const MEMBERSHIP_STATUS_COLORS: Record<MembershipStatus, string> = {
  pending: 'yellow',
  completed: 'green',
  cancelled: 'red'
}
export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  pending: 'yellow',
  cancelled: 'red',
  completed: 'green'
}

export function StatusBadge(props: StatusBadgeProps) {
  const { className = ''} = props;
  let label = '';
  let color = '';

  switch (props.type){
    case 'season':
      label = translateSeasonStatus(props.status);
      color = SEASON_STATUS_COLORS[props.status];
      break;
    case 'workshop':
      label = translateWorkshopStatus(props.status);
      color = WORKSHOP_STATUS_COLORS[props.status];
      break;
    case 'membership':
      label = translateMembershipStatus(props.status);
      color = MEMBERSHIP_STATUS_COLORS[props.status];
      break;
    case 'payment':
      label = translatePaymentStatus(props.status);
      color = PAYMENT_STATUS_COLORS[props.status];
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