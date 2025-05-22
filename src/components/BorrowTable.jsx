import React from 'react'

export default function BorrowTable({
    borrows,
    getBookById,
    getMemberById,
    formatDate,
    openDetailModal,
    openReturnModal
}) {
    return (
        <div className="overflow-x-auto rounded-lg border border-gray-200 animate-slide-in-right">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">-</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buku</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tgl Pinjam</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tgl Kembali</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {borrows.length > 0 ? (
                        borrows.map((borrow, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{borrow.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {getMemberById(borrow.id_member)?.nama || 'Nama tidak tersedia'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {getBookById(borrow.id_buku)?.judul || 'Judul tidak tersedia'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(borrow.tgl_pinjam)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(borrow.tgl_pengembalian)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${borrow.status_pengembalian === 1 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {borrow.status_pengembalian === 1 ? 'Dikembalikan' : 'Dipinjam'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => openDetailModal(borrow)}
                                        className="text-blue-600 hover:text-blue-900 mr-3"
                                    >
                                        Detail
                                    </button>
                                    {borrow.status_pengembalian === 0 && (
                                        <button
                                            onClick={() => openReturnModal(borrow)}
                                            className="text-green-600 hover:text-green-900"
                                        >
                                            Kembalikan
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                                Tidak ada data peminjaman
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}