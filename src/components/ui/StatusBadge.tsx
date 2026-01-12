import { SeasonStatus } from '@/lib/domain/enums/season.enum';
import { WorkshopStatus } from '@/lib/domain/enums/workshop.enum';
import { MembershipStatus } from '@/lib/domain/enums/membership.enum';
import { PaymentStatus } from '@/lib/domain/enums/payment.enum';
import {
  MEMBERSHIP_STATUS_TRANSLATIONS,
  PAYMENT_STATUS_TRANSLATIONS,
  SEASON_STATUS_TRANSLATIONS,
  WORKSHOP_STATUS_TRANSLATIONS
} from '@/lib/i18n/translations';

// Couleurs typées
const COLOR_CLASSES = {
  yellow: 'bg-yellow-100 text-yellow-800',
  green: 'bg-green-100 text-green-800',
  red: 'bg-red-100 text-red-800',
  gray: 'bg-gray-100 text-gray-800',
} as const;
type ColorKey = keyof typeof COLOR_CLASSES;

// Status -> couleur
export const SEASON_STATUS_COLORS: Record<SeasonStatus, ColorKey> = {
  inactive: 'red',
  active: 'green',
};
export const WORKSHOP_STATUS_COLORS: Record<WorkshopStatus, ColorKey> = {
  inactive: 'red',
  active: 'green',
};
export const MEMBERSHIP_STATUS_COLORS: Record<MembershipStatus, ColorKey> = {
  pending: 'yellow',
  completed: 'green',
  cancelled: 'red',
};
export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, ColorKey> = {
  pending: 'yellow',
  cancelled: 'red',
  completed: 'green',
};


// Mapping type -> translations et couleurs
type StatusConfigEntry<Status extends string> = {
  translations: Record<Status, string>;
  colors: Record<Status, ColorKey>;
};
const STATUS_CONFIG = {
  season: {
    translations: SEASON_STATUS_TRANSLATIONS,
    colors: SEASON_STATUS_COLORS,
  } satisfies StatusConfigEntry<SeasonStatus>,
  workshop: {
    translations: WORKSHOP_STATUS_TRANSLATIONS,
    colors: WORKSHOP_STATUS_COLORS,
  } satisfies StatusConfigEntry<WorkshopStatus>,
  membership: {
    translations: MEMBERSHIP_STATUS_TRANSLATIONS,
    colors: MEMBERSHIP_STATUS_COLORS,
  } satisfies StatusConfigEntry<MembershipStatus>,
  payment: {
    translations: PAYMENT_STATUS_TRANSLATIONS,
    colors: PAYMENT_STATUS_COLORS,
  } satisfies StatusConfigEntry<PaymentStatus>,
} as const;

// type generique
type GenericStatusProps = {
  type: 'generic';
  status: string;
  color?: ColorKey;
  className?: string;
};

// Types automatiques
type StatusType = keyof typeof STATUS_CONFIG;
type TypedStatusProps<T extends keyof typeof STATUS_CONFIG> = {
  type: T;
  status: keyof typeof STATUS_CONFIG[T]['translations'];
  className?: string;
}
type StatusFor<T extends StatusType> =
  keyof typeof STATUS_CONFIG[T]['translations'];

// type du composant : generique ou union des types déclarés
type StatusBadgeProps = 
| GenericStatusProps
| {
  [K in keyof typeof STATUS_CONFIG] : TypedStatusProps<K>;
}[keyof typeof STATUS_CONFIG];


// Composant
export function StatusBadge(props : StatusBadgeProps) {
  const { className = '' } = props;
  let label, colorKey;
  if (props.type === 'generic'){
    colorKey = props.color ?? 'gray'; // couleur par défaut si non spécifiée
    label = props.status;
  } else {
    const type = props.type as Exclude<StatusType, 'generic'>;
    const status = props.status as StatusFor<typeof type>;
    const config = getStatusConfig(type, status);
    label = config.label
    colorKey = config.color;
  }

  return (
    <span
      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${COLOR_CLASSES[colorKey]} ${className}`}
    >
      {label}
    </span>
  );
}


function getStatusConfig<T extends StatusType>(
  type: T,
  status: StatusFor<T>
) {
  const config = STATUS_CONFIG[type];

  const translations =
    config.translations as Record<
      keyof typeof STATUS_CONFIG[T]['translations'],
      string
    >;
  const colors =
    config.colors as Record<
      keyof typeof STATUS_CONFIG[T]['translations'],
      ColorKey
    >;

  return {
    label: translations[status],
    color: colors[status],
  };
}