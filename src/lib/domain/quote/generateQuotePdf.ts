import { renderToStream } from '@react-pdf/renderer';
import { QuoteWithDetailsDTO } from '@/lib/dto/quote.dto';
import { createQuoteDocument } from './pdf/QuotePdf';
import { createQuoteInvoiceDocument } from './pdf/QuoteInvoicePdf';

export async function generateQuotePdf(quote: QuoteWithDetailsDTO) {
  const doc = createQuoteDocument(quote);
  return renderToStream(doc);
}

export async function generateQuoteInvoicePdf(
  quote: QuoteWithDetailsDTO,
  clientAddress?: string | null
) {
  const doc = createQuoteInvoiceDocument({ quote, clientAddress });
  return renderToStream(doc);
}