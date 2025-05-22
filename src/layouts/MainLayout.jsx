import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function MainLayout() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Navbar */}
            <Navbar />

            {/* Main content */}
            <main className="flex-grow pt-32"> {/* Menambahkan padding-top (pt-32) */}
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-white shadow-inner py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-sm text-gray-500">
                        &copy; {new Date().getFullYear()} Perpustakaan. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
