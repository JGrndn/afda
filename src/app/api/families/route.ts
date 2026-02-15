import { NextRequest, NextResponse } from 'next/server';
import { familyService } from '@/lib/services/family.service';
import { parseQueryParams } from '@/lib/hooks/apiHelper';
import { requireAuth, requireRole } from '@/lib/auth/api-protection';

export async function GET(request: NextRequest) {
  // tout utilisateur authentifié peut lire
  const sessionOrError = await requireAuth(request);
  if (sessionOrError instanceof NextResponse) return sessionOrError;

  try {
    const options = parseQueryParams(request);
    const { searchParams } = new URL(request.url);

    const families = await familyService.getAll({
      ...options,
    });

    return NextResponse.json(families);
  } catch (error) {
    console.error('Failed to fetch families:', error);
    return NextResponse.json(
      { error: 'Failed to fetch families' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
// Seuls ADMIN et MANAGER peuvent créer
  const sessionOrError = await requireRole(request, ['ADMIN', 'MANAGER']);
  if (sessionOrError instanceof NextResponse) return sessionOrError;
  
  try {
    const data = await request.json();
    const family = await familyService.create(data);
    return NextResponse.json(family, { status: 201 });
  } catch (error) {
    console.error('Failed to create family:', error);
    return NextResponse.json(
      { error: 'Failed to create family' },
      { status: 500 }
    );
  }
}