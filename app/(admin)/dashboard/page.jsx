'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [recentLoans, setRecentLoans] = useState([]);
  const [pendingLoans, setPendingLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.role !== 'admin') {
      router.push('/dashboard');
    } else if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status, session, router]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, loansRes, pendingRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/loans'),
        fetch('/api/loans?status=pending'),
      ]);

      const statsData = await statsRes.json();
      const loansData = await loansRes.json();
      const pendingData = await pendingRes.json();

      setStats(statsData);
      setRecentLoans(loansData.loans.slice(0, 5));
      setPendingLoans(pendingData.loans);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (loanId) => {
    try {
      const response = await fetch(`/api/loans/${loanId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });

      if (response.ok) {
        alert('Peminjaman disetujui!');
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error approving loan:', error);
    }
  };

  const handleReject = async (loanId) => {
    if (!confirm('Tolak peminjaman ini?')) return;

    try {
      const response = await fetch(`/api/loans/${loanId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      });

      if (response.ok) {
        alert('Peminjaman ditolak!');
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error rejecting loan:', error);
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
          <h1 className="text-3xl font-bold mb-8">👨‍💼 Admin Dashboard</h1>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 text-3xl mb-2">📚</div>
              <div className="text-2xl font-bold">{stats?.totalBooks || 0}</div>
              <div className="text-gray-600">Total Buku</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-green-600 text-3xl mb-2">👥</div>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <div className="text-gray-600">Total Users</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-purple-600 text-3xl mb-2">📋</div>
              <div className="text-2xl font-bold">{stats?.activeLoans || 0}</div>
              <div className="text-gray-600">Peminjaman Aktif</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-yellow-600 text-3xl mb-2">⏳</div>
              <div className="text-2xl font-bold">{stats?.pendingLoans || 0}</div>
              <div className="text-gray-600">Pending Approval</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Link
              href="/collections"
              className="bg-blue-600 text-white p-6 rounded-lg shadow-md hover:bg-blue-700 transition text-center"
            >
              <div className="text-4xl mb-2">📚</div>
              <div className="text-xl font-bold">Manage Books</div>
              <div className="text-sm mt-2">Tambah, edit, hapus buku</div>
            </Link>

            <Link
              href="/loan_management"
              className="bg-green-600 text-white p-6 rounded-lg shadow-md hover:bg-green-700 transition text-center"
            >
              <div className="text-4xl mb-2">📋</div>
              <div className="text-xl font-bold">Manage Loans</div>
              <div className="text-sm mt-2">Approve & manage peminjaman</div>
            </Link>

            <div className="bg-purple-600 text-white p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-2">📊</div>
              <div className="text-xl font-bold">Reports</div>
              <div className="text-sm mt-2">Coming soon...</div>
            </div>
          </div>

          {/* Pending Approvals */}
          {pendingLoans.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h2 className="text-2xl font-bold mb-4">⏳ Pending Approvals ({pendingLoans.length})</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3">User</th>
                      <th className="text-left py-3">Buku</th>
                      <th className="text-left py-3">Tanggal Pinjam</th>
                      <th className="text-left py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingLoans.map((loan) => (
                      <tr key={loan.id} className="border-b">
                        <td className="py-3">{loan.user_name}</td>
                        <td className="py-3">{loan.title}</td>
                        <td className="py-3">{new Date(loan.loan_date).toLocaleDateString('id-ID')}</td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(loan.id)}
                              className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => handleReject(loan.id)}
                              className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
                            >
                              ✗ Reject
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

          {/* Recent Loans */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Recent Loans</h2>
            
            {recentLoans.length === 0 ? (
              <p className="text-gray-600">Belum ada peminjaman</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3">User</th>
                      <th className="text-left py-3">Buku</th>
                      <th className="text-left py-3">Tanggal</th>
                      <th className="text-left py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLoans.map((loan) => (
                      <tr key={loan.id} className="border-b">
                        <td className="py-3">{loan.user_name}</td>
                        <td className="py-3">{loan.title}</td>
                        <td className="py-3">{new Date(loan.loan_date).toLocaleDateString('id-ID')}</td>
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
                            {loan.status}
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