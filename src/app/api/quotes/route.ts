import { NextRequest, NextResponse } from 'next/server';
import { quoteService } from '@/lib/services/quote.service';
import { parseQueryParams } from '@/lib/hooks/apiHelper';
import { requireAuth, requireRole } from '@/lib/auth/api-protection';
import { CreateQuoteSchema } from '@/lib/schemas/quote.input';
import { QuoteStatusSchema } from '@/lib/schemas/quote.schema';
import { validateBody, isNextResponse } from '@/lib/api/validation';

export async function GET(request: NextRequest) {
  const sessionOrError = await requireAuth(request);
  if (sessionOrError instanceof NextResponse) return sessionOrError;

  try {
    const options = parseQueryParams(request, { status: QuoteStatusSchema });
    const quotes = await quoteService.getAll({ ...options });
    return NextResponse.json(quotes);
  } catch (error) {
    console.error('Failed to fetch quotes:', error);
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const sessionOrError = await requireRole(request, ['ADMIN', 'MANAGER']);
  if (sessionOrError instanceof NextResponse) return sessionOrError;

  const dataOrError = await validateBody(request, CreateQuoteSchema);
  if (isNextResponse(dataOrError)) return dataOrError;

  try {
    const quote = await quoteService.create(dataOrError);
    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    console.error('Failed to create quote:', error);
    return NextResponse.json({ error: 'Failed to create quote' }, { status: 500 });
  }
}