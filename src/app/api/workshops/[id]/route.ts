import { NextRequest, NextResponse } from 'next/server';
import { workshopService } from '@/lib/services/workshop.service';
import { requireAuth, requireRole } from '@/lib/auth/api-protection';
import { UpdateWorkshopSchema } from '@/lib/schemas/workshop.input';
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

    const workshop = await workshopService.getById(id);

    if (!workshop) {
      return NextResponse.json(
        { error: 'Workshop not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(workshop);
  } catch (error) {
    console.error('Failed to fetch workshop:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workshop' },
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
    const dataOrError = await validateBody(request, UpdateWorkshopSchema);
    if (isNextResponse(dataOrError)) return dataOrError;

    const workshop = await workshopService.update(id, dataOrError);
    return NextResponse.json(workshop);
  } catch (error) {
    console.error('Failed to update workshop:', error);
    return NextResponse.json(
      { error: 'Failed to update workshop' },
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

    await workshopService.delete(id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete workshop:', error);
    return NextResponse.json(
      { error: 'Failed to delete workshop' },
      { status: 500 }
    );
  }
}
