import { NextResponse, NextRequest } from 'next/server';
import { workshopService } from '@/lib/services/workshop.service';
import { parseQueryParams } from '@/lib/hooks/apiHelper';
import { WorkshopStatusSchema } from '@/lib/schemas/workshop.schema';
import { requireAuth, requireRole } from '@/lib/auth/api-protection';
import { CreateWorkshopSchema } from '@/lib/schemas/workshop.input';
import { validateBody, isNextResponse } from '@/lib/api/validation';

export async function GET(request: NextRequest) {
  // tout utilisateur authentifié peut lire
  const sessionOrError = await requireAuth(request);
  if (sessionOrError instanceof NextResponse) return sessionOrError;
  
  try {
    const options = parseQueryParams(request, { status: WorkshopStatusSchema });
    
    const workshops = await workshopService.getAll({
      ...options
    });

    return NextResponse.json(workshops);
  } catch (error) {
    console.error('Failed to fetch workshops:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workshops' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Seuls ADMIN et MANAGER peuvent créer
  const sessionOrError = await requireRole(request, ['ADMIN', 'MANAGER']);
  if (sessionOrError instanceof NextResponse) return sessionOrError;
  
  // ✅ Validation Zod
  const dataOrError = await validateBody(request, CreateWorkshopSchema);
  if (isNextResponse(dataOrError)) return dataOrError;

  try {
    const workshop = await workshopService.create(dataOrError);
    return NextResponse.json(workshop, { status: 201 });
  } catch (error) {
    console.error('Failed to create workshop:', error);
    return NextResponse.json(
      { error: 'Failed to create workshop' },
      { status: 500 }
    );
  }
}
