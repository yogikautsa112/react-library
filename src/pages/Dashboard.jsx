import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../constant';
import { Pie, Bar } from 'react-chartjs-2';
import { 
    Chart as ChartJS, 
    ArcElement, 
    Tooltip, 
    Legend, 
    CategoryScale,
    LinearScale,
    BarElement,
    Title
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
    ArcElement, 
    Tooltip, 
    Legend, 
    CategoryScale,
    LinearScale,
    BarElement,
    Title
);

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [bookStats, setBookStats] = useState({
        total: 0,
        borrowed: 0,
        available: 0
    });
    const [memberStats, setMemberStats] = useState({
        total: 0,
        active: 0
    });
    const [monthlyBorrowings, setMonthlyBorrowings] = useState(null);
    const [recentActivities, setRecentActivities] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setError('');
            try {
                // Fetch books data
                const booksResponse = await axios.get(`${API_URL}buku`);
                const books = booksResponse.data.data || booksResponse.data;

                // Fetch borrows data
                const borrowsResponse = await axios.get(`${API_URL}peminjaman`);
                const borrows = borrowsResponse.data.data || borrowsResponse.data;

                // Fetch members data
                const membersResponse = await axios.get(`${API_URL}member`);
                const members = membersResponse.data.data || membersResponse.data;

                // Calculate book statistics
                const totalBooks = books.length;
                const borrowedBooks = borrows.filter(borrow => borrow.status !== 'dikembalikan').length;

                setBookStats({
                    total: totalBooks,
                    borrowed: borrowedBooks,
                    available: totalBooks - borrowedBooks
                });

                setMemberStats({
                    total: members.length,
                    active: members.filter(member => new Date(member.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length
                });

                const monthlyStats = borrows.reduce((acc, borrow) => {
                    const date = new Date(borrow.tgl_pinjam);
                    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
                    acc[monthYear] = (acc[monthYear] || 0) + 1;
                    return acc;
                }, {});

                // Get last 6 months
                const last6Months = Array.from({ length: 6 }, (_, i) => {
                    const date = new Date();
                    date.setMonth(date.getMonth() - i);
                    return `${date.getMonth() + 1}/${date.getFullYear()}`;
                }).reverse();

                // Prepare monthly borrowings chart data
                const monthlyBorrowingsData = {
                    labels: last6Months.map(month => {
                        const [m, y] = month.split('/');
                        return new Date(y, m - 1).toLocaleDateString('id-ID', { 
                            month: 'short', 
                            year: 'numeric' 
                        });
                    }),
                    datasets: [{
                        label: 'Jumlah Peminjaman',
                        data: last6Months.map(month => monthlyStats[month] || 0),
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgb(75, 192, 192)',
                        borderWidth: 1
                    }]
                };

                setMonthlyBorrowings(monthlyBorrowingsData);

                const allActivities = borrows.map(borrow => ({
                    id: borrow.id,
                    type: borrow.status_pengembalian === 1 ? 'return' : 'borrow',
                    bookId: borrow.id_buku,
                    memberId: borrow.id_member,
                    date: borrow.status_pengembalian === 1 ? borrow.updated_at : borrow.tanggal_pinjam
                }));

                const sortedActivities = allActivities.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
                const enrichedActivities = await Promise.all(sortedActivities.map(async (activity) => {
                    const book = books.find(b => b.id === activity.bookId) || { judul: 'Buku tidak ditemukan' };
                    const member = members.find(m => m.id === activity.memberId) || { nama: 'Member tidak ditemukan' };

                    return {
                        ...activity,
                        bookTitle: book.judul,
                        memberName: member.nama
                    };
                }));

                setRecentActivities(enrichedActivities);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError(err.response?.data?.message || 'Gagal mengambil data dashboard');
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    // Prepare chart data
    const bookChartData = {
        labels: ['Dipinjam', 'Tersedia'],
        datasets: [
            {
                data: [bookStats.borrowed, bookStats.available],
                backgroundColor: ['#FFCE56', '#36A2EB'],
                hoverBackgroundColor: ['#FFD76E', '#4DB6FF']
            }
        ]
    };

    const memberChartData = {
        labels: ['Aktif (30 hari terakhir)', 'Lainnya'],
        datasets: [
            {
                data: [memberStats.active, memberStats.total - memberStats.active],
                backgroundColor: ['#4BC0C0', '#FF6384'],
                hoverBackgroundColor: ['#5ED3D3', '#FF7A9A']
            }
        ]
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Perpustakaan</h1>

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
            ) : error ? (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                    <p>{error}</p>
                </div>
            ) : (
                <div>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Buku</h3>
                            <p className="text-3xl font-bold text-blue-600">{bookStats.total}</p>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Buku Dipinjam</h3>
                            <p className="text-3xl font-bold text-yellow-600">{bookStats.borrowed}</p>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Buku Tersedia</h3>
                            <p className="text-3xl font-bold text-green-600">{bookStats.available}</p>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Member</h3>
                            <p className="text-3xl font-bold text-purple-600">{memberStats.total}</p>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">Status Buku</h3>
                            <div className="h-64">
                                <Pie data={bookChartData} options={{ maintainAspectRatio: false }} />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">Status Member</h3>
                            <div className="h-64">
                                <Pie data={memberChartData} options={{ maintainAspectRatio: false }} />
                            </div>
                        </div>
                    </div>

                    {/* Monthly Borrowings Chart */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">
                            Statistik Peminjaman per Bulan
                        </h3>
                        <div className="h-80">
                            {monthlyBorrowings && (
                                <Bar
                                    data={monthlyBorrowings}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'top',
                                            },
                                            title: {
                                                display: false,
                                            },
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                ticks: {
                                                    stepSize: 1,
                                                    precision: 0
                                                }
                                            }
                                        }
                                    }}
                                />
                            )}
                        </div>
                    </div>

                    {/* Recent Activities */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Aktivitas Terbaru</h3>

                        {recentActivities.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktivitas</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buku</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {recentActivities.map((activity, index) => (
                                            <tr key={`${activity.id}-${index}`} className="hover:bg-gray-50 transition-colors duration-200">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(activity.date)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${activity.type === 'borrow' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                                        {activity.type === 'borrow' ? 'Peminjaman' : 'Pengembalian'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {activity.bookTitle}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {activity.memberName}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-4">Tidak ada aktivitas terbaru</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}