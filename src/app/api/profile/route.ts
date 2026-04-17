import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/api-protection';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { toUserDTO } from '@/lib/mappers/user.mapper';
import { auth } from '@/lib/auth';

const UpdateProfileSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'Le nouveau mot de passe doit contenir au moins 6 caractères').optional(),
}).refine(
  (data) => {
    // If newPassword is set, currentPassword must also be set
    if (data.newPassword && !data.currentPassword) return false;
    return true;
  },
  { message: 'Le mot de passe actuel est requis pour changer le mot de passe', path: ['currentPassword'] }
);

export async function GET(request: NextRequest) {
  const sessionOrError = await requireAuth(request);
  if (sessionOrError instanceof NextResponse) return sessionOrError;

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  return NextResponse.json(toUserDTO(user));
}

export async function PUT(request: NextRequest) {
  const sessionOrError = await requireAuth(request);
  if (sessionOrError instanceof NextResponse) return sessionOrError;

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const data = UpdateProfileSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;

    if (data.newPassword && data.currentPassword) {
      const isValid = await bcrypt.compare(data.currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 400 });
      }
      updateData.password = await bcrypt.hash(data.newPassword, 10);
    }

    const updated = await prisma.user.update({ where: { id: userId }, data: updateData });
    return NextResponse.json(toUserDTO(updated));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Données invalides' },
        { status: 422 }
      );
    }
    console.error('Failed to update profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}