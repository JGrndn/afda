import { NextResponse } from 'next/server';
import { registrationService } from '@/lib/services/registration.service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const includeDetails = searchParams.get('includeDetails') === 'true';

    const registration = includeDetails
      ? await registrationService.getByIdWithDetails(parseInt(id))
      : await registrationService.getById(parseInt(id));

    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    return NextResponse.json(registration);
  } catch (error) {
    console.error('Failed to fetch registration:', error);
    return NextResponse.json({ error: 'Failed to fetch registration' }, { status: 500 });
  }
}