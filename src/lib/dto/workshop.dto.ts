import { WorkshopStatus } from '../domain/workshop.status';

export type WorkshopDTO = {
  id: number;
  name: string;
  description: string | null;
  status: WorkshopStatus;
  allowMultiple: boolean;
  maxPerMember: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type WorkshopPriceDTO = {
  id: number;
  workshopId: number;
  seasonId: number;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type WorkshopWithPricesAndSeasonDTO = WorkshopDTO & {
  prices: WorkshopPriceWithDetailsDTO[];
};

export type WorkshopPriceWithDetailsDTO = WorkshopPriceDTO & {
  workshopName?: string;
  seasonStart?: number;
  seasonEnd?: number;
};