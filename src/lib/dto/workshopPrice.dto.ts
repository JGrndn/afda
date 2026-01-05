import { SeasonDTO } from "./season.dto";
import { WorkshopDTO } from "./workshop.dto";

export type WorkshopPriceDTO = {
  id: number;
  workshopId: number;
  seasonId: number;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type WorkshopPriceWithSeasonInfoDTO = WorkshopPriceDTO & {
  season: SeasonDTO;
};

export type WorkshopPriceWithWorkshopInfoDTO = WorkshopPriceDTO & {
  workshop : WorkshopDTO;
}