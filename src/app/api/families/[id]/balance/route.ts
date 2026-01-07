import { NextResponse } from 'next/server';
import { paymentService } from '@/lib/services/payment.service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const seasonId = searchParams.get('seasonId');

    if (!seasonId) {
      return NextResponse.json(
        { error: 'seasonId query parameter is required' },
        { status: 400 }
      );
    }

    const balance = await paymentService.calculateFamilyBalance(
      parseInt(id),
      parseInt(seasonId)
    );

    return NextResponse.json(balance);
  } catch (error) {
    console.error('Failed to calculate family balance:', error);
    return NextResponse.json({ error: 'Failed to calculate balance' }, { status: 500 });
  }
}