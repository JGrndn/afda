import { NextResponse } from 'next/server';
import { membershipService } from '@/lib/services/membership.service';
import { parseQueryParams } from '@/lib/hooks/apiHelper';
import { MembershipStatusSchema } from '@/lib/schemas/membership.schema';

export async function GET(request: Request) {
  try {
    const options = parseQueryParams(request, { status: MembershipStatusSchema });
    const { searchParams } = new URL(request.url);

    const includeDetails = searchParams.get('includeDetails') === 'true';
    const includeSummary = searchParams.get('includeSummary') === 'true';
    const memberId = searchParams.get('memberId');
    const seasonId = searchParams.get('seasonId');
    const familyId = searchParams.get('familyId');

    const memberships = await membershipService.getAll({
      ...options,
      includeDetails,
      includeSummary,
      memberId: memberId ? parseInt(memberId) : undefined,
      seasonId: seasonId ? parseInt(seasonId) : undefined,
      familyId: familyId ? parseInt(familyId) : undefined,
    });

    return NextResponse.json(memberships);
  } catch (error) {
    console.error('Failed to fetch memberships:', error);
    return NextResponse.json({ error: 'Failed to fetch memberships' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const membership = await membershipService.create(data);
    return NextResponse.json(membership, { status: 201 });
  } catch (error) {
    console.error('Failed to create membership:', error);
    return NextResponse.json({ error: 'Failed to create membership' }, { status: 500 });
  }
}