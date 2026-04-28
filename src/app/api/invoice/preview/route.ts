import { NextRequest, NextResponse } from 'next/server';
import { getInvoiceForFamilyAndSeason } from '@/lib/domain/invoice/invoice.orchestrator';
import { generateInvoicePdf } from '@/lib/domain/invoice/generateInvoicePdf';
import { requireAuth } from '@/lib/auth/api-protection';

export async function GET(req: NextRequest) {
const sessionOrError = await requireAuth(req);
  if (sessionOrError instanceof NextResponse) return sessionOrError;

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

  return new NextResponse(stream as any, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="invoice-preview.pdf"',
    },
  });
}
