import { NextRequest, NextResponse } from 'next/server';
import { clientService } from '@/lib/services/client.service';
import { requireAuth, requireRole } from '@/lib/auth/api-protection';
import { UpdateClientSchema } from '@/lib/schemas/client.input';
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

    const client = await clientService.getById(id);
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    return NextResponse.json(client);
  } catch (error) {
    console.error('Failed to fetch client:', error);
    return NextResponse.json({ error: 'Failed to fetch client' }, { status: 500 });
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

    const dataOrError = await validateBody(request, UpdateClientSchema);
    if (isNextResponse(dataOrError)) return dataOrError;

    const client = await clientService.update(id, dataOrError);
    return NextResponse.json(client);
  } catch (error) {
    console.error('Failed to update client:', error);
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
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

    await clientService.delete(id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete client:', error);
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
  }
}