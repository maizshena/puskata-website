export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">📚 Library App</h3>
            <p className="text-gray-400">
              Sistem manajemen perpustakaan modern untuk kemudahan peminjaman buku.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/books" className="hover:text-white">Browse Books</a></li>
              <li><a href="/loans" className="hover:text-white">My Loans</a></li>
              <li><a href="/wishlist" className="hover:text-white">Wishlist</a></li>
              <li><a href="/profile" className="hover:text-white">Profile</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Contact</h3>
            <p className="text-gray-400">
              Email: library@example.com<br />
              Phone: (021) 1234-5678<br />
              Address: Jakarta, Indonesia
            </p>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; 2025 Library Management System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}