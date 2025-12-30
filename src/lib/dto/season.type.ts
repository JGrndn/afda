import { SeasonStatus } from "../domain/season.status";

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
