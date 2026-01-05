import { SeasonDTO } from "@/lib/dto/season.dto";
import { WorkshopDTO } from "@/lib/dto/workshop.dto";

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