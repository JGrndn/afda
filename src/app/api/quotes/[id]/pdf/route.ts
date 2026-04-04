import { NextResponse } from 'next/server';
import { quoteService } from '@/lib/services/quote.service';
import { generateQuotePdf } from '@/lib/domain/quote/generateQuotePdf';
import { requireAuth } from '@/lib/auth/api-protection';
import { validateId, isNextResponse } from '@/lib/api/validation';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionOrError = await requireAuth(request as any);
  if (sessionOrError instanceof NextResponse) return sessionOrError;

  const { id: idString } = await params;
  const id = validateId(idString);
  if (isNextResponse(id)) return id;

  const quote = await quoteService.getById(id);
  if (!quote) {
    return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
  }

  const stream = await generateQuotePdf(quote);

  const filename = quote.quoteNumber
    ? `devis-${quote.quoteNumber}.pdf`
    : `devis-${quote.id}.pdf`;

  return new NextResponse(stream as any, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
    },
  });
}