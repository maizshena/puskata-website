'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [recentLoans, setRecentLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.role === 'admin') {
      router.push('/dashboard');
    } else if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status, session, router]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, loansRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/loans'),
      ]);

      const statsData = await statsRes.json();
      const loansData = await loansRes.json();

      setStats(statsData);
      setRecentLoans(loansData.loans.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 text-3xl mb-2">📚</div>
              <div className="text-2xl font-bold">{stats?.activeLoans || 0}</div>
              <div className="text-gray-600">Peminjaman Aktif</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-green-600 text-3xl mb-2">📖</div>
              <div className="text-2xl font-bold">{stats?.totalLoans || 0}</div>
              <div className="text-gray-600">Total Peminjaman</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-purple-600 text-3xl mb-2">❤️</div>
              <div className="text-2xl font-bold">{stats?.wishlistCount || 0}</div>
              <div className="text-gray-600">Wishlist</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-red-600 text-3xl mb-2">💰</div>
              <div className="text-2xl font-bold">Rp {stats?.totalFines?.toLocaleString() || 0}</div>
              <div className="text-gray-600">Total Denda</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Link
              href="/books"
              className="bg-blue-600 text-white p-6 rounded-lg shadow-md hover:bg-blue-700 transition text-center"
            >
              <div className="text-4xl mb-2">📚</div>
              <div className="text-xl font-bold">Browse Books</div>
              <div className="text-sm mt-2">Cari buku yang ingin dipinjam</div>
            </Link>

            <Link
              href="/loans"
              className="bg-green-600 text-white p-6 rounded-lg shadow-md hover:bg-green-700 transition text-center"
            >
              <div className="text-4xl mb-2">📋</div>
              <div className="text-xl font-bold">My Loans</div>
              <div className="text-sm mt-2">Lihat status peminjaman</div>
            </Link>

            <Link
              href="/wishlist"
              className="bg-purple-600 text-white p-6 rounded-lg shadow-md hover:bg-purple-700 transition text-center"
            >
              <div className="text-4xl mb-2">❤️</div>
              <div className="text-xl font-bold">Wishlist</div>
              <div className="text-sm mt-2">Buku yang ingin dibaca</div>
            </Link>
          </div>

          {/* Recent Loans */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Peminjaman Terbaru</h2>
            
            {recentLoans.length === 0 ? (
              <p className="text-gray-600">Belum ada peminjaman</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3">Buku</th>
                      <th className="text-left py-3">Tanggal Pinjam</th>
                      <th className="text-left py-3">Batas Kembali</th>
                      <th className="text-left py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLoans.map((loan) => (
                      <tr key={loan.id} className="border-b">
                        <td className="py-3">{loan.title}</td>
                        <td className="py-3">{new Date(loan.loan_date).toLocaleDateString('id-ID')}</td>
                        <td className="py-3">{new Date(loan.due_date).toLocaleDateString('id-ID')}</td>
                        <td className="py-3">
                          <span
                            className={`px-3 py-1 rounded-full text-sm ${
                              loan.status === 'approved'
                                ? 'bg-green-100 text-green-700'
                                : loan.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : loan.status === 'returned'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {loan.status === 'approved' ? 'Disetujui' :
                             loan.status === 'pending' ? 'Menunggu' :
                             loan.status === 'returned' ? 'Dikembalikan' : 'Ditolak'}
                          </span>
                        </td>
                      </tr>
                    ))}
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