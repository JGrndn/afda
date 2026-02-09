import { NextResponse } from 'next/server';
import { invoiceService } from '@/lib/services/invoice.service';
import { generateInvoicePdf } from '@/lib/domain/invoice/generateInvoicePdf';

export async function GET(
  _: Request,
  { params }: { params: { id: string } }
) {
  const invoice = await invoiceService.getById(parseInt(params.id));

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
