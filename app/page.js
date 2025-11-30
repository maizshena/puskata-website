import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl font-bold mb-6 text-gray-800">
            Welcome to Library Management System
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Kelola perpustakaan dengan mudah dan efisien
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-700 transition"
            >
              Mulai Sekarang
            </Link>
            <Link
              href="/login"
              className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg text-lg hover:bg-gray-300 transition"
            >
              Login
            </Link>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">📖</div>
              <h3 className="text-xl font-bold mb-2">Browse Books</h3>
              <p className="text-gray-600">Cari dan temukan buku favoritmu</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">❤️</div>
              <h3 className="text-xl font-bold mb-2">Wishlist</h3>
              <p className="text-gray-600">Simpan buku yang ingin kamu baca</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-xl font-bold mb-2">Track Loans</h3>
              <p className="text-gray-600">Pantau peminjaman bukumu</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}