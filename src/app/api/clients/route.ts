import { NextRequest, NextResponse } from 'next/server';
import { clientService } from '@/lib/services/client.service';
import { parseQueryParams } from '@/lib/hooks/apiHelper';
import { requireAuth, requireRole } from '@/lib/auth/api-protection';
import { CreateClientSchema } from '@/lib/schemas/client.input';
import { validateBody, isNextResponse } from '@/lib/api/validation';

export async function GET(request: NextRequest) {
  const sessionOrError = await requireAuth(request);
  if (sessionOrError instanceof NextResponse) return sessionOrError;

  try {
    const options = parseQueryParams(request);
    const clients = await clientService.getAll({ ...options });
    return NextResponse.json(clients);
  } catch (error) {
    console.error('Failed to fetch clients:', error);
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const sessionOrError = await requireRole(request, ['ADMIN', 'MANAGER']);
  if (sessionOrError instanceof NextResponse) return sessionOrError;

  const dataOrError = await validateBody(request, CreateClientSchema);
  if (isNextResponse(dataOrError)) return dataOrError;

  try {
    const client = await clientService.create(dataOrError);
    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error('Failed to create client:', error);
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}