import { NextResponse } from 'next/server';
import { workshopService } from '@/lib/services/workshop.service';
import { DomainError } from '@/lib/errors/domain-error';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try{
    const { id } = await params;
    if (!id) throw new DomainError('', '');
    const workshops = await workshopService.getActiveWorkshopsForSeason(parseInt(id));

    return NextResponse.json(workshops);
  } catch (error) {
    console.error('Failed to fetch workshops:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workshops' },
      { status: 500 }
    );
  }
}