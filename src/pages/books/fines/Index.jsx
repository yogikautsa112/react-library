import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../../constant';
import SearchBar from '../../../components/SearchBar';
import Pagination from '../../../components/Pagination';
import AlertMessage from '../../../components/AlertMessage';
import LoadingSpinner from '../../../components/LoadingSpinner';
import FineTable from '../../../components/FineTable'; // Kita akan buat komponen ini

export default function FinesIndex() {
    const [fines, setFines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [finesPerPage] = useState(10); // Sesuaikan jumlah item per halaman

    // State untuk data referensi (member dan buku) jika diperlukan untuk detail denda
    const [members, setMembers] = useState([]);
    const [books, setBooks] = useState([]);

    // Auto-dismiss alert setelah 3 detik
    useEffect(() => {
        if (successMessage || error) {
            const timer = setTimeout(() => {
                setSuccessMessage('');
                setError('');
            }, 3000); // 3 detik

            return () => clearTimeout(timer); // Cleanup timer jika komponen unmount
        }
    }, [successMessage, error]);

    // Mengambil data denda dari API
    const fetchFines = async () => {
        setLoading(true);
        setError('');
        try {
            // Diasumsikan ada endpoint API untuk denda
            const response = await axios.get(`${API_URL}denda`);
            const data = response.data.data || response.data;

            if (Array.isArray(data)) {
                setFines(data);
            } else {
                console.error('Data denda bukan array:', data);
                setFines([]);
            }

            setLoading(false);
        } catch (err) {
            console.error('Error fetching fines:', err);
            setError(err.response?.data?.message || 'Gagal mengambil data denda');
            setLoading(false);
        }
    };

    // Mengambil data member dan buku untuk referensi
    const fetchReferences = async () => {
        try {
            const [membersResponse, booksResponse] = await Promise.all([
                axios.get(`${API_URL}member`),
                axios.get(`${API_URL}buku`)
            ]);

            setMembers(membersResponse.data.data || membersResponse.data);
            setBooks(booksResponse.data.data || booksResponse.data);
        } catch (err) {
            console.error('Error fetching references:', err);
            // Tidak perlu setError di sini agar tidak menimpa error fetchFines
        }
    };


    useEffect(() => {
        fetchFines();
        fetchReferences(); // Ambil data referensi
    }, []);

    // Tambahkan fungsi untuk mendapatkan data member dan buku berdasarkan ID
    const getMemberById = (memberId) => {
        return members.find(member => member.id === memberId) || null;
    }

    const getBookById = (bookId) => {
        return books.find(book => book.id === bookId) || null;
    }


    // Filter denda berdasarkan pencarian
    const filteredFines = fines.filter(fine => {
        // Diasumsikan data denda memiliki id_member dan id_buku
        const member = getMemberById(fine.id_member);
        const book = getBookById(fine.id_buku);

        return (
            String(fine.id).includes(searchTerm) ||
            String(fine.jumlah_denda).includes(searchTerm) ||
            fine.jenis_denda?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fine.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book?.judul?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    // Pagination logic
    const indexOfLastFine = currentPage * finesPerPage;
    const indexOfFirstFine = indexOfLastFine - finesPerPage;
    const currentFines = filteredFines.slice(indexOfFirstFine, indexOfLastFine);
    const totalPages = Math.ceil(filteredFines.length / finesPerPage);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Format tanggal (jika ada kolom tanggal di data denda)
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    // Fungsi untuk membuka modal detail denda (jika diperlukan)
    const openDetailModal = (fine) => {
        // Implementasi modal detail jika ada
        console.log('Detail Denda:', fine);
    };


    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in-down">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Data Denda</h2>

                    <AlertMessage type="success" message={successMessage} />
                    <AlertMessage type="error" message={error} />

                    <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                        <div className="w-full md:w-1/3 mb-4 md:mb-0">
                            <SearchBar
                                placeholder="Cari denda..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {/* Tombol tambah denda jika ada fitur tambah manual */}
                        {/* <button
                            onClick={openCreateModal}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                            Tambah Denda Baru
                        </button> */}
                    </div>

                    {loading ? (
                        <LoadingSpinner message="Memuat data denda..." />
                    ) : (
                        <>
                            <FineTable
                                fines={currentFines}
                                getMemberById={getMemberById} // Pass reference data functions
                                getBookById={getBookById}
                                formatDate={formatDate}
                                openDetailModal={openDetailModal}
                            // Tambahkan fungsi aksi lain jika ada (misal: edit, delete denda)
                            />

                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                paginate={paginate}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Modal Detail Denda (jika diimplementasikan) */}
            {/* <Modal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                title="Detail Denda"
            >
                {currentFine && (
                    <div>
                        <p><strong>ID:</strong> {currentFine.id}</p>
                        <p><strong>Jumlah Denda:</strong> Rp {parseInt(currentFine.jumlah_denda).toLocaleString('id-ID')}</p>
                        <p><strong>Jenis Denda:</strong> {currentFine.jenis_denda || '-'}</p>
                        <p><strong>Deskripsi:</strong> {currentFine.deskripsi || '-'}</p>
                        <p><strong>Member:</strong> {getMemberById(currentFine.id_member)?.nama || 'Tidak diketahui'}</p>
                        <p><strong>Buku:</strong> {getBookById(currentFine.id_buku)?.judul || 'Tidak diketahui'}</p>
                        <p><strong>Tanggal Dibuat:</strong> {formatDate(currentFine.created_at)}</p>
                        <p><strong>Tanggal Diperbarui:</strong> {formatDate(currentFine.updated_at)}</p>
                    </div>
                )}
            </Modal> */}

        </div>
    );
}