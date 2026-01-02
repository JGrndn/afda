import { NextResponse } from 'next/server';
import { familyService } from '@/lib/services/family.service';
import { parseQueryParams } from '@/lib/hooks/apiHelper';

export async function GET(request: Request) {
  try {
    const options = parseQueryParams(request);
    const { searchParams } = new URL(request.url);

    const families = await familyService.getAll({
      ...options,
    });

    return NextResponse.json(families);
  } catch (error) {
    console.error('Failed to fetch families:', error);
    return NextResponse.json(
      { error: 'Failed to fetch families' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const family = await familyService.create(data);
    return NextResponse.json(family, { status: 201 });
  } catch (error) {
    console.error('Failed to create family:', error);
    return NextResponse.json(
      { error: 'Failed to create family' },
      { status: 500 }
    );
  }
}