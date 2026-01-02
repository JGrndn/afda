export type WorkshopPriceDTO = {
  id: number;
  workshopId: number;
  seasonId: number;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type WorkshopPriceWithSeasonInfoDTO = WorkshopPriceDTO & {
  seasonStart: number;
  seasonEnd: number;
};

export type WorkshopPriceWithWorkshopInfoDTO = WorkshopPriceDTO & {
  workshopName : string;
}