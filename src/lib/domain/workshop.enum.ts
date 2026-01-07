export const WORKSHOP_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export type WorkshopStatus = (typeof WORKSHOP_STATUS)[keyof typeof WORKSHOP_STATUS];