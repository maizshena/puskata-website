'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import BookCard from '@/components/BookCard';

export default function BooksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchBooks();
      fetchWishlist();
    }
  }, [status, search, category]);

    // Add this after the existing imports
    const [categories, setCategories] = useState([]);

    // Add this in useEffect
    useEffect(() => {
    if (status === 'authenticated') {
        fetchBooks();
        fetchWishlist();
        fetchCategories(); // Add this
    }
    }, [status, search, category]);

    // Add this function
    const fetchCategories = async () => {
    try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        setCategories(data.categories || []);
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
    };

    <select
    value={category}
    onChange={(e) => setCategory(e.target.value)}
    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
    <option value="">Semua Kategori</option>
    {categories.map((cat) => (
        <option key={cat} value={cat}>{cat}</option>
    ))}
    </select>

  const fetchBooks = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);

      const response = await fetch(`/api/books?${params}`);
      const data = await response.json();
      setBooks(data.books);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const params = new URLSearchParams();
      params.append('userEmail', session.user.email);
      
      const response = await fetch(`/api/wishlist?${params}`);
      const data = await response.json();
      setWishlist(data.wishlist || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const handleAddWishlist = async (bookId) => {
    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_email: session.user.email, // diganti dari user_id
          book_id: bookId 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Added to wishlist successfully!');
        fetchWishlist();
      } else {
        alert(data.error || 'Failed to add to wishlist');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      alert('An error occurred');
    }
  };

const handleBorrow = async (bookId) => {
  const loanDate = new Date().toISOString().split('T')[0];
  const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 14 days

  try {
    const response = await fetch('/api/loans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_email: session.user.email, // Changed from user_id
        book_id: bookId,
        loan_date: loanDate,
        due_date: dueDate,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      alert('Loan request submitted successfully! Waiting for admin approval.');
      fetchBooks();
    } else {
      alert(data.error || 'Failed to submit loan request');
    }
  } catch (error) {
    console.error('Error borrowing book:', error);
    alert('An error occurred');
  }
};

  const isInWishlist = (bookId) => {
    return wishlist.some((item) => item.book_id === bookId);
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
          <h1 className="text-3xl font-bold mb-8">Browse Books</h1>

          {/* Search & Filter */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Cari judul atau penulis..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                 <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Kategori</option>
            <option value="Fiction">Fiction</option>
            <option value="Non-Fiction">Non-Fiction</option>
            <option value="Science">Science</option>
            <option value="History">History</option>
            <option value="Technology">Technology</option>
          </select>
        </div>
      </div>

      {/* Books Grid */}
      {books.length === 0 ? (
        <div className="text-center py-12 text-gray-600">
          Tidak ada buku ditemukan
        </div>
      ) : (
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onAddWishlist={handleAddWishlist}
              onBorrow={handleBorrow}
              isInWishlist={isInWishlist(book.id)}
            />
          ))}
        </div>
      )}
    </div>
  </div>
</>
);
}
