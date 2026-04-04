import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/api-protection';
import { toQuoteInvoiceDTO } from '@/lib/mappers/quote.mapper';
import { parseQueryParams } from '@/lib/hooks/apiHelper';
import { QuoteInvoiceStatusSchema } from '@/lib/schemas/quoteInvoice.schema';

export async function GET(request: NextRequest) {
  const sessionOrError = await requireAuth(request);
  if (sessionOrError instanceof NextResponse) return sessionOrError;

  try {
    const options = parseQueryParams(request, { status: QuoteInvoiceStatusSchema });
    const { filters = {}, search } = options;

    const where: any = {};

    if (filters.status) where.status = filters.status;
    if (filters.seasonId) where.seasonId = Number(filters.seasonId);

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { quote: { title: { contains: search, mode: 'insensitive' } } },
        { quote: { client: { name: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    const invoices = await prisma.quoteInvoice.findMany({
      where,
      orderBy: { issuedAt: 'desc' },
      include: {
        quote: {
          select: {
            title: true,
            quoteNumber: true,
            client: { select: { name: true } },
          },
        },
        season: {
          select: { startYear: true, endYear: true },
        },
      },
    });

    const result = invoices.map((inv) => ({
      ...toQuoteInvoiceDTO(inv),
      quoteTitle: inv.quote.title,
      quoteNumber: inv.quote.quoteNumber,
      clientName: inv.quote.client.name,
      seasonYear: inv.season
        ? `${inv.season.startYear}-${inv.season.endYear}`
        : null,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch quote invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch quote invoices' }, { status: 500 });
  }
}