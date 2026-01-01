export type FamilyDTO = {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type FamilyWithMembersDTO = FamilyDTO & {
  memberCount: number;
};