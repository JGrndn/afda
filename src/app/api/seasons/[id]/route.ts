import { NextRequest, NextResponse } from 'next/server';
import { seasonService } from '@/lib/services/season.service';
import { requireAuth, requireRole } from '@/lib/auth/api-protection';
import { UpdateSeasonSchema } from '@/lib/schemas/season.input';
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

    const season = await seasonService.getById(id);

    if (!season) {
      return NextResponse.json(
        { error: 'Season not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(season);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: 'Failed to fetch season' },
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
    const dataOrError = await validateBody(request, UpdateSeasonSchema);
    if (isNextResponse(dataOrError)) return dataOrError;

    const season = await seasonService.update(id, dataOrError);
    return NextResponse.json(season);
  } catch (error) {
    console.error('Failed to update season:', error);
    return NextResponse.json(
      { error: 'Failed to update season' },
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

    await seasonService.delete(id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete season:', error);
    return NextResponse.json(
      { error: 'Failed to delete season' },
      { status: 500 }
    );
  }
}
