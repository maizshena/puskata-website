// admin/collections/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function AdminCollectionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [uploading, setUploading] = useState(false);
  const [coverPreviewValid, setCoverPreviewValid] = useState(null); // null = nothing, true = ok, false = bad

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    published_year: '',
    category: '',
    pages: '',
    language: 'Indonesian',
    description: '',
    cover_image: '',
    quantity: 1,
    available: 1,
    status: 'active',
  });

  useEffect(() => {
    if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/home');
      } else {
        fetchBooks();
      }
    }
    // intentionally not depending on session to avoid infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    // re-fetch when search changes (debounce could be added later)
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchBooks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, categoryFilter, statusFilter]);

  useEffect(() => {
    // Verify cover image URL when it changes
    if (!formData.cover_image) {
      setCoverPreviewValid(null);
      return;
    }
    let mounted = true;
    const img = new Image();
    img.onload = () => { if (mounted) setCoverPreviewValid(true); };
    img.onerror = () => { if (mounted) setCoverPreviewValid(false); };
    img.src = formData.cover_image;
    return () => { mounted = false; img.onload = null; img.onerror = null; };
  }, [formData.cover_image]);

  const fetchBooks = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryFilter) params.append('category', categoryFilter);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/books?${params}`);
      const data = await response.json();
      setBooks(data.books || []);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('type', 'book');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await response.json();

      if (response.ok) {
        setFormData((prev) => ({ ...prev, cover_image: data.url }));
        alert('Image uploaded successfully!');
      } else {
        alert(data.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    // sanitize helper
    const toNullIfEmpty = (v) => {
      if (v === undefined) return null;
      if (v === null) return null;
      if (typeof v === 'string' && v.trim() === '') return null;
      return v;
    };

    // ensure numeric fields are numbers (or null)
    const parseNum = (v, fallback = null) => {
      if (v === undefined || v === null || v === '') return fallback;
      const n = Number(v);
      return Number.isNaN(n) ? fallback : n;
    };

    // prepare payload with explicit fields (no undefined)
    const payload = {
      title: (formData.title ?? '').toString().trim(),
      author: (formData.author ?? '').toString().trim(),
      isbn: toNullIfEmpty(formData.isbn),
      publisher: toNullIfEmpty(formData.publisher),
      published_year: parseNum(formData.published_year, null),
      category: toNullIfEmpty(formData.category),
      pages: parseNum(formData.pages, null),
      language: (formData.language ?? 'Indonesian').toString().trim(),
      description: toNullIfEmpty(formData.description),
      cover_image: toNullIfEmpty(formData.cover_image),
      quantity: parseNum(formData.quantity, 1),
      available: parseNum(formData.available, 1),
      status: (formData.status ?? 'active').toString().trim()
    };

    // make sure we're not trying to update without an id
    if (editingBook) {
      if (!editingBook.id && editingBook?.bookId) {
        // cover some backend schemas that use bookId
        editingBook.id = editingBook.bookId;
      }
      if (!editingBook.id) {
        alert('Cannot update: missing book id.');
        return;
      }
    }

    const url = editingBook ? `/api/books/${editingBook.id}` : '/api/books';
    const method = editingBook ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      alert(editingBook ? 'Book updated successfully!' : 'Book added successfully!');
      setShowModal(false);
      resetForm();
      fetchBooks();
    } else {
      alert(data.error || 'Failed to save book');
    }
    } catch (error) {
      console.error('Error saving book:', error);
      alert('An error occurred: ' + error.message);
    }
  };


  const handleEdit = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title ?? '',
      author: book.author ?? '',
      isbn: book.isbn ?? '',
      publisher: book.publisher ?? '',
      published_year: book.published_year ?? '',
      category: book.category ?? '',
      pages: book.pages ?? '',
      language: book.language ?? 'Indonesian',
      description: book.description ?? '',
      cover_image: book.cover_image ?? '',
      quantity: book.quantity ?? 1,
      available: book.available ?? 1,
      status: book.status ?? 'active',
    });
    setShowModal(true);
  };

  const handleDelete = async (bookId) => {
    if (!confirm('Delete this book? This action cannot be undone!')) return;

    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        alert('Book deleted successfully!');
        fetchBooks();
      } else {
        alert(data.error || 'Failed to delete book');
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('An error occurred');
    }
  };

  const resetForm = () => {
    setEditingBook(null);
    setFormData({
      title: '',
      author: '',
      isbn: '',
      publisher: '',
      published_year: '',
      category: '',
      pages: '',
      language: 'Indonesian',
      description: '',
      cover_image: '',
      quantity: 1,
      available: 1,
      status: 'active',
    });
    setCoverPreviewValid(null);
  };

  const filteredBooks = books.filter(book => {
    const matchCategory = !categoryFilter || book.category === categoryFilter;
    const matchStatus = !statusFilter || book.status === statusFilter;
    return matchCategory && matchStatus;
  });

  const categories = [...new Set(books.map(b => b.category).filter(Boolean))];

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
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">📚 Book Collections</h1>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <span>+</span> Add New Book
            </button>
          </div>

          {/* Search & Filters */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="grid md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Search books..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
                <option value="damaged">Damaged</option>
              </select>

              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 px-4 py-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                  🔲 Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 px-4 py-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                  ☰ List
                </button>
              </div>
            </div>
          </div>

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredBooks.map((book) => (
                <div key={book.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
                  <div className="h-64 bg-gray-200 flex items-center justify-center relative">
                    {book.cover_image ? (
                      <img src={book.cover_image} alt={book.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-6xl">📕</div>
                    )}
                    <span className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold ${
                      book.status === 'active' ? 'bg-green-500 text-white' :
                      book.status === 'archived' ? 'bg-gray-500 text-white' :
                      'bg-red-500 text-white'
                    }`}>
                      {book.status}
                    </span>
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-1 line-clamp-2">{book.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{book.author}</p>

                    {book.category && (
                      <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs mb-2">
                        {book.category}
                      </span>
                    )}

                    <div className="flex justify-between text-sm text-gray-600 mb-3">
                      <span>Stock: <strong className={book.available > 0 ? 'text-green-600' : 'text-red-600'}>{book.available}/{book.quantity}</strong></span>
                      {book.published_year && <span>{book.published_year}</span>}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(book)}
                        className="flex-1 bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(book.id)}
                        className="flex-1 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cover</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Publisher</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredBooks.map((book) => (
                      <tr key={book.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          {book.cover_image ? (
                            <img src={book.cover_image} alt={book.title} className="h-16 w-12 object-cover rounded" />
                          ) : (
                            <div className="h-16 w-12 bg-gray-200 rounded flex items-center justify-center text-2xl">📕</div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium">{book.title}</td>
                        <td className="px-6 py-4">{book.author}</td>
                        <td className="px-6 py-4 text-sm">{book.publisher || '-'}</td>
                        <td className="px-6 py-4 text-sm">{book.published_year || '-'}</td>
                        <td className="px-6 py-4">
                          {book.category && (
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                              {book.category}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={book.available > 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                            {book.available}/{book.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            book.status === 'active' ? 'bg-green-100 text-green-700' :
                            book.status === 'archived' ? 'bg-gray-100 text-gray-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {book.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(book)}
                              className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(book.id)}
                              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {filteredBooks.length === 0 && (
            <div className="text-center py-12 text-gray-600">
              No books found
            </div>
          )}
        </div>
      </div>

      {/* Modal Add/Edit Book */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl my-8 overflow-hidden">
            <div className="px-6 py-5 border-b flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {editingBook ? '✏️ Edit Book' : '➕ Add New Book'}
              </h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="text-gray-500 hover:text-gray-800"
                aria-label="close modal"
              >
                ✖
              </button>
            </div>

            {/* Form area is scrollable to keep modal compact */}
            <div className="max-h-[80vh] overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-bold mb-4">📖 Basic Information</h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2">Title *</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">Author *</label>
                      <input
                        type="text"
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">ISBN</label>
                      <input
                        type="text"
                        value={formData.isbn}
                        onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="978-3-16-148410-0"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">Publisher</label>
                      <input
                        type="text"
                        value={formData.publisher}
                        onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Gramedia"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">Published Year</label>
                      <input
                        type="number"
                        min="1900"
                        max={new Date().getFullYear()}
                        value={formData.published_year}
                        onChange={(e) => setFormData({ ...formData, published_year: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="2024"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select category</option>
                        <option value="Fiction">Fiction</option>
                        <option value="Non-Fiction">Non-Fiction</option>
                        <option value="Science">Science</option>
                        <option value="Technology">Technology</option>
                        <option value="History">History</option>
                        <option value="Biography">Biography</option>
                        <option value="Self-Help">Self-Help</option>
                        <option value="Business">Business</option>
                        <option value="Education">Education</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">Pages</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.pages}
                        onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 350"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">Language</label>
                      <select
                        value={formData.language}
                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Indonesian">Indonesian</option>
                        <option value="English">English</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="4"
                      placeholder="Book synopsis or description..."
                    />
                  </div>

                  {/* Cover Image Section */}
                  <div className="mt-4">
                    <label className="block text-gray-700 mb-2">Cover Image</label>

                    {/* Upload from File */}
                    <div className="mb-3">
                      <label className="block text-sm text-gray-600 mb-2">Upload from Computer</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {uploading && <p className="text-sm text-blue-600 mt-1">Uploading...</p>}
                    </div>

                    {/* OR */}
                    <div className="text-center text-gray-500 my-2">OR</div>

                    {/* URL Input */}
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Enter Image URL</label>
                      <input
                        type="url"
                        value={formData.cover_image}
                        onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com/cover.jpg"
                      />
                    </div>

                    {/* Image Preview */}
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Preview:</p>
                      {coverPreviewValid === true && (
                        <img
                          src={formData.cover_image}
                          alt="Cover preview"
                          className="h-48 w-32 object-cover rounded border"
                        />
                      )}
                      {coverPreviewValid === false && (
                        <div className="text-sm text-red-600">
                          Couldn't load image from the URL. The URL will still be saved if you submit, but preview failed.
                        </div>
                      )}
                      {coverPreviewValid === null && (
                        <div className="text-sm text-gray-500">No image</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stock & Status */}
                <div>
                  <h3 className="text-lg font-bold mb-4">📦 Stock & Status</h3>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2">Quantity *</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">Available *</label>
                      <input
                        type="number"
                        min="0"
                        max={formData.quantity ?? 0}
                        value={formData.available}
                        onChange={(e) => setFormData({ ...formData, available: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">Status *</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="active">Active</option>
                        <option value="archived">Archived</option>
                        <option value="damaged">Damaged</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-400"
                  >
                    {editingBook ? '💾 Update Book' : '➕ Add Book'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 font-semibold"
                  >
                    ❌ Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
