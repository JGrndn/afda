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
  draftBanner: {
    marginTop: 6,
    padding: '4 8',
    backgroundColor: '#fef3c7',
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  draftBannerText: {
    fontSize: 9,
    color: '#92400e',
    fontWeight: 'bold',
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
  validityBlock: {
    marginTop: 16,
    padding: '6 8',
    backgroundColor: '#f0fdf4',
    borderRadius: 4,
  },
  validityText: {
    fontSize: 9,
    color: '#166534',
  },
  notes: {
    marginTop: 16,
    padding: '6 8',
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  notesLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 3,
  },
  notesText: {
    fontSize: 9,
    color: '#4b5563',
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

export function createQuoteDocument(quote: QuoteWithDetailsDTO) {
  const isDraft = quote.status === 'draft';

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* ===== HEADER ===== */}
        <View style={styles.headerSection}>
          <View style={styles.headerTop}>
            <Image style={styles.headerImageSmall} src={LOGO_URL} />
            <Text style={styles.company}>Compagnie théâtrale Au Fil Des Actes</Text>
          </View>
          <Text style={styles.docTitle}>DEVIS</Text>
          {isDraft && (
            <View style={styles.draftBanner}>
              <Text style={styles.draftBannerText}>BROUILLON — non contractuel</Text>
            </View>
          )}
        </View>

        {/* ===== META + DESTINATAIRE ===== */}
        <View style={styles.metaSection}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLine}>
              Numéro : {quote.quoteNumber ?? '—'}
            </Text>
            <Text style={styles.metaLine}>
              Date d'émission :{' '}
              {quote.issuedAt
                ? new Date(quote.issuedAt).toLocaleDateString('fr-FR')
                : '—'}
            </Text>
            {quote.validUntil && (
              <Text style={styles.metaLine}>
                Valable jusqu'au :{' '}
                {new Date(quote.validUntil).toLocaleDateString('fr-FR')}
              </Text>
            )}
          </View>

          <View style={styles.metaBlock}>
            <Text style={styles.metaLine}>{quote.clientName}</Text>
          </View>
        </View>

        {/* Titre de la prestation */}
        <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>
          Objet : {quote.title}
        </Text>
        {quote.description && (
          <Text style={{ fontSize: 9, color: '#4b5563', marginBottom: 8 }}>
            {quote.description}
          </Text>
        )}

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
            <Text>{quote.totalAmount.toFixed(2)} €</Text>
          </View>
        </View>

        {/* Validité */}
        {quote.validUntil && (
          <View style={styles.validityBlock}>
            <Text style={styles.validityText}>
              Ce devis est valable jusqu'au{' '}
              {new Date(quote.validUntil).toLocaleDateString('fr-FR')}.
              Passé ce délai, les tarifs pourront être révisés.
            </Text>
          </View>
        )}

        {/* Notes */}
        {quote.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesLabel}>Notes :</Text>
            <Text style={styles.notesText}>{quote.notes}</Text>
          </View>
        )}

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