import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 30
    },
    header: {
        marginBottom: 20,
        textAlign: 'center'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10
    },
    subtitle: {
        fontSize: 12,
        color: '#666',
        marginBottom: 20
    },
    table: {
        display: 'table',
        width: 'auto',
        marginVertical: 10,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        borderBottomStyle: 'solid',
    },
    tableHeader: {
        backgroundColor: '#f3f4f6',
        padding: 5,
    },
    tableCell: {
        padding: 5,
    },
    col1: { width: '10%' },
    col2: { width: '30%' },
    col3: { width: '35%' },
    col4: { width: '25%' },
});

const MemberPDF = ({ members, formatDate }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.title}>Laporan Data Member Perpustakaan</Text>
                <Text style={styles.subtitle}>Tanggal: {new Date().toLocaleDateString('id-ID')}</Text>
            </View>

            <View style={styles.table}>
                {/* Table Header */}
                <View style={[styles.tableRow, styles.tableHeader]}>
                    <Text style={[styles.tableCell, styles.col1]}>ID</Text>
                    <Text style={[styles.tableCell, styles.col2]}>Nama</Text>
                    <Text style={[styles.tableCell, styles.col3]}>Alamat</Text>
                    <Text style={[styles.tableCell, styles.col4]}>Tanggal Daftar</Text>
                </View>

                {/* Table Body */}
                {members.map((member, index) => (
                    <View key={member.id || index} style={styles.tableRow}>
                        <Text style={[styles.tableCell, styles.col1]}>{index + 1}</Text>
                        <Text style={[styles.tableCell, styles.col2]}>{member.nama || '-'}</Text>
                        <Text style={[styles.tableCell, styles.col3]}>{member.alamat || '-'}</Text>
                        <Text style={[styles.tableCell, styles.col4]}>
                            {formatDate(member.created_at)}
                        </Text>
                    </View>
                ))}
            </View>
        </Page>
    </Document>
);

export default MemberPDF;