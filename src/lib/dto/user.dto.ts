import { UserRole } from '@/lib/domain/enums/user-role.enum';

export interface UserDTO {
  id: string;
  name: string | null;
  email: string;
  role: UserRole; // ← Notre enum
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionUserDTO {
  id: string;
  name: string | null;
  email: string;
  role: UserRole; // ← Notre enum
}