import { NextResponse } from 'next/server';
import { workshopService } from '@/lib/services/workshop.service';
import { parseQueryParams } from '@/lib/hooks/apiHelper';
import { WorkshopStatusSchema } from '@/lib/schemas/workshop.schema';

export async function GET(request: Request) {
  try {
    const options = parseQueryParams(request, { status: WorkshopStatusSchema });
    const { searchParams } = new URL(request.url);
    
    const includePrices = searchParams.get('includePrices') === 'true';
    const seasonId = searchParams.get('seasonId');

    const workshops = await workshopService.getAll({
      ...options,
      includePrices,
      seasonId: seasonId ? parseInt(seasonId) : undefined,
    });

    return NextResponse.json(workshops);
  } catch (error) {
    console.error('Failed to fetch workshops:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workshops' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const workshop = await workshopService.create(data);
    return NextResponse.json(workshop, { status: 201 });
  } catch (error) {
    console.error('Failed to create workshop:', error);
    return NextResponse.json(
      { error: 'Failed to create workshop' },
      { status: 500 }
    );
  }
}