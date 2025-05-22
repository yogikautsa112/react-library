import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

export default function Navbar() {
    const navigate = useNavigate()
    const location = useLocation()

    const userDataString = localStorage.getItem('user')
    let user = {}

    try {
        if (userDataString && userDataString !== 'undefined') {
            user = JSON.parse(userDataString)
        }
    } catch (err) {
        console.error('Error parsing user data from localStorage:', err)
    }

    const [activeTab, setActiveTab] = useState(() => {
        if (location.pathname.startsWith('/members')) return 'members'
        if (location.pathname.startsWith('/books')) return 'books'
        if (location.pathname.startsWith('/borrowing')) return 'borrowing'
        if (location.pathname.startsWith('/reports')) return 'reports'
        if (location.pathname.startsWith('/fines')) return 'fines' // Tambahkan pengecekan untuk rute fines
        if (location.pathname === '/dashboard') return'dashboard'
        return ''
    })

    // Update active tab when location changes
    useEffect(() => {
        if (location.pathname.startsWith('/members')) setActiveTab('members')
        else if (location.pathname.startsWith('/books')) setActiveTab('books')
        else if (location.pathname.startsWith('/borrowing')) setActiveTab('borrowing')
        else if (location.pathname.startsWith('/reports')) setActiveTab('reports')
        else if (location.pathname.startsWith('/fines')) setActiveTab('fines') // Tambahkan pengecekan untuk rute fines
        else if (location.pathname === '/dashboard') setActiveTab('dashboard')
        else setActiveTab('')
    }, [location.pathname])

    const handleLogout = () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        navigate('/login')
    }

    // Dalam array navItems, tambahkan item untuk Dashboard dan Denda
    const navItems = [
        { 
            id: 'dashboard',
            path: '/dashboard',
            label: 'Dashboard', 
            icon: '' },
        {
            id: 'members',
            path: '/members',
            label: 'Member',
            icon: (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
            )
        },
        {
            id: 'books',
            path: '/books',
            label: 'Buku',
            icon: (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
            )
        },
        {
            id: 'borrowing',
            path: '/borrowing',
            label: 'Peminjaman',
            icon: (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                </svg>
            )
        },
        {
            id: 'fines',
            path: '/fines',
            label: 'Denda',
            icon: (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V9m0 3v2m0 4v1m-6 3h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
            )
        },
    ]

    return (
        <nav className="bg-white border-b border-gray-200 fixed w-full z-30 shadow-sm">
            <div className="px-3 py-3 lg:px-5 lg:pl-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center justify-start">
                        <Link to="/" className="flex ml-2 md:mr-24">
                            <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap text-blue-600">Perpustakaan</span>
                        </Link>
                    </div>
                    <div className="flex items-center">
                        <div className="hidden md:flex mr-3 items-center">
                            <div className="text-sm text-gray-500 mr-2">{user.name || 'User'}</div>
                            <button
                                onClick={handleLogout}
                                className="text-gray-500 hover:text-blue-600 p-2 rounded-lg"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation using Tailwind CSS */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex" aria-label="Tabs">
                    {navItems.map((item) => (
                        <Link
                            key={item.id}
                            to={item.path}
                            className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${activeTab === item.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            aria-current={activeTab === item.id ? 'page' : undefined}
                        >
                            <div className="flex items-center justify-center">
                                {item.icon}
                                {item.label}
                            </div>
                        </Link>
                    ))}
                </nav>
            </div>
        </nav>
    )
}