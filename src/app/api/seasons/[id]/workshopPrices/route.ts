import { NextRequest, NextResponse } from 'next/server';
import { seasonService } from '@/lib/services/season.service';
import { requireAuth } from '@/lib/auth/api-protection';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionOrError = await requireAuth(request);
  if (sessionOrError instanceof NextResponse) return sessionOrError;
    
  try {
    const { id } = await params;
    const season = await seasonService.getByIdWithWorkshopPrices(parseInt(id));
    if (!season) {
      return NextResponse.json({ error: 'Season not found' }, { status: 404 });
    }
    return NextResponse.json(season);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch season' }, { status: 500 });
  }
}