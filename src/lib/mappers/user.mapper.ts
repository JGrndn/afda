import { User as PrismaUser } from '@/generated/prisma/client';
import { UserDTO } from '@/lib/dto/user.dto';
import { UserRole } from '../domain/enums/user-role.enum';
import { UserRole as PrismaUserRole}  from '@/generated/prisma/client';

export function toUserDTO(prismaUser: PrismaUser): UserDTO {
  return {
    id: prismaUser.id,
    name: prismaUser.name,
    email: prismaUser.email,
    role: fromPrismaUserRole(prismaUser.role), // ← Conversion
    isActive: prismaUser.isActive,
    createdAt: prismaUser.createdAt,
    updatedAt: prismaUser.updatedAt,
  };
}

export function fromPrismaUserRole(
  role: PrismaUserRole
): UserRole {
  return role as UserRole;
}

export function toPrismaUserRole(
  role: UserRole
): PrismaUserRole {
  return role as PrismaUserRole;
}