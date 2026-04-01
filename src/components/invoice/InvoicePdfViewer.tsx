'use client';

import dynamic from 'next/dynamic';
import { InvoiceDTO } from '@/lib/dto/invoice.dto';
import { createInvoiceDocument } from '@/lib/domain/invoice/pdf/InvoicePdf';

// PDFViewer must be loaded client-side only (no SSR)
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

interface InvoicePdfViewerProps {
  invoice: InvoiceDTO;
  height?: string;
}

export function InvoicePdfViewer({ invoice, height = '70vh' }: InvoicePdfViewerProps) {
  const doc = createInvoiceDocument(invoice);

  return (
    <div style={{ height }} className="w-full rounded overflow-hidden border border-gray-200">
      <PDFViewer width="100%" height="100%" showToolbar>
        {doc}
      </PDFViewer>
    </div>
  );
}