import { NextResponse } from 'next/server';
import { membershipService } from '@/lib/services/membership.service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const includeDetails = searchParams.get('includeDetails') === 'true';

    const membership = includeDetails
      ? await membershipService.getByIdWithDetails(parseInt(id))
      : await membershipService.getById(parseInt(id));

    if (!membership) {
      return NextResponse.json({ error: 'Membership not found' }, { status: 404 });
    }

    return NextResponse.json(membership);
  } catch (error) {
    console.error('Failed to fetch membership:', error);
    return NextResponse.json({ error: 'Failed to fetch membership' }, { status: 500 });
  }
}