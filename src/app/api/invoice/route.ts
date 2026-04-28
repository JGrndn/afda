import { NextRequest, NextResponse } from 'next/server';
import { getInvoiceForFamilyAndSeason } from '@/lib/domain/invoice/invoice.orchestrator';
import { requireAuth } from '@/lib/auth/api-protection';

export async function GET(req: NextRequest) {
  const sessionOrError = await requireAuth(req);
  if (sessionOrError instanceof NextResponse) return sessionOrError;

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