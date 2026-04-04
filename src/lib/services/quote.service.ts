import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';
import { QueryOptions } from '@/lib/hooks/query';
import {
  toQuoteDTO,
  toQuotesDTO,
  toQuoteWithClientDTO,
  toQuoteWithDetailsDTO,
  toQuoteInvoiceDTO,
} from '@/lib/mappers/quote.mapper';
import {
  QuoteDTO,
  QuoteWithDetailsDTO,
  QuoteWithClientDTO,
  QuoteInvoiceDTO,
} from '@/lib/dto/quote.dto';
import { DomainError } from '@/lib/errors/domain-error';
import { CreateQuoteInput, UpdateQuoteInput } from '@/lib/schemas/quote.input';
import { QuoteStatus, QUOTE_STATUS } from '@/lib/domain/enums/quote.enum';

function generateQuoteNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `D${year}${month}-${random}`;
}

function generateInvoiceNumber(quoteId: number): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `F${year}${month}-${quoteId}`;
}

function computeTotal(items: { unitPrice: number; quantity: number }[]): number {
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

export const quoteService = {
  async getAll(
    options?: QueryOptions<Prisma.QuoteOrderByWithRelationInput> & {
      status?: QuoteStatus;
      clientId?: number;
      search?: string;
    }
  ): Promise<QuoteWithClientDTO[]> {
    const { filters = {}, orderBy, status, clientId, search } = options || {};

    const where: Prisma.QuoteWhereInput = { ...filters };

    if (status) where.status = status;
    if (clientId) where.clientId = clientId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { quoteNumber: { contains: search, mode: 'insensitive' } },
        { client: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const finalOrderBy = orderBy || { createdAt: 'desc' as const };

    const quotes = await prisma.quote.findMany({
      where,
      orderBy: finalOrderBy,
      include: { client: { select: { name: true } } },
    });

    return quotes.map(toQuoteWithClientDTO);
  },

  async getById(id: number): Promise<QuoteWithDetailsDTO | null> {
    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        client: { select: { name: true } },
        items: { orderBy: { id: 'asc' } },
        quoteInvoice: true,
      },
    });
    return quote ? toQuoteWithDetailsDTO(quote) : null;
  },

  async create(input: CreateQuoteInput): Promise<QuoteDTO> {
    const totalAmount = computeTotal(input.items);
    const quoteNumber = generateQuoteNumber();

    try {
      const result = await prisma.quote.create({
        data: {
          clientId: input.clientId,
          title: input.title,
          description: input.description ?? null,
          status: input.status,
          quoteNumber,
          issuedAt: new Date(),
          validUntil: input.validUntil ?? null,
          totalAmount: new Prisma.Decimal(totalAmount),
          notes: input.notes ?? null,
          items: {
            create: input.items.map((item) => ({
              label: item.label,
              description: item.description ?? null,
              unitPrice: new Prisma.Decimal(item.unitPrice),
              quantity: item.quantity,
              lineTotal: new Prisma.Decimal(item.unitPrice * item.quantity),
            })),
          },
        },
      });
      return toQuoteDTO(result);
    } catch (error: unknown) {
      const e = error as any;
      if (e?.code === 'P2003') {
        throw new DomainError('Client introuvable', 'CLIENT_NOT_FOUND');
      }
      throw error;
    }
  },

  async update(id: number, input: UpdateQuoteInput): Promise<QuoteDTO> {
    const existing = await prisma.quote.findUnique({ where: { id } });
    if (!existing) throw new DomainError('Devis introuvable', 'QUOTE_NOT_FOUND');

    if (existing.status === QUOTE_STATUS.INVOICED) {
      throw new DomainError(
        'Un devis facturé ne peut plus être modifié',
        'QUOTE_ALREADY_INVOICED'
      );
    }

    const totalAmount = input.items ? computeTotal(input.items) : undefined;

    try {
      const result = await prisma.quote.update({
        where: { id },
        data: {
          ...(input.title !== undefined && { title: input.title }),
          ...(input.description !== undefined && { description: input.description }),
          ...(input.status !== undefined && { status: input.status }),
          ...(input.validUntil !== undefined && { validUntil: input.validUntil }),
          ...(input.notes !== undefined && { notes: input.notes }),
          ...(totalAmount !== undefined && {
            totalAmount: new Prisma.Decimal(totalAmount),
          }),
          ...(input.items && {
            items: {
              deleteMany: {},
              create: input.items.map((item) => ({
                label: item.label,
                description: item.description ?? null,
                unitPrice: new Prisma.Decimal(item.unitPrice),
                quantity: item.quantity,
                lineTotal: new Prisma.Decimal(item.unitPrice * item.quantity),
              })),
            },
          }),
        },
      });
      return toQuoteDTO(result);
    } catch (error: unknown) {
      const e = error as any;
      if (e?.code === 'P2025') throw new DomainError('Devis introuvable', 'QUOTE_NOT_FOUND');
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    const existing = await prisma.quote.findUnique({ where: { id } });
    if (!existing) throw new DomainError('Devis introuvable', 'QUOTE_NOT_FOUND');
    if (existing.status === QUOTE_STATUS.INVOICED) {
      throw new DomainError(
        'Un devis facturé ne peut pas être supprimé',
        'QUOTE_ALREADY_INVOICED'
      );
    }
    try {
      await prisma.quote.delete({ where: { id } });
    } catch (error: unknown) {
      const e = error as any;
      if (e?.code === 'P2025') throw new DomainError('Devis introuvable', 'QUOTE_NOT_FOUND');
      throw error;
    }
  },

  /**
   * Émet la facture liée à un devis accepté.
   * Crée un enregistrement QuoteInvoice immuable et passe le devis en "invoiced".
   */
  async issueInvoice(id: number): Promise<QuoteInvoiceDTO> {
    const existing = await prisma.quote.findUnique({
      where: { id },
      include: { quoteInvoice: true },
    });

    if (!existing) throw new DomainError('Devis introuvable', 'QUOTE_NOT_FOUND');

    if (existing.status !== QUOTE_STATUS.ACCEPTED) {
      throw new DomainError(
        'Seul un devis accepté peut être facturé',
        'QUOTE_NOT_ACCEPTED'
      );
    }

    if (existing.quoteInvoice) {
      return toQuoteInvoiceDTO(existing.quoteInvoice);
    }

    const invoiceNumber = generateInvoiceNumber(id);

    const [invoice] = await prisma.$transaction([
      prisma.quoteInvoice.create({
        data: {
          quoteId: id,
          invoiceNumber,
          issuedAt: new Date(),
          totalAmount: existing.totalAmount,
        },
      }),
      prisma.quote.update({
        where: { id },
        data: { status: QUOTE_STATUS.INVOICED },
      }),
    ]);

    return toQuoteInvoiceDTO(invoice);
  },
};