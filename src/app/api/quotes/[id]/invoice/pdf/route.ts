import { NextResponse } from 'next/server';
import { quoteService } from '@/lib/services/quote.service';
import { clientService } from '@/lib/services/client.service';
import { generateQuoteInvoicePdf } from '@/lib/domain/quote/generateQuotePdf';
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

  if (!quote.invoice) {
    return NextResponse.json(
      { error: 'No invoice issued for this quote' },
      { status: 404 }
    );
  }

  // Récupérer l'adresse du client pour le PDF
  const client = await clientService.getById(quote.clientId);

  const stream = await generateQuoteInvoicePdf(quote, client?.address ?? null);

  const filename = `facture-${quote.invoice.invoiceNumber}.pdf`;

  return new NextResponse(stream as any, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
    },
  });
}