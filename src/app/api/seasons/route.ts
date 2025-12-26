import { NextResponse } from 'next/server';
import { seasonService } from '@/lib/services/season';

export async function GET() {
  try {
    const seasons = await seasonService.getAll();
    return NextResponse.json(seasons);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch seasons' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const season = await seasonService.create(data);
    return NextResponse.json(season, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create season' }, { status: 500 });
  }
}