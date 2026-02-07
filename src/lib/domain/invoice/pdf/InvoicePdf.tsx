// lib/domain/invoice/InvoicePdf.tsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { InvoiceDTO } from '@/lib/dto/invoice.dto';

const styles = StyleSheet.create({
  page: { 
    padding: 40,
    fontSize: 11 },
  title: { 
    fontSize: 20,
    marginBottom: 20 },
  section: { 
    marginBottom: 16 },
  table: {
    width: '100%',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  header: {
    backgroundColor: '#f3f3f3',
    fontWeight: 'bold',
  },
  memberRow: {
    backgroundColor: '#fafafa',
  },
  cellLabel: {
    width: '50%',
    paddingLeft: 6,
  },
  cellQty: {
    width: '15%',
    textAlign: 'right',
  },
  cellUnit: {
    width: '15%',
    textAlign: 'right',
  },
  cellTotal: {
    width: '20%',
    textAlign: 'right',
    paddingRight: 6,
  },
});

export function createInvoiceDocument(invoice: InvoiceDTO) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>
          Facture {invoice.invoiceNumber ?? '— Brouillon —'}
        </Text>

        <View style={styles.section}>
          <Text>Saison : {invoice.season}</Text>
        </View>

        <View style={styles.section}>
          <Text>Date: {invoice.issuedAt?.toLocaleDateString() ?? ''}</Text>
        </View>

        <View style={styles.table}>
          {/* Header unique */}
          <View style={[styles.row, styles.header]}>
            <Text style={styles.cellLabel}>Désignation</Text>
            <Text style={styles.cellQty}>Qté</Text>
            <Text style={styles.cellUnit}>PU</Text>
            <Text style={styles.cellTotal}>Total</Text>
          </View>
          {/* Lignes */}
          {invoice.itemsByMember.map(member => {
            const memberTotal = member.items.reduce(
              (sum, item) => sum + item.lineTotal,
              0
            );
            return (
              <View key={member.memberId} wrap={false}>

                {/* Ligne membre */}
                <View style={[styles.row, styles.memberRow]}>
                  <Text style={styles.cellLabel}>
                    {member.memberName}
                  </Text>
                  <Text style={styles.cellQty}></Text>
                  <Text style={styles.cellUnit}></Text>
                  <Text style={styles.cellTotal}></Text>
                </View>

                {/* Items */}
                {member.items.map((item, i) => (
                  <View key={i} style={styles.row}>
                    <Text style={styles.cellLabel}>
                      {item.label}
                    </Text>
                    <Text style={styles.cellQty}>
                      {item.quantity}
                    </Text>
                    <Text style={styles.cellUnit}>
                      {item.unitPrice.toFixed(2)} €
                    </Text>
                    <Text style={styles.cellTotal}>
                      {item.lineTotal.toFixed(2)} €
                    </Text>
                  </View>
                ))}

                {/* Sous-total membre */}
                <View style={[styles.row, { fontWeight: 'bold' }]}>
                  <Text style={styles.cellLabel}>Sous-total</Text>
                  <Text style={styles.cellQty}></Text>
                  <Text style={styles.cellUnit}></Text>
                  <Text style={styles.cellTotal}>
                    {memberTotal.toFixed(2)} €
                  </Text>
                </View>

              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text>Total : {invoice.totalAmount.toFixed(2)} €</Text>
        </View>
      </Page>
    </Document>
  );
}