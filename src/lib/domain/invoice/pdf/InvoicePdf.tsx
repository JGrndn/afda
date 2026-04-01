import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { InvoiceDTO } from '@/lib/dto/invoice.dto';

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
  invoiceTitle: {
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
  memberRow: {
    backgroundColor: '#fafafa',
    fontWeight: 'bold',
  },
  cellLabel: {
    width: '40%',
    paddingLeft: 6,
  },
  cellQty: {
    width: '10%',
    textAlign: 'right',
  },
  cellUnit: {
    width: '15%',
    textAlign: 'right',
  },
  cellDiscount: {
    width: '15%',
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
    fontWeight: 'bold'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalFinal: {
    fontWeight: 'bold',
    fontSize: 12,
    borderTopWidth: 1,
    borderColor: '#000',
    paddingTop: 6,
  },
  conditions: {
    fontSize: 8,
    textAlign: 'left',
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
   // width: '30%',
    fontWeight: 'bold',
  },
  footerValue: {
    //width: '70%',
    marginLeft:10
  },
  separator:{
    marginTop:50
  }
});

const LOGO_URL = typeof window === 'undefined'
  // Côté serveur : chemin absolu système de fichiers pour @react-pdf
  ? `${process.cwd()}/public/logo.png`
  // Côté client : URL relative suffit pour le PDFViewer dans le browser
  : '/logo.png';

export function createInvoiceDocument(invoice: InvoiceDTO) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* ===== HEADER ===== */}
        <View style={styles.headerSection}>
          <View style={styles.headerTop}>
            <Image style={styles.headerImageSmall} src={LOGO_URL} />
            <Text style={styles.company}>Compagnie théâtrale Au Fil Des Actes</Text>
          </View>
          <Text style={styles.invoiceTitle}>FACTURE</Text>
        </View>

        {/* ===== META + DESTINATAIRE ===== */}
        <View style={styles.metaSection}>

          {/* Gauche — métadonnées facture */}
          <View style={styles.metaBlock}>
            <Text style={styles.metaLine}>
              Numéro : {invoice.invoiceNumber ?? '—'}
            </Text>
            <Text style={styles.metaLine}>
              Date : {invoice.issuedAt
                ? new Date(invoice.issuedAt).toLocaleDateString('fr-FR')
                : '—'}
            </Text>
            <Text style={styles.metaLine}>
              Saison : {invoice.season}
            </Text>
          </View>

          {/* Droite — destinataire */}
          <View style={styles.metaBlock}>
            <Text style={styles.metaLine}>{invoice.familyName}</Text>
            {invoice.familyAddress && (
              <Text style={styles.metaLine}>{invoice.familyAddress}</Text>
            )}
          </View>

        </View>

        {/* ===== TABLE ===== */}
        <View style={styles.table}>

          {/* Header */}
          <View style={[styles.row, styles.headerRow]}>
            <Text style={styles.cellLabel}>Désignation</Text>
            <Text style={styles.cellQty}>Qté</Text>
            <Text style={styles.cellUnit}>Prix unit.</Text>
            <Text style={styles.cellDiscount}>Réduction</Text>
            <Text style={styles.cellTotal}>Total</Text>
          </View>

          {/* Lines */}
          {invoice.itemsByMember.map(member => {
            const memberTotal = member.items.reduce(
              (sum, item) => sum + item.lineTotal,
              0
            );

            return (
              <View key={member.memberId} wrap={false}>

                {/* Member row */}
                <View style={[styles.row, styles.memberRow]}>
                  <Text style={styles.cellLabel}>
                    {member.memberName}
                  </Text>
                  <Text style={styles.cellQty}></Text>
                  <Text style={styles.cellUnit}></Text>
                  <Text style={styles.cellDiscount}></Text>
                  <Text style={styles.cellTotal}></Text>
                </View>

                {/* Items */}
                {member.items.map((item, i) => (
                  <View key={i} style={styles.row}>
                    <Text style={styles.cellLabel}>{item.label}</Text>
                    <Text style={styles.cellQty}>{item.quantity}</Text>
                    <Text style={styles.cellUnit}>{item.unitPrice.toFixed(2)} €</Text>
                    <Text style={styles.cellDiscount}>{item.discountPercent ? `${item.discountPercent}%`:'-'}</Text>
                    <Text style={styles.cellTotal}>{item.lineTotal.toFixed(2)} €</Text>
                  </View>
                ))}

              </View>
            );
          })}
        </View>

        {/* ===== TOTALS ===== */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Total</Text>
            <Text>{invoice.totalAmount.toFixed(2)} €</Text>
          </View>
        </View>

        <Text style={styles.separator}>
          Pour faire valoir ce que de droit
        </Text>

        <Text style={styles.conditions}>
          Conditions générales:
        </Text>
        <Text style={styles.conditions}>
          - TVA non applicable
        </Text>
        <Text style={styles.conditions}>
          - Association non assujettie aux impôts commerciaux
        </Text>

        {/* ===== FOOTER ===== */}
        <View style={styles.footer} fixed>

          <View style={styles.footerRow}>
            <Text style={styles.footerLabel}>Compagnie théâtrale Au Fil Des Actes</Text>
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
            <Text style={styles.footerValue}>
              contact@aufildesactes.fr
            </Text>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerLabel}>Numéro au Répertoire National des Associations (RNA)</Text>
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