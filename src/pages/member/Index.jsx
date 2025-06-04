import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from '../../constant'
import Modal from '../../components/Modal'
import Pagination from '../../components/Pagination'
import { PDFDownloadLink } from '@react-pdf/renderer';
import MemberPDF from '../../components/MemberPDF';
import BorrowingHistoryPDF from '../../components/BorrowingHistoryPDF';
import { useRef } from 'react';

export default function MemberIndex() {
    const [members, setMembers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [currentView, setCurrentView] = useState('table') // 'table' atau 'card'
    const [currentPage, setCurrentPage] = useState(1)
    const [membersPerPage] = useState(5)
    const [borrowingHistory, setBorrowingHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // State untuk modal
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [currentMember, setCurrentMember] = useState(null)


    const printRef = useRef();

    // State untuk form
    const [formData, setFormData] = useState({
        no_ktp: '',
        nama: '',
        alamat: '',
        tgl_lahir: ''
    })

    // Reset form
    const resetForm = () => {
        setFormData({
            no_ktp: '',
            nama: '',
            alamat: '',
            tgl_lahir: ''
        })
    }

    // Mengambil data member dari API
    const fetchMembers = async () => {
        setLoading(true)
        setError('')
        try {
            const response = await axios.get(`${API_URL}member`)

            console.log('Data members:', response.data)
            setMembers(response.data.data || response.data)
            setLoading(false)
        } catch (err) {
            console.error('Error fetching members:', err)
            setError(err.response?.data?.message || 'Gagal mengambil data member')
            setLoading(false)
        }
    }

    // Update the fetchBorrowingHistory function
    const fetchBorrowingHistory = async (memberId) => {
        try {
            const peminjamanResponse = await axios.get(`${API_URL}peminjaman`);
            const allBorrowings = peminjamanResponse.data.data || peminjamanResponse.data;
            const bukuResponse = await axios.get(`${API_URL}buku`);
            const allBooks = bukuResponse.data.data || bukuResponse.data;

            const memberBorrowings = allBorrowings
                .filter(borrowing => {
                    const matches = borrowing.id_member === memberId;
                    return matches;
                })
                .map(borrowing => {
                    const book = allBooks.find(book => book.id === borrowing.id_buku);
                    return {
                        ...borrowing,
                        buku: book || { judul: 'Buku tidak ditemukan' }
                    };
                });

            // Sort results
            memberBorrowings.sort((a, b) =>
                new Date(b.tgl_pinjam) - new Date(a.tgl_pinjam)
            );
            return memberBorrowings;
        } catch (err) {
            console.error('❌ Error in fetchBorrowingHistory:', err);
            console.error('Error details:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });
            throw err;
        }
    };

    useEffect(() => {
        fetchMembers()
    }, [])

    // Filter member berdasarkan pencarian
    const filteredMembers = members.filter(member => {
        return (
            member.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.alamat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(member.id).includes(searchTerm)
        )
    })

    // Pagination logic
    const indexOfLastMember = currentPage * membersPerPage
    const indexOfFirstMember = indexOfLastMember - membersPerPage
    const currentMembers = filteredMembers.slice(indexOfFirstMember, indexOfLastMember)
    const totalPages = Math.ceil(filteredMembers.length / membersPerPage)

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber)

    // Format tanggal
    const formatDate = (dateString) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })
    }

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value
        })
    }

    // Open create modal
    const openCreateModal = () => {
        resetForm()
        setIsCreateModalOpen(true)
    }

    // Open edit modal
    const openEditModal = (member) => {
        setCurrentMember(member)
        setFormData({
            no_ktp: member.no_ktp || '',
            nama: member.nama || '',
            alamat: member.alamat || '',
            tgl_lahir: member.tgl_lahir || ''
        })
        setIsEditModalOpen(true)
    }

    // Open delete modal
    const openDeleteModal = (member) => {
        setCurrentMember(member)
        setIsDeleteModalOpen(true)
    }

    // Update openDetailModal to include debugging
    const openDetailModal = async (member) => {
        console.log('🔵 Opening detail modal for member:', member);
        setCurrentMember(member);
        setLoadingHistory(true);
        try {
            const history = await fetchBorrowingHistory(member.id);
            console.log('📊 Retrieved history:', history);
            setBorrowingHistory(history);
        } catch (err) {
            console.error('❌ Error in openDetailModal:', err);
            setError('Gagal mengambil riwayat peminjaman');
        } finally {
            setLoadingHistory(false);
        }
        setIsDetailModalOpen(true);
    };

    // Create member
    const createMember = async (e) => {
        e.preventDefault()
        setError('')
        setSuccessMessage('')

        try {
            const response = await axios.post(`${API_URL}member`, formData)

            console.log('Create response:', response.data)
            setSuccessMessage('Member berhasil ditambahkan')
            setIsCreateModalOpen(false)
            resetForm()
            fetchMembers() // Refresh data
        } catch (err) {
            console.error('Error creating member:', err)
            setError(err.response?.data?.message || 'Gagal menambahkan member')
        }
    }

    // Update member
    const updateMember = async (e) => {
        e.preventDefault()
        setError('')
        setSuccessMessage('')

        if (!currentMember) {
            setError('Terjadi kesalahan. Silakan coba lagi.')
            return
        }

        try {
            const response = await axios.put(`${API_URL}member/${currentMember.id}`, formData)
            console.log('Update response:', response.data)
            setSuccessMessage('Member berhasil diperbarui')
            setIsEditModalOpen(false)
            resetForm()
            fetchMembers() // Refresh data
        } catch (err) {
            console.error('Error updating member:', err)
            setError(err.response?.data?.message || 'Gagal memperbarui member')
        }
    }

    // Delete member
    const deleteMember = async () => {
        setError('')
        setSuccessMessage('')

        if (!currentMember) {
            setError('Terjadi kesalahan. Silakan coba lagi.')
            return
        }

        try {
            const response = await axios.delete(`${API_URL}member/${currentMember.id}`)

            console.log('Delete response:', response.data)
            setSuccessMessage('Member berhasil dihapus')
            setIsDeleteModalOpen(false)
            await fetchMembers() // Wait for the data to be refreshed
            window.location.reload() // Refresh the page to ensure clean state
        } catch (err) {
            console.error('Error deleting member:', err)
            setError(err.response?.data?.message || 'Gagal menghapus member')
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in-down">
                {/* Bagian atas dengan judul, pencarian, dan kontrol tampilan */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Daftar Member Perpustakaan</h1>
                            <p className="text-gray-600 mt-1">Kelola data member perpustakaan dengan mudah</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Cari member..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value)
                                        setCurrentPage(1) // Reset to first page on search
                                    }}
                                />
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setCurrentView('table')}
                                    className={`px-3 py-2 rounded-lg flex items-center ${currentView === 'table' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
                                    </svg>
                                    Tabel
                                </button>
                                <button
                                    onClick={() => setCurrentView('card')}
                                    className={`px-3 py-2 rounded-lg flex items-center ${currentView === 'card' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                    Kartu
                                </button>
                                <button
                                    onClick={openCreateModal}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center transition-colors duration-200"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    Tambah
                                </button>
                                <button
                                    className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-full flex items-center transition-colors duration-200 shadow-lg z-50"
                                >
                                    <PDFDownloadLink
                                        document={<MemberPDF members={filteredMembers} formatDate={formatDate} />}
                                        fileName={`Laporan_Member_${new Date().toLocaleDateString('id-ID')}.pdf`}
                                        className="flex items-center"
                                    >
                                        {({ loading }) =>
                                            loading ? (
                                                <>
                                                    <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Generating PDF...
                                                </>
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                                    </svg>
                                                    Download PDF
                                                </>
                                            )
                                        }
                                    </PDFDownloadLink>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Info jumlah data */}
                    <div className="text-sm text-gray-600">
                        Menampilkan {filteredMembers.length > 0 ? `${indexOfFirstMember + 1}-${Math.min(indexOfLastMember, filteredMembers.length)} dari ${filteredMembers.length}` : '0'} member
                        {searchTerm && ` untuk pencarian "${searchTerm}"`}
                    </div>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="mx-6 mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg animate-fade-in-down" role="alert">
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <p>{successMessage}</p>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mx-6 mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg" role="alert">
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p>{error}</p>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="flex justify-center items-center p-12">
                        <div className="flex flex-col items-center">
                            <svg className="animate-spin h-10 w-10 mb-3 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-blue-600">Memuat data...</span>
                        </div>
                    </div>
                ) : (
                    <div className="p-6">
                        <div ref={printRef} className="print-content bg-white">
                            <div className="hidden print:block print-header">
                                <h1 className="text-2xl font-bold">Laporan Data Member Perpustakaan</h1>
                                <p className="text-gray-600">Tanggal: {new Date().toLocaleDateString('id-ID')}</p>
                            </div>
                            {/* Table View */}
                            {currentView === 'table' ? (
                                <div className="overflow-x-auto rounded-lg border border-gray-200 animate-slide-in-right">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alamat</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Daftar</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider no-print">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {currentMembers.length > 0 ? (
                                                currentMembers.map((member, index) => (
                                                    <tr key={member.id || index} className="hover:bg-gray-50 transition-colors duration-200">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{indexOfFirstMember + index + 1}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">{member.nama || 'Nama tidak tersedia'}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.alamat || 'Alamat tidak tersedia'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {formatDate(member.created_at)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium no-print">
                                                            <button
                                                                onClick={() => openDetailModal(member)}
                                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                                            >
                                                                Detail
                                                            </button>
                                                            <button
                                                                onClick={() => openEditModal(member)}
                                                                className="text-green-600 hover:text-green-900 mr-3"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => openDeleteModal(member)}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                Hapus
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                                        Tidak ada data member
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                // Card View - tidak ditampilkan saat print
                                <div className="no-print grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {currentMembers.map((member, index) => (
                                        <div key={member.id || index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{member.nama || 'Nama tidak tersedia'}</h3>
                                            <p className="text-gray-600 mb-4">{member.alamat || 'Alamat tidak tersedia'}</p>
                                            <p className="text-sm text-gray-500 mb-4">Terdaftar: {formatDate(member.created_at)}</p>
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => openDetailModal(member)}
                                                    className="text-blue-600 hover:text-blue-900">Detail</button>
                                                <button onClick={() => openEditModal(member)} className="text-green-600 hover:text-green-900">Edit</button>
                                                <button onClick={() => openDeleteModal(member)} className="text-red-600 hover:text-red-900">Hapus</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Pagination - hide when printing */}
                        {!loading && filteredMembers.length > membersPerPage && (
                            <div className="mt-4 no-print">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    paginate={paginate}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
            {/* Create Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Tambah Member Baru">
                <form onSubmit={createMember}>
                    <div className="mb-4">
                        <label htmlFor="no_ktp" className="block text-sm font-medium text-gray-700 mb-1">Nomor KTP</label>
                        <input
                            type="text"
                            id="no_ktp"
                            name="no_ktp"
                            value={formData.no_ktp}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                        <input
                            type="text"
                            id="nama"
                            name="nama"
                            value={formData.nama}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="alamat" className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                        <textarea
                            id="alamat"
                            name="alamat"
                            value={formData.alamat}
                            onChange={handleInputChange}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        ></textarea>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="tgl_lahir" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                        <input
                            type="date"
                            id="tgl_lahir"
                            name="tgl_lahir"
                            value={formData.tgl_lahir}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-2 mt-6">
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(false)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Simpan
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Member">
                {currentMember && (
                    <form onSubmit={updateMember}>
                        <div className="mb-4">
                            <label htmlFor="edit-no_ktp" className="block text-sm font-medium text-gray-700 mb-1">Nomor KTP</label>
                            <input
                                type="text"
                                id="edit-no_ktp"
                                name="no_ktp"
                                value={formData.no_ktp}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="edit-nama" className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                            <input
                                type="text"
                                id="edit-nama"
                                name="nama"
                                value={formData.nama}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="edit-alamat" className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                            <textarea
                                id="edit-alamat"
                                name="alamat"
                                value={formData.alamat}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                required
                            ></textarea>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="edit-tgl_lahir" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                            <input
                                type="date"
                                id="edit-tgl_lahir"
                                name="tgl_lahir"
                                value={formData.tgl_lahir}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        <div className="flex justify-end space-x-2 mt-6">
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Simpan
                            </button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Detail Modal */}
            <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Detail Member">
                {currentMember && (
                    <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-bold text-blue-800">{currentMember.nama || 'Nama tidak tersedia'}</h3>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 py-3">
                            <h4 className="text-sm font-medium text-gray-500 mb-1">Nomor KTP</h4>
                            <p className="text-gray-800">{currentMember.no_ktp || 'Nomor KTP tidak tersedia'}</p>
                        </div>

                        <div className="border-b border-gray-200 py-3">
                            <h4 className="text-sm font-medium text-gray-500 mb-1">Alamat</h4>
                            <p className="text-gray-800">{currentMember.alamat || 'Alamat tidak tersedia'}</p>
                        </div>

                        <div className="border-b border-gray-200 py-3">
                            <h4 className="text-sm font-medium text-gray-500 mb-1">Tanggal Lahir</h4>
                            <p className="text-gray-800">{formatDate(currentMember.tgl_lahir) || '-'}</p>
                        </div>

                        <div className="border-b border-gray-200 py-3">
                            <h4 className="text-sm font-medium text-gray-500 mb-1">Tanggal Daftar</h4>
                            <p className="text-gray-800">{formatDate(currentMember.created_at)}</p>
                        </div>

                        <div className="border-b border-gray-200 py-3">
                            <h4 className="text-sm font-medium text-gray-500 mb-1">Terakhir Diperbarui</h4>
                            <p className="text-gray-800">{formatDate(currentMember.updated_at) || '-'}</p>
                        </div>

                        <div className="border-t border-gray-200 pt-4 mt-4">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-lg font-medium text-gray-900">Riwayat Peminjaman</h4>
                                <PDFDownloadLink
                                    document={
                                        <BorrowingHistoryPDF
                                            member={currentMember}
                                            borrowings={borrowingHistory}
                                            formatDate={formatDate}
                                        />
                                    }
                                    fileName={`Riwayat_Peminjaman_${currentMember.nama}_${new Date().toLocaleDateString('id-ID')}.pdf`}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                                >
                                    {({ loading }) =>
                                        loading ? 'Menyiapkan PDF...' : 'Download PDF'
                                    }
                                </PDFDownloadLink>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Buku</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Pinjam</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Kembali</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {loadingHistory ? (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-4 text-center">
                                                    <div className="flex justify-center items-center">
                                                        <svg className="animate-spin h-5 w-5 mr-2 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        <span>Memuat riwayat peminjaman...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : borrowingHistory.length > 0 ? (
                                            borrowingHistory.map((borrowing, index) => (
                                                <tr key={index}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {borrowing.buku.judul}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDate(borrowing.tgl_pinjam)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDate(borrowing.tgl_pengembalian) || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {borrowing.status_pengembalian === 1 ? 'Dikembalikan' : 'Dipinjam'}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                                                    Tidak ada riwayat peminjaman
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => setIsDetailModalOpen(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Hapus Member">
                {currentMember && (
                    <div>
                        <div className="bg-red-50 p-4 rounded-lg mb-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">Konfirmasi Penghapusan</h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <p>Apakah Anda yakin ingin menghapus member <strong>{currentMember.nama}</strong>? Tindakan ini tidak dapat dibatalkan.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 mt-6">
                            <button
                                type="button"
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={deleteMember}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}
