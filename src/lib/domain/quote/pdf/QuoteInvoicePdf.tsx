import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { QuoteWithDetailsDTO } from '@/lib/dto/quote.dto';

const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingLeft: 32,
    paddingRight: 32,
    paddingBottom: 110,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#111',
  },
  headerSection: {
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerImageSmall: {
    width: 90,
    height: 'auto',
  },
  company: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  docTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  metaSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  metaBlock: {
    width: '40%',
  },
  metaLine: {
    fontSize: 10,
    marginBottom: 3,
  },
  refBlock: {
    marginBottom: 12,
    padding: '4 8',
    backgroundColor: '#f0f9ff',
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  refText: {
    fontSize: 9,
    color: '#0369a1',
  },
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#000',
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  headerRow: {
    backgroundColor: '#f2f2f2',
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderColor: '#000',
  },
  cellLabel: {
    width: '50%',
    paddingLeft: 6,
  },
  cellDesc: {
    fontSize: 8,
    color: '#666',
    marginTop: 2,
  },
  cellQty: {
    width: '10%',
    textAlign: 'right',
  },
  cellUnit: {
    width: '20%',
    textAlign: 'right',
  },
  cellTotal: {
    width: '20%',
    textAlign: 'right',
    paddingRight: 6,
  },
  totals: {
    marginTop: 20,
    alignSelf: 'flex-end',
    width: '40%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    fontWeight: 'bold',
    fontSize: 12,
    borderTopWidth: 1,
    borderColor: '#000',
    paddingTop: 6,
  },
  conditions: {
    fontSize: 8,
    textAlign: 'left',
    marginTop: 6,
  },
  separator: {
    marginTop: 50,
    fontSize: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 32,
    left: 32,
    right: 32,
    fontSize: 9,
    borderTopWidth: 1,
    borderColor: '#000',
    paddingTop: 8,
  },
  footerRow: {
    flexDirection: 'row',
    paddingVertical: 2,
  },
  footerLabel: {
    fontWeight: 'bold',
  },
  footerValue: {
    marginLeft: 10,
  },
});

const LOGO_URL =
  typeof window === 'undefined'
    ? `${process.cwd()}/public/logo.png`
    : '/logo.png';

interface QuoteInvoiceDocumentProps {
  quote: QuoteWithDetailsDTO;
  /** Adresse du client si disponible */
  clientAddress?: string | null;
}

export function createQuoteInvoiceDocument({
  quote,
  clientAddress,
}: QuoteInvoiceDocumentProps) {
  const invoice = quote.invoice!;

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* ===== HEADER ===== */}
        <View style={styles.headerSection}>
          <View style={styles.headerTop}>
            <Image style={styles.headerImageSmall} src={LOGO_URL} />
            <Text style={styles.company}>Compagnie théâtrale Au Fil Des Actes</Text>
          </View>
          <Text style={styles.docTitle}>FACTURE</Text>
        </View>

        {/* ===== META + DESTINATAIRE ===== */}
        <View style={styles.metaSection}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLine}>
              Numéro : {invoice.invoiceNumber}
            </Text>
            <Text style={styles.metaLine}>
              Date :{' '}
              {new Date(invoice.issuedAt).toLocaleDateString('fr-FR')}
            </Text>
          </View>

          <View style={styles.metaBlock}>
            <Text style={styles.metaLine}>{quote.clientName}</Text>
            {clientAddress && (
              <Text style={styles.metaLine}>{clientAddress}</Text>
            )}
          </View>
        </View>

        {/* Référence au devis */}
        <View style={styles.refBlock}>
          <Text style={styles.refText}>
            Réf. devis : {quote.quoteNumber ?? '—'} — {quote.title}
          </Text>
        </View>

        {/* ===== TABLE ===== */}
        <View style={styles.table}>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={styles.cellLabel}>Désignation</Text>
            <Text style={styles.cellQty}>Qté</Text>
            <Text style={styles.cellUnit}>Prix unit. (€)</Text>
            <Text style={styles.cellTotal}>Total (€)</Text>
          </View>

          {quote.items.map((item, i) => (
            <View key={i} style={styles.row}>
              <View style={styles.cellLabel}>
                <Text>{item.label}</Text>
                {item.description && (
                  <Text style={styles.cellDesc}>{item.description}</Text>
                )}
              </View>
              <Text style={styles.cellQty}>{item.quantity}</Text>
              <Text style={styles.cellUnit}>{item.unitPrice.toFixed(2)}</Text>
              <Text style={styles.cellTotal}>{item.lineTotal.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* ===== TOTAL ===== */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Total HT</Text>
            <Text>{invoice.totalAmount.toFixed(2)} €</Text>
          </View>
        </View>

        <Text style={styles.separator}>Pour faire valoir ce que de droit</Text>

        <Text style={styles.conditions}>Conditions générales :</Text>
        <Text style={styles.conditions}>- TVA non applicable</Text>
        <Text style={styles.conditions}>
          - Association non assujettie aux impôts commerciaux
        </Text>

        {/* ===== FOOTER ===== */}
        <View style={styles.footer} fixed>
          <View style={styles.footerRow}>
            <Text style={styles.footerLabel}>
              Compagnie théâtrale Au Fil Des Actes
            </Text>
            <Text style={styles.footerValue}>(Association Loi de 1901)</Text>
          </View>
          <View style={styles.footerRow}>
            <Text style={styles.footerLabel}>Siège social</Text>
            <Text style={styles.footerValue}>
              57 rue Abel Leblanc, 77220 Presles en Brie
            </Text>
          </View>
          <View style={styles.footerRow}>
            <Text style={styles.footerLabel}>Contact</Text>
            <Text style={styles.footerValue}>contact@aufildesactes.fr</Text>
          </View>
          <View style={styles.footerRow}>
            <Text style={styles.footerLabel}>RNA</Text>
            <Text style={styles.footerValue}>W772010686</Text>
          </View>
          <View style={styles.footerRow}>
            <Text style={styles.footerLabel}>SIREN</Text>
            <Text style={styles.footerValue}>933 536 575</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
}