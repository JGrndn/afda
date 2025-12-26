import { NextResponse } from 'next/server';
import { seasonService } from '@/lib/services/season';

export async function GET(
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const {id} = await params;
    const season = await seasonService.getById(parseInt(id));
    if (!season) {
      return NextResponse.json({ error: 'Season not found' }, { status: 404 });
    }
    return NextResponse.json(season);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch season' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const {id} = await params;
    const data = await request.json();
    const season = await seasonService.update(parseInt(id), data);
    return NextResponse.json(season);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update season' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const {id} = await params;
    await seasonService.delete(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete season' }, { status: 500 });
  }
}