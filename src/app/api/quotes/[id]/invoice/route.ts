import { NextRequest, NextResponse } from 'next/server';
import { quoteService } from '@/lib/services/quote.service';
import { requireRole } from '@/lib/auth/api-protection';
import { validateId, isNextResponse } from '@/lib/api/validation';
import { DomainError } from '@/lib/errors/domain-error';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionOrError = await requireRole(request, ['ADMIN', 'MANAGER']);
  if (sessionOrError instanceof NextResponse) return sessionOrError;

  try {
    const { id: idString } = await params;
    const id = validateId(idString);
    if (isNextResponse(id)) return id;

    const invoice = await quoteService.issueInvoice(id);
    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    console.error('Failed to issue invoice:', error);
    return NextResponse.json({ error: 'Failed to issue invoice' }, { status: 500 });
  }
}