import { NextResponse } from 'next/server';
import { registrationService } from '@/lib/services/registration.service';
import { parseQueryParams } from '@/lib/hooks/apiHelper';

export async function GET(request: Request) {
  try {
    const options = parseQueryParams(request);
    const { searchParams } = new URL(request.url);

    const includeDetails = searchParams.get('includeDetails') === 'true';
    const memberId = searchParams.get('memberId');
    const seasonId = searchParams.get('seasonId');
    const workshopId = searchParams.get('workshopId');

    const registrations = await registrationService.getAll({
      ...options,
      includeDetails,
      memberId: memberId ? parseInt(memberId) : undefined,
      seasonId: seasonId ? parseInt(seasonId) : undefined,
      workshopId: workshopId ? parseInt(workshopId) : undefined,
    });

    return NextResponse.json(registrations);
  } catch (error) {
    console.error('Failed to fetch registrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const registration = await registrationService.create(data);
    return NextResponse.json(registration, { status: 201 });
  } catch (error) {
    console.error('Failed to create registration:', error);
    return NextResponse.json(
      { error: 'Failed to create registration' },
      { status: 500 }
    );
  }
}