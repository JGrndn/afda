import { NextResponse } from 'next/server';
import { getInvoiceForFamilyAndSeason } from '@/lib/domain/invoice/invoice.orchestrator';
import { generateInvoicePdf } from '@/lib/domain/invoice/generateInvoicePdf';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const familyId = searchParams.get('familyId');
  const seasonId = searchParams.get('seasonId');

  if (!familyId || !seasonId) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  const invoice = await getInvoiceForFamilyAndSeason(parseInt(familyId), parseInt(seasonId));

  // Sécurité : preview = draft only
  if (invoice.status !== 'draft') {
    return NextResponse.json({ error: 'Invoice already issued' }, { status: 400 });
  }
  
  const stream = await generateInvoicePdf(invoice);
  console.log('hello world');

  return new NextResponse(stream as any, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="invoice-preview.pdf"',
    },
  });
}
