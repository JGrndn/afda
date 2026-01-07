import { NextResponse } from 'next/server';
import { paymentService } from '@/lib/services/payment.service';
import { parseQueryParams } from '@/lib/hooks/apiHelper';
import { PaymentStatusSchema } from '@/lib/schemas/payment.schema';

export async function GET(request: Request) {
  try {
    const options = parseQueryParams(request, { status: PaymentStatusSchema });
    const { searchParams } = new URL(request.url);

    const includeDetails = searchParams.get('includeDetails') === 'true';
    const familyId = searchParams.get('familyId');
    const seasonId = searchParams.get('seasonId');

    const payments = await paymentService.getAll({
      ...options,
      includeDetails,
      familyId: familyId ? parseInt(familyId) : undefined,
      seasonId: seasonId ? parseInt(seasonId) : undefined,
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Failed to fetch payments:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}