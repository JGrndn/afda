import { WorkshopStatus } from '@/lib/domain/enums/workshop.enum';
import { WorkshopPriceWithSeasonInfoDTO } from '@/lib/dto/workshopPrice.dto';

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