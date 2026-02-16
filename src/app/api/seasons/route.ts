import { NextResponse, NextRequest } from 'next/server';
import { seasonService } from '@/lib/services/season.service';
import { parseQueryParams } from '@/lib/hooks/apiHelper';
import { SeasonStatusSchema } from '@/lib/schemas/season.schema';
import { requireAuth, requireRole } from '@/lib/auth/api-protection';
import { CreateSeasonSchema } from '@/lib/schemas/season.input';
import { validateBody, isNextResponse } from '@/lib/api/validation';

export async function GET(request: NextRequest) {
  // tout utilisateur authentifié peut lire
  const sessionOrError = await requireAuth(request);
  if (sessionOrError instanceof NextResponse) return sessionOrError;
  
  try {
    const options = parseQueryParams(request, { status: SeasonStatusSchema });

    const seasons = await seasonService.getAll({
      ...options,
    });
    
    return NextResponse.json(seasons);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch seasons' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Seuls ADMIN et MANAGER peuvent créer
  const sessionOrError = await requireRole(request, ['ADMIN', 'MANAGER']);
  if (sessionOrError instanceof NextResponse) return sessionOrError;
  
  // ✅ Validation Zod
  const dataOrError = await validateBody(request, CreateSeasonSchema);
  if (isNextResponse(dataOrError)) return dataOrError;

  try {
    const season = await seasonService.create(dataOrError);
    return NextResponse.json(season, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create season' }, 
      { status: 500 }
    );
  }
}
