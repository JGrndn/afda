'use client';

import dynamic from 'next/dynamic';
import { QuoteWithDetailsDTO } from '@/lib/dto/quote.dto';
import { createQuoteDocument } from '@/lib/domain/quote/pdf/QuotePdf';

const PDFViewer = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Génération du PDF...</p>
        </div>
      </div>
    ),
  }
);

interface QuotePdfViewerProps {
  quote: QuoteWithDetailsDTO;
  height?: string;
}

export function QuotePdfViewer({ quote, height = '70vh' }: QuotePdfViewerProps) {
  const doc = createQuoteDocument(quote);

  return (
    <div style={{ height }} className="w-full rounded overflow-hidden border border-gray-200">
      <PDFViewer width="100%" height="100%" showToolbar>
        {doc}
      </PDFViewer>
    </div>
  );
}