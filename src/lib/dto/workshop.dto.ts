import { WorkshopStatus } from '../domain/workshop.status';
import { WorkshopPriceWithSeasonInfoDTO } from './workshopPrice.dto';

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

export type WorkshopWithPricesAndSeasonDTO = WorkshopDTO & {
  prices: WorkshopPriceWithSeasonInfoDTO[];
};