import { NextRequest, NextResponse } from 'next/server';
import { quoteService } from '@/lib/services/quote.service';
import { requireAuth, requireRole } from '@/lib/auth/api-protection';
import { UpdateQuoteSchema } from '@/lib/schemas/quote.input';
import { validateBody, validateId, isNextResponse } from '@/lib/api/validation';
import { DomainError } from '@/lib/errors/domain-error';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionOrError = await requireAuth(request);
  if (sessionOrError instanceof NextResponse) return sessionOrError;

  try {
    const { id: idString } = await params;
    const id = validateId(idString);
    if (isNextResponse(id)) return id;

    const quote = await quoteService.getById(id);
    if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 });

    return NextResponse.json(quote);
  } catch (error) {
    console.error('Failed to fetch quote:', error);
    return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionOrError = await requireRole(request, ['ADMIN', 'MANAGER']);
  if (sessionOrError instanceof NextResponse) return sessionOrError;

  try {
    const { id: idString } = await params;
    const id = validateId(idString);
    if (isNextResponse(id)) return id;

    const dataOrError = await validateBody(request, UpdateQuoteSchema);
    if (isNextResponse(dataOrError)) return dataOrError;

    const quote = await quoteService.update(id, dataOrError);
    return NextResponse.json(quote);
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    console.error('Failed to update quote:', error);
    return NextResponse.json({ error: 'Failed to update quote' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionOrError = await requireRole(request, ['ADMIN', 'MANAGER']);
  if (sessionOrError instanceof NextResponse) return sessionOrError;

  try {
    const { id: idString } = await params;
    const id = validateId(idString);
    if (isNextResponse(id)) return id;

    await quoteService.delete(id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    console.error('Failed to delete quote:', error);
    return NextResponse.json({ error: 'Failed to delete quote' }, { status: 500 });
  }
}