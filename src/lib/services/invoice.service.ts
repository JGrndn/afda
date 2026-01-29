import { prisma } from '@/lib/prisma';
import { mapInvoiceToDTO } from '@/lib/mappers/invoice.mapper';
import { Prisma } from '@/generated/prisma';

export const invoiceService = {
  async findByFamilyAndSeason(familyId: number, seasonId: number) {
    const invoice: PrismaInvoiceDetails | null = await prisma.invoice.findUnique({
      where: { familyId_seasonId: { familyId, seasonId } },
      include: { items: true },
    });
    return invoice ? mapInvoiceToDTO(invoice) : null;
  },

  async createIssuedInvoice(data: {
    familyId: number;
    seasonId: number;
    invoiceNumber: string;
    totalAmount: number;
    items: {
    label: string;
    description?: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
    }[]
  }) {
  const invoice = await prisma.invoice.create({
    data: {
      familyId: data.familyId,
      seasonId: data.seasonId,
      status: 'issued',
      invoiceNumber: data.invoiceNumber,
      issuedAt: new Date(),
      totalAmount: data.totalAmount,
      items: { create: data.items },
    },
    include: { items: true },
  });

  return mapInvoiceToDTO(invoice);
  }
}

export type PrismaInvoiceDetails =
  Prisma.InvoiceGetPayload<{
    include: {
      items:true
    }
  }>;