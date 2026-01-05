import { SeasonStatus } from "@/lib/domain/season.enum";
import { WorkshopPriceWithWorkshopInfoDTO } from "@/lib/dto/workshopPrice.dto";
import { MembershipWithMemberDTO } from "@/lib/dto/membership.dto";

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

export type SeasonWithFullDetailsDTO = SeasonDTO & {
  prices: WorkshopPriceWithWorkshopInfoDTO[];
  memberships : MembershipWithMemberDTO [];
}