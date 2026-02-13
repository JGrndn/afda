import { NextResponse, NextRequest } from 'next/server';
import { workshopService } from '@/lib/services/workshop.service';
import { parseQueryParams } from '@/lib/hooks/apiHelper';
import { WorkshopStatusSchema } from '@/lib/schemas/workshop.schema';
import { requireAuth, requireRole } from '@/lib/auth/api-protection';

export async function GET(request: NextRequest) {
  // tout utilisateur authentifié peut lire
  const sessionOrError = await requireAuth(request);
  if (sessionOrError instanceof NextResponse) return sessionOrError;
  
  try {
    const options = parseQueryParams(request, { status: WorkshopStatusSchema });
    const { searchParams } = new URL(request.url);
    
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
  
  try {
    const data = await request.json();
    const workshop = await workshopService.create(data);
    return NextResponse.json(workshop, { status: 201 });
  } catch (error) {
    console.error('Failed to create workshop:', error);
    return NextResponse.json(
      { error: 'Failed to create workshop' },
      { status: 500 }
    );
  }
}