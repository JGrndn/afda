import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/services/payment.service';
import { parseQueryParams } from '@/lib/hooks/apiHelper';
import { requireAuth, requireRole } from '@/lib/auth/api-protection';
import { PaymentStatusSchema } from '@/lib/schemas/payment.input';
import { CreatePaymentSchema } from '@/lib/schemas/payment.input';
import { validateBody, isNextResponse } from '@/lib/api/validation';

export async function GET(request: NextRequest) {
  const sessionOrError = await requireAuth(request);
  if (sessionOrError instanceof NextResponse) return sessionOrError;

  try {
    const { searchParams } = new URL(request.url);
    const includeDetails = searchParams.get('includeDetails') === 'true';
    
    const options = parseQueryParams(request, { status: PaymentStatusSchema });

    const payments = await paymentService.getAll({
      ...options,
      includeDetails,
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Failed to fetch payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const sessionOrError = await requireRole(request, ['ADMIN', 'MANAGER']);
  if (sessionOrError instanceof NextResponse) return sessionOrError;

  // ✅ Validation Zod
  const dataOrError = await validateBody(request, CreatePaymentSchema);
  if (isNextResponse(dataOrError)) return dataOrError;

  try {
    const payment = await paymentService.create(dataOrError);
    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('Failed to create payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
