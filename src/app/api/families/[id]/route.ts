import { NextRequest, NextResponse } from 'next/server';
import { familyService } from '@/lib/services/family.service';
import { requireAuth, requireRole } from '@/lib/auth/api-protection';
import { UpdateFamilySchema } from '@/lib/schemas/family.input';
import { validateBody, validateId, isNextResponse } from '@/lib/api/validation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionOrError = await requireAuth(request);
  if (sessionOrError instanceof NextResponse) return sessionOrError;

  try {
    const { id: idString } = await params;
    const id = validateId(idString);
    if (isNextResponse(id)) return id;

    const family = await familyService.getById(id);

    if (!family) {
      return NextResponse.json(
        { error: 'Family not found' },
        { status: 404 }
      );
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionOrError = await requireRole(request, ['ADMIN', 'MANAGER']);
  if (sessionOrError instanceof NextResponse) return sessionOrError;

  try {
    const { id: idString } = await params;
    const id = validateId(idString);
    if (isNextResponse(id)) return id;

    // ✅ Validation Zod
    const dataOrError = await validateBody(request, UpdateFamilySchema);
    if (isNextResponse(dataOrError)) return dataOrError;

    const family = await familyService.update(id, dataOrError);
    return NextResponse.json(family);
  } catch (error) {
    console.error('Failed to update family:', error);
    return NextResponse.json(
      { error: 'Failed to update family' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionOrError = await requireRole(request, ['ADMIN', 'MANAGER']);
  if (sessionOrError instanceof NextResponse) return sessionOrError;

  try {
    const { id: idString } = await params;
    const id = validateId(idString);
    if (isNextResponse(id)) return id;

    await familyService.delete(id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete family:', error);
    return NextResponse.json(
      { error: 'Failed to delete family' },
      { status: 500 }
    );
  }
}
