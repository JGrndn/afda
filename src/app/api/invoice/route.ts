import { NextResponse } from 'next/server';
import { getInvoiceForFamilyAndSeason } from '@/lib/domain/invoice/invoice.orchestrator';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const familyId = Number(searchParams.get('familyId'));
  const seasonId = Number(searchParams.get('seasonId'));

  if (!familyId || !seasonId) {
    return NextResponse.json(
      { error: 'Missing parameters' },
      { status: 400 }
    );
  }

  const invoice =
    await getInvoiceForFamilyAndSeason(familyId, seasonId );

  return NextResponse.json(invoice);
}