import React from 'react';

export default function FineTable({
    fines,
    getMemberById, // Terima fungsi untuk mendapatkan data member
    getBookById,   // Terima fungsi untuk mendapatkan data buku
    formatDate,
    openDetailModal
    // Terima fungsi aksi lain jika ada
}) {
    return (
        <div className="overflow-x-auto rounded-lg border border-gray-200 animate-slide-in-right">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buku</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Denda</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis Denda</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {fines.length > 0 ? (
                        fines.map((fine, index) => (
                            <tr key={fine.id || index} className="hover:bg-gray-50 transition-colors duration-200">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fine.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {getMemberById(fine.id_member)?.nama || 'Tidak diketahui'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {getBookById(fine.id_buku)?.judul || 'Tidak diketahui'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    Rp {parseInt(fine.jumlah_denda).toLocaleString('id-ID')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {fine.jenis_denda || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {fine.deskripsi || '-'}
                                </td>
                                {/* Tampilkan tanggal jika ada */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(fine.created_at)} {/* Menggunakan created_at sebagai contoh tanggal */}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => openDetailModal(fine)}
                                        className="text-blue-600 hover:text-blue-900 mr-3"
                                    >
                                        Detail
                                    </button>
                                    {/* Tambahkan tombol aksi lain jika ada (misal: Edit, Hapus) */}
                                    {/* <button
                                        onClick={() => openEditModal(fine)}
                                        className="text-yellow-600 hover:text-yellow-900 mr-3"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => openDeleteModal(fine)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Hapus
                                    </button> */}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500"> {/* Ubah colspan menjadi 8 */}
                                Tidak ada data denda
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}