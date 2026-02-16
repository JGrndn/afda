import { NextRequest, NextResponse } from 'next/server';
import { memberService } from '@/lib/services/member.service';
import { parseQueryParams } from '@/lib/hooks/apiHelper';
import { requireAuth, requireRole } from '@/lib/auth/api-protection';
import { CreateMemberSchema } from '@/lib/schemas/member.input';
import { validateBody, isNextResponse } from '@/lib/api/validation';

export async function GET(request: NextRequest) {
  // tout utilisateur authentifié peut lire
  const sessionOrError = await requireAuth(request);
  if (sessionOrError instanceof NextResponse) return sessionOrError;

  try {
    const options = parseQueryParams(request);
    
    const members = await memberService.getAll({
      ...options,
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error('Failed to fetch members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Seuls ADMIN et MANAGER peuvent créer
  const sessionOrError = await requireRole(request, ['ADMIN', 'MANAGER']);
  if (sessionOrError instanceof NextResponse) return sessionOrError;

  // ✅ Validation Zod
  const dataOrError = await validateBody(request, CreateMemberSchema);
  if (isNextResponse(dataOrError)) return dataOrError;

  try {
    const member = await memberService.create(dataOrError);
    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('Failed to create member:', error);
    return NextResponse.json(
      { error: 'Failed to create member' },
      { status: 500 }
    );
  }
}
