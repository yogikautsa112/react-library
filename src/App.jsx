import { Link } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Simple Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-blue-900">Perpustakaan Digital</h1>
          <div className="space-x-4">
            <Link to="/login" className="text-blue-600 hover:text-blue-800">Masuk</Link>
            <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300">Daftar</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Simplified */}
      <header className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-bold text-blue-900 mb-4 animate-fade-in-down">
          Jelajahi Dunia Pengetahuan
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto animate-fade-in-up">
          Akses ribuan buku digital, baca di mana saja dan kapan saja. Bergabunglah sekarang dan mulai petualangan membaca Anda.
        </p>
        <div className="space-x-4">
          <Link to="/register" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 inline-block">
            Mulai Sekarang
          </Link>
        </div>
      </header>

      {/* Features Section - Simplified */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition duration-300 text-center">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Koleksi Digital</h3>
            <p className="text-gray-600">Ribuan buku dalam genggaman Anda</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition duration-300 text-center">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Akses 24/7</h3>
            <p className="text-gray-600">Baca kapan saja, di mana saja</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition duration-300 text-center">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Mudah Digunakan</h3>
            <p className="text-gray-600">Interface yang sederhana dan intuitif</p>
          </div>
        </div>
      </section>

      {/* Footer - Simplified */}
      <footer className="bg-gray-50 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          <p>&copy; 2024 Perpustakaan Digital. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
