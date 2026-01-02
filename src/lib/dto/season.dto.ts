import { SeasonStatus } from "../domain/season.status";
import { WorkshopPriceWithWorkshopInfoDTO } from "./workshopPrice.dto";

export type SeasonDTO = {
  id: number;
  startYear: number;
  endYear: number;
  status: SeasonStatus;
  membershipAmount: number;
  discountPercent: number;
  totalDonations: number;
  createdAt: Date;
  updatedAt: Date;
};

export type SeasonWithPricesAndWorkshopDTO = SeasonDTO & {
  prices: WorkshopPriceWithWorkshopInfoDTO[];
};