'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function BookCard({ book, onAddWishlist, onBorrow, isInWishlist = false }) {
  const [loading, setLoading] = useState(false);

  const handleWishlist = async () => {
    setLoading(true);
    await onAddWishlist(book.id);
    setLoading(false);
  };

  const handleBorrow = async () => {
    setLoading(true);
    await onBorrow(book.id);
    setLoading(false);
  };

  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
      <div className="h-64 bg-gray-200 flex items-center justify-center">
        {book.cover_image && !imageError ? (
          <img
            src={book.cover_image}
            alt={book.title}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="text-6xl">📕</div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-xl font-bold mb-2 line-clamp-2">{book.title}</h3>
        <p className="text-gray-600 mb-2">by {book.author}</p>
        
        {book.category && (
          <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm mb-3">
            {book.category}
          </span>
        )}

        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-600">
            Tersedia: <span className="font-bold">{book.available}/{book.quantity}</span>
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleBorrow}
            disabled={loading || book.available <= 0}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {book.available <= 0 ? 'Habis' : 'Pinjam'}
          </button>

          <button
            onClick={handleWishlist}
            disabled={loading || isInWishlist}
            className={`px-4 py-2 rounded ${
              isInWishlist
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {isInWishlist ? '❤️' : '🤍'}
          </button>
        </div>
      </div>
    </div>
  );
}
