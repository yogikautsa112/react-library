import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from '../../constant'
import Modal from '../../components/Modal'
import SearchBar from '../../components/SearchBar'
import Pagination from '../../components/Pagination' // Tambahkan import ini

export default function BooksIndex() {
    const [books, setBooks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [currentView, setCurrentView] = useState('table') // 'table' atau 'card'
    const [currentPage, setCurrentPage] = useState(1)
    const [booksPerPage] = useState(5)

    // State untuk modal
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [currentBook, setCurrentBook] = useState(null)

    // Auto-dismiss alert setelah 3 detik
    useEffect(() => {
        if (successMessage || error) {
            const timer = setTimeout(() => {
                setSuccessMessage('')
                setError('')
            }, 3000) // 3 detik

            return () => clearTimeout(timer) // Cleanup timer jika komponen unmount
        }
    }, [successMessage, error])

    // State untuk form
    const [formData, setFormData] = useState({
        no_rak: '',
        judul: '',
        pengarang: '',
        tahun_terbit: '',
        penerbit: '',
        stok: '',
        detail: ''
    })

    // Reset form
    const resetForm = () => {
        setFormData({
            no_rak: '',
            judul: '',
            pengarang: '',
            tahun_terbit: '',
            penerbit: '',
            stok: '',
            detail: ''
        })
    }

    // Mengambil data buku dari API
    const fetchBooks = async () => {
        setLoading(true)
        setError('')
        try {
            const response = await axios.get(`${API_URL}buku`)

            console.log('Data buku:', response.data)
            // Sesuaikan dengan struktur respons API
            setBooks(response.data.data || response.data)
            setLoading(false)
        } catch (err) {
            console.error('Error fetching books:', err)
            setError(err.response?.data?.message || 'Gagal mengambil data buku')
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBooks()
    }, [])

    // Filter buku berdasarkan pencarian
    const filteredBooks = books.filter(book => {
        return (
            book.judul?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.pengarang?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(book.id).includes(searchTerm)
        )
    })

    // Pagination logic
    const indexOfLastBook = currentPage * booksPerPage
    const indexOfFirstBook = indexOfLastBook - booksPerPage
    const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook)
    const totalPages = Math.ceil(filteredBooks.length / booksPerPage)

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
    const openEditModal = (book) => {
        setCurrentBook(book)
        setFormData({
            no_rak: book.no_rak || '',
            judul: book.judul || '',
            pengarang: book.pengarang || '',
            tahun_terbit: book.tahun_terbit || '',
            penerbit: book.penerbit || '',
            stok: book.stok || '',
            detail: book.detail || ''
        })
        setIsEditModalOpen(true)
    }

    // Open delete modal
    const openDeleteModal = (book) => {
        setCurrentBook(book)
        setIsDeleteModalOpen(true)
    }

    // Open detail modal
    const openDetailModal = (book) => {
        setCurrentBook(book)
        setIsDetailModalOpen(true)
    }

    // Create book
    const createBook = async (e) => {
        e.preventDefault()
        setError('')
        setSuccessMessage('')

        try {
            const response = await axios.post(`${API_URL}buku`, formData)

            console.log('Create response:', response.data)
            setSuccessMessage('Buku berhasil ditambahkan')
            setIsCreateModalOpen(false)
            resetForm()
            fetchBooks() // Refresh data
        } catch (err) {
            console.error('Error creating book:', err)
            setError(err.response?.data?.message || 'Gagal menambahkan buku')
        }
    }

    // Update book
    const updateBook = async (e) => {
        e.preventDefault()
        setError('')
        setSuccessMessage('')

        if (!currentBook) {
            setError('Terjadi kesalahan. Silakan coba lagi.')
            return
        }

        try {
            const response = await axios.put(`${API_URL}buku/${currentBook.id}`, formData)
            console.log('Update response:', response.data)
            setSuccessMessage('Buku berhasil diperbarui')
            setIsEditModalOpen(false)
            resetForm()
            fetchBooks() // Refresh data
        } catch (err) {
            console.error('Error updating book:', err)
            setError(err.response?.data?.message || 'Gagal memperbarui buku')
        }
    }

    // Delete book
    const deleteBook = async () => {
        setError('')
        setSuccessMessage('')

        if (!currentBook) {
            setError('Terjadi kesalahan. Silakan coba lagi.')
            return
        }

        try {
            const response = await axios.delete(`${API_URL}buku/${currentBook.id}`)

            console.log('Delete response:', response.data)
            setSuccessMessage('Buku berhasil dihapus')
            setIsDeleteModalOpen(false)
            fetchBooks() // Refresh data
        } catch (err) {
            console.error('Error deleting book:', err)
            setError(err.response?.data?.message || 'Gagal menghapus buku')
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in-down">
                {/* Bagian atas dengan judul, pencarian, dan kontrol tampilan */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Daftar Buku Perpustakaan</h1>
                            <p className="text-gray-600 mt-1">Kelola data buku perpustakaan dengan mudah</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <SearchBar
                                placeholder="Cari buku..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value)
                                    setCurrentPage(1) // Reset to first page on search
                                }}
                            />

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
                            </div>
                        </div>
                    </div>

                    {/* Info jumlah data */}
                    <div className="text-sm text-gray-600">
                        Menampilkan {filteredBooks.length > 0 ? `${indexOfFirstBook + 1}-${Math.min(indexOfLastBook, filteredBooks.length)} dari ${filteredBooks.length}` : '0'} buku
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
                        {/* Table View */}
                        {currentView === 'table' ? (
                            <div className="overflow-x-auto rounded-lg border border-gray-200 animate-slide-in-right">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pengarang</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penerbit</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentBooks.length > 0 ? (
                                            currentBooks.map((book, index) => (
                                                <tr key={book.id || index} className="hover:bg-gray-50 transition-colors duration-200">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{indexOfFirstBook + index + 1}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{book.judul || 'Judul tidak tersedia'}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.pengarang || 'Pengarang tidak tersedia'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.penerbit || 'Penerbit tidak tersedia'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.stok || '0'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <button
                                                            onClick={() => openDetailModal(book)}
                                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                                        >
                                                            Detail
                                                        </button>
                                                        <button
                                                            onClick={() => openEditModal(book)}
                                                            className="text-green-600 hover:text-green-900 mr-3"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => openDeleteModal(book)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                                                    Tidak ada data buku
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            /* Card View */
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                                {currentBooks.length > 0 ? (
                                    currentBooks.map((book, index) => (
                                        <div key={book.id || index} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                                            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600">
                                                <div className="flex justify-between items-center">
                                                    <h3 className="text-lg font-semibold text-white truncate">{book.judul || 'Judul tidak tersedia'}</h3>
                                                    <span className="text-white bg-blue-700 px-2 py-1 rounded-full text-xs">{indexOfFirstBook + index + 1}</span>
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <div className="mb-3">
                                                    <p className="text-sm text-gray-500">Pengarang</p>
                                                    <p className="text-gray-800">{book.pengarang || 'Pengarang tidak tersedia'}</p>
                                                </div>
                                                <div className="mb-3">
                                                    <p className="text-sm text-gray-500">Penerbit</p>
                                                    <p className="text-gray-800">{book.penerbit || 'Penerbit tidak tersedia'}</p>
                                                </div>
                                                <div className="mb-3">
                                                    <p className="text-sm text-gray-500">Stok</p>
                                                    <p className="text-gray-800">{book.stok || '0'}</p>
                                                </div>
                                                <div className="flex justify-end space-x-2 mt-4">
                                                    <button
                                                        onClick={() => openDetailModal(book)}
                                                        className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                                                    >
                                                        Detail
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(book)}
                                                        className="px-3 py-1 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors duration-200"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteModal(book)}
                                                        className="px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-200"
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
                                        <p className="text-gray-500">Tidak ada data buku</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                paginate={paginate}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Tambah Buku">
                <form onSubmit={createBook} className="space-y-4">
                    <div>
                        <label htmlFor="no_rak" className="block text-sm font-medium text-gray-700 mb-1">No. Rak</label>
                        <input
                            type="text"
                            id="no_rak"
                            name="no_rak"
                            value={formData.no_rak}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="judul" className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                        <input
                            type="text"
                            id="judul"
                            name="judul"
                            value={formData.judul}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="pengarang" className="block text-sm font-medium text-gray-700 mb-1">Pengarang</label>
                        <input
                            type="text"
                            id="pengarang"
                            name="pengarang"
                            value={formData.pengarang}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="tahun_terbit" className="block text-sm font-medium text-gray-700 mb-1">Tahun Terbit</label>
                        <input
                            type="text"
                            id="tahun_terbit"
                            name="tahun_terbit"
                            value={formData.tahun_terbit}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="penerbit" className="block text-sm font-medium text-gray-700 mb-1">Penerbit</label>
                        <input
                            type="text"
                            id="penerbit"
                            name="penerbit"
                            value={formData.penerbit}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="stok" className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
                        <input
                            type="number"
                            id="stok"
                            name="stok"
                            value={formData.stok}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="detail" className="block text-sm font-medium text-gray-700 mb-1">Detail</label>
                        <textarea
                            id="detail"
                            name="detail"
                            value={formData.detail}
                            onChange={handleInputChange}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(false)}
                            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Simpan
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Buku">
                <form onSubmit={updateBook} className="space-y-4">
                    <div>
                        <label htmlFor="edit_no_rak" className="block text-sm font-medium text-gray-700 mb-1">No. Rak</label>
                        <input
                            type="text"
                            id="edit_no_rak"
                            name="no_rak"
                            value={formData.no_rak}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="edit_judul" className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                        <input
                            type="text"
                            id="edit_judul"
                            name="judul"
                            value={formData.judul}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="edit_pengarang" className="block text-sm font-medium text-gray-700 mb-1">Pengarang</label>
                        <input
                            type="text"
                            id="edit_pengarang"
                            name="pengarang"
                            value={formData.pengarang}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="edit_tahun_terbit" className="block text-sm font-medium text-gray-700 mb-1">Tahun Terbit</label>
                        <input
                            type="text"
                            id="edit_tahun_terbit"
                            name="tahun_terbit"
                            value={formData.tahun_terbit}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="edit_penerbit" className="block text-sm font-medium text-gray-700 mb-1">Penerbit</label>
                        <input
                            type="text"
                            id="edit_penerbit"
                            name="penerbit"
                            value={formData.penerbit}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="edit_stok" className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
                        <input
                            type="number"
                            id="edit_stok"
                            name="stok"
                            value={formData.stok}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="edit_detail" className="block text-sm font-medium text-gray-700 mb-1">Detail</label>
                        <textarea
                            id="edit_detail"
                            name="detail"
                            value={formData.detail}
                            onChange={handleInputChange}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsEditModalOpen(false)}
                            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Simpan
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Detail Modal */}
            <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Detail Buku">
                {currentBook && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1 text-gray-600">ID</div>
                            <div className="col-span-2 font-medium">{currentBook.id}</div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1 text-gray-600">No. Rak</div>
                            <div className="col-span-2 font-medium">{currentBook.no_rak || '-'}</div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1 text-gray-600">Judul</div>
                            <div className="col-span-2 font-medium">{currentBook.judul || '-'}</div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1 text-gray-600">Pengarang</div>
                            <div className="col-span-2 font-medium">{currentBook.pengarang || '-'}</div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1 text-gray-600">Tahun Terbit</div>
                            <div className="col-span-2 font-medium">{currentBook.tahun_terbit || '-'}</div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1 text-gray-600">Penerbit</div>
                            <div className="col-span-2 font-medium">{currentBook.penerbit || '-'}</div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1 text-gray-600">Stok</div>
                            <div className="col-span-2 font-medium">{currentBook.stok || '0'}</div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1 text-gray-600">Detail</div>
                            <div className="col-span-2 font-medium">{currentBook.detail || '-'}</div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1 text-gray-600">Tanggal Dibuat</div>
                            <div className="col-span-2 font-medium">{formatDate(currentBook.created_at)}</div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1 text-gray-600">Terakhir Diperbarui</div>
                            <div className="col-span-2 font-medium">{formatDate(currentBook.updated_at)}</div>
                        </div>
                        <div className="pt-4 flex justify-end">
                            <button
                                onClick={() => setIsDetailModalOpen(false)}
                                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Modal */}
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Hapus Buku">
                {currentBook && (
                    <div>
                        <p className="text-gray-700 mb-6">Apakah Anda yakin ingin menghapus buku <span className="font-semibold">{currentBook.judul}</span>?</p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Batal
                            </button>
                            <button
                                onClick={deleteBook}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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