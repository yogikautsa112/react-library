import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from '../../../constant'
import Modal from '../../../components/Modal'
import SearchBar from '../../../components/SearchBar'
import BorrowTable from '../../../components/BorrowTable'
import Pagination from '../../../components/Pagination'
import AlertMessage from '../../../components/AlertMessage'
import LoadingSpinner from '../../../components/LoadingSpinner'
import * as XLSX from 'xlsx';

export default function BorrowIndex() {
    const STATUS_DIPINJAM = 0
    const STATUS_DIKEMBALIKAN = 1

    const [borrows, setBorrows] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [borrowsPerPage] = useState(5)

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [currentBorrow, setCurrentBorrow] = useState(null)

    const [formData, setFormData] = useState({
        member_id: '',
        book_id: '',
        tanggal_pinjam: new Date().toISOString().split('T')[0],
        tanggal_kembali: '',
    })

    const [returnFormData, setReturnFormData] = useState({
        jumlah_denda: 0,
        jenis_denda: '',
        deskripsi: ''
    })

    const [members, setMembers] = useState([])
    const [books, setBooks] = useState([])

    useEffect(() => {
        if (successMessage || error) {
            const timer = setTimeout(() => {
                setSuccessMessage('')
                setError('')
            }, 3000)

            return () => clearTimeout(timer)
        }
    }, [successMessage, error])

    const fetchBorrows = async () => {
        setLoading(true)
        setError('')
        try {
            const response = await axios.get(`${API_URL}peminjaman`)
            const data = response.data.data || response.data

            if (Array.isArray(data)) {
                setBorrows(data)
            } else {
                console.error('Data peminjaman bukan array:', data)
                setBorrows([])
            }

            setLoading(false)
        } catch (err) {
            console.error('Error fetching borrows:', err)
            setError(err.response?.data?.message || 'Gagal mengambil data peminjaman')
            setLoading(false)
        }
    }

    const fetchReferences = async () => {
        try {
            const [membersResponse, booksResponse] = await Promise.all([
                axios.get(`${API_URL}member`),
                axios.get(`${API_URL}buku`)
            ])

            setMembers(membersResponse.data.data || membersResponse.data)
            setBooks(booksResponse.data.data || booksResponse.data)
        } catch (err) {
            console.error('Error fetching references:', err)
            setError('Gagal mengambil data referensi')
        }
    }

    useEffect(() => {
        fetchBorrows()
        fetchReferences()
    }, [])

    const getMemberById = (memberId) => {
        return members.find(member => member.id === memberId) || null;
    }

    const getBookById = (bookId) => {
        return books.find(book => book.id === bookId) || null;
    }

    const filteredBorrows = borrows.filter(borrow => {
        const member = getMemberById(borrow.id_member);
        const book = getBookById(borrow.id_buku);
        return (
            member?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book?.judul?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(borrow.id).includes(searchTerm)
        )
    })

    const indexOfLastBorrow = currentPage * borrowsPerPage
    const indexOfFirstBorrow = indexOfLastBorrow - borrowsPerPage
    const currentBorrows = filteredBorrows.slice(indexOfFirstBorrow, indexOfLastBorrow)
    const totalPages = Math.ceil(filteredBorrows.length / borrowsPerPage)

    const paginate = (pageNumber) => setCurrentPage(pageNumber)

    const formatDate = (dateString) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value
        })

        if (name === 'tanggal_pinjam') {
            const borrowDate = new Date(value)
            const returnDate = new Date(borrowDate)
            returnDate.setDate(borrowDate.getDate() + 7)

            setFormData(prev => ({
                ...prev,
                tanggal_kembali: returnDate.toISOString().split('T')[0]
            }))
        }
    }

    const handleReturnInputChange = (e) => {
        const { name, value } = e.target
        setReturnFormData({
            ...returnFormData,
            [name]: value
        })
    }

    const openReturnModal = (borrow) => {
        setCurrentBorrow(borrow)
        setReturnFormData({
            jumlah_denda: 0,
            jenis_denda: '',
            deskripsi: ''
        })
        setIsReturnModalOpen(true)
    }

    const openDetailModal = (borrow) => {
        setCurrentBorrow(borrow)
        setIsDetailModalOpen(true)
    }

    const createBorrow = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        try {
            if (!formData.member_id || !formData.book_id) {
                setError('Harap pilih member dan buku');
                return;
            }

            const book = books.find(b => b.id === parseInt(formData.book_id));
            if (!book || book.stok <= 0) {
                setError(book ? `Stok buku "${book.judul}" habis` : 'Buku tidak ditemukan');
                return;
            }

            const dataToSend = {
                id_buku: parseInt(formData.book_id),
                id_member: parseInt(formData.member_id),
                tgl_pinjam: formData.tanggal_pinjam,
                tgl_pengembalian: formData.tanggal_kembali,
                status_peminjaman: STATUS_DIPINJAM // Ensure status is set to DIPINJAM
            };

            // Create new peminjaman with DIPINJAM status
            const response = await axios.post(`${API_URL}peminjaman`, dataToSend);

            // Update book stock
            await axios.put(`${API_URL}buku/${book.id}`, {
                ...book,
                stok: book.stok - 1
            });

            setSuccessMessage(`Peminjaman buku "${book.judul}" berhasil`);
            setIsCreateModalOpen(false);
            setFormData({
                member_id: '',
                book_id: '',
                tanggal_pinjam: new Date().toISOString().split('T')[0],
                tanggal_kembali: '',
            });

            fetchBorrows();
            fetchReferences();
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mencatat peminjaman. Silakan coba lagi.');
        }
    };

    const calculateFine = (dueDate, returnDate) => {
        const due = new Date(dueDate);
        const returned = new Date(returnDate);
        const diffTime = returned - due;

        if (diffTime > 0) {
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays * 5000;
        }
        return 0;
    };

    // Update returnBook function
    const returnBook = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!currentBorrow) {
            setError('Terjadi kesalahan. Silakan coba lagi.');
            return;
        }

        try {
            const today = new Date().toISOString().split('T')[0];
            const fine = calculateFine(currentBorrow.tgl_pengembalian, today);
            console.log('Calculated fine:', fine);

            // Create denda record if there's a fine
            if (fine > 0) {
                const dendaData = {
                    id_peminjaman: currentBorrow.id,
                    id_member: currentBorrow.id_member,
                    id_buku: currentBorrow.id_buku,
                    jumlah_denda: fine.toString(), // Convert to string
                    jenis_denda: 'terlambat',
                    deskripsi: `Keterlambatan pengembalian ${Math.ceil((new Date(today) - new Date(currentBorrow.tgl_pengembalian)) / (1000 * 60 * 60 * 24))} hari`,
                    status_pembayaran: '0', // Convert to string
                    tanggal: today
                };

                console.log('Sending denda data:', dendaData);

                try {
                    const dendaResponse = await axios.post(`${API_URL}denda`, dendaData);
                    console.log('Denda creation response:', dendaResponse.data);
                    if (!dendaResponse.data) {
                        throw new Error('Empty response from denda creation');
                    }
                } catch (dendaError) {
                    console.error('Error creating denda:', dendaError);
                    console.error('Error response:', dendaError.response?.data);
                    throw new Error(`Gagal membuat record denda: ${dendaError.response?.data?.message || dendaError.message}`);
                }
            }

            // Update peminjaman status
            const returnData = {
                tanggal_pengembalian: today,
                status_peminjaman: STATUS_DIKEMBALIKAN,
                denda: fine > 0 ? fine : null,
                tanggal_denda: fine > 0 ? today : null,
                jenis_denda: fine > 0 ? 'terlambat' : null,
                deskripsi: fine > 0 ? `Keterlambatan pengembalian ${Math.ceil((new Date(today) - new Date(currentBorrow.tgl_pengembalian)) / (1000 * 60 * 60 * 24))} hari` : null
            };

            console.log('Updating peminjaman with:', returnData);

            try {
                const peminjamanResponse = await axios.put(`${API_URL}peminjaman/pengembalian/${currentBorrow.id}`, returnData);
                console.log('Peminjaman update response:', peminjamanResponse.data);
            } catch (peminjamanError) {
                console.error('Error updating peminjaman:', peminjamanError.response?.data || peminjamanError);
                throw new Error('Gagal mengupdate status peminjaman');
            }

            const book = getBookById(currentBorrow.id_buku);
            if (book) {
                const bookData = {
                    ...book,
                    stok: book.stok + 1
                };

                console.log('Updating book stock:', bookData);

                try {
                    const bookResponse = await axios.put(`${API_URL}buku/${book.id}`, bookData);
                    console.log('Book update response:', bookResponse.data);
                } catch (bookError) {
                    console.error('Error updating book:', bookError.response?.data || bookError);
                    throw new Error('Gagal mengupdate stok buku');
                }
            }

            setSuccessMessage(`Buku "${book?.judul || 'yang dipinjam'}" berhasil dikembalikan${fine > 0 ? ` dengan denda keterlambatan Rp ${fine.toLocaleString('id-ID')}` : ''}.`);
            setIsReturnModalOpen(false);

            await fetchBorrows();
            await fetchReferences();
        } catch (err) {
            console.error('Final error:', err);
            setError(err.message || 'Gagal mengembalikan buku. Silakan coba lagi.');
        }
    };

    const exportToExcel = () => {
        try {
            const excelData = borrows.map(borrow => ({
                'ID Peminjaman': borrow.id,
                'Member': getMemberById(borrow.id_member)?.nama || 'Nama tidak tersedia',
                'Buku': getBookById(borrow.id_buku)?.judul || 'Judul tidak tersedia',
                'Tanggal Pinjam': formatDate(borrow.tgl_pinjam),
                'Tanggal Kembali': formatDate(borrow.tgl_pengembalian),
                'Status': borrow.status_peminjaman === STATUS_DIKEMBALIKAN ? 'Dikembalikan' : 'Dipinjam',
            }));

            const ws = XLSX.utils.json_to_sheet(excelData);

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Data Peminjaman");

            const fileName = `data_peminjaman_${new Date().toISOString().split('T')[0]}.xlsx`;

            XLSX.writeFile(wb, fileName);
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            setError('Gagal mengexport data ke Excel');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in-down">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Peminjaman & Pengembalian Buku</h1>
                            <p className="text-gray-600 mt-1">Kelola peminjaman dan pengembalian buku perpustakaan</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <SearchBar
                                placeholder="Cari peminjaman..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value)
                                    setCurrentPage(1) // Reset ke halaman pertama saat pencarian
                                }}
                            />

                            <button
                                onClick={exportToExcel}
                                className="fixed bottom-8 right-8 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-full flex items-center transition-colors duration-200 shadow-lg"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm2 2v10h10V5H5z" clipRule="evenodd" />
                                </svg>
                                Export to Excel
                            </button>

                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center transition-colors duration-200"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                                Tambah
                            </button>

                            <button
                                onClick={exportToExcel}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center transition-colors duration-200"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm2 2v10h10V5H5z" clipRule="evenodd" />
                                </svg>
                                Export
                            </button>
                        </div>
                    </div>

                    {/* Info jumlah data */}
                    <div className="text-sm text-gray-600">
                        Menampilkan {filteredBorrows.length > 0 ? `${indexOfFirstBorrow + 1}-${Math.min(indexOfLastBorrow, filteredBorrows.length)} dari ${filteredBorrows.length}` : '0'} peminjaman
                        {searchTerm && ` untuk pencarian "${searchTerm}"`}
                    </div>
                </div>

                {/* Alert Messages */}
                <AlertMessage type="success" message={successMessage} />
                <AlertMessage type="error" message={error} />

                {/* Loading State */}
                {loading ? (
                    <LoadingSpinner message="Memuat data..." />
                ) : (
                    <div className="p-6">
                        {/* Table View */}
                        <BorrowTable
                            borrows={currentBorrows}
                            getBookById={getBookById}
                            getMemberById={getMemberById}
                            formatDate={formatDate}
                            openDetailModal={openDetailModal}
                            openReturnModal={openReturnModal}
                        />

                        {/* Pagination */}
                        {filteredBorrows.length > borrowsPerPage && (
                            // Pada komponen Pagination (pastikan props currentPage dan totalPages sudah benar)
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                paginate={paginate}
                            />
                        )}
                    </div>
                )}

                {/* Modals */}
                {/* Modal Tambah Peminjaman */}
                <Modal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    title="Tambah Peminjaman Buku"
                >
                    <form onSubmit={createBorrow} className="space-y-4">
                        <div>
                            <label htmlFor="member_id" className="block text-sm font-medium text-gray-700">Member</label>
                            <select
                                id="member_id"
                                name="member_id"
                                value={formData.member_id}
                                onChange={handleInputChange}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                required
                            >
                                <option value="">Pilih Member</option>
                                {members.map(member => (
                                    <option key={member.id} value={member.id}>{member.nama}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="book_id" className="block text-sm font-medium text-gray-700">Buku</label>
                            <select
                                id="book_id"
                                name="book_id"
                                value={formData.book_id}
                                onChange={handleInputChange}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                required
                            >
                                <option value="">Pilih Buku</option>
                                {books.filter(book => book.stok > 0).map(book => (
                                    <option key={book.id} value={book.id}>{book.judul} (Stok: {book.stok})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="tanggal_pinjam" className="block text-sm font-medium text-gray-700">Tanggal Pinjam</label>
                            <input
                                type="date"
                                id="tanggal_pinjam"
                                name="tanggal_pinjam"
                                value={formData.tanggal_pinjam}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="tanggal_kembali" className="block text-sm font-medium text-gray-700">Tanggal Kembali</label>
                            <input
                                type="date"
                                id="tanggal_kembali"
                                name="tanggal_kembali"
                                value={formData.tanggal_kembali}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
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

                {/* Modal Detail Peminjaman */}
                <Modal
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    title="Detail Peminjaman"
                >
                    {currentBorrow && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">ID Peminjaman</h3>
                                    <p className="mt-1 text-sm text-gray-900">{currentBorrow.id}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                                    <p className="mt-1 text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${currentBorrow.status_peminjaman === STATUS_DIKEMBALIKAN
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {currentBorrow.status_peminjaman === STATUS_DIKEMBALIKAN ? 'Dikembalikan' : 'Dipinjam'}
                                        </span>
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Buku</h3>
                                    <p className="mt-1 text-sm text-gray-900">{getBookById(currentBorrow.id_buku)?.judul || 'Judul tidak tersedia'}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Member</h3>
                                    <p className="mt-1 text-sm text-gray-900">{getMemberById(currentBorrow.id_member)?.nama || 'Nama tidak tersedia'}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Tanggal Pinjam</h3>
                                    <p className="mt-1 text-sm text-gray-900">{formatDate(currentBorrow.tgl_pinjam)}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Tanggal Kembali</h3>
                                    <p className="mt-1 text-sm text-gray-900">{formatDate(currentBorrow.tgl_pengembalian)}</p>
                                </div>
                                {currentBorrow.status_peminjaman === STATUS_DIKEMBALIKAN && currentBorrow.denda > 0 && (
                                    <div className="col-span-2">
                                        <h3 className="text-sm font-medium text-gray-500">Denda Keterlambatan</h3>
                                        <p className="mt-1 text-sm text-red-600 font-medium">
                                            Rp {parseInt(currentBorrow.denda).toLocaleString('id-ID')}
                                        </p>
                                        {currentBorrow.deskripsi && (
                                            <p className="mt-1 text-sm text-gray-500">{currentBorrow.deskripsi}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="pt-4 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsDetailModalOpen(false)}
                                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    )}
                </Modal>

                {/* Modal Pengembalian Buku */}
                <Modal
                    isOpen={isReturnModalOpen}
                    onClose={() => setIsReturnModalOpen(false)}
                    title="Pengembalian Buku"
                >
                    {currentBorrow && (
                        <form onSubmit={returnBook} className="space-y-4">
                            <p className="text-sm text-gray-700">
                                Anda akan mengembalikan buku "<span className="font-semibold">{getBookById(currentBorrow.id_buku)?.judul || 'Judul tidak tersedia'}</span>" yang dipinjam oleh <span className="font-semibold">{getMemberById(currentBorrow.id_member)?.nama || 'Member tidak tersedia'}</span>.
                            </p>
                            <p className="text-sm text-gray-700">
                                Tanggal Pinjam: <span className="font-semibold">{formatDate(currentBorrow.tgl_pinjam)}</span>
                            </p>
                            <p className="text-sm text-gray-700">
                                Tanggal Seharusnya Kembali: <span className="font-semibold">{formatDate(currentBorrow.tgl_pengembalian)}</span>
                            </p>
                            <p className="text-sm text-gray-700">
                                Tanggal Pengembalian Sekarang: <span className="font-semibold">{formatDate(new Date().toISOString().split('T')[0])}</span>
                            </p>

                            {/* Form untuk Denda */}
                            <div className="border-t border-gray-200 pt-4 mt-4">
                                <h4 className="text-md font-semibold text-gray-800 mb-3">Informasi Denda Keterlambatan</h4>
                                {calculateFine(currentBorrow.tgl_pengembalian, new Date().toISOString().split('T')[0]) > 0 ? (
                                    <>
                                        <p className="text-sm text-red-600">
                                            Buku terlambat dikembalikan selama {Math.ceil((new Date() - new Date(currentBorrow.tgl_pengembalian)) / (1000 * 60 * 60 * 24))} hari.
                                        </p>
                                        <p className="text-sm text-red-600 font-semibold mt-1">
                                            Denda: Rp {calculateFine(currentBorrow.tgl_pengembalian, new Date().toISOString().split('T')[0]).toLocaleString('id-ID')}
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-sm text-green-600">
                                        Buku dikembalikan tepat waktu. Tidak ada denda keterlambatan.
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsReturnModalOpen(false)}
                                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    Konfirmasi Pengembalian
                                </button>
                            </div>
                        </form>
                    )}
                </Modal>
            </div>
        </div>
    )
}