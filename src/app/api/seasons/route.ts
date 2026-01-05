import { NextResponse } from 'next/server';
import { seasonService } from '@/lib/services/season.service';
import { parseQueryParams } from '@/lib/hooks/apiHelper';
import { SeasonStatusSchema } from '@/lib/schemas/season.schema';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const options = parseQueryParams(request, { status:SeasonStatusSchema});

    const seasons = await seasonService.getAll({
      ...options,
    });
    
    return NextResponse.json(seasons);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch seasons' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const season = await seasonService.create(data);
    return NextResponse.json(season, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create season' }, 
      { status: 500 }
    );
  }
}