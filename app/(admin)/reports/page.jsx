'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function AdminReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/home');
      } else {
        fetchReports();
      }
    }
  }, [status, session, router]);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reports');
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
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
          <h1 className="text-3xl font-bold mb-8">📊 Reports & Analytics</h1>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-green-600 text-3xl mb-2">💰</div>
              <div className="text-2xl font-bold">Rp {reports?.totalFines?.toLocaleString() || 0}</div>
              <div className="text-gray-600">Total Fines Collected</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-red-600 text-3xl mb-2">⚠️</div>
              <div className="text-2xl font-bold">{reports?.overdueCount || 0}</div>
              <div className="text-gray-600">Overdue Loans</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Top Borrowed Books */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">📚 Top Borrowed Books</h2>
              
              {reports?.topBooks?.length === 0 ? (
                <p className="text-gray-600">Belum ada data</p>
              ) : (
                <div className="space-y-3">
                  {reports?.topBooks?.map((book, index) => (
                    <div key={book.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold">{book.title}</div>
                          <div className="text-sm text-gray-600">{book.author}</div>
                        </div>
                      </div>
                      <div className="text-blue-600 font-bold">
                        {book.borrow_count} x
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Active Users */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">👥 Most Active Users</h2>
              
              {reports?.topUsers?.length === 0 ? (
                <p className="text-gray-600">Belum ada data</p>
              ) : (
                <div className="space-y-3">
                  {reports?.topUsers?.map((user, index) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold">{user.name}</div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                        </div>
                      </div>
                      <div className="text-green-600 font-bold">
                        {user.loan_count} loans
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Monthly Statistics */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <h2 className="text-2xl font-bold mb-4">📈 Monthly Loan Statistics</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3">Month</th>
                    <th className="text-center py-3">Total Loans</th>
                    <th className="text-center py-3">Approved</th>
                    <th className="text-center py-3">Returned</th>
                    <th className="text-center py-3">Rejected</th>
                  </tr>
                </thead>
                <tbody>
                  {reports?.monthlyStats?.map((stat) => (
                    <tr key={stat.month} className="border-b">
                      <td className="py-3">{stat.month}</td>
                      <td className="text-center py-3">{stat.total_loans}</td>
                      <td className="text-center py-3 text-green-600">{stat.approved}</td>
                      <td className="text-center py-3 text-blue-600">{stat.returned}</td>
                      <td className="text-center py-3 text-red-600">{stat.rejected}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}