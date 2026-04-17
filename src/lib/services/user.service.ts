import { prisma } from '@/lib/prisma';
import { toUserDTO } from '@/lib/mappers/user.mapper';
import { UserDTO } from '@/lib/dto/user.dto';

export const userService = {
  async getById(id: string): Promise<UserDTO | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? toUserDTO(user) : null;
  },
};