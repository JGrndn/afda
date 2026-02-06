// lib/domain/invoice/InvoicePdf.tsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { InvoiceDTO } from '@/lib/dto/invoice.dto';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11 },
  title: { fontSize: 20, marginBottom: 20 },
  section: { marginBottom: 16 },
});

export function createInvoiceDocument(invoice: InvoiceDTO) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>
          Facture {invoice.invoiceNumber ?? '— Brouillon —'}
        </Text>

        <View style={styles.section}>
          <Text>Famille : {invoice.familyId}</Text>
          <Text>Saison : {invoice.seasonId}</Text>
        </View>

        {invoice.items.map((item, idx) => (
          <View key={idx}>
            <Text>
              {item.label} – {item.quantity} × {item.unitPrice.toFixed(2)} €
            </Text>
          </View>
        ))}

        <View style={styles.section}>
          <Text>Total : {invoice.totalAmount.toFixed(2)} €</Text>
        </View>
      </Page>
    </Document>
  );
}