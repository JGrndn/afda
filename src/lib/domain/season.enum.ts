export const SEASON_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export type SeasonStatus =
  (typeof SEASON_STATUS)[keyof typeof SEASON_STATUS];