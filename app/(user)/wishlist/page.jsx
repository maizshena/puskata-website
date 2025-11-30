'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';

export default function WishlistPage() {
  const { data: session } = useSession();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchWishlist();
    }
  }, [session]);

  const fetchWishlist = async () => {
    try {
      const params = new URLSearchParams();
      params.append('userEmail', session.user.email);
      
      const response = await fetch(`/api/wishlist?${params}`);
      const data = await response.json();
      setWishlist(data.wishlist || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (bookId) => {
    if (!confirm('Remove book from wishlist?')) return;

    try {
      const params = new URLSearchParams();
      params.append('bookId', bookId);
      params.append('userEmail', session.user.email);
      
      const response = await fetch(`/api/wishlist?${params}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Book removed from wishlist!');
        fetchWishlist();
      } else {
        alert('Failed to remove book');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('An error occurred');
    }
  };

  const handleBorrow = async (bookId) => {
  const loanDate = new Date().toISOString().split('T')[0];
  const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  try {
    const response = await fetch('/api/loans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_email: session.user.email, // Changed
        book_id: bookId,
        loan_date: loanDate,
        due_date: dueDate,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      alert('Loan request submitted successfully!');
      // Remove from wishlist after borrowing
      const params = new URLSearchParams();
      params.append('bookId', bookId);
      params.append('userEmail', session.user.email);
      await fetch(`/api/wishlist?${params}`, { method: 'DELETE' });
      fetchWishlist();
    } else {
      alert(data.error || 'Failed to submit loan request');
    }
  } catch (error) {
    console.error('Error borrowing book:', error);
    alert('An error occurred');
  }
};

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-xl">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">❤️ My Wishlist</h1>

          {wishlist.length === 0 ? (
            <div className="bg-white p-12 rounded-lg shadow-md text-center">
              <div className="text-6xl mb-4">📚</div>
              <h2 className="text-2xl font-bold mb-2">Wishlist kosong</h2>
              <p className="text-gray-600 mb-6">
                Belum ada buku yang ditambahkan ke wishlist
              </p>
              
            <a href="/books" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-block">Browse Books</a>

            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    {item.cover_image ? (
                      <img
                        src={item.cover_image}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-6xl">📕</div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-gray-600 mb-3">by {item.author}</p>

                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-gray-600">
                        Tersedia: <span className="font-bold">{item.available}</span>
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(item.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleBorrow(item.book_id)}
                        disabled={item.available <= 0}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                      >
                        {item.available <= 0 ? 'Habis' : 'Pinjam'}
                      </button>
                      <button
                        onClick={() => handleRemove(item.book_id)}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}