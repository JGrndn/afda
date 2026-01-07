import { NextResponse } from 'next/server';
import { familyService } from '@/lib/services/family.service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    const family = await familyService.getById(parseInt(id));

    if (!family) {
      return NextResponse.json({ error: 'Family not found' }, { status: 404 });
    }

    return NextResponse.json(family);
  } catch (error) {
    console.error('Failed to fetch family:', error);
    return NextResponse.json(
      { error: 'Failed to fetch family' },
      { status: 500 }
    );
  }
}