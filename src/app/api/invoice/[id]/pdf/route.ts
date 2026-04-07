import { NextResponse } from 'next/server';
import { invoiceService } from '@/lib/services/invoice.service';
import { generateInvoicePdf } from '@/lib/domain/invoice/generateInvoicePdf';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const invoice = await invoiceService.getById(parseInt(resolvedParams.id));

  if (!invoice) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const stream = await generateInvoicePdf(invoice);

  return new NextResponse(stream as any, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="invoice-${invoice.invoiceNumber}.pdf"`,
    },
  });
}
