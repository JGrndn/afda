import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';
import { QueryOptions } from '@/lib/hooks/query';
import {
  toClientDTO,
  toClientsDTO,
  toClientWithQuotesDTO,
} from '@/lib/mappers/client.mapper';
import { ClientDTO, ClientWithQuotesDTO } from '@/lib/dto/client.dto';
import { DomainError } from '@/lib/errors/domain-error';
import { CreateClientInput, UpdateClientInput } from '@/lib/schemas/client.input';

export const clientService = {
  async getAll(
    options?: QueryOptions<Prisma.ClientOrderByWithRelationInput> & {
      search?: string;
    }
  ): Promise<ClientDTO[]> {
    const { filters = {}, orderBy, search } = options || {};

    const where: Prisma.ClientWhereInput = { ...filters };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { contact: { contains: search, mode: 'insensitive' } },
      ];
    }

    const finalOrderBy = orderBy || { name: 'asc' as const };
    const clients = await prisma.client.findMany({ where, orderBy: finalOrderBy });
    return toClientsDTO(clients);
  },

  async getById(id: number): Promise<ClientWithQuotesDTO | null> {
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        quotes: {
          orderBy: { createdAt: 'desc' },
          include: {
            quoteInvoice: { select: { status: true, paidAt: true } },
          },
        },
      },
    });
    return client ? toClientWithQuotesDTO(client) : null;
  },

  async create(input: CreateClientInput): Promise<ClientDTO> {
    try {
      const result = await prisma.client.create({ data: input });
      return toClientDTO(result);
    } catch (error: unknown) {
      const e = error as any;
      if (e?.code === 'P2002') {
        throw new DomainError('Un client avec ce nom existe déjà', 'CLIENT_ALREADY_EXISTS');
      }
      throw error;
    }
  },

  async update(id: number, input: UpdateClientInput): Promise<ClientDTO> {
    try {
      const result = await prisma.client.update({ where: { id }, data: input });
      return toClientDTO(result);
    } catch (error: unknown) {
      const e = error as any;
      if (e?.code === 'P2025') {
        throw new DomainError('Client introuvable', 'CLIENT_NOT_FOUND');
      }
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await prisma.client.delete({ where: { id } });
    } catch (error: unknown) {
      const e = error as any;
      if (e?.code === 'P2025') {
        throw new DomainError('Client introuvable', 'CLIENT_NOT_FOUND');
      }
      throw error;
    }
  },
};