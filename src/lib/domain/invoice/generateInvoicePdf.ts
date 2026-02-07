import { renderToStream } from '@react-pdf/renderer';
import { createInvoiceDocument } from './pdf/InvoicePdf';
import { InvoiceDTO } from '@/lib/dto/invoice.dto';

export async function generateInvoicePdf(invoice: InvoiceDTO) {
  const doc = createInvoiceDocument(invoice); // retourne un <Document>
  const buffer = await renderToStream(doc); // génère un PDF en mémoire
  return buffer;
}