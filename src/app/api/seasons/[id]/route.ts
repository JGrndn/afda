import { NextResponse } from 'next/server';
import { seasonService } from '@/lib/services/seasons.service';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const season = await seasonService.getById(parseInt(params.id));
    if (!season) {
      return NextResponse.json({ error: 'Season not found' }, { status: 404 });
    }
    return NextResponse.json(season);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Failed to fetch season' }, { status: 500 });
  }
}