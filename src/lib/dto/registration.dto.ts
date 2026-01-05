import { WorkshopDTO } from "./workshop.dto";

export type RegistrationDTO = {
  id: number;
  memberId: number;
  seasonId: number;
  workshopId: number;
  quantity: number;
  totalPrice: number;
  discountPercent: number;
  registrationDate: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type RegistrationWithDetailsDTO = RegistrationDTO & {
  memberName: string;
  workshopName: string;
  seasonYear: string;
  totalPrice: number;
};

export type RegistrationWithWorkshopDetailsDTO = RegistrationDTO & {
  workshop : WorkshopDTO;
}