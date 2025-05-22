import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 30,
        backgroundColor: '#FFFFFF',
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },
    memberInfo: {
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#f3f4f6',
    },
    memberInfoText: {
        fontSize: 12,
        marginBottom: 4,
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
        minHeight: 30,
        alignItems: 'center',
    },
    tableHeader: {
        backgroundColor: '#f3f4f6',
    },
    tableCol: {
        padding: 5,
    },
    colBuku: { width: '35%' },
    colTanggal: { width: '25%' },
    colStatus: { width: '20%' },
    colKeterangan: { width: '20%' },
    emptyMessage: {
        marginVertical: 20,
        textAlign: 'center',
    },
});

const BorrowingHistoryPDF = ({ member, borrowings, formatDate }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.title}>Riwayat Peminjaman Buku</Text>
                <Text style={styles.subtitle}>
                    Tanggal: {new Date().toLocaleDateString('id-ID')}
                </Text>
            </View>

            <View style={styles.memberInfo}>
                <Text style={styles.memberInfoText}>Nama: {member.nama}</Text>
                <Text style={styles.memberInfoText}>No. KTP: {member.no_ktp}</Text>
                <Text style={styles.memberInfoText}>Alamat: {member.alamat}</Text>
                <Text style={styles.memberInfoText}>
                    Tanggal Bergabung: {formatDate(member.created_at)}
                </Text>
            </View>

            <View style={styles.table}>
                {borrowings && borrowings.length > 0 ? (
                    <>
                        <View style={[styles.tableRow, styles.tableHeader]}>
                            <View style={[styles.tableCol, styles.colBuku]}>
                                <Text>Judul Buku</Text>
                            </View>
                            <View style={[styles.tableCol, styles.colTanggal]}>
                                <Text>Tanggal Pinjam</Text>
                            </View>
                            <View style={[styles.tableCol, styles.colTanggal]}>
                                <Text>Tanggal Kembali</Text>
                            </View>
                            <View style={[styles.tableCol, styles.colStatus]}>
                                <Text>Status</Text>
                            </View>
                        </View>

                        {borrowings.map((borrowing, index) => (
                            <View key={index} style={styles.tableRow}>
                                <View style={[styles.tableCol, styles.colBuku]}>
                                    <Text>{borrowing.buku.judul}</Text>
                                </View>
                                <View style={[styles.tableCol, styles.colTanggal]}>
                                    <Text>{formatDate(borrowing.tgl_pinjam)}</Text>
                                </View>
                                <View style={[styles.tableCol, styles.colTanggal]}>
                                    <Text>{formatDate(borrowing.tgl_kembali) || '-'}</Text>
                                </View>
                                <View style={[styles.tableCol, styles.colStatus]}>
                                    <Text>{borrowing.status}</Text>
                                </View>
                            </View>
                        ))}
                    </>
                ) : (
                    <View style={styles.emptyMessage}>
                        <Text>Tidak ada riwayat peminjaman untuk member ini</Text>
                    </View>
                )}
            </View>

            <View style={[styles.memberInfo, { marginTop: 20 }]}>
                <Text style={styles.memberInfoText}>
                    * Data diambil pada: {new Date().toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </Text>
            </View>
        </Page>
    </Document>
);

export default BorrowingHistoryPDF;