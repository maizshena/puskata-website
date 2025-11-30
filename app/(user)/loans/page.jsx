
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';

export default function UserLoansPage() {
  const { data: session } = useSession();
  const [loans, setLoans] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchLoans();
    }
  }, [session, filter]);

  const fetchLoans = async () => {
    try {
      const params = new URLSearchParams();
      params.append('userEmail', session.user.email);
      params.append('isAdmin', 'false');
      
      if (filter !== 'all') params.append('status', filter);

      const response = await fetch(`/api/loans?${params}`);
      const data = await response.json();
      setLoans(data.loans || []);
    } catch (error) {
      console.error('Error fetching loans:', error);
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateFine = (dueDate, returnDate) => {
    if (!returnDate) returnDate = new Date();
    const due = new Date(dueDate);
    const returned = new Date(returnDate);
    const daysLate = Math.max(0, Math.floor((returned - due) / (1000 * 60 * 60 * 24)));
    return daysLate * 5000; // Rp 5000 per hari
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
          <h1 className="text-3xl font-bold mb-8">My Loans</h1>

          {/* Filter */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200'}`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter('approved')}
                className={`px-4 py-2 rounded ${filter === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
              >
                Approved
              </button>
              <button
                onClick={() => setFilter('returned')}
                className={`px-4 py-2 rounded ${filter === 'returned' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >
                Returned
              </button>
            </div>
          </div>

          {/* Loans Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {loans.length === 0 ? (
              <div className="p-8 text-center text-gray-600">
                Tidak ada data peminjaman
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Buku</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Pinjam</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batas Kembali</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Denda</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loans.map((loan) => {
                      const isOverdue = new Date(loan.due_date) < new Date() && loan.status === 'approved';
                      const fine = isOverdue ? calculateFine(loan.due_date, null) : loan.fine;

                      return (
                        <tr key={loan.id}>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {loan.cover_image ? (
                                  <img src={loan.cover_image} alt={loan.title} className="h-10 w-10 object-cover rounded" />
                                ) : (
                                  <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">📕</div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{loan.title}</div>
                                <div className="text-sm text-gray-500">{loan.author}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(loan.loan_date).toLocaleDateString('id-ID')}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className={isOverdue ? 'text-red-600 font-bold' : 'text-gray-500'}>
                              {new Date(loan.due_date).toLocaleDateString('id-ID')}
                              {isOverdue && ' (Terlambat!)'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                loan.status === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : loan.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : loan.status === 'returned'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {loan.status === 'approved' ? 'Disetujui' :
                               loan.status === 'pending' ? 'Menunggu' :
                               loan.status === 'returned' ? 'Dikembalikan' : 'Ditolak'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium">
                            {fine > 0 ? (
                              <span className="text-red-600">Rp {fine.toLocaleString()}</span>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}